function formatDateAustralian(dateStr) {
  if (!dateStr) return "—";

  // If already DD/MM/YYYY, leave it
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  // Convert YYYY-MM-DD to DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString("en-AU");
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStatusClass(value = "") {
  const v = String(value).trim().toLowerCase();

  if (v === "green") return "status-green";
  if (v === "yellow") return "status-yellow";
  if (v === "red") return "status-red";

  return "";
}

function renderStatusCell(value = "") {
  const safeValue = escapeHtml(value || "—");
  const cls = getStatusClass(value);
  return `<td class="${cls}">${safeValue}</td>`;
}

function calculateAgeFromDob(dob) {
  if (!dob) return "—";

  let birthDate;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    birthDate = new Date(`${dob}T00:00:00`);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    const [day, month, year] = dob.split("/");
    birthDate = new Date(`${year}-${month}-${day}T00:00:00`);
  } else {
    birthDate = new Date(dob);
  }

  if (Number.isNaN(birthDate.getTime())) return "—";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 1) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`;
}

function downloadHealthReport(selectedPet, dailyLogs = [], healthSchedule = [], medicationHistory = []) {
  if (!selectedPet) {
    alert("Please select a pet first.");
    return;
  }

  const petName = selectedPet.name || "Pet";
  const petDob = selectedPet.dob || selectedPet.dateOfBirth || "";
  const petAge = selectedPet.age || calculateAgeFromDob(petDob);

  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(petName)} Health Report</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, Helvetica, sans-serif;
      background: #ffffff;
      color: #1f2937;
      line-height: 1.4;
    }

    .report-wrap {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 30px;
      line-height: 1.2;
      color: #111827;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }

    .pet-card {
      margin: 20px 0 28px;
      padding: 18px;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      background: #f9fafb;
    }

    .pet-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(220px, 1fr));
      gap: 8px 24px;
    }

    .pet-item {
      margin: 0;
      font-size: 14px;
    }

    .pet-item strong {
      color: #111827;
    }

    h2 {
      margin: 28px 0 12px;
      font-size: 22px;
      color: #111827;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }

    th {
      background: #f3f4f6;
      color: #111827;
      font-weight: 700;
    }

    td {
      background: #ffffff;
    }

    .status-green {
      background: #d1fae5 !important;
      color: #065f46;
      font-weight: 700;
    }

    .status-yellow {
      background: #fef3c7 !important;
      color: #92400e;
      font-weight: 700;
    }

    .status-red {
      background: #fee2e2 !important;
      color: #991b1b;
      font-weight: 700;
    }

    .empty {
      color: #6b7280;
      text-align: center;
      font-style: italic;
      padding: 14px;
    }

    .footer-note {
      margin-top: 28px;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }

    @media print {
      body {
        padding: 12px;
      }

      .status-green,
      .status-yellow,
      .status-red {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .status-green {
        background: #d1fae5 !important;
      }

      .status-yellow {
        background: #fef3c7 !important;
      }

      .status-red {
        background: #fee2e2 !important;
      }

      table, tr, td, th {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="header">
      <h1>${escapeHtml(petName)} Health Report</h1>
      <p class="subtitle">Generated on ${escapeHtml(new Date().toLocaleDateString("en-AU"))}</p>
    </div>

    <div class="pet-card">
      <div class="pet-grid">
        <p class="pet-item"><strong>Pet type:</strong> ${escapeHtml(selectedPet.type || selectedPet.petType || "—")}</p>
        <p class="pet-item"><strong>Breed:</strong> ${escapeHtml(selectedPet.breed || "—")}</p>
        <p class="pet-item"><strong>Sex:</strong> ${escapeHtml(selectedPet.sex || "—")}</p>
        <p class="pet-item"><strong>Date of birth:</strong> ${escapeHtml(formatDateAustralian(petDob))}</p>
        <p class="pet-item"><strong>Age:</strong> ${escapeHtml(petAge || "—")}</p>
        <p class="pet-item"><strong>Weight:</strong> ${escapeHtml(selectedPet.weight || "—")}</p>
        <p class="pet-item"><strong>Desexed:</strong> ${escapeHtml(selectedPet.desexed || "—")}</p>
        <p class="pet-item"><strong>Notes:</strong> ${escapeHtml(selectedPet.notes || "—")}</p>
      </div>
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
      <tbody>
        ${
          dailyLogs.length > 0
            ? dailyLogs
                .map(
                  (log) => `
          <tr>
            <td>${escapeHtml(formatDateAustralian(log.date))}</td>
            ${renderStatusCell(log.health)}
            ${renderStatusCell(log.emotion)}
            ${renderStatusCell(log.behaviour)}
            ${renderStatusCell(log.appetite)}
            ${renderStatusCell(log.toileting)}
            <td>${escapeHtml(log.medication || "—")}</td>
            <td>${escapeHtml(log.trigger || "—")}</td>
            <td>${escapeHtml(log.notes || "—")}</td>
          </tr>
        `
                )
                .join("")
            : `<tr><td colspan="9" class="empty">No daily logs yet.</td></tr>`
        }
      </tbody>
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
      <tbody>
        ${
          healthSchedule.length > 0
            ? healthSchedule
                .map(
                  (item) => `
          <tr>
            <td>${escapeHtml(item.name || item.item || "—")}</td>
            <td>${escapeHtml(item.type || "—")}</td>
            <td>${escapeHtml(formatDateAustralian(item.dateGiven || item.date || ""))}</td>
            <td>${escapeHtml(formatDateAustralian(item.nextDue || ""))}</td>
            <td>${escapeHtml(item.repeat || "—")}</td>
            <td>${escapeHtml(item.reminder ? "Yes" : "No")}</td>
            <td>${escapeHtml(item.notes || "—")}</td>
          </tr>
        `
                )
                .join("")
            : `<tr><td colspan="7" class="empty">No health schedule items yet.</td></tr>`
        }
      </tbody>
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
      <tbody>
        ${
          medicationHistory.length > 0
            ? medicationHistory
                .map(
                  (med) => `
          <tr>
            <td>${escapeHtml(med.name || "—")}</td>
            <td>${escapeHtml(med.dose || "—")}</td>
            <td>${escapeHtml(med.frequency || "—")}</td>
            <td>${escapeHtml(med.howToTake || "—")}</td>
            <td>${escapeHtml(formatDateAustralian(med.start || med.startDate || ""))}</td>
            <td>${escapeHtml(formatDateAustralian(med.end || med.endDate || "Ongoing"))}</td>
            <td>${escapeHtml(med.reason || "—")}</td>
            <td>${escapeHtml(med.prescribedBy || "—")}</td>
            <td>${escapeHtml(med.notes || "—")}</td>
          </tr>
        `
                )
                .join("")
            : `<tr><td colspan="9" class="empty">No medication history yet.</td></tr>`
        }
      </tbody>
    </table>

    <p class="footer-note">
      Status cells are colour coded for easier review. Green indicates good/stable, yellow indicates caution/watch, and red indicates concern.
    </p>
  </div>
</body>
</html>
  `;

  const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${petName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-health-report.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
