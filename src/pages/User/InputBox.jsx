export default function InputBox({ input, setInput, sendMessage, loading }) {
  return (
    <div className="input-box">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe..."
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "..." : "Enviar"}
      </button>
    </div>
  );
}