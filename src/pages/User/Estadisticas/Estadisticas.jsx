/* =========================================
   ESTADISTICAS PAGE
========================================= */

.stats-page {
  min-height: 100vh;
  width: 100%;
  padding: 30px;
  background: linear-gradient(
    135deg,
    #0f172a,
    #111827,
    #1e293b
  );
  color: white;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
}

/* =========================================
   HEADER
========================================= */

.stats-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
}

.stats-header h1 {
  font-size: 2.3rem;
  margin-bottom: 5px;
}

.stats-header p {
  opacity: 0.8;
  font-size: 1rem;
}

.back-btn {
  border: none;
  background: linear-gradient(
    135deg,
    #4f46e5,
    #7c3aed
  );
  color: white;
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.25s;
  font-weight: 600;
}

.back-btn:hover {
  transform: translateY(-2px);
}

/* =========================================
   GRID
========================================= */

.stats-grid {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 24px;
  width: 100%;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-center {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* =========================================
   GLASS CARD
========================================= */

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 22px;
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
}

/* =========================================
   EMOTION CARDS
========================================= */

.emotion-card {
  text-align: center;
  transition: 0.25s;
}

.emotion-card:hover {
  transform: translateY(-4px);
}

.emotion-card span {
  display: block;
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 10px;
}

.emotion-card h2 {
  font-size: 2.6rem;
  margin: 0;
}

.positive {
  background: linear-gradient(
    135deg,
    rgba(16,185,129,0.25),
    rgba(5,150,105,0.2)
  );
}

.neutral {
  background: linear-gradient(
    135deg,
    rgba(59,130,246,0.25),
    rgba(37,99,235,0.2)
  );
}

.negative {
  background: linear-gradient(
    135deg,
    rgba(236,72,153,0.25),
    rgba(190,24,93,0.2)
  );
}

/* =========================================
   FAVORITE CARD
========================================= */

.favorite-card span {
  opacity: 0.8;
}

.favorite-card h3 {
  margin-top: 14px;
  font-size: 1.4rem;
  line-height: 1.4;
}

/* =========================================
   WELLBEING
========================================= */

.wellbeing-card {
  width: 100%;
}

.wellbeing-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.wellbeing-top h2 {
  margin-bottom: 6px;
}

.wellbeing-number {
  font-size: 2.8rem;
  font-weight: bold;
  color: #60a5fa;
}

.progress-container {
  width: 100%;
  height: 18px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #3b82f6,
    #8b5cf6
  );
  transition: 0.5s;
}

/* =========================================
   SUMMARY
========================================= */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.summary-card {
  background: rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 22px;
  text-align: center;
  transition: 0.25s;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-card h2 {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.summary-card p {
  opacity: 0.8;
}

/* =========================================
   EXTRA
========================================= */

.extra-card h3 {
  margin-bottom: 20px;
}

.extra-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mini-box {
  background: rgba(255,255,255,0.07);
  border-radius: 18px;
  padding: 16px;
}

.mini-box span {
  display: block;
  opacity: 0.8;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.mini-box strong {
  font-size: 1.3rem;
}

/* =========================================
   INSIGHTS
========================================= */

.insights-card h3 {
  margin-bottom: 20px;
}

.insight-item {
  background: rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 14px;
  line-height: 1.5;
  font-size: 0.96rem;
}

/* =========================================
   LOADING
========================================= */

.loading-box {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 5px solid rgba(255,255,255,0.2);
  border-top: 5px solid #60a5fa;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   BOTONES MOBILE
========================================= */

.mobile-toggle {
  display: none;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1200px) {

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .left-panel,
  .right-panel {
    position: fixed;
    top: 0;
    width: 300px;
    height: 100vh;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(12px);
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
    transition: 0.35s;
  }

  .left-panel {
    left: -340px;
  }

  .right-panel {
    right: -340px;
  }

  .left-panel.show-panel {
    left: 0;
  }

  .right-panel.show-panel {
    right: 0;
  }

  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    z-index: 1100;
    font-size: 1.3rem;
    color: white;
    background: linear-gradient(
      135deg,
      #3b82f6,
      #8b5cf6
    );
    box-shadow: 0 6px 20px rgba(0,0,0,0.35);
  }

  .left-toggle {
    left: 10px;
  }

  .right-toggle {
    right: 10px;
  }
}

@media (max-width: 900px) {

  .stats-page {
    padding: 20px 15px 40px;
  }

  .stats-header h1 {
    font-size: 1.8rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .extra-grid {
    grid-template-columns: 1fr;
  }

  .wellbeing-number {
    font-size: 2rem;
  }
}

@media (max-width: 500px) {

  .stats-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .glass-card {
    padding: 18px;
  }

  .emotion-card h2 {
    font-size: 2rem;
  }

  .summary-card h2 {
    font-size: 1.8rem;
  }

  .favorite-card h3 {
    font-size: 1.1rem;
  }

  .insight-item {
    font-size: 0.88rem;
  }

  .left-panel,
  .right-panel {
    width: 85%;
  }
}
