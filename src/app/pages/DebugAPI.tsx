import { useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export function DebugAPI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const testHealthCheck = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/health`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testTrainingPlanAPI = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/generate-training-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            experience: "1-2y",
            age: 25,
            weight: 75,
            armLength: "20",
            forearmCircumference: "28",
            styles: ["内侧勾手"],
            goals: ["力量增长"],
            injuries: [],
            frequency: "3",
            frontendStrength: {
              curl4cm: "40",
              curl6cm: "45",
              singleCurl: "35",
              dumbbellWrist: "25",
            },
            baseStrength: {
              pullup: "80",
              bicepCurl: "30",
              tigerGrip: "40",
              thumbLift: "25",
              radialLift: "30",
              tigerLift: "35",
              insideCurl: "35",
              benchPress: "65",
              shoulderPress: "40",
              alsenRow: "50",
            },
          }),
        }
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setResponse({ status: res.status, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-8">API 调试工具</h1>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 mb-6">
          <h2 className="text-2xl mb-4">配置信息</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>Project ID: {projectId}</div>
            <div>API Base: https://{projectId}.supabase.co/functions/v1/make-server-d7eafa70</div>
            <div>Public Key: {publicAnonKey?.substring(0, 20)}...</div>
          </div>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 mb-6">
          <h2 className="text-2xl mb-4">测试 API</h2>
          
          <div className="space-y-4">
            <button
              onClick={testHealthCheck}
              disabled={loading}
              className="w-full py-3 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-[rgb(var(--primary))]/90 transition-all disabled:opacity-50"
            >
              {loading ? "测试中..." : "测试健康检查 (/health)"}
            </button>

            <button
              onClick={testTrainingPlanAPI}
              disabled={loading}
              className="w-full py-3 bg-[rgb(var(--accent))] text-[rgb(var(--background))] hover:bg-[rgb(var(--accent))]/90 transition-all disabled:opacity-50"
            >
              {loading ? "生成中..." : "测试训练计划生成 (/generate-training-plan)"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[rgb(var(--destructive))]/10 border border-destructive/20 p-6 mb-6">
            <h3 className="text-xl text-[rgb(var(--destructive))] mb-2">错误</h3>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {response && (
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6">
            <h3 className="text-xl mb-4">响应结果</h3>
            <div className="mb-4">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">HTTP 状态: </span>
              <span className={`font-medium ${response.status === 200 ? 'text-chart-4' : 'text-[rgb(var(--accent))]'}`}>
                {response.status}
              </span>
            </div>
            <pre className="text-sm bg-[rgb(var(--secondary))] p-4 overflow-auto whitespace-pre-wrap max-h-96">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
