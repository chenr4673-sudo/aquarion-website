import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Copy, Check } from 'lucide-react';
import { generateInviteCode, generateBatchCodes } from '../utils/inviteCode';

export default function AdminInviteCodes() {
  const [generatedCodes, setGeneratedCodes] = useState<{ code: string; type: string; copied: boolean }[]>([]);

  const handleGenerateSingle = (type: 'plan' | 'ai' | 'bundle') => {
    const code = generateInviteCode(type);
    setGeneratedCodes(prev => [{ code, type, copied: false }, ...prev]);
  };

  const handleGenerateBatch = (type: 'plan' | 'ai' | 'bundle', count: number) => {
    const codes = generateBatchCodes(type, count);
    const newCodes = codes.map(code => ({ code, type, copied: false }));
    setGeneratedCodes(prev => [...newCodes, ...prev]);
  };

  const handleCopy = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setGeneratedCodes(prev => prev.map((item, i) =>
      i === index ? { ...item, copied: true } : item
    ));
    setTimeout(() => {
      setGeneratedCodes(prev => prev.map((item, i) =>
        i === index ? { ...item, copied: false } : item
      ));
    }, 2000);
  };

  const handleCopyAll = () => {
    const allCodes = generatedCodes.map(item => `${item.code} (${item.type})`).join('\n');
    navigator.clipboard.writeText(allCodes);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-8">
          <span className="text-[rgb(var(--power-red))]">邀请码</span> 管理
        </h1>

        {/* 生成邀请码按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-[rgb(var(--power-red))]">训练计划</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">¥30 / 6周</p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateSingle('plan')}
                className="w-full bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))]"
              >
                生成 1 个邀请码
              </Button>
              <Button
                onClick={() => handleGenerateBatch('plan', 10)}
                variant="outline"
                className="w-full"
              >
                批量生成 10 个
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-[rgb(var(--power-orange))]">AI 教练</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">¥150 / 6周</p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateSingle('ai')}
                className="w-full bg-[rgb(var(--power-orange))] hover:opacity-90"
              >
                生成 1 个邀请码
              </Button>
              <Button
                onClick={() => handleGenerateBatch('ai', 10)}
                variant="outline"
                className="w-full"
              >
                批量生成 10 个
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-[rgb(var(--power-gold))]">完整体验</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">¥180 / 6周</p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateSingle('bundle')}
                className="w-full bg-[rgb(var(--power-gold))] text-black hover:opacity-90"
              >
                生成 1 个邀请码
              </Button>
              <Button
                onClick={() => handleGenerateBatch('bundle', 10)}
                variant="outline"
                className="w-full"
              >
                批量生成 10 个
              </Button>
            </div>
          </Card>
        </div>

        {/* 已生成的邀请码列表 */}
        {generatedCodes.length > 0 && (
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">已生成邀请码 ({generatedCodes.length})</h2>
              <Button
                onClick={handleCopyAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                复制全部
              </Button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {generatedCodes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[rgb(var(--background))] p-3 rounded border border-[rgb(var(--border))]"
                >
                  <div className="flex-1">
                    <code className="text-lg font-mono text-[rgb(var(--power-red))]">
                      {item.code}
                    </code>
                    <span className="ml-4 text-sm text-[rgb(var(--muted-foreground))]">
                      类型: {item.type === 'plan' ? '训练计划' : item.type === 'ai' ? 'AI教练' : '完整体验'}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleCopy(index, item.code)}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    {item.copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">使用说明</h3>
          <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
            <li>• 生成邀请码后，复制发送给用户</li>
            <li>• 每个邀请码只能使用一次</li>
            <li>• 邀请码格式：AQUA-类型-随机码</li>
            <li>• 用户在首页输入邀请码即可解锁对应服务</li>
            <li>• 建议：收款后再发送邀请码</li>
          </ul>
        </div>

        {/* 预设邀请码说明 */}
        <div className="mt-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">预设测试邀请码</h3>
          <div className="space-y-2 text-sm">
            <div className="font-mono">
              <strong className="text-[rgb(var(--power-red))]">AQUA-PLAN-2024</strong>
              <span className="ml-4 text-[rgb(var(--muted-foreground))]">→ 训练计划</span>
            </div>
            <div className="font-mono">
              <strong className="text-[rgb(var(--power-orange))]">AQUA-AI-2024</strong>
              <span className="ml-4 text-[rgb(var(--muted-foreground))]">→ AI教练</span>
            </div>
            <div className="font-mono">
              <strong className="text-[rgb(var(--power-gold))]">AQUA-BUNDLE-2024</strong>
              <span className="ml-4 text-[rgb(var(--muted-foreground))]">→ 完整体验</span>
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-4">
            这些是在代码中预设的测试邀请码，可用于测试功能。
          </p>
        </div>
      </div>
    </div>
  );
}
