// Waitlist receiver for the "Why do you procrastinate?" quiz.
// Paste this into Extensions > Apps Script of your Google Sheet, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Copy the web app URL into WAITLIST_URL in index.html.

var HEADERS = ["Timestamp", "Email", "Type", "Level", "Over-fixing", "Procrastinating", "Self-criticism", "Imposter", "High standards", "Answers", "Page"];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Spam trap: real visitors never fill this hidden field.
  if (p.website) return ok_();

  var email = String(p.email || "").trim().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ok_();

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([
      new Date(),
      clean_(email),
      clean_(p.type),
      clean_(p.level),
      clean_(p.P), clean_(p.A), clean_(p.C), clean_(p.J), clean_(p.S),
      clean_(p.answers),
      clean_(p.page)
    ]);
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

function doGet() {
  return ContentService.createTextOutput("Waitlist endpoint is running.");
}

// Stops values starting with = + - @ from being run as spreadsheet formulas.
function clean_(v) {
  var s = String(v == null ? "" : v).slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function ok_() {
  return ContentService.createTextOutput("ok");
}
