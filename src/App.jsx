import { Routes, Route, Navigate } from "react-router-dom";

// AUTH
import Login from "./pages/Login/Login";
import Register from "./pages/Register";

// DASHBOARD
import User from "./pages/User/User";
import Admin from "./pages/Admin";

// MODULES USER
import Rutina from "./pages/Rutina";
import Actividades from "./pages/User/Actividades/Actividades";
import Estadisticas from "./pages/User/Estadisticas/Estadisticas";
import Motivacion from "./pages/Motivacion";
import Diario from "./pages/Diario";
import Gustos from "./pages/Gustos";
import Configuracion from "./pages/Configuracion";

// ======================
// PRIVATE ROUTE FIX FINAL
// ======================
function PrivateRoute({ children, role }) {
  const session = JSON.parse(localStorage.getItem("usuario"));

  // sin sesión → login
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const userRole = (session.role || "").toLowerCase().trim();

  // SOLO valida role si viene definido (admin/user)
  if (role && role !== userRole) {
    return <Navigate to="/user" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>

      {/* ======================
          AUTH
      ====================== */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ======================
          ADMIN
      ====================== */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <Admin />
          </PrivateRoute>
        }
      />

      {/* ======================
          USER DASHBOARD
      ====================== */}
      <Route
        path="/user"
        element={
          <PrivateRoute role="user">
            <User />
          </PrivateRoute>
        }
      />

      {/* ======================
          MODULES USER (SIN ROLE CHECK)
          👉 FIX IMPORTANTE
      ====================== */}

      <Route
        path="/rutina"
        element={
          <PrivateRoute>
            <Rutina />
          </PrivateRoute>
        }
      />

      <Route
        path="/actividades"
        element={
          <PrivateRoute>
            <Actividades />
          </PrivateRoute>
        }
      />

      <Route
        path="/estadisticas"
        element={
          <PrivateRoute>
            <Estadisticas />
          </PrivateRoute>
        }
      />

      <Route
        path="/motivacion"
        element={
          <PrivateRoute>
            <Motivacion />
          </PrivateRoute>
        }
      />

      <Route
        path="/diario"
        element={
          <PrivateRoute>
            <Diario />
          </PrivateRoute>
        }
      />

      <Route
        path="/gustos"
        element={
          <PrivateRoute>
            <Gustos />
          </PrivateRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <PrivateRoute>
            <Configuracion />
          </PrivateRoute>
        }
      />

      {/* ======================
          FALLBACK (ANTI BUG)
      ====================== */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
