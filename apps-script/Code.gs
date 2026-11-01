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
/* Strength machines from the SHUA equipment sheet. */
const SEED_EXERCISES = [["Chest Press", "SH-G6801 - 68 Core Series", "Upper"], ["Seated Rowing", "SH-G6803 - 68 Core Series", "Upper"], ["Shoulder Press", "SH-G6804 - 68 Core Series", "Arms & Shoulders"], ["Lateral Raise Machine", "SH-G6805 - 68 Core Series", "Arms & Shoulders"], ["Lat Pulldown", "SH-G6806 - 68 Core Series", "Upper"], ["Biceps Curl", "SH-G6807 - 68 Core Series", "Arms & Shoulders"], ["Triceps Press", "SH-G6808 - 68 Core Series", "Arms & Shoulders"], ["Seated Leg Press", "SH-G6809 - 68 Core Series", "Lower"], ["Leg Extension", "SH-G6810 - 68 Core Series", "Lower"], ["Prone Leg Curl", "SH-G6812 - 68 Core Series", "Lower"], ["Pectoral Fly/Rear Deltoid", "SH-G6813 - 68 Core Series", "Upper"], ["Rear Kick", "SH-G6815 - 68 Core Series", "Lower"], ["Back Extension", "SH-G6817 - 68 Core Series", "Upper"], ["Torso Rotation", "SH-G6818 - 68 Core Series", "Upper"], ["Abductor/Adductor", "SH-G6819 - 68 Core Series", "Lower"], ["Assist Dip/Chin", "SH-G6851 - 68 Core Series", "Arms & Shoulders"], ["Pulley Row", "SH-G6868 - 68 Core Series", "Upper"], ["Lat Pulldown/Seated Row", "SH-G6892 - 68 Core Series", "Upper"], ["Dumbbell Set", "SH-R390 - 68 Core Series", "Upper"], ["Seated Biceps Curl/Triceps Press", "SH-G6822 - 68 Core Series", "Arms & Shoulders"], ["Seated Leg Curl/Extension", "SH-G6823 - 68 Core Series", "Lower"], ["Shoulder Press/Upper Chest", "SH-G6824 - 68 Core Series", "Upper"], ["Seated Hip Abductor", "SH-G6926 - 69 Standard Series", "Lower"], ["Wide Chest Press", "SH-G6928 - 69 Standard Series", "Upper"], ["Low Row", "SH-G6930 - 69 Standard Series", "Upper"], ["D.Y.Row", "SH-G6931 - 69 Standard Series", "Upper"], ["ISO-Lat Pulldown", "SH-G6903 - 69 Standard Series", "Upper"], ["ISO-Row", "SH-G6904 - 69 Standard Series", "Upper"], ["ISO-Shoulder Press", "SH-G6905 - 69 Standard Series", "Arms & Shoulders"], ["Seated Calf Raise", "SH-G6910 - 69 Standard Series", "Lower"], ["Rear Kick (SH-G6911)", "SH-G6911 - 69 Standard Series", "Lower"], ["V Squat", "SH-G6913 - 69 Standard Series", "Lower"], ["Linear Hack Press", "SH-G6914 - 69 Standard Series", "Lower"], ["Multi-Functional Stretch Trainer", "SH-G6916 - 69 Standard Series", "Upper"], ["ISO-Inclined Bench Press", "SH-G6917 - 69 Standard Series", "Upper"], ["ISO-Horizontal Bench Press", "SH-G6918 - 69 Standard Series", "Upper"], ["ISO-Inclined Flight Machine", "SH-G6919 - 69 Standard Series", "Upper"], ["Belt Squat", "SH-G6920 - 69 Standard Series", "Lower"], ["T Bar Row", "SH-G6921 - 69 Standard Series", "Upper"], ["ISO-High Row", "SH-G6922 - 69 Standard Series", "Upper"], ["Standing Abductor", "SH-G6923 - 69 Standard Series", "Lower"], ["Pendulum Squat", "SH-G6924 - 69 Standard Series", "Lower"], ["ISO-Chest Press", "SH-G6901 - 69 Standard Series", "Upper"], ["ISO-Leverage Decline Chest Press", "SH-G6902 - 69 Standard Series", "Upper"], ["ISO-Biceps Curl", "SH-G6906 - 69 Standard Series", "Arms & Shoulders"], ["ISO-Triceps Press", "SH-G6907 - 69 Standard Series", "Arms & Shoulders"], ["ISO-Leg Extension", "SH-G6908 - 69 Standard Series", "Lower"], ["ISO-Kneeling Leg Curl", "SH-G6909 - 69 Standard Series", "Lower"], ["Stretcher", "SH-G6912 - 69 Standard Series", "Upper"], ["Smith Machine", "SH-G6953 - 69 Standard Series", "Upper"], ["Smith Machine (SH-G6954)", "SH-G6954 - 69 Standard Series", "Upper"], ["Linear Leg Press", "SH-G6975 - 69 Standard Series", "Lower"], ["Hybrid Chest Press", "SH-G7701 - 77 Hybrid Series", "Upper"], ["Hybrid Pectoral Fly", "SH-G7702 - 77 Hybrid Series", "Upper"], ["Hybrid Lat Pulldown", "SH-G7703 - 77 Hybrid Series", "Upper"], ["Hybrid Seated Row Trainer", "SH-G7704 - 77 Hybrid Series", "Upper"], ["Hybrid Shoulder Press", "SH-G7705 - 77 Hybrid Series", "Arms & Shoulders"], ["Hybrid Lateral Raise", "SH-G7706 - 77 Hybrid Series", "Arms & Shoulders"], ["Hybrid Leg Press", "SH-G7707 - 77 Hybrid Series", "Lower"], ["Hybrid Leg Extension", "SH-G7708 - 77 Hybrid Series", "Lower"], ["Hybrid Prone Leg Curl", "SH-G7709 - 77 Hybrid Series", "Lower"], ["Hybrid Rear Kick", "SH-G7710 - 77 Hybrid Series", "Lower"], ["Chest Press (SH-G8801)", "SH-G8801 - 88 Apex Series", "Upper"], ["Shoulder Press (SH-G8802)", "SH-G8802 - 88 Apex Series", "Arms & Shoulders"], ["Lat Pulldown (SH-G8803)", "SH-G8803 - 88 Apex Series", "Upper"], ["Seated Row", "SH-G8804 - 88 Apex Series", "Upper"], ["Seated Leg Press (SH-G8805)", "SH-G8805 - 88 Apex Series", "Lower"], ["Leg Extension (SH-G8806)", "SH-G8806 - 88 Apex Series", "Lower"], ["Prone Leg Curl (SH-G8807)", "SH-G8807 - 88 Apex Series", "Lower"], ["Abductor/Adductor (SH-G8808)", "SH-G8808 - 88 Apex Series", "Lower"], ["Hip Thrust", "SH-G8809 - 88 Apex Series", "Lower"], ["Pectoral Fly/Rear Deltoid (SH-G8810)", "SH-G8810 - 88 Apex Series", "Upper"], ["Back Extension (SH-G8812)", "SH-G8812 - 88 Apex Series", "Upper"], ["Biceps Curl/Triceps Press", "SH-G8815 - 88 Apex Series", "Arms & Shoulders"], ["Leg Curl/Extension", "SH-G8816 - 88 Apex Series", "Lower"], ["Lateral Raise", "SH-G8821 - 88 Apex Series", "Arms & Shoulders"], ["Rotary Torso", "SH-G8822 - 88 Apex Series", "Upper"], ["Abductor", "SH-G8823 - 88 Apex Series", "Lower"], ["Adductor", "SH-G8824 - 88 Apex Series", "Lower"], ["Biceps Curl (SH-G8825)", "SH-G8825 - 88 Apex Series", "Arms & Shoulders"], ["Triceps Press (SH-G8826)", "SH-G8826 - 88 Apex Series", "Arms & Shoulders"], ["Seated Leg Curl", "SH-G8827 - 88 Apex Series", "Lower"], ["Power Rack", "SH-G8902 - 89 Performance Series", "Upper"], ["Comprehensive Power Rack", "SH-G8903 - 89 Performance Series", "Upper"], ["Push Sled", "SH-G8904 - 89 Performance Series", "Upper"], ["Lunge Machine", "SH-G8909 - 89 Performance Series", "Lower"], ["Ground Base Jammer", "SH-G8911 - 89 Performance Series", "Upper"], ["ISO-Lateral Chest Press", "SH-G8912 - 89 Performance Series", "Upper"], ["ISO-Lateral Shoulder Press", "SH-G8913 - 89 Performance Series", "Arms & Shoulders"], ["Squat Lunge", "SH-G8914 - 89 Performance Series", "Lower"], ["ISO-Lateral Linear Leg Press", "SH-G8919 - 89 Performance Series", "Lower"], ["Floor Glute Ham Developer", "SH-G8923 - 89 Performance Series", "Lower"], ["Glute Ham Bench", "SH-G8924 - 89 Performance Series", "Lower"], ["Multifunctional Plane Developer", "SH-G8925 - 89 Performance Series", "Upper"], ["Seal Row Bench", "SH-G8926 - 89 Performance Series", "Upper"], ["ISO-Lateral Lat Pulldown", "SH-G8927 - 89 Performance Series", "Upper"], ["Glute Trainer", "SH-G8928 - 89 Performance Series", "Lower"], ["Chest Press (SH-G9801)", "SH-G9801 - 98 Apex Connect Series", "Upper"], ["Shoulder Press (SH-G9802)", "SH-G9802 - 98 Apex Connect Series", "Arms & Shoulders"], ["Seated Row (SH-G9804)", "SH-G9804 - 98 Apex Connect Series", "Upper"], ["Seated Leg Press (SH-G9805)", "SH-G9805 - 98 Apex Connect Series", "Lower"], ["Leg Extension (SH-G9806)", "SH-G9806 - 98 Apex Connect Series", "Lower"], ["Hip Thrust (SH-G9809)", "SH-G9809 - 98 Apex Connect Series", "Lower"], ["Hip Thrust Bench", "SH-G6321 - Bench & Rack", "Lower"], ["Squat Rack", "SH-G6354 - Bench & Rack", "Lower"], ["Adjustable Dumbbell Bench", "SH-G6355 - Bench & Rack", "Upper"], ["Olympic Weight Tree", "SH-G6356 - Bench & Rack", "Upper"], ["Adjustable Bench", "SH-G6357 - Bench & Rack", "Upper"], ["Back Extension (SH-G6358)", "SH-G6358 - Bench & Rack", "Upper"], ["Seated Arm Curl", "SH-G6359 - Bench & Rack", "Arms & Shoulders"], ["Olympic Flat Bench", "SH-G6371 - Bench & Rack", "Upper"], ["Olympic Decline Bench", "SH-G6372 - Bench & Rack", "Upper"], ["Olympic Incline Bench", "SH-G6373 - Bench & Rack", "Upper"], ["Utility Bench", "SH-G6376 - Bench & Rack", "Upper"], ["Flat Bench", "SH-G6378 - Bench & Rack", "Upper"], ["Adjustable Abdominal Bench", "SH-G6379 - Bench & Rack", "Upper"], ["Leg Raise", "SH-G6386 - Bench & Rack", "Lower"], ["Chin Dip Leg Raise Station", "SH-G6388 - Bench & Rack", "Lower"], ["Stretcher (SH-G6390)", "SH-G6390 - Bench & Rack", "Upper"], ["Adjustable Cable Crossover", "SH-G7220 - Cable & Motion", "Upper"], ["Functional Trainer", "SH-G7221 - Cable & Motion", "Upper"], ["Multi-Functional Trainer", "SH-G7225 - Cable & Motion", "Upper"], ["4-Stack Multi-Station", "SH-G7231A - Cable & Motion", "Upper"], ["4-Stack Multi-Station (SH-G7231C)", "SH-G7231C - Cable & Motion", "Upper"], ["5-Stack Multi-Station", "SH-G7232A - Cable & Motion", "Upper"], ["5-Stack Multi-Station (SH-G7232C)", "SH-G7232C - Cable & Motion", "Upper"], ["8-Stack Multi-Station", "SH-G7233C - Cable & Motion", "Upper"], ["8-Stack Multi-Station (SH-G7233D)", "SH-G7233D - Cable & Motion", "Upper"], ["Adjustable Cable Crossover (SH-G7253)", "SH-G7253 - Cable & Motion", "Upper"], ["3-Stations Multi-Gym", "SH-G5203 - Home Gym", "Upper"], ["4-Station Home Gym", "SH-G5205 - Home Gym", "Upper"], ["Functional Trainer (SH-G698)", "SH-G698 - Home Gym", "Upper"]];

