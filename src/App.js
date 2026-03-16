import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "yopaws-health-tracker-v4";
const DEFAULT_DOG_IMAGE =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80";

function getTodayLocalISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const emptyDogProfile = {
  name: "",
  type: "Dog",
  breed: "",
  sex: "Unknown",
  dob: "",
  weight: "",
  desexed: "Unknown",
  photo: DEFAULT_DOG_IMAGE,
  notes: "",
};

function createEmptyDailyForm(dogName = "") {
  const today = getTodayLocalISO();
  return {
    id: null,
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

function safeRead() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        dogProfile: emptyDogProfile,
        dailyLogs: [],
        healthSchedule: [],
        medicationHistory: [],
      };
    }

    const parsed = JSON.parse(saved);
    return {
      dogProfile: { ...emptyDogProfile, ...(parsed.dogProfile || {}) },
      dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
      healthSchedule: Array.isArray(parsed.healthSchedule)
        ? parsed.healthSchedule
        : [],
      medicationHistory: Array.isArray(parsed.medicationHistory)
        ? parsed.medicationHistory
        : [],
    };
  } catch {
    return {
      dogProfile: emptyDogProfile,
      dailyLogs: [],
      healthSchedule: [],
      medicationHistory: [],
    };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAgeText(dob) {
  if (!dob) return "—";
  const birth = new Date(`${dob}T00:00:00`);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"} ${months} month${
    months === 1 ? "" : "s"
  }`;
}

function dueSoonText(date) {
  if (!date) return "";
  const due = new Date(`${date}T00:00:00`);
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

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) cells.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const localDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    cells.push(localDate);
  }

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function getStatusClass(status) {
  if (status === "Green") return "chip-green";
  if (status === "Yellow") return "chip-yellow";
  return "chip-red";
}

function buildPrintableHtml(
  dogProfile,
  dailyLogs,
  healthSchedule,
  medicationHistory
) {
  const sortedLogs = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
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
        <td>${log.health}</td>
        <td>${log.emotion}</td>
        <td>${log.behaviour}</td>
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
        <title>${dogProfile.name || "Pet"} Health Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1, h2 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
          th { background: #f3f4f6; }
          .meta div { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>${dogProfile.name || "Pet"} Health Report</h1>
        <div class="meta">
          <div><strong>Pet type:</strong> ${dogProfile.type || "—"}</div>
          <div><strong>Breed:</strong> ${dogProfile.breed || "—"}</div>
          <div><strong>Sex:</strong> ${dogProfile.sex || "—"}</div>
          <div><strong>Date of birth:</strong> ${
            dogProfile.dob ? formatDate(dogProfile.dob) : "—"
          }</div>
          <div><strong>Age:</strong> ${getAgeText(dogProfile.dob)}</div>
          <div><strong>Weight:</strong> ${dogProfile.weight || "—"}</div>
          <div><strong>Desexed:</strong> ${dogProfile.desexed || "—"}</div>
          <div><strong>Notes:</strong> ${dogProfile.notes || "—"}</div>
        </div>

        <h2>Daily Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Health</th>
              <th>Emotion</th>
              <th>Behaviour</th>
              <th>Appetite</th>
              <th>Toileting</th>
              <th>Medication</th>
              <th>Trigger</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>${logRows || '<tr><td colspan="9">No daily logs yet.</td></tr>'}</tbody>
        </table>

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
          <tbody>${scheduleRows || '<tr><td colspan="7">No health schedule items yet.</td></tr>'}</tbody>
        </table>

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
          <tbody>${medRows || '<tr><td colspan="9">No medication history yet.</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `;
}

