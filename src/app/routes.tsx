import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import TechAnalysis from "./pages/TechAnalysis";
import TrainingPlan from "./pages/TrainingPlan";
import AICoach from "./pages/AICoach";
import AdminInviteCodes from "./pages/AdminInviteCodes";
import MyPlan from "./pages/MyPlan";
import PaymentSuccess from "./pages/PaymentSuccess";
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
      { path: "my-plan", Component: MyPlan },
      { path: "payment-success", Component: PaymentSuccess },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin/invite-codes",
    Component: AdminInviteCodes,
  },
]);
