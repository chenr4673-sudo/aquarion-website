import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import Stripe from "npm:stripe@17.7.0";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
function anonClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
}
function stripeClient() {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-12-18.acacia" });
}

async function requireAuth(c: any): Promise<{ userId: string; email: string } | null> {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await anonClient().auth.getUser(token);
  if (error || !user) return null;
  return { userId: user.id, email: user.email! };
}

// ── Product catalogue ─────────────────────────────────────────────────────────
// Prices in AUD cents (1 AUD = 100 cents)
const PRODUCTS: Record<string, { label: string; amount: number; type: 'plan' | 'ai' | 'bundle' }> = {
  plan:   { label: "Personal Training Plan · 6 weeks", amount: 2000,  type: "plan"   },
  ai:     { label: "Personal AI Coach · 6 weeks",      amount: 9900,  type: "ai"     },
  bundle: { label: "Full AQUARION Experience · 6 weeks", amount: 11000, type: "bundle" },
};

type ProductType = 'plan' | 'ai' | 'bundle';

function cycleIncludesProduct(cycle: any, productType: ProductType) {
  if (!cycle) return false;
  if (productType === 'plan') return cycle.hasPlan === true;
  if (productType === 'ai') return cycle.hasAICoach === true;
  return cycle.hasPlan === true && cycle.hasAICoach === true;
}

function mergedCycleType(hasPlan: boolean, hasAICoach: boolean): ProductType {
  if (hasPlan && hasAICoach) return 'bundle';
  return hasAICoach ? 'ai' : 'plan';
}

async function getActiveCycle(userId: string): Promise<{ cycleIds: string[]; active: any | null }> {
  const cycleIds: string[] = (await kv.get(`user_cycles:${userId}`)) || [];
  if (cycleIds.length === 0) return { cycleIds, active: null };

  const cycles = (await kv.mget(cycleIds.map(id => `cycle:${id}`))).filter(Boolean) as any[];
  const active = cycles.find((cy: any) => (
    cy.status === 'active' && new Date(cy.endsAt).getTime() > Date.now()
  )) || null;

  return { cycleIds, active };
}

async function activatePaidProduct(params: {
  userId: string;
  email: string;
  productType: ProductType;
  sessionId: string;
  orderId: string;
  amountPaid: number;
  currency: string | null;
  paymentMethod: string;
}) {
  const checkoutKey = `checkout_cycle:${params.sessionId}`;
  const existing = await kv.get(checkoutKey);
  if (existing) return existing;

  const now = new Date();
  const { cycleIds, active } = await getActiveCycle(params.userId);
  const addsPlan = params.productType === 'plan' || params.productType === 'bundle';
  const addsAICoach = params.productType === 'ai' || params.productType === 'bundle';

  if (active) {
    const updated = {
      ...active,
      type: mergedCycleType(Boolean(active.hasPlan || addsPlan), Boolean(active.hasAICoach || addsAICoach)),
      hasPlan: Boolean(active.hasPlan || addsPlan),
      hasAICoach: Boolean(active.hasAICoach || addsAICoach),
      updatedAt: now.toISOString(),
      lastPaymentAt: now.toISOString(),
      lastPaymentMethod: params.paymentMethod,
      lastStripeSessionId: params.sessionId,
      lastOrderId: params.orderId,
      amountPaid: Number(active.amountPaid || 0) + params.amountPaid,
      currency: params.currency || active.currency || 'aud',
    };
    await kv.set(`cycle:${active.id}`, updated);
    await kv.set(checkoutKey, updated);
    return updated;
  }

  const endsAt = new Date(now.getTime() + 6 * 7 * 24 * 60 * 60 * 1000);
  const cycleId = `cyc_stripe_${params.userId.slice(0, 8)}_${Date.now()}`;
  const newCycle = {
    id: cycleId,
    userId: params.userId,
    email: params.email,
    type: params.productType,
    hasPlan: addsPlan,
    hasAICoach: addsAICoach,
    status: 'active',
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    createdAt: now.toISOString(),
    orderId: params.orderId,
    stripeSessionId: params.sessionId,
    weeks: 6,
    paymentMethod: params.paymentMethod,
    amountPaid: params.amountPaid,
    currency: params.currency || 'aud',
  };

  await kv.set(`cycle:${cycleId}`, newCycle);
  await kv.set(checkoutKey, newCycle);
  if (!cycleIds.includes(cycleId)) {
    await kv.set(`user_cycles:${params.userId}`, [...cycleIds, cycleId]);
  }
  return newCycle;
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/make-server-d7eafa70/health", (c) => c.json({ status: "ok" }));

// ── Auth: Register ────────────────────────────────────────────────────────────
app.post("/make-server-d7eafa70/auth/register", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "邮箱和密码不能为空" }, 400);
    if (password.length < 6) return c.json({ error: "密码至少需要6位" }, 400);
    const { data, error } = await adminClient().auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered"))
        return c.json({ error: "该邮箱已注册，请直接登录" }, 409);
      return c.json({ error: `注册失败：${error.message}` }, 400);
    }
    await kv.set(`user_profile:${data.user.id}`, { userId: data.user.id, email: data.user.email, createdAt: new Date().toISOString() });
    return c.json({ success: true, userId: data.user.id });
  } catch (e) { return c.json({ error: `服务器错误：${e}` }, 500); }
});

