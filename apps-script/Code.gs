/**
 * Elevation Gym Tracker — Google Apps Script backend.
 * Paste into Extensions > Apps Script of a blank Google Sheet.
 * Run setup() once, then installTriggers(), then Deploy > New deployment > Web app.
 */

const LB = 2.20462;
const HEADERS = {
  Exercises: ['Name', 'Machine', 'Group', 'Favorite'],
  Log: ['ID', 'Date', 'Exercise', 'Group', 'Set', 'Reps', 'Weight', 'Unit', 'KG', 'LBS', 'Volume', 'E1RM', 'Intensity', 'Notes'],
  Schedule: ['Day', 'Split', 'Active'],
  Settings: ['Key', 'Value'],
  Weekly: ['Week', 'Sessions', 'Planned', 'Volume kg', 'Volume Δ%', 'Avg e1RM Δ%', 'Consistency %', 'Score', 'Verdict'],
  Weekly_Exercise: ['Week', 'Exercise', 'Group', 'Sets', 'Volume kg', 'Best e1RM kg', 'Volume Δ%', 'e1RM Δ%', 'Verdict'],
};
const GROUPS = ['Upper', 'Lower', 'Arms & Shoulders'];

/* ---------- setup ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => ensureSheet_(name, HEADERS[name]));

  const ex = ss.getSheetByName('Exercises');
  if (ex.getLastRow() === 1) {
    ex.getRange(2, 1, 12, 4).setValues([
      ['Chest Press', 'Chest press machine', 'Upper', false],
      ['Lat Pulldown', 'Cable pulldown', 'Upper', false],
      ['Seated Row', 'Cable row', 'Upper', false],
      ['Pec Fly', 'Pec deck', 'Upper', false],
      ['Leg Press', 'Leg press sled', 'Lower', false],
      ['Leg Extension', 'Extension machine', 'Lower', false],
      ['Leg Curl', 'Seated curl machine', 'Lower', false],
      ['Hip Thrust', 'Glute machine', 'Lower', false],
      ['Shoulder Press', 'Shoulder press machine', 'Arms & Shoulders', false],
      ['Lateral Raise', 'Lateral raise machine', 'Arms & Shoulders', false],
      ['Bicep Curl', 'Preacher curl machine', 'Arms & Shoulders', false],
      ['Tricep Pushdown', 'Cable', 'Arms & Shoulders', false],
    ]);
    ex.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(GROUPS).build());
    ex.getRange('D2:D').insertCheckboxes();
  }

  const sc = ss.getSheetByName('Schedule');
  if (sc.getLastRow() === 1) {
    sc.getRange(2, 1, 7, 3).setValues([
      ['Monday', 'Upper', true], ['Tuesday', 'Rest', true], ['Wednesday', 'Lower', true],
      ['Thursday', 'Rest', true], ['Friday', 'Upper', true], ['Saturday', 'Rest', true], ['Sunday', 'Rest', true],
    ]);
    sc.getRange('B2:B8').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Upper', 'Lower', 'Rest']).build());
  }

  const st = ss.getSheetByName('Settings');
  if (st.getLastRow() === 1) {
    st.getRange(2, 1, 4, 2).setValues([
      ['Email', Session.getActiveUser().getEmail()],
      ['ReminderHour', 20],
      ['WorkoutHour', 18],
      ['CalendarEvents', true],
    ]);
  }

  const daily = ensureSheet_('Daily', []);
  daily.clear();
  daily.getRange('A1').setFormula(
    '=QUERY(Log!A1:N,"select B, count(A), sum(F), sum(K), max(I) where B is not null group by B order by B desc ' +
    'label B \'Date\', count(A) \'Sets\', sum(F) \'Reps\', sum(K) \'Volume kg\', max(I) \'Top set kg\'",1)');
  daily.getRange('A1:E1').setFontWeight('bold');
  daily.setFrozenRows(1);

  refreshWeekly();
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (headers.length && sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- helpers ---------- */
function tz_() { return Session.getScriptTimeZone(); }
function iso_(d) { return Utilities.formatDate(d, tz_(), 'yyyy-MM-dd'); }
function parseIso_(s) { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function round_(n, p) { const f = Math.pow(10, p || 1); return Math.round(n * f) / f; }

function rows_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const v = sh.getDataRange().getValues();
  const h = v.shift();
  return v.filter(r => r.join('') !== '').map(r => {
    const o = {};
    h.forEach((k, i) => { o[k] = r[i] instanceof Date ? iso_(r[i]) : r[i]; });
    return o;
  });
}

