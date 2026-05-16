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

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        alert(data.error || "Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // =========================
      // NORMALIZAR USER (CRÍTICO)
      // =========================
      const user = data.user;

      const userData = {
        id_usuario: user.id_usuario, // 🔥 IMPORTANTE
        nombre: user.nombre,
        email: user.email,
        role: (user.role || "user").toLowerCase().trim(),
      };

      // =========================
      // GUARDAR SESIÓN
      // =========================
      localStorage.setItem("usuario", JSON.stringify(userData));

      console.log("USER FINAL:", userData);

      alert(`Bienvenido ${userData.nombre}`);

      // =========================
      // REDIRECCIÓN
      // =========================
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("ERROR LOGIN:", error);
      alert("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <LoginMatrix />

      <div style={styles.centerBlock}>
        <div style={styles.card}>
          <h1 style={styles.title}>EmpatIA</h1>

          <p style={styles.subtitle}>
            IA emocional en tiempo real
          </p>

          <div style={styles.formBox}>
            <input
              placeholder="Nombre de usuario"
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              style={styles.input}
            />

            <button
              style={styles.primaryBtn}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
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
