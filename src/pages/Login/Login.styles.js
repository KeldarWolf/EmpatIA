export const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "#050505",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial"
  },

  centerBlock: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 10,
    textAlign: "center",
    width: "100%"
  },

  card: {
    background: "rgba(10,10,10,0.26)",
    padding: "30px 20px",
    borderRadius: "20px",
    border: "1px solid #4ad2ee",
    boxShadow: "0 0 40px rgba(209,250,255,0.37)",
    backdropFilter: "blur(8px)",
    width: "clamp(260px, 80vw, 340px)",
    margin: "0 auto"
  },

  title: {
    fontSize: "40px",
    color: "#00e5ff",
    margin: 0
  },

  subtitle: {
    color: "#aaa",
    fontSize: "14px"
  },

  formBox: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center"
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none"
  },

  primaryBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#00e5ff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer"
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #00e5ff",
    background: "transparent",
    color: "#00e5ff",
    cursor: "pointer"
  },

  googleBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#fff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer"
  },

  divider: {
    color: "#aaa",
    fontSize: "12px"
  }
};