function settings_() {
  const o = {};
  rows_('Settings').forEach(r => { o[r.Key] = r.Value; });
  return o;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function state_() {
  return { exercises: rows_('Exercises'), log: rows_('Log'), schedule: rows_('Schedule') };
}

/* ---------- web app ---------- */
function doGet() {
  return json_({ ok: true, state: state_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.action === 'addSet') addSet_(p);
    else if (p.action === 'deleteSet') deleteSet_(p.id);
    else if (p.action === 'addExercise') addExercise_(p);
    else if (p.action === 'toggleFav') toggleFav_(p.name);
    else throw new Error('Unknown action: ' + p.action);
    return json_({ ok: true, state: state_() });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function addSet_(p) {
  const reps = Number(p.reps), w = Number(p.weight);
  if (!p.exercise || !(reps > 0) || !(w >= 0)) throw new Error('Exercise, reps and weight are required');
  const ex = rows_('Exercises').find(r => r.Name === p.exercise);
  if (!ex) throw new Error('Exercise not found: ' + p.exercise);
  const unit = p.unit === 'lbs' ? 'lbs' : 'kg';
  const kg = unit === 'kg' ? w : w / LB;
  const setNo = rows_('Log').filter(r => r.Date === p.date && r.Exercise === p.exercise).length + 1;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log').appendRow([
    Utilities.getUuid(), parseIso_(p.date), p.exercise, ex.Group, setNo, reps, w, unit,
    round_(kg, 2), round_(kg * LB, 1), round_(kg * reps, 1), round_(kg * (1 + reps / 30), 1),
    ['Easy', 'Med', 'Hard'].indexOf(p.intensity) >= 0 ? p.intensity : 'Med', p.notes || '',
  ]);
  refreshWeekly();
}

function deleteSet_(id) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (let i = ids.length - 1; i >= 1; i--) {
    if (ids[i][0] === id) { sh.deleteRow(i + 1); break; }
  }
  refreshWeekly();
}

function addExercise_(p) {
  const name = String(p.name || '').trim();
  if (!name) throw new Error('Name is required');
  if (GROUPS.indexOf(p.group) < 0) throw new Error('Group must be one of ' + GROUPS.join(', '));
  if (rows_('Exercises').some(r => String(r.Name).toLowerCase() === name.toLowerCase())) throw new Error('Exercise already exists');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Exercises');
  sh.appendRow([name, p.machine || '', p.group, false]);
  sh.getRange(sh.getLastRow(), 4).insertCheckboxes();
}

function toggleFav_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Exercises');
  const v = sh.getRange(1, 1, sh.getLastRow(), 4).getValues();
  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === name) { sh.getRange(i + 1, 4).setValue(!v[i][3]); return; }
  }
  throw new Error('Exercise not found: ' + name);
}

/* ---------- weekly KPI ---------- */
function weekStart_(isoDate) {
  const d = parseIso_(isoDate);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return iso_(d);
}
function pct_(cur, prev) { return prev > 0 ? (cur - prev) / prev * 100 : null; }
function verdict_(x) { return x === null ? 'BASELINE' : x > 2 ? 'PROGRESS' : x < -2 ? 'DIP' : 'HOLD'; }

/**
 * Progress Score = 40% volume Δ + 40% average e1RM Δ + 20% consistency.
 * Consistency term = (min(sessions/planned, 1) - 1) * 100, so a full week adds 0 and missed days subtract.
 */
