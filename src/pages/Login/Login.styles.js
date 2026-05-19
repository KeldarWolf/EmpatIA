export const styles = {
  container: {
    minHeight: "100dvh",
    width: "100%",
    background: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box"
  },

  card: {
    background: "rgba(10,10,10,0.26)",
    padding: "clamp(18px, 4vw, 30px)",
    borderRadius: "20px",
    border: "1px solid #4ad2ee",
    boxShadow: "0 0 40px rgba(209,250,255,0.37)",
    backdropFilter: "blur(8px)",
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto",
    boxSizing: "border-box"
  },

  title: {
    fontSize: "clamp(28px, 8vw, 40px)",
    color: "#00e5ff",
    margin: 0,
    fontWeight: "bold",
    textAlign: "center"
  },

  subtitle: {
    color: "#aaa",
    fontSize: "clamp(12px, 3vw, 14px)",
    marginTop: "8px",
    textAlign: "center",
    lineHeight: 1.4
  },

  formBox: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    width: "100%"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontSize: "16px",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#00e5ff",
    border: "none",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  secondaryBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #00e5ff",
    background: "transparent",
    color: "#00e5ff",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  googleBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#fff",
    border: "none",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  divider: {
    color: "#aaa",
    fontSize: "12px",
    textAlign: "center",
    margin: "4px 0"
  }
};
