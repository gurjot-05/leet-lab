import { useEffect } from "react";
import Layout from "./layout/Layout";
import { Loader2 } from "lucide-react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import SignupPage from "./pages/SignupPage";
import AddProblem from "./pages/AddProblem";
import AdminRoute from "./components/AdminRoute";
import { useAuthStore } from "./store/useAuthStore";
import { Navigate, Route, Routes } from "react-router-dom";
import UpdateProblem from "./pages/UpdateProblem";
import ProblemPage from "./pages/ProblemPage";

const App = () => {
  const { authUser, checkUser, isCheckingUser } = useAuthStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (isCheckingUser && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading...
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-start">
      <Toaster />

      <Routes>
        {/* ──────────────────────  Navbar + Outlet wrapper  ───────────────────── */}
        <Route element={<Layout />}>
          {/* Landing / problems list */}
          <Route
            index
            element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="problem/:id"
            element={
              authUser ? <ProblemPage /> : <Navigate to="/login" replace />
            }
          />

          {/* Admin-only pages (still inside Layout so they get the navbar) */}
          <Route element={<AdminRoute />}>
            <Route
              path="add-problem"
              element={authUser ? <AddProblem /> : <Navigate to="/" replace />}
            />
            <Route
              path="edit-problem/:id"
              element={
                authUser ? <UpdateProblem /> : <Navigate to="/" replace />
              }
            />
          </Route>
        </Route>

        {/* Auth pages (no navbar) */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
};
export default App;
