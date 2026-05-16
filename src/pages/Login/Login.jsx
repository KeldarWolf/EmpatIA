// ============================================ 
// src/pages/Login/Login.jsx
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { styles } from "./Login.styles";
import LoginMatrix from "./LoginMatrix";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = async () => {
    if (!form.nombre || !form.password) {
      alert("Completa usuario y contraseña");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://empatia-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      const user = data.user;

      const userData = {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        role: (user.role || "user")
          .toLowerCase()
          .trim(),
      };

      localStorage.setItem(
        "usuario",
        JSON.stringify(userData)
      );

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (err) {
      console.log(err);
      alert("Error conectando con servidor");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div style={styles.container}>

      <LoginMatrix />

      <div style={styles.centerBlock}>

        <div style={styles.card}>

          <h1 style={styles.title}>
            EmpatIA
          </h1>

          <p style={styles.subtitle}>
            IA emocional en tiempo real
          </p>

          <div style={styles.formBox}>

            <input
              placeholder="Usuario"
              value={form.nombre}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombre: e.target.value,
                })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              style={styles.input}
            />

            <button
              style={styles.primaryBtn}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading
                ? "Entrando..."
                : "Iniciar sesión"}
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
