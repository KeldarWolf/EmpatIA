import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styles } from "./Login.styles";
import LoginMatrix from "./LoginMatrix";

export default function Login() {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async () => {

    try {

      if (!user.email || !user.password) {
        alert("Completa email y contraseña");
        return;
      }

      const response = await fetch(
        "https://empatia-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error login");
        return;
      }

      localStorage.setItem(
        "profile",
        JSON.stringify(data.user)
      );

      alert("Login exitoso");

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (error) {

      console.error(error);

      alert("Error conectando servidor");
    }
  };

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
              placeholder="Email"
              value={user.email}
              onChange={(e) =>
                setUser({
                  ...user,
                  email: e.target.value
                })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={user.password}
              onChange={(e) =>
                setUser({
                  ...user,
                  password: e.target.value
                })
              }
              style={styles.input}
            />

            <button
              style={styles.primaryBtn}
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>

            <div style={styles.divider}>
              o
            </div>

            <button style={styles.googleBtn}>
              🔵 Iniciar con Google
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