// ── User profile + cycles ─────────────────────────────────────────────────────
app.get("/make-server-d7eafa70/user/profile", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "未授权" }, 401);
    const profile = await kv.get(`user_profile:${user.userId}`);
    const cycleIds: string[] = (await kv.get(`user_cycles:${user.userId}`)) || [];
    const cycles = cycleIds.length > 0
      ? (await kv.mget(cycleIds.map(id => `cycle:${id}`))).filter(Boolean) : [];
    return c.json({ profile, cycles });
  } catch (e) { return c.json({ error: `获取用户数据失败：${e}` }, 500); }
});

// ── Sync local cycle (invite-code legacy path) ────────────────────────────────
app.post("/make-server-d7eafa70/user/sync-local-cycle", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "未授权" }, 401);
    const { cycleData } = await c.req.json();
    if (!cycleData) return c.json({ error: "无效数据" }, 400);
    const existing = await kv.get(`invite_code:${cycleData.inviteCode}`);
    if (existing && (existing as any).usedBy && (existing as any).usedBy !== user.userId)
      return c.json({ error: "该邀请码已绑定到其他账号" }, 409);
    const cycleIds: string[] = (await kv.get(`user_cycles:${user.userId}`)) || [];
    if (cycleIds.includes(cycleData.id)) return c.json({ success: true });
    await kv.set(`cycle:${cycleData.id}`, { ...cycleData, userId: user.userId, email: user.email });
    await kv.set(`invite_code:${cycleData.inviteCode}`, { inviteCode: cycleData.inviteCode, usedBy: user.userId, usedAt: cycleData.paidAt || new Date().toISOString() });
    await kv.set(`user_cycles:${user.userId}`, [...cycleIds, cycleData.id]);
    return c.json({ success: true });
  } catch (e) { return c.json({ error: `同步失败：${e}` }, 500); }
});

// ── Activate invite code (legacy) ─────────────────────────────────────────────
app.post("/make-server-d7eafa70/user/activate-code", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const { inviteCode, type } = await c.req.json();
    if (!inviteCode || !type) return c.json({ error: "参数不完整" }, 400);
    const productType = type as ProductType;
    const { active } = await getActiveCycle(user.userId);
    if (active && cycleIncludesProduct(active, productType)) {
      const remaining = Math.ceil((new Date(active.endsAt).getTime() - Date.now()) / 86400000);
      return c.json({ error: "already_active", message: `你已经拥有该功能，当前周期剩余 ${remaining} 天`, cycle: active, remainingDays: remaining }, 409);
    }
    const codeRecord = await kv.get(`invite_code:${inviteCode}`);
    if (codeRecord && (codeRecord as any).usedAt) return c.json({ error: "该邀请码已被使用" }, 409);
    const now = new Date();
    await kv.set(`invite_code:${inviteCode}`, { inviteCode, usedBy: user.userId, usedAt: now.toISOString() });
    const cycle = await activatePaidProduct({
      userId: user.userId,
      email: user.email,
      productType,
      sessionId: `invite_${inviteCode}_${Date.now()}`,
      orderId: `ord_invite_${Date.now()}`,
      amountPaid: 0,
      currency: 'aud',
      paymentMethod: 'invite_code',
    });
    return c.json({ success: true, cycle });
  } catch (e) { return c.json({ error: `激活失败：${e}` }, 500); }
});

