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
      alert("Completa los campos");
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

      console.log("LOGIN OK:", data);

      // guardar usuario
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // nombre del usuario (como pediste)
      console.log("Bienvenido:", data.user.nombre);

      navigate("/user");

    } catch (error) {
      console.error("ERROR LOGIN:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de usuario"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
