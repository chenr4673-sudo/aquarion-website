# ✅ Vercel 部署 - 正确且安全的配置

## 🎉 好消息！

你发现了一个**非常严重的安全问题**！我已经修复了代码，现在 API Key **完全安全**了！

---

## 🔒 安全架构（已实现）

### 之前（不安全❌）：
```
用户浏览器 → 直接调用 OpenAI API
            ↑
        API Key 暴露在前端代码中！
```

### 现在（安全✅）：
```
用户浏览器 → Supabase Edge Function → OpenAI API
                    ↑
                API Key 安全存储在服务器！
```

---

## 📋 Vercel 配置步骤（更新版）

### ❌ 不需要添加环境变量！

在 Vercel 配置页面：

1. **Framework Preset**: Vite ✅
2. **Build Command**: `pnpm build` ✅
3. **Output Directory**: `dist` ✅
4. **Install Command**: `pnpm install` ✅

5. **Environment Variables（环境变量）**: 
   
   ⚠️ **重要：不需要添加任何环境变量！**
   
   - ❌ 删除 `EXAMPLE_NAME`（如果有）
   - ❌ **不要添加** `VITE_OPENAI_API_KEY`
   - ✅ 保持环境变量部分为空

6. **点击 Deploy** 按钮

---

## 🔧 OpenAI API Key 配置（在 Supabase）

API Key 现在需要配置在 **Supabase** 的环境变量中，而不是 Vercel！

### 配置步骤：

1. **访问 Supabase 项目**
   ```
   https://supabase.com/dashboard
   ```

2. **选择你的项目**
   - 找到 AQUARION 相关的项目

3. **进入项目设置**
   - 左侧菜单 → **Settings** → **Edge Functions**

4. **添加环境变量**
   - 点击 **"Add new secret"**
   - **Name**: `OPENAI_API_KEY`
   - **Value**: 你的新 OpenAI API Key（sk-proj-开头）
   - 点击 **Save**

---

## 🌐 为什么这样更安全？

### ✅ 安全优势：

1. **API Key 不在前端代码中**
   - 用户无法在浏览器中看到 API Key
   - 查看网页源代码也看不到

2. **API Key 只在服务器端**
   - 存储在 Supabase 服务器环境变量中
   - 只有后端代码可以访问

3. **防止滥用**
   - 即使有人反编译你的前端代码，也拿不到 API Key
   - 你的 OpenAI 额度是安全的

4. **可以添加额外保护**
   - 后续可以添加请求频率限制
   - 可以添加用户认证
   - 可以记录使用日志

---

## 📝 完整部署检查清单

### Vercel 部署：

- [ ] Framework: Vite
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `dist`
- [ ] Environment Variables: **留空**（不需要任何环境变量）
- [ ] 点击 Deploy

### Supabase 配置：

- [ ] 登录 Supabase Dashboard
- [ ] 进入项目设置 → Edge Functions
- [ ] 添加环境变量：`OPENAI_API_KEY`
- [ ] 值为你的新 OpenAI API Key
- [ ] 保存

---

## 🎯 测试部署

部署成功后：

1. **访问你的网站**
   ```
   https://你的域名.vercel.app
   ```

2. **测试 AI 教练功能**
   - 使用邀请码 `AQUA-AI-2024` 或 `AQUA-BUNDLE-2024` 解锁 AI 教练
   - 进入 AI 教练页面
   - 发送一条测试消息
   - 如果收到 AI 回复，说明配置成功！

3. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Network 标签
   - 应该看到请求发送到：`supabase.co/functions/v1/make-server-d7eafa70/ai-coach`
   - 不应该看到任何 `api.openai.com` 的直接请求

---

## 💡 常见问题

### Q: AI 教练不工作怎么办？

**A**: 检查以下几点：
1. Supabase 环境变量 `OPENAI_API_KEY` 是否正确配置
2. OpenAI API Key 是否有效（访问 platform.openai.com 确认）
3. OpenAI 账户是否有余额
4. 浏览器控制台是否有错误信息

### Q: 为什么不在 Vercel 配置 API Key？

**A**: 因为 `VITE_` 开头的环境变量会被打包进前端代码，任何人都能看到。而 Supabase Edge Function 的环境变量是服务器端的，完全安全。

### Q: 如果我想换新的 API Key 怎么办？

**A**: 只需要在 Supabase 的 Edge Functions 设置中更新 `OPENAI_API_KEY` 的值即可，不需要重新部署 Vercel。

---

## 🔍 技术细节（给开发者）

### 代码更改：

1. **新增后端 API 端点**
   - 文件：`/supabase/functions/server/ai-coach.ts`
   - 路由：`/make-server-d7eafa70/ai-coach`

2. **前端调用后端**
   - 文件：`/src/app/pages/AICoach.tsx`
   - 改为调用 Supabase Edge Function
   - 不再直接调用 OpenAI API

3. **API Key 存储**
   - 从 Vercel 环境变量移到 Supabase 环境变量
   - 变量名从 `VITE_OPENAI_API_KEY` 改为 `OPENAI_API_KEY`

---

## ✨ 总结

现在你的系统架构是：

```
前端（Vercel）
    ↓ 公开访问，安全
后端（Supabase Edge Function）
    ↓ API Key 在这里，完全安全！
OpenAI API
```

**代码已推送到 GitHub** ✅  
**可以安全部署了** ✅  
**API Key 完全安全** ✅
