// ============================================
// src/pages/User/Actividades/Actividades.jsx
// ============================================

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

export default function Actividades() {
  const navigate = useNavigate();

  const [
    savedActivities,
    setSavedActivities,
  ] = useState([]);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("actividades") ||
        "[]"
    );

    setSavedActivities(data);
  }, []);

  // ============================================
  // DELETE
  // ============================================

  const deleteActivity = (index) => {
    const updated =
      savedActivities.filter(
        (_, i) => i !== index
      );

    setSavedActivities(updated);

    localStorage.setItem(
      "actividades",
      JSON.stringify(updated)
    );
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div style={styles.page}>

      <div style={styles.header}>

        <h1>🎯 Actividades</h1>

        <button
          onClick={() =>
            navigate("/user")
          }
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>

      </div>

      {savedActivities.length === 0 ? (
        <div style={styles.empty}>
          No tienes actividades aún
        </div>
      ) : (
        savedActivities.map((a, i) => (
          <div
            key={i}
            style={styles.card}
          >

            <div>

              <h3>{a.texto}</h3>

              <p style={styles.date}>
                {new Date(
                  a.fecha
                ).toLocaleString()}
              </p>

            </div>

            <button
              style={styles.deleteBtn}
              onClick={() =>
                deleteActivity(i)
              }
            >
              ❌
            </button>

          </div>
        ))
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0f14",
    color: "white",
    padding: 20,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  backBtn: {
    background: "#1f2937",
    border: "none",
    color: "white",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
  },

  card: {
    background: "#111827",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    opacity: 0.6,
    fontSize: 12,
  },

  deleteBtn: {
    background: "#dc2626",
    border: "none",
    color: "white",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  empty: {
    opacity: 0.7,
    textAlign: "center",
    marginTop: 50,
  },
};
