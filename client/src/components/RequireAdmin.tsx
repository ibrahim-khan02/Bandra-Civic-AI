
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function RequireAdmin() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    fetch(`${API_URL}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setIsAuthorized(response.ok);
      })
      .catch(() => {
        setIsAuthorized(false);
      });
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    sessionStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
