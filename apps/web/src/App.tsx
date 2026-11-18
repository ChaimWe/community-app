import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthGate } from "./components/AuthGate";
import { AppLayout } from "./layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Events } from "./pages/Events";
import { Groups } from "./pages/Groups";
import { Login } from "./pages/Login";
import { Members } from "./pages/Members";
import { PendingRequests } from "./pages/PendingRequests";
import { useSession } from "./api/session";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  if (session.isLoading) return null;
  if (session.data?.isAdmin) return <>{children}</>;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <AuthGate>
              <AppLayout />
            </AuthGate>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/pending" element={<AdminRoute><PendingRequests /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
