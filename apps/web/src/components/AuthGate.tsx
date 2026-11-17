import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../api/session";

export function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession();

  if (session.isLoading) {
    return (
      <div className="boot">
        <div className="mark">C</div>
        <p>Opening the workspace</p>
      </div>
    );
  }

  if (session.isError) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