// ── Stripe: Create checkout session ──────────────────────────────────────────
// POST { productType: 'plan'|'ai'|'bundle', successUrl, cancelUrl }
app.post("/make-server-d7eafa70/payment/create-checkout", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "请先登录" }, 401);

    const { productType, successUrl, cancelUrl } = await c.req.json();
    const product = PRODUCTS[productType];
    if (!product) return c.json({ error: "无效的产品类型" }, 400);

    const { active } = await getActiveCycle(user.userId);
    if (active && cycleIncludesProduct(active, productType)) {
      const remaining = Math.ceil((new Date(active.endsAt).getTime() - Date.now()) / 86400000);
      return c.json({ error: "already_active", message: `你已经拥有该功能，当前周期剩余 ${remaining} 天`, remainingDays: remaining, cycle: active }, 409);
    }

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "wechat_pay", "alipay"],
      payment_method_options: {
        wechat_pay: { client: "web" },
      },
      line_items: [{
        price_data: {
          currency: "aud",
          product_data: { name: product.label, description: "AQUARION 手臂摔跤训练系统" },
          unit_amount: product.amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: successUrl + `?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.userId,
        email: user.email,
        productType,
      },
      customer_email: user.email,
    });

    // Store pending order
    await kv.set(`pending_order:${session.id}`, {
      sessionId: session.id,
      userId: user.userId,
      email: user.email,
      productType,
      amount: product.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return c.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.log("Create checkout error:", e);
    return c.json({ error: `创建支付会话失败：${e}` }, 500);
  }
});

// ── Stripe: Verify session and activate cycle ─────────────────────────────────
// GET ?session_id=xxx  (called from success page, requires auth)
app.get("/make-server-d7eafa70/payment/verify-session", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "未授权" }, 401);

    const sessionId = c.req.query("session_id");
    if (!sessionId) return c.json({ error: "缺少 session_id" }, 400);

    // Check if already activated
    const existingCycleKey = `checkout_cycle:${sessionId}`;
    const existingCycle = await kv.get(existingCycleKey);
    if (existingCycle) return c.json({ success: true, cycle: existingCycle, alreadyActivated: true });

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return c.json({ status: session.payment_status, paid: false, message: "订单正在确认中，请稍候刷新" });
    }

    const productType = session.metadata?.productType as 'plan' | 'ai' | 'bundle';
    if (!productType) return c.json({ error: "订单数据异常" }, 400);

    const cycle = await activatePaidProduct({
      userId: user.userId,
      email: user.email,
      productType,
      sessionId,
      orderId: session.payment_intent as string || sessionId,
      amountPaid: (session.amount_total || 0) / 100,
      currency: session.currency,
      paymentMethod: 'stripe',
    });

    // Update pending order status
    const pendingOrder = await kv.get(`pending_order:${sessionId}`);
    if (pendingOrder) {
      await kv.set(`pending_order:${sessionId}`, { ...(pendingOrder as any), status: 'completed', cycleId: (cycle as any).id, completedAt: new Date().toISOString() });
    }

    return c.json({ success: true, paid: true, cycle });
  } catch (e) {
    console.log("Verify session error:", e);
    return c.json({ error: `验证支付失败：${e}` }, 500);
  }
});

// ── Helper: map AUD amount (cents) → product type ─────────────────────────────
function amountToProductType(amount: number | null): 'plan' | 'ai' | 'bundle' | null {
  if (amount === 2000) return 'plan';
  if (amount === 9900) return 'ai';
  if (amount === 11000) return 'bundle';
  return null;
}

// ── Sync: manually search Stripe for recent paid sessions for this user ────────
// POST (requires auth) — called after user returns from Payment Link
app.post("/make-server-d7eafa70/payment/sync-payment-link", async (c) => {
  try {
    const user = await requireAuth(c);
    if (!user) return c.json({ error: "未授权" }, 401);

    const stripe = stripeClient();

    // Search recent checkout sessions where client_reference_id = userId
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
    });

    let activatedCycle = null;

    for (const session of sessions.data) {
      if (session.payment_status !== "paid") continue;
      const sessionUserId = session.client_reference_id || session.metadata?.userId;
      if (sessionUserId !== user.userId) continue;

      const existingCycleKey = `checkout_cycle:${session.id}`;
      const alreadyDone = await kv.get(existingCycleKey);
      if (alreadyDone) {
        activatedCycle = alreadyDone;
        continue;
      }

      const productType = session.metadata?.productType as 'plan' | 'ai' | 'bundle'
        || amountToProductType(session.amount_total);
      if (!productType) continue;

      const email = user.email || session.customer_email || session.customer_details?.email || "";
      activatedCycle = await activatePaidProduct({
        userId: user.userId,
        email,
        productType,
        sessionId: session.id,
        orderId: session.payment_intent as string || session.id,
        amountPaid: (session.amount_total || 0) / 100,
        currency: session.currency,
        paymentMethod: 'stripe_payment_link',
      });
      break; // activate one at a time
    }

    if (activatedCycle) {
      return c.json({ success: true, cycle: activatedCycle });
    }
    return c.json({ success: false, message: "未找到待激活的付款记录" });
  } catch (e) {
    console.log("Sync payment error:", e);
    return c.json({ error: `同步失败：${e}` }, 500);
  }
});

// ── Stripe: Webhook (server-side event listener) ──────────────────────────────
app.post("/make-server-d7eafa70/payment/webhook", async (c) => {
  try {
    const signature = c.req.header("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const body = await c.req.text();

    const stripe = stripeClient();
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err) {
        console.log("Webhook signature verification failed:", err);
        return c.json({ error: "Invalid signature" }, 400);
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.CheckoutSession;
      if (session.payment_status === "paid") {
        // Support both Checkout Sessions (metadata) and Payment Links (client_reference_id)
        const userId = session.metadata?.userId || session.client_reference_id || null;
        const email = session.metadata?.email || session.customer_email || session.customer_details?.email || "";
        const productType = session.metadata?.productType as 'plan' | 'ai' | 'bundle'
          || amountToProductType(session.amount_total);

        console.log("Webhook: userId=", userId, "productType=", productType, "amount=", session.amount_total);

        if (userId && productType) {
          const existingCycleKey = `checkout_cycle:${session.id}`;
          const alreadyDone = await kv.get(existingCycleKey);
          if (!alreadyDone) {
            const cycle = await activatePaidProduct({
              userId,
              email,
              productType,
              sessionId: session.id,
              orderId: session.payment_intent as string || session.id,
              amountPaid: (session.amount_total || 0) / 100,
              currency: session.currency,
              paymentMethod: 'stripe_payment_link',
            });
            console.log("Webhook: cycle activated", (cycle as any).id, "for user", userId);
          } else {
            console.log("Webhook: cycle already activated for session", session.id);
          }
        } else {
          console.log("Webhook: missing userId or productType — cannot activate cycle");
        }
      }
    }

    return c.json({ received: true });
  } catch (e) {
    console.log("Webhook error:", e);
    return c.json({ error: `Webhook error: ${e}` }, 500);
  }
});

// ── AI Coach ──────────────────────────────────────────────────────────────────
app.post("/make-server-d7eafa70/ai-coach", async (c) => {
  try {
    const { messages, userContext } = await c.req.json();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) return c.json({ error: "OpenAI API 密钥未配置" }, 500);
    const systemPrompt = `你是 AQUARION 专业手臂摔跤训练教练助手。用中文回答，语气专业但友好。\n\n用户信息：\n${userContext}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openaiApiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages.filter((m: any) => m.role !== 'system')],
        max_tokens: 1000, temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      return c.json({ error: `OpenAI 错误：${err.error?.message || response.status}` }, 500);
    }
    const data = await response.json();
    return c.json({ message: data.choices[0].message.content });
  } catch (e) { return c.json({ error: `AI 错误：${e}` }, 500); }
});

Deno.serve(app.fetch);
