import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import TechAnalysis from "./pages/TechAnalysis";
import TrainingPlan from "./pages/TrainingPlan";
import AICoach from "./pages/AICoach";
import AdminInviteCodes from "./pages/AdminInviteCodes";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "assessment", Component: Assessment },
      { path: "tech-analysis", Component: TechAnalysis },
      { path: "training-plan", Component: TrainingPlan },
      { path: "ai-coach", Component: AICoach },
      { path: "*", Component: NotFound },
    ],
  },
  // 管理员页面 - 独立路由，无导航栏
  {
    path: "/admin/invite-codes",
    Component: AdminInviteCodes,
  },
]);