import { Routes, Route, Navigate } from "react-router-dom";

// AUTH
import Login from "./pages/Login/Login";
import Register from "./pages/Register";

// DASHBOARD
import User from "./pages/User/User";
import Admin from "./pages/Admin";

// MODULES
import Rutina from "./pages/Rutina";
import Actividades from "./pages/User/Actividades/Actividades";
import Estadisticas from "./pages/User/Estadisticas/Estadisticas";
import Motivacion from "./pages/Motivacion";
import Diario from "./pages/Diario";
import Gustos from "./pages/Gustos";
import Configuracion from "./pages/Configuracion";

// ======================
// PROTECCIÓN CORREGIDA
// ======================
function PrivateRoute({ children, role }) {
  const session = JSON.parse(localStorage.getItem("usuario"));

  // ❌ no hay sesión
  if (!session) {
    return <Navigate to="/" replace />;
  }

  // 🔥 normalizar role (CLAVE)
  const userRole = (session.role || "").toLowerCase().trim();

  // ❌ no tiene permisos
  if (role && userRole !== role) {
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
          ADMIN (PROTEGIDO)
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
          USER (PROTEGIDO)
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
          MÓDULOS USER
      ====================== */}
      <Route
        path="/rutina"
        element={
          <PrivateRoute role="user">
            <Rutina />
          </PrivateRoute>
        }
      />

      <Route
        path="/actividades"
        element={
          <PrivateRoute role="user">
            <Actividades />
          </PrivateRoute>
        }
      />

      <Route
        path="/estadisticas"
        element={
          <PrivateRoute role="user">
            <Estadisticas />
          </PrivateRoute>
        }
      />

      <Route
        path="/motivacion"
        element={
          <PrivateRoute role="user">
            <Motivacion />
          </PrivateRoute>
        }
      />

      <Route
        path="/diario"
        element={
          <PrivateRoute role="user">
            <Diario />
          </PrivateRoute>
        }
      />

      <Route
        path="/gustos"
        element={
          <PrivateRoute role="user">
            <Gustos />
          </PrivateRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <PrivateRoute role="user">
            <Configuracion />
          </PrivateRoute>
        }
      />

    </Routes>
  );
}
