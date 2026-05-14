import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.password) {
      alert("Completa todos los campos");
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
          body: JSON.stringify({
            nombre: form.nombre,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al iniciar sesión");
        return;
      }

      // guardar usuario completo
      localStorage.setItem("usuario", JSON.stringify(data.user));

      console.log("👤 Usuario logueado:", data.user.nombre);

      navigate("/user");

    } catch (error) {
      console.error("❌ ERROR LOGIN:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>EmpatIA</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            type="text"
            name="nombre"
            placeholder="Nombre de usuario"
            value={form.nombre}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>

        </form>

        <p style={styles.text}>
          ¿No tienes cuenta?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/register")}
          >
            Regístrate
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at center, #050505, #000)",
  },

  card: {
    width: "90%",
    maxWidth: "400px",
    padding: "30px 20px",
    borderRadius: "20px",
    background: "rgba(10,10,10,0.9)",
    boxShadow: "0 0 40px rgba(0,229,255,0.15)",
    backdropFilter: "blur(8px)",
  },

  title: {
    textAlign: "center",
    color: "#00e5ff",
    marginBottom: "5px",
  },

  subtitle: {
    textAlign: "center",
    color: "#aaa",
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#111",
    color: "#fff",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#00e5ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },

  text: {
    marginTop: "15px",
    textAlign: "center",
    color: "#aaa",
  },

  link: {
    color: "#00e5ff",
    cursor: "pointer",
  },
};
