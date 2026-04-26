import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ManuscriptProvider } from "./context/ManuscriptContext";
import { AuthModal } from "./components/AuthModal";

function AppInner() {
  const { authOpen, closeAuth, login } = useAuth();
  return (
    <>
      <RouterProvider router={router} />
      <AuthModal isOpen={authOpen} onClose={closeAuth} onLogin={login} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ManuscriptProvider>
        <AppInner />
      </ManuscriptProvider>
    </AuthProvider>
  );
}