/* ---------- setup ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => ensureSheet_(name, HEADERS[name]));

  const ex = ss.getSheetByName('Exercises');
  if (ex.getLastRow() === 1) {
    ex.getRange(2, 1, SEED_EXERCISES.length, 4).setValues(SEED_EXERCISES.map(r => r.concat([false])));
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
    else if (p.action === 'setSplit') setSplit_(p);
    else throw new Error('Unknown action: ' + p.action);
    return json_({ ok: true, state: state_() });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* Edit one day of the Schedule tab from the app. Creates the day's row if it is missing. */
function setSplit_(p) {
  const DAYS_ = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const SPLITS_ = ['Upper', 'Lower', 'Arms & Shoulders', 'Rest'];
  if (DAYS_.indexOf(p.day) < 0) throw new Error('Unknown day: ' + p.day);
  if (SPLITS_.indexOf(p.split) < 0) throw new Error('Split must be one of ' + SPLITS_.join(', '));
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedule');
  const last = sh.getLastRow();
  const days = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
  const idx = days.findIndex(r => r[0] === p.day);
  if (idx >= 0) {
    sh.getRange(idx + 2, 2).setValue(p.split);
    sh.getRange(idx + 2, 3).setValue(p.split !== 'Rest');
  } else {
    sh.appendRow([p.day, p.split, p.split !== 'Rest']);
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
