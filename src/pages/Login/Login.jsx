import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USERS } from "./loginData";
import { styles } from "./Login.styles";
import LoginMatrix from "./LoginMatrix";

export default function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    user: "",
    password: ""
  });

  const handleLogin = () => {
    if (!user.user || !user.password) {
      alert("Completa usuario y contraseña");
      return;
    }

    const foundUser = USERS.find(
      (u) =>
        u.user === user.user &&
        u.password === user.password
    );

    if (!foundUser) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    localStorage.setItem(
      "profile",
      JSON.stringify({
        name: foundUser.user,
        role: foundUser.role
      })
    );

    alert("Login exitoso");

    if (foundUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/user");
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
              placeholder="Usuario"
              value={user.user}
              onChange={(e) =>
                setUser({
                  ...user,
                  user: e.target.value
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

            <div style={styles.divider}>o</div>

            <button style={styles.googleBtn}>
              🔵 Iniciar con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}