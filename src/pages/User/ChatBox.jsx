export default function ChatBox({ messages, onOptionClick }) {
  return (
    <div className="chat-box">
      {messages.map((m, i) => (
        <div key={i} className={`msg ${m.role}`}>

          <div>{m.text}</div>

          {m.options && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              {m.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => onOptionClick?.(opt)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#1f2937",
                    color: "white",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}