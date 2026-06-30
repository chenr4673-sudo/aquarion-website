import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, AlertTriangle, Zap } from 'lucide-react';
import AICoachLocked from './AICoachLocked';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/* ── Palette: Batman / midnight electric-blue ── */
const C = {
  bg:         '#03040d',          /* near-black with blue tint */
  surface:    '#07091a',          /* deep navy card surface */
  surfaceHi:  '#0c0f26',          /* slightly lighter surface */
  border:     'rgba(90,70,200,0.25)',
  borderGlow: 'rgba(120,90,255,0.55)',
  accent:     '#6b4de0',          /* electric violet */
  accentBrt:  '#9b7fff',          /* bright violet highlight */
  accentDim:  'rgba(107,77,224,0.18)',
  userBubble: 'rgba(75,55,190,0.85)',
  aiBubble:   '#0d1025',
  text:       '#d8d4f5',          /* soft lavender white */
  textMuted:  '#7068a8',
  glow:       '0 0 24px rgba(107,77,224,0.45)',
};

const cinzel = { fontFamily: 'Cinzel, Georgia, serif' };
const garamond = { fontFamily: 'EB Garamond, Georgia, serif' };


export default function AICoach() {
  const { t } = useLanguage();
  const { activeCycle, loading } = useAuth();
  const QUICK_QUESTIONS = [t("coach.q1"),t("coach.q2"),t("coach.q3"),t("coach.q4"),t("coach.q5"),t("coach.q6")];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Access is determined solely by backend Supabase data, not localStorage
  const hasAccess = !loading && !!(
    activeCycle &&
    activeCycle.hasAICoach &&
    activeCycle.status === 'active' &&
    new Date(activeCycle.endsAt).getTime() > Date.now()
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 style={{ width: 24, height: 24, color: C.accent, animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!hasAccess) return <AICoachLocked />;

  const getUserContext = (): string => {
    const assessmentData = localStorage.getItem('assessmentData');
    const techRecommendation = localStorage.getItem('techRecommendation');
    if (!assessmentData) return '用户尚未完成能力评估。';
    const data = JSON.parse(assessmentData);
    const tech = techRecommendation ? JSON.parse(techRecommendation) : null;
    let ctx = `用户基本信息：\n- 体重：${data.bodyWeight} kg\n- 手掌长度：${data.palmLength} cm\n- 前臂长度：${data.forearmLength} cm\n- 每周训练频率：${data.weeklyFrequency} 次\n\n`;
    if (tech) ctx += `推荐技术路线：${tech.recommendedStyle}\n理由：${tech.reason}\n\n`;
    ctx += `当前力量数据（1RM）：\n`;
    Object.entries(data.exercises).forEach(([, value]: [string, any]) => {
      ctx += `- ${value.name}：${value.current1RM} kg\n`;
    });
    return ctx;
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;
    setError(null);
    const userMessage: Message = { role: 'user', content: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/ai-coach`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({
            messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: textToSend }],
            userContext: getUserContext(),
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败：${response.status}`);
      }
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: Date.now() }]);
    } catch (err) {
      console.error('AI Coach error:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我暂时无法回答。请稍后再试或联系技术支持。', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div className="container mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-7">
          <h1
            className="text-2xl md:text-4xl font-bold uppercase tracking-[0.2em] mb-2"
            style={{ ...cinzel, color: C.text }}
          >
            AQUARION{' '}
            <span style={{ color: C.accentBrt, textShadow: `0 0 18px ${C.accent}` }}>{t('coach.title')}</span>
          </h1>
          <div className="flex items-center gap-3 mb-5">
            <span style={{ display: 'block', height: 1, width: 32, background: C.accent }} />
            <p className="text-xs tracking-[0.2em] uppercase" style={{ ...cinzel, color: C.textMuted }}>
              {t('coach.subtitle')}
            </p>
          </div>

          {/* Warning banner */}
          <div style={{
            background: 'rgba(80,55,10,0.2)',
            border: '1px solid rgba(180,140,30,0.35)',
            borderRadius: 4,
            padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <AlertTriangle style={{ width: 16, height: 16, color: '#c9a830', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8rem', color: '#d4bc72', ...garamond }}>
              {t("coach.warning")}
            </p>
          </div>
        </div>

        {/* ── Layout grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              padding: 16,
              position: 'sticky',
              top: 16,
            }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-4"
                style={{ ...cinzel, color: C.accentBrt }}>{t("coach.quickq")}
              </p>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      color: C.text,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'border-color 0.2s, background 0.2s',
                      ...garamond,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = C.accent;
                      (e.currentTarget as HTMLButtonElement).style.background = C.accentDim;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-3">
            <div style={{
              background: C.surface,
              border: `1px solid ${C.borderGlow}`,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 280px)',
              boxShadow: C.glow,
              overflow: 'hidden',
            }}>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: C.textMuted }}>
                    <Zap style={{ width: 48, height: 48, marginBottom: 16, color: C.accent, opacity: 0.4 }} />
                    <p className="text-base font-semibold mb-2" style={{ ...cinzel, color: C.text, letterSpacing: '0.1em' }}>
                      {t("coach.welcome")}
                    </p>
                    <p style={{ fontSize: '0.9rem', maxWidth: 360, ...garamond, color: C.textMuted, lineHeight: 1.7 }}>
                      {t("coach.welcome.desc")}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: 4,
                          background: msg.role === 'user' ? C.userBubble : C.aiBubble,
                          border: `1px solid ${msg.role === 'user' ? 'rgba(120,90,255,0.5)' : C.border}`,
                          boxShadow: msg.role === 'user' ? `0 0 12px rgba(107,77,224,0.3)` : 'none',
                        }}>
                          <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', ...garamond, color: C.text, lineHeight: 1.7 }}>
                            {msg.content}
                          </p>
                          <p style={{ fontSize: '0.7rem', opacity: 0.45, marginTop: 6, color: C.textMuted, ...cinzel }}>
                            {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '12px 16px', background: C.aiBubble, border: `1px solid ${C.border}`, borderRadius: 4 }}>
                          <Loader2 style={{ width: 18, height: 18, color: C.accent, animation: 'spin 1s linear infinite' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error bar */}
              {error && (
                <div style={{ padding: '10px 24px', background: 'rgba(120,20,20,0.2)', borderTop: '1px solid rgba(200,50,50,0.3)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#f87171' }}>错误：{error}</p>
                </div>
              )}

              {/* Input bar */}
              <div style={{
                borderTop: `1px solid ${C.borderGlow}`,
                padding: 16,
                background: C.bg,
                display: 'flex',
                gap: 10,
              }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("coach.placeholder")}
                  disabled={isLoading}
                  rows={3}
                  style={{
                    flex: 1,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 3,
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    resize: 'none',
                    color: C.text,
                    outline: 'none',
                    ...garamond,
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = C.accent)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    padding: '0 22px',
                    background: (!input.trim() || isLoading) ? 'rgba(107,77,224,0.25)' : C.accent,
                    border: `1px solid ${C.accent}`,
                    borderRadius: 3,
                    color: '#fff',
                    cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: (!input.trim() || isLoading) ? 'none' : C.glow,
                    alignSelf: 'flex-end',
                    height: 48,
                  }}
                >
                  {isLoading
                    ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                    : <Send style={{ width: 18, height: 18 }} />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
