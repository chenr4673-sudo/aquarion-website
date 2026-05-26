import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, AlertTriangle, Dumbbell } from 'lucide-react';
import { Button } from '../components/ui/button';
import AICoachLocked from './AICoachLocked';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const QUICK_QUESTIONS = [
  '如何提升我的内侧力？',
  '训练后手腕疼痛怎么办？',
  '比赛前一周应该如何准备？',
  '如何安排饮食和营养补充？',
  '我的技术路线适合我吗？',
  '如何预防训练损伤？',
];

export default function AICoach() {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 调试：检查环境变量
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('=== AI Coach Debug ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key starts with sk-:', apiKey?.startsWith('sk-'));
    console.log('All env vars:', import.meta.env);
  }, []);

  // 检查AI教练访问权限
  useEffect(() => {
    const currentCycleId = localStorage.getItem('currentCycleId');
    const paidCycles = localStorage.getItem('paidCycles');

    if (!currentCycleId || !paidCycles) {
      setHasAccess(false);
      return;
    }

    const cycles = JSON.parse(paidCycles);
    const activeCycle = cycles.find((cycle: any) =>
      cycle.id === currentCycleId && cycle.status === 'active'
    );

    if (!activeCycle || !activeCycle.hasAICoach) {
      setHasAccess(false);
      return;
    }

    setHasAccess(true);
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 如果没有访问权限，显示锁定页面
  if (!hasAccess) {
    return <AICoachLocked />;
  }

  const getUserContext = (): string => {
    const assessmentData = localStorage.getItem('assessmentData');
    const techRecommendation = localStorage.getItem('techRecommendation');

    if (!assessmentData) {
      return '用户尚未完成能力评估。';
    }

    const data = JSON.parse(assessmentData);
    const tech = techRecommendation ? JSON.parse(techRecommendation) : null;

    let context = `用户基本信息：\n`;
    context += `- 体重：${data.bodyWeight} kg\n`;
    context += `- 手掌长度：${data.palmLength} cm\n`;
    context += `- 前臂长度：${data.forearmLength} cm\n`;
    context += `- 每周训练频率：${data.weeklyFrequency} 次\n\n`;

    if (tech) {
      context += `推荐技术路线：${tech.recommendedStyle}\n`;
      context += `理由：${tech.reason}\n\n`;
    }

    context += `当前力量数据（1RM）：\n`;
    Object.entries(data.exercises).forEach(([key, value]: [string, any]) => {
      context += `- ${value.name}：${value.current1RM} kg\n`;
    });

    return context;
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = getUserContext();
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');

      // 调用后端 API（安全！）
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/ai-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: textToSend },
            ],
            userContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败：${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Coach error:', err);
      setError(err instanceof Error ? err.message : '未知错误');

      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我暂时无法回答。请稍后再试或联系技术支持。',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <MessageCircle className="w-10 h-10 text-[rgb(var(--power-orange))]" strokeWidth={2} />
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider">
                <span className="text-[rgb(var(--power-orange))]">AQUARION</span>{' '}
                <span className="text-[rgb(var(--foreground))]">AI 教练</span>
              </h1>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                专业手臂摔跤训练顾问 · 随时解答你的训练疑问
              </p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong>重要提示：</strong>AI 教练仅提供训练建议，不能替代专业医疗意见。
              如遇严重疼痛或损伤，请立即就医。AI 教练无法修改你的训练计划或评估数据。
            </div>
          </div>

          {error && error.includes('演示模式') && (
            <div className="mt-4 bg-orange-900/20 border border-[rgb(var(--power-orange))]/50 rounded-lg p-4 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-200">
                <strong>🤖 演示模式：</strong>当前使用模拟回复。要启用真实的 AI 教练，请配置 OpenAI API 密钥。
                详见 <code className="bg-orange-950/50 px-1 py-0.5 rounded">AI_COACH_SETUP.md</code> 文件。
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 sticky top-4">
              <h3 className="text-sm font-bold text-[rgb(var(--power-orange))] uppercase mb-4">快捷提问</h3>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                    className="w-full text-left text-sm p-3 bg-[rgb(var(--background))] hover:bg-orange-900/20 border border-[rgb(var(--border))] hover:border-[rgb(var(--power-orange))]/50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--power-orange))]/30 rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[rgb(var(--muted-foreground))]">
                    <Dumbbell className="w-16 h-16 text-[rgb(var(--power-orange))]/30 mb-4" />
                    <p className="text-lg font-semibold mb-2">欢迎来到 AQUARION AI 教练</p>
                    <p className="text-sm max-w-md">
                      我可以回答关于手臂摔跤训练、技术、营养、比赛准备等方面的问题。
                      <br />
                      使用左侧的快捷提问或直接输入你的问题。
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-[rgb(var(--power-orange))] text-white'
                              : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-60 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[rgb(var(--muted))] rounded-lg p-4">
                          <Loader2 className="w-5 h-5 text-[rgb(var(--power-orange))] animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {error && (
                <div className="px-6 py-3 bg-red-900/20 border-t border-red-600/50">
                  <p className="text-sm text-red-400">错误：{error}</p>
                </div>
              )}

              <div className="border-t border-[rgb(var(--power-orange))]/30 p-4 bg-[rgb(var(--background))]">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入你的问题... (Enter 发送，Shift+Enter 换行)"
                    disabled={isLoading}
                    className="flex-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-[rgb(var(--power-orange))]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="bg-[rgb(var(--power-orange))] hover:bg-[rgb(var(--power-orange))]/90 text-white px-6 self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
