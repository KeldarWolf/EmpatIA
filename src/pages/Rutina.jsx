<div className="calendar-container">

  {/* HEADER MES + AÑO */}
  <div className="calendar-header">

    <h2 className="calendar-title">
      {[
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
      ][currentMonth]} {currentYear}
    </h2>

    {/* navegación */}
    <div className="calendar-nav">
      <button onClick={() => changeMonth(-1)}>◀</button>
      <button onClick={() => changeMonth(1)}>▶</button>
    </div>

  </div>

  {/* WEEK DAYS */}
  <div className="weekdays">
    {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
      <div key={d}>{d}</div>
    ))}
  </div>

  {/* GRID */}
  <div className="calendar-grid">
    {days.map((d, i) => {
      if (!d) return <div key={i} className="calendar-day empty" />;

      const date = new Date(currentYear, currentMonth, d);
      const full = formatDateLocal(date);

      const has = eventos.some((e) => e.fecha?.slice(0, 10) === full);

      const selected =
        selectedDate.getDate() === d &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const isToday =
        today.getDate() === d &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

      return (
        <div
          key={i}
          className={`calendar-day ${selected ? "selected" : ""} ${
            isToday ? "today" : ""
          }`}
          onClick={() => setSelectedDate(date)}
        >
          {d}
          {has && <div className="event-dot" />}
        </div>
      );
    })}
  </div>

</div>
