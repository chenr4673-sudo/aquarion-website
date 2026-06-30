import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Loader2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectId } from '../../utils/supabase/info';

const cinzel = { fontFamily: 'Cinzel, Georgia, serif' };
const garamond = { fontFamily: 'EB Garamond, Georgia, serif' };

type Status = 'verifying' | 'success' | 'pending' | 'error';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { session, refreshCycles } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('正在验证支付状态…');
  const [cycle, setCycle] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const verify = async () => {
    if (!sessionId || !session) {
      setStatus('error');
      setMessage('缺少支付会话信息，请返回首页');
      return;
    }

    setStatus('verifying');
    setMessage('正在验证支付状态…');

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/payment/verify-session?session_id=${sessionId}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const data = await res.json();

      if (data.success && data.paid) {
        setCycle(data.cycle);
        setStatus('success');
        setMessage('支付成功！你的训练周期已激活。');
        // Sync to localStorage
        if (data.cycle) {
          const existing = JSON.parse(localStorage.getItem('paidCycles') || '[]');
          if (!existing.find((c: any) => c.id === data.cycle.id)) existing.push(data.cycle);
          localStorage.setItem('paidCycles', JSON.stringify(existing));
          localStorage.setItem('currentCycleId', data.cycle.id);
        }
        await refreshCycles();
      } else if (data.paid === false) {
        setStatus('pending');
        setMessage('订单正在确认中，请稍候…');
      } else if (data.error) {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (e) {
      setStatus('error');
      setMessage(`验证失败：${e}`);
    }
  };

  useEffect(() => {
    if (session) verify();
  }, [session]);

  // Auto-retry for pending status (up to 5 times)
  useEffect(() => {
    if (status === 'pending' && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(n => n + 1);
        verify();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, retryCount]);

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        maxWidth: 480, width: '100%',
        background: 'rgb(6,4,4)',
        border: `1px solid ${status === 'success' ? 'rgba(160,8,12,0.5)' : status === 'error' ? 'rgba(200,60,60,0.4)' : 'rgba(45,20,20,1)'}`,
        borderRadius: 4,
        padding: '48px 40px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{ marginBottom: 24 }}>
          {status === 'verifying' || status === 'pending' ? (
            <Loader2 style={{ width: 48, height: 48, color: 'rgb(160,8,12)', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          ) : status === 'success' ? (
            <CheckCircle style={{ width: 48, height: 48, color: '#4ade80', margin: '0 auto' }} />
          ) : (
            <XCircle style={{ width: 48, height: 48, color: '#f87171', margin: '0 auto' }} />
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.2rem', letterSpacing: '0.2em', marginBottom: 12, color: 'rgb(245,240,235)', ...cinzel }}>
          {status === 'verifying' ? '支付验证中' :
           status === 'pending' ? '订单确认中' :
           status === 'success' ? '支付成功' : '验证失败'}
        </h1>

        {/* Ornament */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ display: 'block', height: 1, width: 40, background: 'rgb(160,8,12)' }} />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgb(160,8,12)', ...cinzel }}>AQUARION</span>
          <span style={{ display: 'block', height: 1, width: 40, background: 'rgb(160,8,12)' }} />
        </div>

        {/* Message */}
        <p style={{ fontSize: '0.95rem', color: 'rgb(155,140,132)', marginBottom: 24, lineHeight: 1.7, ...garamond }}>
          {message}
          {status === 'pending' && retryCount > 0 && ` (${retryCount}/5)`}
        </p>

        {/* Cycle details on success */}
        {status === 'success' && cycle && (
          <div style={{
            background: 'rgba(160,8,12,0.06)',
            border: '1px solid rgba(160,8,12,0.25)',
            borderRadius: 3,
            padding: '16px 20px',
            marginBottom: 28,
            textAlign: 'left',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
              <CycleDetail label="产品" value={typeLabel(cycle.type)} />
              <CycleDetail label="订单号" value={(cycle.orderId || '').slice(-12)} />
              <CycleDetail label="开始日期" value={new Date(cycle.startedAt).toLocaleDateString('zh-CN')} />
              <CycleDetail label="结束日期" value={new Date(cycle.endsAt).toLocaleDateString('zh-CN')} />
              <CycleDetail label="训练计划" value={cycle.hasPlan ? '✓ 已解锁' : '✗'} />
              <CycleDetail label="AI 教练" value={cycle.hasAICoach ? '✓ 已解锁' : '✗'} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status === 'success' && (
            <>
              {cycle?.hasPlan && (
                <ActionButton primary onClick={() => navigate('/assessment')}>
                  开始能力评估
                </ActionButton>
              )}
              {cycle?.hasAICoach && !cycle?.hasPlan && (
                <ActionButton primary onClick={() => navigate('/ai-coach')}>
                  前往 AI 教练
                </ActionButton>
              )}
              <ActionButton onClick={() => navigate('/my-plan')}>
                查看我的训练计划
              </ActionButton>
            </>
          )}
          {status === 'pending' && retryCount >= 5 && (
            <ActionButton onClick={() => { setRetryCount(0); verify(); }}>
              <RefreshCw size={14} style={{ marginRight: 6 }} />
              手动刷新
            </ActionButton>
          )}
          {status === 'error' && (
            <ActionButton onClick={() => navigate('/')}>
              返回首页
            </ActionButton>
          )}
          <ActionButton onClick={() => navigate('/')}>
            返回首页
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function CycleDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgb(155,140,132)', marginBottom: 2, fontFamily: 'Cinzel, Georgia, serif' }}>{label}</p>
      <p style={{ fontSize: '0.8rem', color: 'rgb(245,240,235)', fontFamily: 'EB Garamond, Georgia, serif' }}>{value}</p>
    </div>
  );
}

function ActionButton({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px',
        background: primary ? 'rgb(160,8,12)' : 'none',
        border: `1px solid ${primary ? 'rgb(160,8,12)' : 'rgba(45,20,20,1)'}`,
        borderRadius: 2,
        color: 'rgb(245,240,235)',
        fontSize: '0.65rem', letterSpacing: '0.2em',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Cinzel, Georgia, serif',
      }}
    >
      {children}
    </button>
  );
}

function typeLabel(type: string) {
  const map: Record<string, string> = { plan: '个人专属计划定制', ai: '私人专属 AI 教练', bundle: '完整 AQUARION 体验' };
  return map[type] || type;
}
