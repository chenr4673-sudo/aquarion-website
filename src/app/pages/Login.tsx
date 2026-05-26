import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Dumbbell } from "lucide-react";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/5 via-transparent to-[rgb(var(--accent))]/5 pointer-events-none" />

      <div className="absolute top-20 left-20 w-72 h-72 bg-[rgb(var(--primary))]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[rgb(var(--accent))]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-lg mb-4">
            <Dumbbell className="w-8 h-8 text-[rgb(var(--background))]" />
          </div>
          <h1 className="tracking-wider uppercase">
            ARM <span className="text-[rgb(var(--primary))]">WRESTLING</span>
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-2">
            {isLogin ? "登录你的账户" : "创建新账户"}
          </p>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm mb-2">姓名</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[rgb(var(--input))]-background border border-[rgb(var(--border))] rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="输入你的姓名"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-2">邮箱</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[rgb(var(--input))]-background border border-[rgb(var(--border))] rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="输入你的邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">密码</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[rgb(var(--input))]-background border border-[rgb(var(--border))] rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="输入你的密码"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm mb-2">确认密码</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-[rgb(var(--input))]-background border border-[rgb(var(--border))] rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="再次输入密码"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[rgb(var(--border))]" />
                  <span className="text-[rgb(var(--muted-foreground))]">记住我</span>
                </label>
                <a href="#" className="text-[rgb(var(--primary))] hover:underline">
                  忘记密码？
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-[rgb(var(--background))] rounded hover:opacity-90 transition-opacity font-medium"
            >
              {isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[rgb(var(--muted-foreground))]">
              {isLogin ? "还没有账户？" : "已有账户？"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[rgb(var(--primary))] hover:underline"
            >
              {isLogin ? "立即注册" : "立即登录"}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgb(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[rgb(var(--card))] text-[rgb(var(--muted-foreground))]">或</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="px-4 py-2 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--secondary))] transition-colors">
              Google
            </button>
            <button className="px-4 py-2 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--secondary))] transition-colors">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
