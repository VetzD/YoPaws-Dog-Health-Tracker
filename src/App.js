import React, { useEffect, useMemo, useRef, useState } from "react";

const colours = {
  Green: "🟢",
  Yellow: "🟡",
  Red: "🔴",
};

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
  color: "#1e293b",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #dbe3ea",
  borderRadius: "18px",
  padding: "16px",
  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "4px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "14px",
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: "bold",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#b91c1c",
  fontWeight: "bold",
  cursor: "pointer",
};

const topButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: "bold",
  cursor: "pointer",
};

const darkTopButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: "bold",
  cursor: "pointer",
};

const emptyDogProfile = {
  name: "",
  breed: "",
  sex: "Unknown",
  dob: "",
  weight: "",
  desexed: "Unknown",
  photo: "",
  notes: "",
};

function createEmptyDailyForm(dogName = "") {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    dog: dogName,
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

function createEmptyScheduleForm() {
  return {
    itemName: "",
    type: "Vaccine",
    dateGiven: "",
    nextDueDate: "",
    repeatFrequency: "",
    reminder: "7 days before",
    notes: "",
  };
}

function createEmptyMedForm() {
  return {
    medicationName: "",
    dose: "",
    frequency: "Once daily",
    foodInstruction: "With food",
    startDate: "",
    endDate: "",
    reason: "",
    prescribedBy: "",
    notes: "",
  };
}

function getStatusColor(status) {
  if (status === "Green") return "#15803d";
  if (status === "Yellow") return "#a16207";
  return "#b91c1c";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) cells.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push(d.toISOString().slice(0, 10));
  }

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function getAgeText(dob) {
  if (!dob) return "";
  const birth = new Date(dob + "T00:00:00");
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  if (months === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"} ${months} month${
    months === 1 ? "" : "s"
  }`;
}

function getBirthdayInfo(dob) {
  if (!dob) return "";
  const birth = new Date(dob + "T00:00:00");
  const now = new Date();

  let nextBirthday = new Date(
    now.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );

  if (
    nextBirthday < new Date(now.getFullYear(), now.getMonth(), now.getDate())
  ) {
    nextBirthday = new Date(
      now.getFullYear() + 1,
      birth.getMonth(),
      birth.getDate()
    );
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((nextBirthday - today) / msPerDay);

  if (diffDays === 0) return "Birthday is today 🎉";
  if (diffDays === 1) return "Birthday is tomorrow";
  return `Birthday in ${diffDays} days`;
}

function dueSoonText(date) {
  if (!date) return "";
  const due = new Date(date + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((due - today) / (24 * 60 * 60 * 1000));

  if (diff < 0) {
    return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
  }
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

function safeRead(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const importFileRef = useRef(null);

  function buildPrintableHtml(
    dogProfile,
    dailyLogs,
    healthSchedule,
    medicationHistory
  ) {
    const sortedLogs = [...dailyLogs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const sortedSchedule = [...healthSchedule].sort((a, b) =>
      (a.nextDueDate || "").localeCompare(b.nextDueDate || "")
    );
    const sortedMeds = [...medicationHistory].sort((a, b) =>
      (a.startDate || "").localeCompare(b.startDate || "")
    );

    const logRows = sortedLogs
      .map(
        (log) => `
          <tr>
            <td>${formatDate(log.date)}</td>
            <td>H ❤️ ${colours[log.health]} ${log.health}<br/>E 🧠 ${
          colours[log.emotion]
        } ${log.emotion}<br/>B 🐶 ${colours[log.behaviour]} ${
          log.behaviour
        }</td>
            <td>${log.appetite || "—"}</td>
            <td>${log.toileting || "—"}</td>
            <td>${log.medication || "—"}</td>
            <td>${log.trigger || "—"}</td>
            <td>${log.notes || "—"}</td>
          </tr>
        `
      )
      .join("");

    const scheduleRows = sortedSchedule
      .map(
        (item) => `
          <tr>
            <td>${item.itemName || "—"}</td>
            <td>${item.type || "—"}</td>
            <td>${item.dateGiven ? formatDate(item.dateGiven) : "—"}</td>
            <td>${item.nextDueDate ? formatDate(item.nextDueDate) : "—"}</td>
            <td>${item.repeatFrequency || "—"}</td>
            <td>${item.reminder || "—"}</td>
            <td>${item.notes || "—"}</td>
          </tr>
        `
      )
      .join("");

    const medRows = sortedMeds
      .map(
        (med) => `
          <tr>
            <td>${med.medicationName || "—"}</td>
            <td>${med.dose || "—"}</td>
            <td>${med.frequency || "—"}</td>
            <td>${med.foodInstruction || "—"}</td>
            <td>${med.startDate ? formatDate(med.startDate) : "—"}</td>
            <td>${med.endDate ? formatDate(med.endDate) : "Ongoing"}</td>
            <td>${med.reason || "—"}</td>
            <td>${med.prescribedBy || "—"}</td>
            <td>${med.notes || "—"}</td>
          </tr>
        `
      )
      .join("");

    return `
      <html>
        <head>
          <title>${dogProfile.name || "Dog"} Health Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            h1, h2, h3 { margin-bottom: 8px; }
            .meta { margin-bottom: 20px; line-height: 1.7; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; font-size: 12px; }
            th { background: #f8fafc; }
            .section { margin-bottom: 28px; }
            .small { color: #475569; font-size: 13px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${dogProfile.name || "Dog"} Health & Behaviour Report</h1>
          <div class="meta">
            <div><strong>Breed:</strong> ${dogProfile.breed || "—"}</div>
            <div><strong>Sex:</strong> ${dogProfile.sex || "—"}</div>
            <div><strong>Date of birth:</strong> ${
              dogProfile.dob ? formatDate(dogProfile.dob) : "—"
            }</div>
            <div><strong>Age:</strong> ${getAgeText(dogProfile.dob) || "—"}</div>
            <div><strong>Weight:</strong> ${dogProfile.weight || "—"}</div>
            <div><strong>Desexed:</strong> ${dogProfile.desexed || "—"}</div>
            <div><strong>Notes:</strong> ${dogProfile.notes || "—"}</div>
          </div>

          <div class="section">
            <h2>Daily Logs</h2>
            <div class="small">H = Health, E = Emotion, B = Behaviour</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Appetite</th>
                  <th>Toileting</th>
                  <th>Medication Note</th>
                  <th>Trigger</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>${
                logRows || '<tr><td colspan="7">No daily logs yet.</td></tr>'
              }</tbody>
            </table>
          </div>

          <div class="section">
            <h2>Health Schedule</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Date Given</th>
                  <th>Next Due</th>
                  <th>Repeat</th>
                  <th>Reminder</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>${
                scheduleRows ||
                '<tr><td colspan="7">No health schedule items yet.</td></tr>'
              }</tbody>
            </table>
          </div>

          <div class="section">
            <h2>Medication History</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dose</th>
                  <th>Frequency</th>
                  <th>How to Take</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Prescribed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>${
                medRows ||
                '<tr><td colspan="9">No medication history yet.</td></tr>'
              }</tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  function handlePrintReport(
    dogProfile,
    dailyLogs,
    healthSchedule,
    medicationHistory
  ) {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(
      buildPrintableHtml(
        dogProfile,
        dailyLogs,
        healthSchedule,
        medicationHistory
      )
    );
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  function handleSavePdf(
    dogProfile,
    dailyLogs,
    healthSchedule,
    medicationHistory
  ) {
    const pdfWindow = window.open("", "_blank", "width=1200,height=900");
    if (!pdfWindow) return;
    pdfWindow.document.open();
    pdfWindow.document.write(
      buildPrintableHtml(
        dogProfile,
        dailyLogs,
        healthSchedule,
        medicationHistory
      )
    );
    pdfWindow.document.close();
    pdfWindow.focus();
    setTimeout(() => {
      pdfWindow.print();
    }, 300);
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayString = today.toISOString().slice(0, 10);

  const [dogProfile, setDogProfile] = useState(() =>
    safeRead("dogProfile", emptyDogProfile)
  );
  const [dailyLogs, setDailyLogs] = useState(() => safeRead("dailyLogs", []));
  const [healthSchedule, setHealthSchedule] = useState(() =>
    safeRead("healthSchedule", [])
  );
  const [medicationHistory, setMedicationHistory] = useState(() =>
    safeRead("medicationHistory", [])
  );

  const [selectedDate, setSelectedDate] = useState(todayString);
  const [dailyForm, setDailyForm] = useState(() =>
    createEmptyDailyForm(safeRead("dogProfile", emptyDogProfile).name || "")
  );
  const [scheduleForm, setScheduleForm] = useState(createEmptyScheduleForm());
  const [medForm, setMedForm] = useState(createEmptyMedForm());

  useEffect(() => {
    localStorage.setItem("dogProfile", JSON.stringify(dogProfile));
  }, [dogProfile]);

  useEffect(() => {
    localStorage.setItem("dailyLogs", JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem("healthSchedule", JSON.stringify(healthSchedule));
  }, [healthSchedule]);

  useEffect(() => {
    localStorage.setItem("medicationHistory", JSON.stringify(medicationHistory));
  }, [medicationHistory]);

  useEffect(() => {
    setDailyForm((prev) => ({
      ...prev,
      dog: dogProfile.name || "",
    }));
  }, [dogProfile.name]);

  const monthGrid = useMemo(
    () => getMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const logsByDate = useMemo(() => {
    const map = new Map();
    dailyLogs.forEach((log) => map.set(log.date, log));
    return map;
  }, [dailyLogs]);

  const selectedLog = logsByDate.get(selectedDate);

  const upcomingItems = useMemo(() => {
    return [...healthSchedule]
      .filter((item) => item.nextDueDate)
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .slice(0, 5);
  }, [healthSchedule]);

  const activeMeds = useMemo(() => {
    return medicationHistory.filter((med) => !med.endDate);
  }, [medicationHistory]);

  const patternAlerts = useMemo(() => {
    if (dailyLogs.length === 0) {
      return ["No pattern alerts yet. Start adding daily logs."];
    }

    const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    const alerts = [];
    const recent = sorted.slice(-3);

    if (recent.length === 3 && recent.every((x) => x.health === "Yellow")) {
      alerts.push("Health has been Yellow for 3 entries in a row.");
    }

    if (recent.length === 3 && recent.every((x) => x.emotion === "Yellow")) {
      alerts.push("Emotion has been Yellow for 3 entries in a row.");
    }

    if (recent.length === 3 && recent.every((x) => x.behaviour === "Yellow")) {
      alerts.push("Behaviour has been Yellow for 3 entries in a row.");
    }

    const redHealth = sorted.filter((x) => x.health === "Red").length;
    if (redHealth >= 2) {
      alerts.push("There have been multiple Red health entries.");
    }

    if (alerts.length === 0) {
      alerts.push("No major pattern alerts right now.");
    }

    return alerts;
  }, [dailyLogs]);

  function updateDogProfile(field, value) {
    setDogProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updateDailyForm(field, value) {
    setDailyForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateScheduleForm(field, value) {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateMedForm(field, value) {
    setMedForm((prev) => ({ ...prev, [field]: value }));
  }

  function saveDailyLog(e) {
    e.preventDefault();

    if (!dailyForm.date) return;

    const existingIndex = dailyLogs.findIndex(
      (log) => log.date === dailyForm.date
    );

    const newLog = {
      ...dailyForm,
      id: existingIndex >= 0 ? dailyLogs[existingIndex].id : Date.now(),
      dog: dogProfile.name || dailyForm.dog || "Dog",
    };

    if (existingIndex >= 0) {
      const updated = [...dailyLogs];
      updated[existingIndex] = newLog;
      setDailyLogs(updated.sort((a, b) => a.date.localeCompare(b.date)));
    } else {
      setDailyLogs((prev) =>
        [...prev, newLog].sort((a, b) => a.date.localeCompare(b.date))
      );
    }

    setSelectedDate(dailyForm.date);
    setDailyForm(createEmptyDailyForm(dogProfile.name || ""));
  }

  function saveScheduleItem(e) {
    e.preventDefault();
    if (!scheduleForm.itemName.trim()) return;

    const newItem = {
      ...scheduleForm,
      id: Date.now(),
    };

    setHealthSchedule((prev) =>
      [...prev, newItem].sort((a, b) =>
        (a.nextDueDate || "").localeCompare(b.nextDueDate || "")
      )
    );

    setScheduleForm(createEmptyScheduleForm());
  }

  function saveMedication(e) {
    e.preventDefault();
    if (!medForm.medicationName.trim()) return;

    const newMed = {
      ...medForm,
      id: Date.now(),
    };

    setMedicationHistory((prev) =>
      [...prev, newMed].sort((a, b) =>
        (a.startDate || "").localeCompare(b.startDate || "")
      )
    );

    setMedForm(createEmptyMedForm());
  }

  function loadLogIntoForm(log) {
    setDailyForm({
      date: log.date || todayString,
      dog: log.dog || dogProfile.name || "",
      health: log.health || "Green",
      emotion: log.emotion || "Green",
      behaviour: log.behaviour || "Green",
      appetite: log.appetite || "Normal",
      toileting: log.toileting || "Normal",
      medication: log.medication || "",
      trigger: log.trigger || "None",
      notes: log.notes || "",
    });
  }

  function deleteDailyLog(id) {
    const confirmed = window.confirm("Delete this daily log?");
    if (!confirmed) return;

    setDailyLogs((prev) => prev.filter((log) => log.id !== id));

    if (selectedLog?.id === id) {
      setSelectedDate(todayString);
      setDailyForm(createEmptyDailyForm(dogProfile.name || ""));
    }
  }

  function deleteScheduleItem(id) {
    const confirmed = window.confirm("Delete this health schedule item?");
    if (!confirmed) return;
    setHealthSchedule((prev) => prev.filter((item) => item.id !== id));
  }

  function deleteMedication(id) {
    const confirmed = window.confirm("Delete this medication entry?");
    if (!confirmed) return;
    setMedicationHistory((prev) => prev.filter((med) => med.id !== id));
  }

  function clearAllSavedData() {
    const confirmed = window.confirm(
      "This will erase all saved dog data on this device and reset the app to blank. Are you sure?"
    );
    if (!confirmed) return;

    localStorage.removeItem("dogProfile");
    localStorage.removeItem("dailyLogs");
    localStorage.removeItem("healthSchedule");
    localStorage.removeItem("medicationHistory");

    setDogProfile(emptyDogProfile);
    setDailyLogs([]);
    setHealthSchedule([]);
    setMedicationHistory([]);
    setSelectedDate(todayString);
    setDailyForm(createEmptyDailyForm(""));
    setScheduleForm(createEmptyScheduleForm());
    setMedForm(createEmptyMedForm());
  }

  function exportBackup() {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      dogProfile,
      dailyLogs,
      healthSchedule,
      medicationHistory,
    };

    const dogName = dogProfile.name
      ? dogProfile.name.toLowerCase().replace(/\s+/g, "-")
      : "dog-health";
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `${dogName}-backup-${dateStamp}.json`;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    if (importFileRef.current) {
      importFileRef.current.click();
    }
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result);

        const importedDogProfile =
          parsed?.dogProfile && typeof parsed.dogProfile === "object"
            ? { ...emptyDogProfile, ...parsed.dogProfile }
            : emptyDogProfile;

        const importedDailyLogs = Array.isArray(parsed?.dailyLogs)
          ? parsed.dailyLogs
          : [];
        const importedHealthSchedule = Array.isArray(parsed?.healthSchedule)
          ? parsed.healthSchedule
          : [];
        const importedMedicationHistory = Array.isArray(parsed?.medicationHistory)
          ? parsed.medicationHistory
          : [];

        const confirmed = window.confirm(
          "Import this backup and replace the current data in the app?"
        );
        if (!confirmed) return;

        setDogProfile(importedDogProfile);
        setDailyLogs(importedDailyLogs);
        setHealthSchedule(importedHealthSchedule);
        setMedicationHistory(importedMedicationHistory);
        setSelectedDate(todayString);
        setDailyForm(createEmptyDailyForm(importedDogProfile.name || ""));
        setScheduleForm(createEmptyScheduleForm());
        setMedForm(createEmptyMedForm());

        window.alert("Backup imported successfully.");
      } catch {
        window.alert(
          "That file could not be imported. Please choose a valid YoPaws backup JSON file."
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function handleSetupSubmit(e) {
    e.preventDefault();
    if (!dogProfile.name.trim()) {
      window.alert("Please enter your dog's name.");
      return;
    }
  }

  if (!dogProfile.name) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "600px", margin: "80px auto" }}>
          <div style={cardStyle}>
            <h1 style={{ marginTop: 0 }}>Set Up Your Dog Profile</h1>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Add your dog's details to start tracking health, behaviour,
              medication, and reminders.
            </p>

            <form onSubmit={handleSetupSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label>Dog name</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.name}
                  onChange={(e) => updateDogProfile("name", e.target.value)}
                  placeholder="e.g. Yoshi"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Breed</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.breed}
                  onChange={(e) => updateDogProfile("breed", e.target.value)}
                  placeholder="e.g. Golden Retriever"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Sex</label>
                <select
                  style={inputStyle}
                  value={dogProfile.sex}
                  onChange={(e) => updateDogProfile("sex", e.target.value)}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Date of birth</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={dogProfile.dob}
                  onChange={(e) => updateDogProfile("dob", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Weight</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.weight}
                  onChange={(e) => updateDogProfile("weight", e.target.value)}
                  placeholder="e.g. 28 kg"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Desexed</label>
                <select
                  style={inputStyle}
                  value={dogProfile.desexed}
                  onChange={(e) => updateDogProfile("desexed", e.target.value)}
                >
                  <option>No</option>
                  <option>Yes</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Notes</label>
                <textarea
                  style={inputStyle}
                  rows={3}
                  value={dogProfile.notes}
                  onChange={(e) => updateDogProfile("notes", e.target.value)}
                  placeholder="Optional notes"
                />
              </div>

              <button type="submit" style={buttonStyle}>
                Save Dog Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={importBackup}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ ...cardStyle, marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "32px" }}>
                Dog Health & Behaviour App
              </h1>
              <p style={{ marginTop: "10px", color: "#475569" }}>
                Track daily wellbeing, medications, reminders, and health
                history for {dogProfile.name}.
              </p>
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                Auto-saves on this device. You can also export a backup file.
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  handlePrintReport(
                    dogProfile,
                    dailyLogs,
                    healthSchedule,
                    medicationHistory
                  )
                }
                style={topButtonStyle}
              >
                Print Report
              </button>
              <button
                onClick={() =>
                  handleSavePdf(
                    dogProfile,
                    dailyLogs,
                    healthSchedule,
                    medicationHistory
                  )
                }
                style={darkTopButtonStyle}
              >
                Save as PDF
              </button>
              <button onClick={exportBackup} style={topButtonStyle}>
                Export Backup
              </button>
              <button onClick={handleImportClick} style={topButtonStyle}>
                Import Backup
              </button>
              <button
                onClick={clearAllSavedData}
                style={{
                  ...topButtonStyle,
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#b91c1c",
                }}
              >
                Clear Saved Data
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Dog Profile</h2>
            <div style={{ marginBottom: "10px" }}>
              <strong>{dogProfile.name || "No dog name yet"}</strong>
            </div>
            <div style={{ color: "#475569", lineHeight: "1.7" }}>
              <div>Breed: {dogProfile.breed || "—"}</div>
              <div>Sex: {dogProfile.sex || "—"}</div>
              <div>
                Date of birth:{" "}
                {dogProfile.dob ? formatDate(dogProfile.dob) : "—"}
              </div>
              <div>Age: {getAgeText(dogProfile.dob) || "—"}</div>
              <div>{getBirthdayInfo(dogProfile.dob) || ""}</div>
              <div>Weight: {dogProfile.weight || "—"}</div>
              <div>Desexed: {dogProfile.desexed || "—"}</div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Upcoming Reminders</h2>
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{item.itemName}</div>
                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    {item.type}
                  </div>
                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    {item.nextDueDate
                      ? dueSoonText(item.nextDueDate)
                      : "No due date"}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#64748b" }}>No reminder items yet.</div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Active Medications</h2>
            {activeMeds.length > 0 ? (
              activeMeds.map((med) => (
                <div
                  key={med.id}
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{med.medicationName}</div>
                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    {med.dose || "—"} · {med.frequency || "—"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    {med.foodInstruction || "—"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    Started: {med.startDate ? formatDate(med.startDate) : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#64748b" }}>No active medications.</div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div style={{ ...cardStyle, marginBottom: "20px" }}>
              <h2 style={{ marginTop: 0 }}>
                {new Date(currentYear, currentMonth).toLocaleDateString(
                  "en-AU",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h2>

              <div
                style={{
                  marginBottom: "10px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                H = Health · E = Emotion · B = Behaviour
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: "bold",
                      }}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "8px",
                }}
              >
                {monthGrid.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={index}
                        style={{
                          minHeight: "78px",
                          borderRadius: "14px",
                          background: "#e2e8f0",
                        }}
                      />
                    );
                  }

                  const log = logsByDate.get(date);
                  const isSelected = selectedDate === date;

                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        if (log) {
                          loadLogIntoForm(log);
                        } else {
                          setDailyForm({
                            ...createEmptyDailyForm(dogProfile.name || ""),
                            date,
                          });
                        }
                      }}
                      style={{
                        minHeight: "78px",
                        borderRadius: "14px",
                        border: isSelected
                          ? "2px solid #0f172a"
                          : "1px solid #dbe3ea",
                        background: "#fff",
                        padding: "8px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(date + "T00:00:00").getDate()}
                      </div>

                      {log ? (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "10px",
                            lineHeight: "1.3",
                          }}
                        >
                          <div style={{ color: getStatusColor(log.health) }}>
                            H ❤️ {colours[log.health]}
                          </div>
                          <div style={{ color: getStatusColor(log.emotion) }}>
                            E 🧠 {colours[log.emotion]}
                          </div>
                          <div style={{ color: getStatusColor(log.behaviour) }}>
                            B 🐶 {colours[log.behaviour]}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: "18px",
                            color: "#94a3b8",
                            fontSize: "18px",
                          }}
                        >
                          ·
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Selected Day</h2>
              {selectedLog ? (
                <div style={{ lineHeight: "1.8" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    {selectedLog.dog || dogProfile.name || "Dog"} —{" "}
                    {formatDate(selectedLog.date)}
                  </div>
                  <div>
                    <strong>Health:</strong> ❤️ {colours[selectedLog.health]}{" "}
                    {selectedLog.health}
                  </div>
                  <div>
                    <strong>Emotion:</strong> 🧠 {colours[selectedLog.emotion]}{" "}
                    {selectedLog.emotion}
                  </div>
                  <div>
                    <strong>Behaviour:</strong> 🐶{" "}
                    {colours[selectedLog.behaviour]} {selectedLog.behaviour}
                  </div>
                  <div>
                    <strong>Appetite:</strong> {selectedLog.appetite}
                  </div>
                  <div>
                    <strong>Toileting:</strong> {selectedLog.toileting}
                  </div>
                  <div>
                    <strong>Medication note:</strong>{" "}
                    {selectedLog.medication || "—"}
                  </div>
                  <div>
                    <strong>Trigger:</strong> {selectedLog.trigger || "—"}
                  </div>
                  <div>
                    <strong>Notes:</strong>{" "}
                    {selectedLog.notes || "No notes recorded."}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "14px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => loadLogIntoForm(selectedLog)}
                      style={secondaryButtonStyle}
                    >
                      Load into Form
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDailyLog(selectedLog.id)}
                      style={deleteButtonStyle}
                    >
                      Delete Log
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#64748b" }}>
                  No entry saved for {formatDate(selectedDate)} yet.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Edit Dog Profile</h2>

              <div style={{ marginBottom: "12px" }}>
                <label>Dog name</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.name}
                  onChange={(e) => updateDogProfile("name", e.target.value)}
                  placeholder="e.g. Yoshi"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Breed</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.breed}
                  onChange={(e) => updateDogProfile("breed", e.target.value)}
                  placeholder="e.g. Golden Retriever"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Sex</label>
                <select
                  style={inputStyle}
                  value={dogProfile.sex}
                  onChange={(e) => updateDogProfile("sex", e.target.value)}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Date of birth</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={dogProfile.dob}
                  onChange={(e) => updateDogProfile("dob", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Weight</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={dogProfile.weight}
                  onChange={(e) => updateDogProfile("weight", e.target.value)}
                  placeholder="e.g. 28 kg"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Desexed</label>
                <select
                  style={inputStyle}
                  value={dogProfile.desexed}
                  onChange={(e) => updateDogProfile("desexed", e.target.value)}
                >
                  <option>No</option>
                  <option>Yes</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Notes</label>
                <textarea
                  style={inputStyle}
                  rows={3}
                  value={dogProfile.notes}
                  onChange={(e) => updateDogProfile("notes", e.target.value)}
                />
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Add / Edit Daily Log</h2>
              <form onSubmit={saveDailyLog}>
                <div style={{ marginBottom: "12px" }}>
                  <label>Date</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={dailyForm.date}
                    onChange={(e) => updateDailyForm("date", e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Dog</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={dogProfile.name || ""}
                    readOnly
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Health</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.health}
                    onChange={(e) => updateDailyForm("health", e.target.value)}
                  >
                    <option>Green</option>
                    <option>Yellow</option>
                    <option>Red</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Emotion</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.emotion}
                    onChange={(e) => updateDailyForm("emotion", e.target.value)}
                  >
                    <option>Green</option>
                    <option>Yellow</option>
                    <option>Red</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Behaviour</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.behaviour}
                    onChange={(e) =>
                      updateDailyForm("behaviour", e.target.value)
                    }
                  >
                    <option>Green</option>
                    <option>Yellow</option>
                    <option>Red</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Appetite</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.appetite}
                    onChange={(e) =>
                      updateDailyForm("appetite", e.target.value)
                    }
                  >
                    <option>Normal</option>
                    <option>Reduced</option>
                    <option>Refused</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Toileting</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.toileting}
                    onChange={(e) =>
                      updateDailyForm("toileting", e.target.value)
                    }
                  >
                    <option>Normal</option>
                    <option>Soft stool</option>
                    <option>Diarrhoea</option>
                    <option>Vomiting</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Medication note</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={dailyForm.medication}
                    onChange={(e) =>
                      updateDailyForm("medication", e.target.value)
                    }
                    placeholder="e.g. Zoloft started"
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Trigger / event</label>
                  <select
                    style={inputStyle}
                    value={dailyForm.trigger}
                    onChange={(e) => updateDailyForm("trigger", e.target.value)}
                  >
                    <option>None</option>
                    <option>Medication change</option>
                    <option>Training session</option>
                    <option>Public outing</option>
                    <option>Vet visit</option>
                    <option>Travel</option>
                    <option>New food</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Notes</label>
                  <textarea
                    style={inputStyle}
                    rows={4}
                    value={dailyForm.notes}
                    onChange={(e) => updateDailyForm("notes", e.target.value)}
                  />
                </div>

                <button type="submit" style={buttonStyle}>
                  Save Daily Log
                </button>
              </form>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Health Schedule</h2>
            <form onSubmit={saveScheduleItem}>
              <div style={{ marginBottom: "12px" }}>
                <label>Item name</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={scheduleForm.itemName}
                  onChange={(e) =>
                    updateScheduleForm("itemName", e.target.value)
                  }
                  placeholder="e.g. Lepto, Cytopoint, worming"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Type</label>
                <select
                  style={inputStyle}
                  value={scheduleForm.type}
                  onChange={(e) => updateScheduleForm("type", e.target.value)}
                >
                  <option>Vaccine</option>
                  <option>Injection</option>
                  <option>Parasite prevention</option>
                  <option>Medication</option>
                  <option>Check-up</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Date given</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={scheduleForm.dateGiven}
                  onChange={(e) =>
                    updateScheduleForm("dateGiven", e.target.value)
                  }
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Next due date</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={scheduleForm.nextDueDate}
                  onChange={(e) =>
                    updateScheduleForm("nextDueDate", e.target.value)
                  }
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Repeat frequency</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={scheduleForm.repeatFrequency}
                  onChange={(e) =>
                    updateScheduleForm("repeatFrequency", e.target.value)
                  }
                  placeholder="e.g. Yearly, Monthly, Every 3 months"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Reminder</label>
                <select
                  style={inputStyle}
                  value={scheduleForm.reminder}
                  onChange={(e) =>
                    updateScheduleForm("reminder", e.target.value)
                  }
                >
                  <option>None</option>
                  <option>On due date</option>
                  <option>1 day before</option>
                  <option>7 days before</option>
                  <option>30 days before</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Notes</label>
                <textarea
                  style={inputStyle}
                  rows={3}
                  value={scheduleForm.notes}
                  onChange={(e) => updateScheduleForm("notes", e.target.value)}
                />
              </div>

              <button type="submit" style={buttonStyle}>
                Add Health Item
              </button>
            </form>

            <div style={{ marginTop: "16px" }}>
              {healthSchedule.length > 0 ? (
                healthSchedule.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{item.itemName}</div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      {item.type}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      Given: {item.dateGiven ? formatDate(item.dateGiven) : "—"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      Next due:{" "}
                      {item.nextDueDate ? formatDate(item.nextDueDate) : "—"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      {item.nextDueDate ? dueSoonText(item.nextDueDate) : ""}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        onClick={() => deleteScheduleItem(item.id)}
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748b" }}>
                  No health schedule items yet.
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Medication History</h2>
            <form onSubmit={saveMedication}>
              <div style={{ marginBottom: "12px" }}>
                <label>Medication name</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={medForm.medicationName}
                  onChange={(e) =>
                    updateMedForm("medicationName", e.target.value)
                  }
                  placeholder="e.g. Zoloft"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Dose</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={medForm.dose}
                  onChange={(e) => updateMedForm("dose", e.target.value)}
                  placeholder="e.g. 25 mg"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Frequency</label>
                <select
                  style={inputStyle}
                  value={medForm.frequency}
                  onChange={(e) => updateMedForm("frequency", e.target.value)}
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Every 8 hours</option>
                  <option>Every 12 hours</option>
                  <option>As needed (PRN)</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>How to take it</label>
                <select
                  style={inputStyle}
                  value={medForm.foodInstruction}
                  onChange={(e) =>
                    updateMedForm("foodInstruction", e.target.value)
                  }
                >
                  <option>With food</option>
                  <option>Without food</option>
                  <option>After food</option>
                  <option>Before food</option>
                  <option>With treat</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Start date</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={medForm.startDate}
                  onChange={(e) => updateMedForm("startDate", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>End date</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={medForm.endDate}
                  onChange={(e) => updateMedForm("endDate", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Reason</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={medForm.reason}
                  onChange={(e) => updateMedForm("reason", e.target.value)}
                  placeholder="e.g. anxiety"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Prescribed by</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={medForm.prescribedBy}
                  onChange={(e) =>
                    updateMedForm("prescribedBy", e.target.value)
                  }
                  placeholder="e.g. vet or behavioural vet"
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Notes</label>
                <textarea
                  style={inputStyle}
                  rows={3}
                  value={medForm.notes}
                  onChange={(e) => updateMedForm("notes", e.target.value)}
                />
              </div>

              <button type="submit" style={buttonStyle}>
                Add Medication
              </button>
            </form>

            <div style={{ marginTop: "16px" }}>
              {medicationHistory.length > 0 ? (
                medicationHistory.map((med) => (
                  <div
                    key={med.id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{med.medicationName}</div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      {med.dose || "—"} · {med.frequency || "—"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      {med.foodInstruction || "—"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      Start: {med.startDate ? formatDate(med.startDate) : "—"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      End: {med.endDate ? formatDate(med.endDate) : "Ongoing"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      Reason: {med.reason || "—"}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        onClick={() => deleteMedication(med.id)}
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748b" }}>
                  No medication history yet.
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Pattern Alerts</h2>
            {patternAlerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                {alert}
              </div>
            ))}

            <h3 style={{ marginTop: "20px" }}>What this version includes</h3>
            <ul
              style={{
                paddingLeft: "18px",
                color: "#475569",
                lineHeight: "1.8",
              }}
            >
              <li>Local auto-save on the device</li>
              <li>Export backup to a JSON file</li>
              <li>Import backup from a JSON file</li>
              <li>Dog profile editing</li>
              <li>Daily health, emotion, and behaviour logging</li>
              <li>Calendar view for saved daily logs</li>
              <li>Health schedule reminders</li>
              <li>Medication history</li>
              <li>Delete logs, schedule items, and medications</li>
              <li>Print report and Save as PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
