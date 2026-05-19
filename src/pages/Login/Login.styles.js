export const styles = {
  /* =========================
     CONTAINER
  ========================= */

  container: {
    minHeight: "100dvh",
    width: "100%",

    background: `
      radial-gradient(
        circle at top,
        rgba(0,229,255,0.15),
        transparent 35%
      ),
      linear-gradient(
        180deg,
        #050505 0%,
        #0a0f1c 100%
      )
    `,

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",

    fontFamily: "Arial, sans-serif",

    padding: "clamp(12px, 3vw, 40px)",

    boxSizing: "border-box",

    position: "relative"
  },

  /* =========================
     CARD
  ========================= */

  card: {
    width: "100%",

    maxWidth: "430px",

    padding: "clamp(20px, 4vw, 38px)",

    borderRadius: "clamp(18px, 3vw, 28px)",

    background: `
      linear-gradient(
        180deg,
        rgba(18,18,18,0.78),
        rgba(10,10,10,0.68)
      )
    `,

    border:
      "clamp(1px, 0.2vw, 2px) solid rgba(74,210,238,0.35)",

    backdropFilter:
      "blur(clamp(8px, 2vw, 16px))",

    WebkitBackdropFilter:
      "blur(clamp(8px, 2vw, 16px))",

    boxShadow: `
      0 0 clamp(14px, 3vw, 28px)
      rgba(0,229,255,0.18),

      0 0 clamp(30px, 6vw, 65px)
      rgba(0,229,255,0.08),

      inset 0 0 25px
      rgba(255,255,255,0.03)
    `,

    boxSizing: "border-box",

    transition: "0.35s ease"
  },

  /* =========================
     TITLE
  ========================= */

  title: {
    fontSize: "clamp(30px, 7vw, 50px)",

    color: "#00e5ff",

    margin: 0,

    fontWeight: "800",

    textAlign: "center",

    lineHeight: 1.1,

    letterSpacing: "0.5px",

    wordBreak: "break-word",

    textShadow: `
      0 0 clamp(10px, 3vw, 20px)
      rgba(0,229,255,0.45)
    `
  },

  /* =========================
     SUBTITLE
  ========================= */

  subtitle: {
    color: "#a1a1aa",

    fontSize: "clamp(12px, 2.5vw, 15px)",

    marginTop: "12px",

    textAlign: "center",

    lineHeight: 1.6,

    padding: "0 6px"
  },

  /* =========================
     FORM
  ========================= */

  formBox: {
    marginTop: "clamp(20px, 4vw, 30px)",

    display: "flex",

    flexDirection: "column",

    gap: "clamp(12px, 2vw, 18px)",

    alignItems: "center",

    width: "100%"
  },

  /* =========================
     INPUT
  ========================= */

  input: {
    width: "100%",

    padding: "clamp(13px, 2vw, 16px)",

    borderRadius: "16px",

    border:
      "1px solid rgba(255,255,255,0.08)",

    background:
      "rgba(255,255,255,0.05)",

    color: "#fff",

    outline: "none",

    fontSize: "clamp(14px, 2vw, 16px)",

    transition: "0.3s ease",

    boxSizing: "border-box",

    backdropFilter: "blur(6px)"
  },

  /* =========================
     PRIMARY BUTTON
  ========================= */

  primaryBtn: {
    width: "100%",

    padding: "clamp(13px, 2vw, 16px)",

    borderRadius: "16px",

    border: "none",

    cursor: "pointer",

    fontWeight: "700",

    fontSize: "clamp(14px, 2vw, 16px)",

    color: "#03131a",

    background: `
      linear-gradient(
        135deg,
        #00e5ff,
        #00bcd4
      )
    `,

    transition: "0.3s ease",

    boxSizing: "border-box",

    boxShadow: `
      0 0 clamp(12px, 3vw, 26px)
      rgba(0,229,255,0.32)
    `
  },

  /* =========================
     SECONDARY BUTTON
  ========================= */

  secondaryBtn: {
    width: "100%",

    padding: "clamp(13px, 2vw, 16px)",

    borderRadius: "16px",

    border:
      "1px solid rgba(0,229,255,0.5)",

    background:
      "rgba(255,255,255,0.02)",

    color: "#00e5ff",

    fontSize: "clamp(14px, 2vw, 16px)",

    fontWeight: "600",

    cursor: "pointer",

    transition: "0.3s ease",

    boxSizing: "border-box"
  },

  /* =========================
     GOOGLE BUTTON
  ========================= */

  googleBtn: {
    width: "100%",

    padding: "clamp(13px, 2vw, 16px)",

    borderRadius: "16px",

    background: "#ffffff",

    border: "none",

    color: "#000",

    fontWeight: "700",

    fontSize: "clamp(14px, 2vw, 16px)",

    cursor: "pointer",

    transition: "0.3s ease",

    boxSizing: "border-box"
  },

  /* =========================
     DIVIDER
  ========================= */

  divider: {
    color: "#8b8b8b",

    fontSize: "clamp(11px, 2vw, 13px)",

    textAlign: "center",

    margin: "4px 0"
  }
};
