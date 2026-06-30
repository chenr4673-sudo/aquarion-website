import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        {/* MARKER-MAKE-KIT-INVOKED */}
        <RouterProvider router={router} />
      </AuthProvider>
    </LanguageProvider>
  );
}
