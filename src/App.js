import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "yopaws-health-tracker-profile-first-v1";

const PET_TYPES = ["Dog", "Cat", "Other"];
const SEX_OPTIONS = ["Unknown", "Female", "Male"];
const DESEXED_OPTIONS = ["Unknown", "Yes", "No"];
const STATUS_OPTIONS = ["Green", "Yellow", "Red"];
const APPETITE_OPTIONS = ["Normal", "Reduced", "Poor", "Increased"];
const TOILETING_OPTIONS = ["Normal", "Loose", "Constipated", "Accidents", "Other"];
const TRIGGER_OPTIONS = [
  "None",
  "Medication change",
  "Vet visit",
  "Travel",
  "Visitors",
  "Weather",
  "Diet change",
  "Exercise change",
  "Stress",
  "Other",
];

const emptyPetProfile = {
  name: "",
  type: "Dog",
  breed: "",
  sex: "Unknown",
  dob: "",
  weight: "",
  desexed: "Unknown",
  notes: "",
};

function formatAUDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseAUDate(value) {
  if (!value || typeof value !== "string") return null;

  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function auDateToKey(value) {
  const parsed = parseAUDate(value);
  if (!parsed) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function createEmptyDailyForm(petName = "") {
  return {
    id: null,
    date: formatAUDate(new Date()),
    pet: petName,
    health: "Green",
    emotion: "Green",
    behaviour: "Green",
    appetite: "Normal",
    toileting: "Normal",
    medication: "",
    trigger: "None",
    notes: "",
  };
}

function statusClass(value) {
  const safe = String(value || "").toLowerCase();
  if (safe === "green") return "mini-pill--green";
  if (safe === "yellow") return "mini-pill--yellow";
  if (safe === "red") return "mini-pill--red";
  return "";
}

export default function App() {
  const [petProfile, setPetProfile] = useState(emptyPetProfile);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyForm, setDailyForm] = useState(createEmptyDailyForm(""));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(formatAUDate(new Date()));
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (parsed.petProfile) {
        setPetProfile({ ...emptyPetProfile, ...parsed.petProfile });
      }

      if (Array.isArray(parsed.dailyLogs)) {
        setDailyLogs(parsed.dailyLogs);
      }

      if (parsed.dailyForm) {
        setDailyForm(parsed.dailyForm);
      }

      if (parsed.selectedCalendarDate) {
        setSelectedCalendarDate(parsed.selectedCalendarDate);
      }

      if (parsed.calendarViewDate) {
        const loadedViewDate = new Date(parsed.calendarViewDate);
        if (!Number.isNaN(loadedViewDate.getTime())) {
          setCalendarViewDate(
            new Date(loadedViewDate.getFullYear(), loadedViewDate.getMonth(), 1)
          );
        }
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
  }, []);

  useEffect(() => {
    const payload = {
      petProfile,
      dailyLogs,
      dailyForm,
      selectedCalendarDate,
      calendarViewDate: calendarViewDate.toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [petProfile, dailyLogs, dailyForm, selectedCalendarDate, calendarViewDate]);

  useEffect(() => {
    setDailyForm((prev) => ({
      ...prev,
      pet: petProfile.name || prev.pet || "",
    }));
  }, [petProfile.name]);

  const logsByDate = useMemo(() => {
    const map = {};
    dailyLogs.forEach((log) => {
      const key = auDateToKey(log.date);
      if (key) map[key] = log;
    });
    return map;
  }, [dailyLogs]);

  const selectedDateKey = auDateToKey(selectedCalendarDate);
  const selectedLog = selectedDateKey ? logsByDate[selectedDateKey] : null;

  const calendarYear = calendarViewDate.getFullYear();
  const calendarMonth = calendarViewDate.getMonth();

  const monthLabel = calendarViewDate.toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  function buildCalendarDays() {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells = [];

    for (let i = startDay - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i;
      cells.push({
        date: new Date(calendarYear, calendarMonth - 1, day),
        day,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(calendarYear, calendarMonth, day),
        day,
        isCurrentMonth: true,
      });
    }

    while (cells.length < 42) {
      const day = cells.length - (startDay + daysInMonth) + 1;
      cells.push({
        date: new Date(calendarYear, calendarMonth + 1, day),
        day,
        isCurrentMonth: false,
      });
    }

    return cells;
  }

  const calendarDays = buildCalendarDays();
  const todayKey = auDateToKey(formatAUDate(new Date()));

  function handlePetProfileChange(field, value) {
    setPetProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleDailyFormChange(field, value) {
    if (field === "date") setDateError("");
    setDailyForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSaveDailyLog() {
    if (!parseAUDate(dailyForm.date)) {
      setDateError("Please enter a valid date in DD/MM/YYYY format.");
      return;
    }

    const cleanedLog = {
      ...dailyForm,
      id: auDateToKey(dailyForm.date),
      pet: dailyForm.pet?.trim() || petProfile.name?.trim() || "Pet",
      medication: dailyForm.medication?.trim() || "",
      notes: dailyForm.notes?.trim() || "",
    };

    setDailyLogs((prev) => {
      const withoutSameDate = prev.filter(
        (log) => auDateToKey(log.date) !== auDateToKey(cleanedLog.date)
      );

      return [...withoutSameDate, cleanedLog].sort((a, b) => {
        const aDate = parseAUDate(a.date);
        const bDate = parseAUDate(b.date);
        return aDate - bDate;
      });
    });

    setSelectedCalendarDate(cleanedLog.date);

    const parsed = parseAUDate(cleanedLog.date);
    if (parsed) {
      setCalendarViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }

    setDateError("");
  }

  function handleLoadSelectedDayIntoForm() {
    if (!selectedLog) {
      window.alert("No saved log for the selected day.");
      return;
    }
    setDailyForm({ ...selectedLog });
  }

  function handleNewBlankForm() {
    setDailyForm(createEmptyDailyForm(petProfile.name || ""));
    setDateError("");
  }

  function goToPreviousMonth() {
    setCalendarViewDate(new Date(calendarYear, calendarMonth - 1, 1));
  }

  function goToNextMonth() {
    setCalendarViewDate(new Date(calendarYear, calendarMonth + 1, 1));
  }

  function goToCurrentMonth() {
    const today = new Date();
    setCalendarViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedCalendarDate(formatAUDate(today));
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="topbar-copy">
            <h1>YoPaws Health Tracker</h1>
            <p>Auto-save, backup file, and vet-friendly reports for pets</p>
          </div>
        </header>

        <div className="content-grid">
          <div className="left-column">
            <section className="panel">
              <h2>🐾 Pet Profile</h2>

              <div className="form-grid">
                <label>
                  <span>Pet Name</span>
                  <input
                    type="text"
                    value={petProfile.name}
                    onChange={(e) => handlePetProfileChange("name", e.target.value)}
                    placeholder="e.g. Yoshi"
                  />
                </label>

                <label>
                  <span>Pet Type</span>
                  <select
                    value={petProfile.type}
                    onChange={(e) => handlePetProfileChange("type", e.target.value)}
                  >
                    {PET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Breed / Species Details</span>
                  <input
                    type="text"
                    value={petProfile.breed}
                    onChange={(e) => handlePetProfileChange("breed", e.target.value)}
                    placeholder="Breed or species details"
                  />
                </label>

                <label>
                  <span>Sex</span>
                  <select
                    value={petProfile.sex}
                    onChange={(e) => handlePetProfileChange("sex", e.target.value)}
                  >
                    {SEX_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Date of Birth</span>
                  <input
                    type="text"
                    value={petProfile.dob}
                    onChange={(e) => handlePetProfileChange("dob", e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </label>

                <label>
                  <span>Weight</span>
                  <input
                    type="text"
                    value={petProfile.weight}
                    onChange={(e) => handlePetProfileChange("weight", e.target.value)}
                    placeholder="e.g. 28 kg"
                  />
                </label>

                <label>
                  <span>Desexed</span>
                  <select
                    value={petProfile.desexed}
                    onChange={(e) => handlePetProfileChange("desexed", e.target.value)}
                  >
                    {DESEXED_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="full-width">
                  <span>Profile Notes</span>
                  <textarea
                    rows="4"
                    value={petProfile.notes}
                    onChange={(e) => handlePetProfileChange("notes", e.target.value)}
                    placeholder="Important medical notes, behaviour notes, diagnosis, sensitivities, etc."
                  />
                </label>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>📝 Add / Edit Daily Log</h2>
                <button className="secondary-btn" type="button" onClick={handleNewBlankForm}>
                  New Blank Form
                </button>
              </div>

              <div className="form-grid">
                <label>
                  <span>Date</span>
                  <input
                    type="text"
                    value={dailyForm.date}
                    onChange={(e) => handleDailyFormChange("date", e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </label>

                <label>
                  <span>Pet</span>
                  <input
                    type="text"
                    value={dailyForm.pet}
                    onChange={(e) => handleDailyFormChange("pet", e.target.value)}
                    placeholder="Pet name"
                  />
                </label>

                <label>
                  <span>Health</span>
                  <select
                    value={dailyForm.health}
                    onChange={(e) => handleDailyFormChange("health", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Emotion</span>
                  <select
                    value={dailyForm.emotion}
                    onChange={(e) => handleDailyFormChange("emotion", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Behaviour</span>
                  <select
                    value={dailyForm.behaviour}
                    onChange={(e) => handleDailyFormChange("behaviour", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Appetite</span>
                  <select
                    value={dailyForm.appetite}
                    onChange={(e) => handleDailyFormChange("appetite", e.target.value)}
                  >
                    {APPETITE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Toileting</span>
                  <select
                    value={dailyForm.toileting}
                    onChange={(e) => handleDailyFormChange("toileting", e.target.value)}
                  >
                    {TOILETING_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="full-width">
                  <span>Medication note</span>
                  <input
                    type="text"
                    value={dailyForm.medication}
                    onChange={(e) => handleDailyFormChange("medication", e.target.value)}
                    placeholder="e.g. Zoloft started"
                  />
                </label>

                <label className="full-width">
                  <span>Trigger / event</span>
                  <select
                    value={dailyForm.trigger}
                    onChange={(e) => handleDailyFormChange("trigger", e.target.value)}
                  >
                    {TRIGGER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="full-width">
                  <span>Notes</span>
                  <textarea
                    rows="5"
                    value={dailyForm.notes}
                    onChange={(e) => handleDailyFormChange("notes", e.target.value)}
                    placeholder="Write anything important about the day here..."
                  />
                </label>
              </div>

              {dateError ? <div className="error-text">{dateError}</div> : null}

              <button className="primary-btn" type="button" onClick={handleSaveDailyLog}>
                Save Daily Log
              </button>
            </section>
          </div>

          <div className="right-column">
            <section className="panel">
              <h2>📅 Calendar</h2>

              <div className="calendar-header-row">
                <button type="button" className="calendar-nav-btn" onClick={goToPreviousMonth}>
                  ←
                </button>

                <div className="calendar-month-label">{monthLabel}</div>

                <button type="button" className="calendar-nav-btn" onClick={goToNextMonth}>
                  →
                </button>
              </div>

              <div className="calendar-toolbar">
                <button type="button" className="calendar-today-btn" onClick={goToCurrentMonth}>
                  Today
                </button>
              </div>

              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((cell, index) => {
                  const cellAUDate = formatAUDate(cell.date);
                  const cellKey = auDateToKey(cellAUDate);
                  const log = logsByDate[cellKey];
                  const isToday = cellKey === todayKey;
                  const isSelected = cellAUDate === selectedCalendarDate;

                  return (
                    <button
                      key={`${cellKey}-${index}`}
                      type="button"
                      className={[
                        "calendar-cell",
                        cell.isCurrentMonth ? "" : "calendar-cell--muted",
                        isToday ? "calendar-cell--today" : "",
                        isSelected ? "calendar-cell--selected" : "",
                      ]
                        .join(" ")
                        .trim()}
                      onClick={() => setSelectedCalendarDate(cellAUDate)}
                    >
                      <div className="calendar-day-number">{cell.day}</div>

                      {log ? (
                        <div className="calendar-badges">
                          <span className={`mini-pill ${statusClass(log.health)}`}>H</span>
                          <span className={`mini-pill ${statusClass(log.emotion)}`}>E</span>
                          <span className={`mini-pill ${statusClass(log.behaviour)}`}>B</span>
                        </div>
                      ) : (
                        <div className="calendar-empty-mark">·</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="selected-day-panel">
                <h3>Selected Day</h3>
                <div className="selected-day-date">{selectedCalendarDate}</div>

                {selectedLog ? (
                  <>
                    <div className="selected-day-pills">
                      <span className={`detail-pill ${statusClass(selectedLog.health)}`}>
                        Health: {selectedLog.health}
                      </span>
                      <span className={`detail-pill ${statusClass(selectedLog.emotion)}`}>
                        Emotion: {selectedLog.emotion}
                      </span>
                      <span className={`detail-pill ${statusClass(selectedLog.behaviour)}`}>
                        Behaviour: {selectedLog.behaviour}
                      </span>
                    </div>

                    <p><strong>Pet:</strong> {selectedLog.pet || "-"}</p>
                    <p><strong>Appetite:</strong> {selectedLog.appetite || "-"}</p>
                    <p><strong>Toileting:</strong> {selectedLog.toileting || "-"}</p>
                    <p><strong>Trigger:</strong> {selectedLog.trigger || "-"}</p>
                    <p><strong>Medication:</strong> {selectedLog.medication || "-"}</p>
                    <p><strong>Notes:</strong> {selectedLog.notes || "-"}</p>

                    <div className="selected-day-actions">
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={handleLoadSelectedDayIntoForm}
                      >
                        Load into Form
                      </button>
                    </div>
                  </>
                ) : (
                  <p>No log saved for this day.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
