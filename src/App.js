:root {
  --bg: #1f2326;
  --bg-soft: #232831;
  --panel: rgba(255, 255, 255, 0.05);
  --panel-border: rgba(255, 255, 255, 0.1);
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.6);
  --muted-2: rgba(255, 255, 255, 0.45);
  --brand: #18a3a8;
  --brand-2: #7fe3de;
  --violet: #c084fc;
  --yellow: #fde68a;
  --cyan: #67e8f9;
  --danger: #f87171;
  --danger-bg: rgba(248, 113, 113, 0.15);
  --radius-xl: 32px;
  --radius-lg: 24px;
  --radius-md: 18px;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  --font: Inter, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(148, 69, 149, 0.12), transparent 30%),
    linear-gradient(180deg, #232831 0%, #1b1f24 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
}

.phone-card {
  width: 100%;
  max-width: 420px;
  min-height: calc(100vh - 32px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--panel-border);
  background: rgba(0, 0, 0, 0.08);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.setup-card {
  max-width: 560px;
  min-height: auto;
  padding: 20px;
}

.app-header {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left,
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 18px;
  background: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 12px 30px rgba(24, 163, 168, 0.3);
  flex-shrink: 0;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 20px;
}

.title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.15;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.82rem;
}

.app-main {
  flex: 1;
  padding: 16px;
  display: grid;
  gap: 14px;
}

.hero-card,
.panel-card {
  border: 1px solid var(--panel-border);
  background: var(--panel);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.hero-card {
  padding: 16px;
}

.hero-top {
  display: flex;
  gap: 14px;
  align-items: center;
}

.dog-photo {
  width: 84px;
  height: 84px;
  object-fit: cover;
  border-radius: 999px;
  border: 2px solid rgba(24, 163, 168, 0.45);
  flex-shrink: 0;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-name-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.dog-name {
  margin: 0;
  font-size: 2rem;
  line-height: 1;
}

.dog-meta {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.hero-stats {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
}

.muted-label {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.weight-value {
  margin: 4px 0 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.tiny-muted {
  color: var(--muted-2);
  font-size: 0.75rem;
  margin: 6px 0 0;
}

.mini-bars {
  width: 100px;
  height: 58px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.mini-bar {
  flex: 1;
  border-radius: 999px;
  background: linear-gradient(to top, var(--brand), var(--brand-2));
  opacity: 0.95;
}

.panel-card {
  padding: 16px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.panel-heading h3 {
  margin: 0;
  font-size: 1.05rem;
}

.list-stack,
.stack-lg,
.stack-md,
.stack-sm,
.button-stack {
  display: grid;
  gap: 10px;
}

.stack-lg {
  gap: 14px;
}

.stack-md {
  gap: 12px;
}

.stack-sm {
  gap: 8px;
}

.top-gap {
  margin-top: 16px;
}

.top-gap-sm {
  margin-top: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--panel-border);
}

.stat-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: 600;
}

.stat-value {
  font-weight: 700;
}

.stat-violet {
  color: var(--violet);
}

.stat-yellow {
  color: var(--yellow);
}

.stat-cyan {
  color: var(--cyan);
}

.stat-meta {
  color: var(--muted);
  font-size: 0.82rem;
  margin-top: 4px;
}

.chevron {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.4rem;
}

.quick-grid {
  display: grid;
  gap: 10px;
}

.quick-button {
  width: 100%;
  border-radius: 18px;
  border: 1px solid transparent;
  padding: 14px 16px;
  text-align: left;
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--text);
  transition: transform 0.15s ease, filter 0.15s ease;
}

.quick-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.quick-violet {
  background: rgba(168, 85, 247, 0.16);
  border-color: rgba(192, 132, 252, 0.28);
  color: #e9d5ff;
}

.quick-yellow {
  background: rgba(234, 179, 8, 0.16);
  border-color: rgba(253, 224, 71, 0.28);
  color: #fef3c7;
}

.quick-cyan {
  background: rgba(6, 182, 212, 0.16);
  border-color: rgba(103, 232, 249, 0.28);
  color: #cffafe;
}

.reminder-card,
.selected-log-box {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  padding: 12px;
  border: 1px solid var(--panel-border);
}

.reminder-title {
  font-weight: 700;
}

.reminder-meta,
.muted-detail,
.empty-text,
.subtitle-block {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.88rem;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 12px 13px;
  border-radius: 14px;
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  outline: none;
}

.field input::placeholder,
.field textarea::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(24, 163, 168, 0.7);
  box-shadow: 0 0 0 3px rgba(24, 163, 168, 0.18);
}

.primary-button,
.secondary-button,
.danger-button {
  width: 100%;
  border-radius: 18px;
  padding: 13px 14px;
  font-weight: 700;
  border: none;
}

.primary-button {
  background: var(--brand);
  color: var(--text);
  box-shadow: 0 18px 30px rgba(24, 163, 168, 0.25);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  border: 1px solid var(--panel-border);
}

.danger-button {
  background: var(--danger-bg);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.button-row {
  display: flex;
  gap: 10px;
}

.button-row > * {
  flex: 1;
}

.calendar-grid-header,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-name {
  text-align: center;
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 700;
}

.calendar-empty,
.calendar-cell {
  min-height: 78px;
  border-radius: 16px;
}

.calendar-empty {
  background: rgba(255, 255, 255, 0.05);
}

.calendar-cell {
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.03);
  padding: 8px;
  text-align: left;
  color: var(--text);
}

.calendar-selected {
  border-color: var(--brand);
}

.calendar-date {
  font-size: 0.78rem;
  color: var(--muted);
}

.calendar-dots {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-placeholder {
  margin-top: 18px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 1.2rem;
}

.tiny-chip,
.status-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid transparent;
}

.tiny-chip {
  width: fit-content;
  padding: 3px 8px;
  font-size: 0.68rem;
}

.status-chip {
  padding: 6px 10px;
  font-size: 0.76rem;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-green {
  background: rgba(16, 185, 129, 0.15);
  color: #86efac;
  border-color: rgba(16, 185, 129, 0.3);
}

.chip-yellow {
  background: rgba(234, 179, 8, 0.16);
  color: #fde68a;
  border-color: rgba(234, 179, 8, 0.3);
}

.chip-red {
  background: rgba(239, 68, 68, 0.16);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.hidden-file-input {
  display: none;
}

.bottom-nav {
  border-top: 1px solid var(--panel-border);
  background: rgba(0, 0, 0, 0.16);
  padding: 10px 12px 14px;
}

.bottom-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.nav-button {
  border: none;
  border-radius: 18px;
  background: transparent;
  color: var(--muted-2);
  padding: 8px 4px;
  text-align: center;
  font-size: 0.74rem;
}

.nav-active {
  color: var(--brand);
  background: rgba(255, 255, 255, 0.05);
}

.nav-icon {
  font-size: 1.15rem;
  margin-bottom: 4px;
}

@media (max-width: 480px) {
  .app-shell {
    padding: 0;
  }

  .phone-card {
    max-width: 100%;
    min-height: 100vh;
    border-radius: 0;
    border: none;
  }

  .dog-name {
    font-size: 1.7rem;
  }

  .button-row {
    flex-direction: column;
  }
}