function refreshWeekly() {
  const log = rows_('Log');
  const planned = rows_('Schedule').filter(r => r.Active && r.Split !== 'Rest').length || 3;
  const weeks = {};
  log.forEach(r => {
    const w = weekStart_(r.Date);
    weeks[w] = weeks[w] || { dates: {}, vol: 0, ex: {} };
    const W = weeks[w];
    W.dates[r.Date] = 1;
    W.vol += Number(r.Volume) || 0;
    const e = W.ex[r.Exercise] = W.ex[r.Exercise] || { group: r.Group, sets: 0, vol: 0, e1rm: 0 };
    e.sets++; e.vol += Number(r.Volume) || 0; e.e1rm = Math.max(e.e1rm, Number(r.E1RM) || 0);
  });

  const keys = Object.keys(weeks).sort();
  const summary = [], perEx = [];
  const lastSeen = {};
  keys.forEach((k, i) => {
    const W = weeks[k], prev = i > 0 ? weeks[keys[i - 1]] : null;
    const sessions = Object.keys(W.dates).length;
    const volD = prev ? pct_(W.vol, prev.vol) : null;
    const e1Ds = [];
    Object.keys(W.ex).sort().forEach(name => {
      const e = W.ex[name], last = lastSeen[name];
      const vD = last ? pct_(e.vol, last.vol) : null;
      const eD = last ? pct_(e.e1rm, last.e1rm) : null;
      if (eD !== null) e1Ds.push(eD);
      perEx.push([k, name, e.group, e.sets, round_(e.vol), round_(e.e1rm), fmtPct_(vD), fmtPct_(eD), verdict_(eD)]);
      lastSeen[name] = e;
    });
    const e1Avg = e1Ds.length ? e1Ds.reduce((a, b) => a + b, 0) / e1Ds.length : null;
    const cons = Math.min(sessions / planned, 1) * 100;
    const score = volD === null ? null : 0.4 * volD + 0.4 * (e1Avg || 0) + 0.2 * (cons - 100);
    summary.push([k, sessions, planned, round_(W.vol), fmtPct_(volD), fmtPct_(e1Avg), round_(cons), fmtPct_(score), verdict_(score)]);
  });

  writeTable_('Weekly', summary.reverse());
  writeTable_('Weekly_Exercise', perEx.reverse());
}

function fmtPct_(x) { return x === null ? '' : round_(x); }

function writeTable_(name, data) {
  const sh = ensureSheet_(name, HEADERS[name]);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  if (data.length) sh.getRange(2, 1, data.length, data[0].length).setValues(data);
}

/* ---------- reminders (email + Google Calendar, both free) ---------- */
function reminder() {
  const s = settings_();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = Utilities.formatDate(tomorrow, tz_(), 'EEEE');
  const plan = rows_('Schedule').find(r => r.Day === dayName);
  if (!plan || !plan.Active || plan.Split === 'Rest') return;

  const groups = plan.Split === 'Upper' ? ['Upper', 'Arms & Shoulders'] : ['Lower'];
  const log = rows_('Log').filter(r => groups.indexOf(r.Group) >= 0);
  const lastDate = log.map(r => r.Date).sort().pop();
  const lines = [];
  if (lastDate) {
    const best = {};
    log.filter(r => r.Date === lastDate).forEach(r => {
      if (!best[r.Exercise] || r.KG > best[r.Exercise].KG) best[r.Exercise] = r;
    });
    Object.keys(best).forEach(n => {
      const b = best[n];
      lines.push(`• ${n}: ${b.KG} kg / ${b.LBS} lbs × ${b.Reps} (${b.Intensity})`);
    });
  }
  const favs = rows_('Exercises').filter(r => r.Favorite && groups.indexOf(r.Group) >= 0).map(r => r.Name);

  const subject = `Tomorrow: ${plan.Split} day — ${dayName}`;
  const body = [
    `Planned: ${plan.Split} (${groups.join(' + ')})`, '',
    lastDate ? `Last ${plan.Split} session (${lastDate}) — beat these:` : 'First session of this split. Set your baseline.',
    ...lines, '',
    favs.length ? `Favorites: ${favs.join(', ')}` : '',
  ].join('\n');

  if (s.Email) MailApp.sendEmail(String(s.Email), subject, body);

  if (s.CalendarEvents === true || s.CalendarEvents === 'TRUE') {
    const cal = CalendarApp.getDefaultCalendar();
    const start = new Date(tomorrow); start.setHours(Number(s.WorkoutHour) || 18, 0, 0, 0);
    const end = new Date(start.getTime() + 75 * 60000);
    const title = `Gym: ${plan.Split}`;
    const exists = cal.getEventsForDay(start).some(ev => ev.getTitle() === title);
    if (!exists) cal.createEvent(title, start, end, { description: body }).addPopupReminder(60);
  }
}

function installTriggers() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'reminder').forEach(t => ScriptApp.deleteTrigger(t));
  const hour = Number(settings_().ReminderHour) || 20;
  ScriptApp.newTrigger('reminder').timeBased().everyDays(1).atHour(hour).create();
}
