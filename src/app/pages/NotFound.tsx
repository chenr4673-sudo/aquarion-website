import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="text-center relative z-10">
        <div className="inline-block mb-8">
          <div className="text-9xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            404
          </div>
        </div>

        <h1 className="text-4xl mb-4">页面未找到</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto">
          抱歉，你访问的页面不存在。可能是链接错误或页面已被移除。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-background rounded hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 border border-border rounded hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
