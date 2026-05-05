import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛠 Panel Admin</h1>
        <p style={styles.subtitle}>
          Zona de pruebas — solo administradores
        </p>

        <div style={styles.box}>
          <h3 style={styles.sectionTitle}>Estado del sistema</h3>
          <p>✔ Servidor activo</p>
          <p>✔ Usuarios conectados: 12</p>
          <p>✔ IA emocional: online</p>
        </div>

        <div style={styles.box}>
          <h3 style={styles.sectionTitle}>Acciones rápidas</h3>

          <button style={styles.button}>
            Ver usuarios
          </button>

          <button style={styles.button}>
            Logs del sistema
          </button>

          <button style={styles.dangerButton}>
            Reiniciar sistema
          </button>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/")}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "radial-gradient(circle at center, #050505, #000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },

  card: {
    width: "90%",
    maxWidth: "500px",
    background: "rgba(10,10,10,0.9)",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 0 40px rgba(0,229,255,0.15)",
    border: "1px solid rgba(0,229,255,0.2)",
  },

  title: {
    color: "#00e5ff",
    textAlign: "center",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: "20px",
  },

  box: {
    background: "#111",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
    color: "#ddd",
  },

  sectionTitle: {
    color: "#00e5ff",
    marginBottom: "8px",
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid rgba(0,229,255,0.3)",
    background: "transparent",
    color: "#00e5ff",
    cursor: "pointer",
  },

  dangerButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "none",
    background: "#ff3b3b",
    color: "#fff",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#00e5ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
};