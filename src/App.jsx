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
// PROTECCIÓN SIMPLE
// ======================
function PrivateRoute({ children, role }) {
  const session = JSON.parse(localStorage.getItem("profile"));

  if (!session) {
    return <Navigate to="/" />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/" />;
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
          USER
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
          MODULES USER (PROTEGIDOS)
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