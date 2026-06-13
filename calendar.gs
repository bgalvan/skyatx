// SKYATX Calendar Availability Checker + Square Payment Link Router
// ─────────────────────────────────────────────────────────────────────────
// SETUP:
// 1. This file lives alongside square.gs in the same Apps Script project.
// 2. Deploy → Manage deployments → edit → new version
//    - Execute as: Me
//    - Who has access: Anyone
// 3. Copy the Web App URL into book.html
// ─────────────────────────────────────────────────────────────────────────

var SLOTS = {
  "Midday (11am – 2pm)":   { start: 11, end: 14 },
  "Afternoon (2pm – 5pm)": { start: 14, end: 17 },
  "Twilight / sunset":     { start: 17, end: 21 }
};

function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // ── Route: Square payment link ──────────────────────────────────────────
  if (e.parameter.action === 'squareLink') {
    var amount = e.parameter.amount;
    if (!amount) {
      output.setContent(JSON.stringify({ error: 'No amount provided' }));
      return output;
    }
    try {
      var result = createSquarePaymentLink(amount); // defined in square.gs
      output.setContent(JSON.stringify(result));
    } catch(err) {
      output.setContent(JSON.stringify({ error: err.toString() }));
    }
    return output;
  }

  // ── Route: Calendar availability ────────────────────────────────────────
  var date = e.parameter.date; // expects YYYY-MM-DD

  if (!date) {
    output.setContent(JSON.stringify({ error: 'No date provided' }));
    return output;
  }

  try {
    var cal   = CalendarApp.getDefaultCalendar();
    var parts = date.split('-');
    var dayStart = new Date(parts[0], parts[1] - 1, parts[2], 0,  0,  0);
    var dayEnd   = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
    var events   = cal.getEvents(dayStart, dayEnd);
    var takenSlots = [];

    events.forEach(function(event) {
      if (event.isAllDayEvent()) return; // ignore holidays, birthdays, etc.
      var evStart = event.getStartTime().getHours();
      var evEnd   = event.getEndTime().getHours();
      for (var slotName in SLOTS) {
        var slot = SLOTS[slotName];
        if (evStart < slot.end && evEnd > slot.start) {
          if (takenSlots.indexOf(slotName) === -1) takenSlots.push(slotName);
        }
      }
    });

    output.setContent(JSON.stringify({
      date:           date,
      takenSlots:     takenSlots,
      availableSlots: Object.keys(SLOTS).filter(function(s) {
        return takenSlots.indexOf(s) === -1;
      })
    }));

  } catch(err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
  }

  return output;
}