export default function App() {
  const importFileRef = useRef(null);
  const photoFileRef = useRef(null);
  const fileHandleRef = useRef(null);

  const initialData = safeRead();

  const [dogProfile, setDogProfile] = useState(initialData.dogProfile);
  const [dailyLogs, setDailyLogs] = useState(initialData.dailyLogs);
  const [healthSchedule, setHealthSchedule] = useState(initialData.healthSchedule);
  const [medicationHistory, setMedicationHistory] = useState(
    initialData.medicationHistory
  );

  const [selectedDate, setSelectedDate] = useState(getTodayLocalISO());
  const [dailyForm, setDailyForm] = useState(
    createEmptyDailyForm(initialData.dogProfile.name || "")
  );
  const [scheduleForm, setScheduleForm] = useState(createEmptyScheduleForm());
  const [medForm, setMedForm] = useState(createEmptyMedForm());

  const [activeTab, setActiveTab] = useState("home");
  const [viewStack, setViewStack] = useState(["home"]);

  const [saveFileSupported, setSaveFileSupported] = useState(false);
  const [hasChosenFile, setHasChosenFile] = useState(false);

  const [deletePrompt, setDeletePrompt] = useState(null);

  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    setSaveFileSupported(
      typeof window !== "undefined" &&
        "showSaveFilePicker" in window &&
        !!window.isSecureContext
    );
  }, []);

  useEffect(() => {
    const data = {
      dogProfile,
      dailyLogs,
      healthSchedule,
      medicationHistory,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [dogProfile, dailyLogs, healthSchedule, medicationHistory]);

  useEffect(() => {
    setDailyForm((prev) => ({
      ...prev,
      dog: dogProfile.name || "",
    }));
  }, [dogProfile.name]);

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();

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

  const activeMeds = useMemo(
    () => medicationHistory.filter((med) => !med.endDate),
    [medicationHistory]
  );

  const upcomingItems = useMemo(() => {
    return [...healthSchedule]
      .filter((item) => item.nextDueDate)
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .slice(0, 5);
  }, [healthSchedule]);

  const latestLog = useMemo(() => {
    return [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [dailyLogs]);

  function openView(next) {
    setActiveTab(next);
    setViewStack((prev) => {
      if (prev[prev.length - 1] === next) return prev;
      return [...prev, next];
    });
  }

  function goBack() {
    setViewStack((prev) => {
      if (prev.length <= 1) {
        setActiveTab("home");
        return ["home"];
      }
      const newStack = prev.slice(0, -1);
      setActiveTab(newStack[newStack.length - 1]);
      return newStack;
    });
  }

  function changeCalendarMonth(direction) {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  }

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

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      updateDogProfile("photo", e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function triggerPhotoUpload() {
    photoFileRef.current?.click();
  }

  function saveDailyLog(e) {
    e.preventDefault();
    if (!dailyForm.date) return;

    const existingIndex = dailyLogs.findIndex((log) => log.date === dailyForm.date);
    const newLog = {
      ...dailyForm,
      id: existingIndex >= 0 ? dailyLogs[existingIndex].id : Date.now(),
      dog: dogProfile.name || "Pet",
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

    const newItem = { ...scheduleForm, id: Date.now() };
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

    const newMed = { ...medForm, id: Date.now() };
    setMedicationHistory((prev) =>
      [...prev, newMed].sort((a, b) =>
        (a.startDate || "").localeCompare(b.startDate || "")
      )
    );
    setMedForm(createEmptyMedForm());
  }

  function loadLogIntoForm(log) {
    setDailyForm({
      id: log.id || null,
      date: log.date || getTodayLocalISO(),
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
    openView("logs");
  }

  function askDelete(type, id, label) {
    setDeletePrompt({ type, id, label });
  }

  function confirmDelete() {
    if (!deletePrompt) return;

    if (deletePrompt.type === "log") {
      setDailyLogs((prev) => prev.filter((item) => item.id !== deletePrompt.id));
    }

    if (deletePrompt.type === "schedule") {
      setHealthSchedule((prev) =>
        prev.filter((item) => item.id !== deletePrompt.id)
      );
    }

    if (deletePrompt.type === "medication") {
      setMedicationHistory((prev) =>
        prev.filter((item) => item.id !== deletePrompt.id)
      );
    }

    setDeletePrompt(null);
  }

  function cancelDelete() {
    setDeletePrompt(null);
  }

  function clearAllSavedData() {
    setDeletePrompt({
      type: "all",
      id: "all",
      label: "all saved data on this device",
    });
  }

  function confirmDeleteAll() {
    localStorage.removeItem(STORAGE_KEY);
    setDogProfile(emptyDogProfile);
    setDailyLogs([]);
    setHealthSchedule([]);
    setMedicationHistory([]);
    setDailyForm(createEmptyDailyForm(""));
    setScheduleForm(createEmptyScheduleForm());
    setMedForm(createEmptyMedForm());
    setSelectedDate(getTodayLocalISO());
    setDeletePrompt(null);
    setActiveTab("home");
    setViewStack(["home"]);
    const now = new Date();
    setCalendarDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  function getBackupData() {
    return {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      dogProfile,
      dailyLogs,
      healthSchedule,
      medicationHistory,
    };
  }

  function exportBackup() {
    const backupData = getBackupData();
    const dogName = dogProfile.name
      ? dogProfile.name.toLowerCase().replace(/\s+/g, "-")
      : "yopaws-health";
    const filename = `${dogName}-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

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

  async function chooseBackupFile() {
    if (!saveFileSupported) {
      window.alert(
        "Direct save to a chosen file is not supported in this browser. Please use Export Backup instead."
      );
      return;
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${(dogProfile.name || "yopaws-health")
          .toLowerCase()
          .replace(/\s+/g, "-")}-backup.json`,
        types: [
          {
            description: "JSON Backup",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });

      fileHandleRef.current = handle;
      setHasChosenFile(true);
      await saveBackupToChosenFile();
    } catch (error) {
      if (error?.name !== "AbortError") {
        window.alert("Could not choose a backup file.");
      }
    }
  }

  async function saveBackupToChosenFile() {
    if (!fileHandleRef.current) {
      await chooseBackupFile();
      return;
    }

    try {
      const writable = await fileHandleRef.current.createWritable();
      await writable.write(JSON.stringify(getBackupData(), null, 2));
      await writable.close();
      window.alert("Backup saved to chosen file.");
    } catch {
      window.alert(
        "Could not save to the chosen file. You can still use Export Backup."
      );
    }
  }

  function handleImportClick() {
    importFileRef.current?.click();
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

        const ok = window.confirm(
          "Import this backup and replace the current data in the app?"
        );
        if (!ok) return;

        setDogProfile(importedDogProfile);
        setDailyLogs(importedDailyLogs);
        setHealthSchedule(importedHealthSchedule);
        setMedicationHistory(importedMedicationHistory);
        setDailyForm(createEmptyDailyForm(importedDogProfile.name || ""));
        setScheduleForm(createEmptyScheduleForm());
        setMedForm(createEmptyMedForm());
        setSelectedDate(getTodayLocalISO());

        window.alert("Backup imported successfully.");
      } catch {
        window.alert("That file could not be imported.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function handlePrintReport() {
    const html = buildPrintableHtml(
      dogProfile,
      dailyLogs,
      healthSchedule,
      medicationHistory
    );
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  function handleSetupSubmit(e) {
    e.preventDefault();
    if (!dogProfile.name.trim()) {
      window.alert("Please enter your pet's name.");
      return;
    }
  }

  const showBackButton = activeTab !== "home";

  if (!dogProfile.name) {
    return (
      <div className="app-shell">
        <input
          ref={photoFileRef}
          type="file"
          accept="image/*"
          className="hidden-file-input"
          onChange={handlePhotoUpload}
        />

        <div className="app-container setup-layout">
          <div className="surface-card">
            <div className="screen-header">
              <div className="brand-wrap">
                <div className="brand-icon">🐶</div>
                <div>
                  <h1 className="title">Set Up Your Pet Profile</h1>
                  <p className="subtitle">
                    Add your pet's details to start tracking health and medications.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSetupSubmit} className="stack-lg app-form-pad">
              <div className="profile-photo-wrap">
                <img
                  src={dogProfile.photo || DEFAULT_DOG_IMAGE}
                  alt="Pet preview"
                  className="dog-photo large"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={triggerPhotoUpload}
                >
                  Upload Photo
                </button>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label>Pet name</label>
                  <input
                    value={dogProfile.name}
                    onChange={(e) => updateDogProfile("name", e.target.value)}
                    placeholder="e.g. Yoshi"
                  />
                </div>

                <div className="field">
                  <label>Pet type</label>
                  <select
                    value={dogProfile.type}
                    onChange={(e) => updateDogProfile("type", e.target.value)}
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>Breed</label>
                  <input
                    value={dogProfile.breed}
                    onChange={(e) => updateDogProfile("breed", e.target.value)}
                    placeholder="e.g. Golden Retriever"
                  />
                </div>

                <div className="field">
                  <label>Sex</label>
                  <select
                    value={dogProfile.sex}
                    onChange={(e) => updateDogProfile("sex", e.target.value)}
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Unknown</option>
                  </select>
                </div>

                <div className="field">
                  <label>Date of birth</label>
                  <input
                    type="date"
                    value={dogProfile.dob}
                    onChange={(e) => updateDogProfile("dob", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Weight</label>
                  <input
                    value={dogProfile.weight}
                    onChange={(e) => updateDogProfile("weight", e.target.value)}
                    placeholder="e.g. 28 kg"
                  />
                </div>

                <div className="field">
                  <label>Desexed</label>
                  <select
                    value={dogProfile.desexed}
                    onChange={(e) => updateDogProfile("desexed", e.target.value)}
                  >
                    <option>No</option>
                    <option>Yes</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea
                  rows={4}
                  value={dogProfile.notes}
                  onChange={(e) => updateDogProfile("notes", e.target.value)}
                  placeholder="Optional notes"
                />
              </div>

              <button className="primary-button" type="submit">
                Save Pet Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        className="hidden-file-input"
        onChange={importBackup}
      />
      <input
        ref={photoFileRef}
        type="file"
        accept="image/*"
        className="hidden-file-input"
        onChange={handlePhotoUpload}
      />

      <div className="app-container">
        <div className="surface-card app-card">
          <header className="screen-header">
            <div className="header-left">
              {showBackButton ? (
                <button className="back-button" onClick={goBack} type="button">
                  ←
                </button>
              ) : (
                <div className="brand-icon">🐶</div>
              )}

              <div>
                <h1 className="title">YoPaws Health Tracker</h1>
                <p className="subtitle">
                  Auto-save, backup file, and vet-friendly reports
                </p>
              </div>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={() => openView("reports")}
            >
              💾
            </button>
          </header>

          <main className="main-content">
            {activeTab === "home" && (
              <>
                <section className="hero-card">
                  <div className="hero-top">
                    <button
                      className="dog-photo-button"
                      type="button"
                      onClick={() => openView("dog")}
                    >
                      <img
                        src={dogProfile.photo || DEFAULT_DOG_IMAGE}
                        alt={dogProfile.name || "Pet"}
                        className="dog-photo home-photo"
                      />
                    </button>

                    <div className="hero-content">
                      <div className="hero-name-row">
                        <div>
                          <h2 className="dog-name">{dogProfile.name}</h2>
                          <p className="dog-meta">
                            {dogProfile.type || "Pet"} • {dogProfile.breed || "Unknown breed"} •{" "}
                            {getAgeText(dogProfile.dob)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mini-action-button"
                          onClick={() => openView("dog")}
                        >
                          Edit Pet
                        </button>
                      </div>

                      <div className="hero-stats">
                        <div>
                          <p className="muted-label">Current weight</p>
                          <p className="weight-value">{dogProfile.weight || "—"}</p>
                          <p className="tiny-muted">
                            Desexed: {dogProfile.desexed || "—"}
                          </p>
                        </div>

                        <div className="mini-bars" aria-hidden="true">
                          {[30, 45, 40, 58, 54, 70, 76].map((h, i) => (
                            <div
                              key={i}
                              className="mini-bar"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-heading">
                    <span>🩺</span>
                    <h3>Today</h3>
                  </div>

                  <div className="list-stack">
                    <div className="stat-row">
                      <div className="stat-icon">🤢</div>
                      <div className="stat-content">
                        <div className="stat-line">
                          <span className="stat-label">Vomiting</span>
                          <span className="stat-value stat-violet">
                            {latestLog?.appetite === "Vomiting" ? "Logged" : "None"}
                          </span>
                        </div>
                        <div className="stat-meta">
                          {latestLog ? `Last: ${formatDate(latestLog.date)}` : "No logs yet"}
                        </div>
                      </div>
                    </div>

                    <div className="stat-row">
                      <div className="stat-icon">💊</div>
                      <div className="stat-content">
                        <div className="stat-line">
                          <span className="stat-label">Active Medications</span>
                          <span className="stat-value stat-yellow">
                            {activeMeds[0]?.medicationName || "None"}
                          </span>
                        </div>
                        <div className="stat-meta">
                          {activeMeds.length ? `Active: ${activeMeds.length}` : "No active meds"}
                        </div>
                      </div>
                    </div>

                    <div className="stat-row">
                      <div className="stat-icon">🍽️</div>
                      <div className="stat-content">
                        <div className="stat-line">
                          <span className="stat-label">Appetite</span>
                          <span className="stat-value stat-yellow">
                            {latestLog?.appetite || "No data"}
                          </span>
                        </div>
                        <div className="stat-meta">
                          {latestLog ? `Last: ${formatDate(latestLog.date)}` : "No logs yet"}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-heading">
                    <span>⚡</span>
                    <h3>Quick Actions</h3>
                  </div>

                  <div className="quick-grid">
                    <button
                      type="button"
                      className="quick-button quick-violet"
                      onClick={() => openView("logs")}
                    >
                      <span>➕</span>
                      <span>Add Symptom</span>
                    </button>

                    <button
                      type="button"
                      className="quick-button quick-yellow"
                      onClick={() => openView("meds")}
                    >
                      <span>💊</span>
                      <span>Add Medication</span>
                    </button>

                    <button
                      type="button"
                      className="quick-button quick-cyan"
                      onClick={() => openView("schedule")}
                    >
                      <span>📅</span>
                      <span>Add Reminder</span>
                    </button>
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-heading">
                    <span>📅</span>
                    <h3>Upcoming Reminders</h3>
                  </div>

                  {upcomingItems.length > 0 ? (
                    <div className="list-stack">
                      {upcomingItems.map((item) => (
                        <div key={item.id} className="reminder-card">
                          <div className="reminder-title">{item.itemName}</div>
                          <div className="reminder-meta">
                            {item.type} • {dueSoonText(item.nextDueDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-text">No reminder items yet.</p>
                  )}
                </section>
              </>
            )}

            {activeTab === "dog" && (
              <section className="panel-card">
                <div className="panel-heading">
                  <span>🐾</span>
                  <h3>Pet Profile</h3>
                </div>

                <div className="profile-photo-wrap">
                  <img
                    src={dogProfile.photo || DEFAULT_DOG_IMAGE}
                    alt={dogProfile.name || "Pet"}
                    className="dog-photo large"
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={triggerPhotoUpload}
                  >
                    Upload Photo
                  </button>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>Pet name</label>
                    <input
                      value={dogProfile.name}
                      onChange={(e) => updateDogProfile("name", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Pet type</label>
                    <select
                      value={dogProfile.type}
                      onChange={(e) => updateDogProfile("type", e.target.value)}
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Breed</label>
                    <input
                      value={dogProfile.breed}
                      onChange={(e) => updateDogProfile("breed", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Sex</label>
                    <select
                      value={dogProfile.sex}
                      onChange={(e) => updateDogProfile("sex", e.target.value)}
                    >
                      <option>Female</option>
                      <option>Male</option>
                      <option>Unknown</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Date of birth</label>
                    <input
                      type="date"
                      value={dogProfile.dob}
                      onChange={(e) => updateDogProfile("dob", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Weight</label>
                    <input
                      value={dogProfile.weight}
                      onChange={(e) => updateDogProfile("weight", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Desexed</label>
                    <select
                      value={dogProfile.desexed}
                      onChange={(e) => updateDogProfile("desexed", e.target.value)}
                    >
                      <option>No</option>
                      <option>Yes</option>
                      <option>Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Notes</label>
                  <textarea
                    rows={4}
                    value={dogProfile.notes}
                    onChange={(e) => updateDogProfile("notes", e.target.value)}
                  />
                </div>
              </section>
            )}

            {activeTab === "logs" && (
              <>
                <section className="panel-card">
                  <div className="panel-heading">
                    <span>📝</span>
                    <h3>Add / Edit Daily Log</h3>
                  </div>

                  <form onSubmit={saveDailyLog} className="stack-lg">
                    <div className="field-grid">
                      <div className="field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={dailyForm.date}
                          onChange={(e) => updateDailyForm("date", e.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Health</label>
                        <select
                          value={dailyForm.health}
                          onChange={(e) => updateDailyForm("health", e.target.value)}
                        >
                          <option>Green</option>
                          <option>Yellow</option>
                          <option>Red</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Emotion</label>
                        <select
                          value={dailyForm.emotion}
                          onChange={(e) => updateDailyForm("emotion", e.target.value)}
                        >
                          <option>Green</option>
                          <option>Yellow</option>
                          <option>Red</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Behaviour</label>
                        <select
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

                      <div className="field">
                        <label>Appetite</label>
                        <select
                          value={dailyForm.appetite}
                          onChange={(e) =>
                            updateDailyForm("appetite", e.target.value)
                          }
                        >
                          <option>Normal</option>
                          <option>Reduced</option>
                          <option>Refused</option>
                          <option>Vomiting</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Toileting</label>
                        <select
                          value={dailyForm.toileting}
                          onChange={(e) =>
                            updateDailyForm("toileting", e.target.value)
                          }
                        >
                          <option>Normal</option>
                          <option>Soft stool</option>
                          <option>Diarrhoea</option>
                          <option>Constipation</option>
                        </select>
                      </div>
                    </div>

                    <div className="field">
                      <label>Medication note</label>
                      <input
                        value={dailyForm.medication}
                        onChange={(e) =>
                          updateDailyForm("medication", e.target.value)
                        }
                        placeholder="e.g. Zoloft started"
                      />
                    </div>

                    <div className="field">
                      <label>Trigger / event</label>
                      <select
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

                    <div className="field">
                      <label>Notes</label>
                      <textarea
                        rows={4}
                        value={dailyForm.notes}
                        onChange={(e) => updateDailyForm("notes", e.target.value)}
                      />
                    </div>

                    <button type="submit" className="primary-button">
                      Save Daily Log
                    </button>
                  </form>
                </section>

                <section className="panel-card">
                  <div className="panel-heading">
                    <span>📆</span>
                    <h3>Calendar</h3>
                  </div>

                  <div className="calendar-month-bar">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => changeCalendarMonth(-1)}
                    >
                      ← Prev
                    </button>

                    <div className="calendar-month-title">
                      {calendarDate.toLocaleDateString("en-AU", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => changeCalendarMonth(1)}
                    >
                      Next →
                    </button>
                  </div>

                  <div className="calendar-scroll">
                    <div className="calendar-shell">
                      <div className="calendar-grid-header">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div key={day} className="calendar-day-name">
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      <div className="calendar-grid">
                        {monthGrid.map((date, index) => {
                          if (!date) {
                            return <div key={index} className="calendar-empty" />;
                          }

                          const log = logsByDate.get(date);
                          const isSelected = selectedDate === date;

                          return (
                            <button
                              key={date}
                              type="button"
                              className={`calendar-cell ${
                                isSelected ? "calendar-selected" : ""
                              }`}
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
                            >
                              <div className="calendar-date">
                                {Number(date.split("-")[2])}
                              </div>

                              {log ? (
                                <div className="calendar-dots">
                                  <span
                                    className={`tiny-chip ${getStatusClass(log.health)}`}
                                  >
                                    H
                                  </span>
                                  <span
                                    className={`tiny-chip ${getStatusClass(log.emotion)}`}
                                  >
                                    E
                                  </span>
                                  <span
                                    className={`tiny-chip ${getStatusClass(log.behaviour)}`}
                                  >
                                    B
                                  </span>
                                </div>
                              ) : (
                                <div className="calendar-placeholder">·</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="selected-log-box">
                    <h4>Selected Day</h4>
                    {selectedLog ? (
                      <div className="stack-sm">
                        <div className="log-line">
                          <strong>{formatDate(selectedLog.date)}</strong>
                        </div>

                        <div className="chips-row">
                          <span
                            className={`status-chip ${getStatusClass(selectedLog.health)}`}
                          >
                            Health: {selectedLog.health}
                          </span>
                          <span
                            className={`status-chip ${getStatusClass(selectedLog.emotion)}`}
                          >
                            Emotion: {selectedLog.emotion}
                          </span>
                          <span
                            className={`status-chip ${getStatusClass(
                              selectedLog.behaviour
                            )}`}
                          >
                            Behaviour: {selectedLog.behaviour}
                          </span>
                        </div>

                        <div className="muted-detail">
                          Appetite: {selectedLog.appetite} • Toileting:{" "}
                          {selectedLog.toileting}
                        </div>

                        <div className="muted-detail">
                          Trigger: {selectedLog.trigger || "—"}
                        </div>

                        <div className="muted-detail">
                          Notes: {selectedLog.notes || "No notes"}
                        </div>

                        <div className="button-row">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => loadLogIntoForm(selectedLog)}
                          >
                            Load into Form
                          </button>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              askDelete("log", selectedLog.id, "this daily log")
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="empty-text">
                        No entry saved for {formatDate(selectedDate)} yet.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === "meds" && (
              <section className="panel-card">
                <div className="panel-heading">
                  <span>💊</span>
                  <h3>Medication History</h3>
                </div>

                <form onSubmit={saveMedication} className="stack-lg">
                  <div className="field-grid">
                    <div className="field">
                      <label>Medication name</label>
                      <input
                        value={medForm.medicationName}
                        onChange={(e) =>
                          updateMedForm("medicationName", e.target.value)
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Dose</label>
                      <input
                        value={medForm.dose}
                        onChange={(e) => updateMedForm("dose", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Frequency</label>
                      <select
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
                    <div className="field">
                      <label>How to take it</label>
                      <select
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
                    <div className="field">
                      <label>Start date</label>
                      <input
                        type="date"
                        value={medForm.startDate}
                        onChange={(e) =>
                          updateMedForm("startDate", e.target.value)
                        }
                      />
                    </div>
                    <div className="field">
                      <label>End date</label>
                      <input
                        type="date"
                        value={medForm.endDate}
                        onChange={(e) => updateMedForm("endDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Reason</label>
                    <input
                      value={medForm.reason}
                      onChange={(e) => updateMedForm("reason", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Prescribed by</label>
                    <input
                      value={medForm.prescribedBy}
                      onChange={(e) =>
                        updateMedForm("prescribedBy", e.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      value={medForm.notes}
                      onChange={(e) => updateMedForm("notes", e.target.value)}
                    />
                  </div>

                  <button type="submit" className="primary-button">
                    Add Medication
                  </button>
                </form>

                <div className="list-stack top-gap">
                  {medicationHistory.length > 0 ? (
                    medicationHistory.map((med) => (
                      <div key={med.id} className="reminder-card">
                        <div className="reminder-title">{med.medicationName}</div>
                        <div className="reminder-meta">
                          {med.dose || "—"} • {med.frequency || "—"} •{" "}
                          {med.endDate ? `Ended ${formatDate(med.endDate)}` : "Ongoing"}
                        </div>
                        <div className="button-row top-gap-sm">
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              askDelete("medication", med.id, med.medicationName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No medication history yet.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === "schedule" && (
              <section className="panel-card">
                <div className="panel-heading">
                  <span>📅</span>
                  <h3>Health Schedule</h3>
                </div>

                <form onSubmit={saveScheduleItem} className="stack-lg">
                  <div className="field-grid">
                    <div className="field">
                      <label>Item name</label>
                      <input
                        value={scheduleForm.itemName}
                        onChange={(e) =>
                          updateScheduleForm("itemName", e.target.value)
                        }
                        placeholder="e.g. Cytopoint"
                      />
                    </div>

                    <div className="field">
                      <label>Type</label>
                      <select
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

                    <div className="field">
                      <label>Date given</label>
                      <input
                        type="date"
                        value={scheduleForm.dateGiven}
                        onChange={(e) =>
                          updateScheduleForm("dateGiven", e.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Next due date</label>
                      <input
                        type="date"
                        value={scheduleForm.nextDueDate}
                        onChange={(e) =>
                          updateScheduleForm("nextDueDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Repeat frequency</label>
                    <input
                      value={scheduleForm.repeatFrequency}
                      onChange={(e) =>
                        updateScheduleForm("repeatFrequency", e.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Reminder</label>
                    <select
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

                  <div className="field">
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      value={scheduleForm.notes}
                      onChange={(e) => updateScheduleForm("notes", e.target.value)}
                    />
                  </div>

                  <button type="submit" className="primary-button">
                    Add Health Item
                  </button>
                </form>

                <div className="list-stack top-gap">
                  {healthSchedule.length > 0 ? (
                    healthSchedule.map((item) => (
                      <div key={item.id} className="reminder-card">
                        <div className="reminder-title">{item.itemName}</div>
                        <div className="reminder-meta">
                          {item.type} •{" "}
                          {item.nextDueDate ? dueSoonText(item.nextDueDate) : "No due date"}
                        </div>
                        <div className="button-row top-gap-sm">
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              askDelete("schedule", item.id, item.itemName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No health schedule items yet.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === "reports" && (
              <section className="panel-card">
                <div className="panel-heading">
                  <span>📤</span>
                  <h3>Backup & Reports</h3>
                </div>

                <div className="stack-md">
                  <p className="subtitle-block">
                    Export a backup file, import a previous backup, save directly
                    to a chosen local file where supported, or print a report for
                    your vet.
                  </p>

                  <button className="primary-button" onClick={handlePrintReport} type="button">
                    Download PDF for Vet
                  </button>

                  <div className="button-stack">
                    <button className="secondary-button" type="button" onClick={exportBackup}>
                      Export Backup
                    </button>

                    <button className="secondary-button" type="button" onClick={handleImportClick}>
                      Import Backup
                    </button>

                    {saveFileSupported && (
                      <>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={chooseBackupFile}
                        >
                          {hasChosenFile ? "Choose Different Backup File" : "Choose Backup File"}
                        </button>

                        <button
                          className="secondary-button"
                          type="button"
                          onClick={saveBackupToChosenFile}
                        >
                          Save to Chosen File
                        </button>
                      </>
                    )}

                    <button
                      className="danger-button"
                      type="button"
                      onClick={clearAllSavedData}
                    >
                      Delete All Saved Data
                    </button>
                  </div>

                  {!saveFileSupported && (
                    <p className="tiny-muted">
                      Direct save to a chosen file is only supported in some browsers.
                      Export Backup still works everywhere.
                    </p>
                  )}
                </div>
              </section>
            )}
          </main>

          <nav className="bottom-nav">
            {[
              { key: "home", label: "Home", icon: "🏠" },
              { key: "logs", label: "Logs", icon: "📋" },
              { key: "dog", label: "Pet", icon: "🐾" },
              { key: "reports", label: "Reports", icon: "📊" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`nav-button ${activeTab === item.key ? "nav-active" : ""}`}
                onClick={() => openView(item.key)}
              >
                <div className="nav-icon">{item.icon}</div>
                <div>{item.label}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {deletePrompt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Confirm Delete</h3>
            <p>
              {deletePrompt.type === "all"
                ? "This will remove all saved data on this device."
                : `Are you sure you want to delete ${deletePrompt.label}?`}
            </p>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={cancelDelete}>
                Cancel
              </button>

              <button
                className="danger-button"
                type="button"
                onClick={
                  deletePrompt.type === "all" ? confirmDeleteAll : confirmDelete
                }
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
