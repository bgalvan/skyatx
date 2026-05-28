// SKYATX Calendar Availability Checker
// ─────────────────────────────────────────────────────────────
// SETUP:
// 1. Paste this into script.google.com (New Project)
// 2. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 3. Copy the Web App URL and paste it into book.html
// ─────────────────────────────────────────────────────────────

// Time slot definitions (24hr)
var SLOTS = {
  "Morning (8am – 11am)":   { start: 8,  end: 11 },
  "Midday (11am – 2pm)":    { start: 11, end: 14 },
  "Afternoon (2pm – 5pm)":  { start: 14, end: 17 },
  "Twilight / sunset":      { start: 17, end: 21 }
};

function doGet(e) {
  var date = e.parameter.date; // expects YYYY-MM-DD

  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  if (!date) {
    output.setContent(JSON.stringify({ error: "No date provided" }));
    return output;
  }

  try {
    var cal = CalendarApp.getDefaultCalendar();

    // Parse the requested date
    var parts = date.split("-");
    var dayStart = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
    var dayEnd   = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);

    // Get all events on that day
    var events = cal.getEvents(dayStart, dayEnd);

    // Check which slots are taken
    var takenSlots = [];

    events.forEach(function(event) {
      var evStart = event.getStartTime().getHours();
      var evEnd   = event.getEndTime().getHours();

      for (var slotName in SLOTS) {
        var slot = SLOTS[slotName];
        // Slot is taken if event overlaps with it
        if (evStart < slot.end && evEnd > slot.start) {
          if (takenSlots.indexOf(slotName) === -1) {
            takenSlots.push(slotName);
          }
        }
      }
    });

    output.setContent(JSON.stringify({
      date: date,
      takenSlots: takenSlots,
      availableSlots: Object.keys(SLOTS).filter(function(s) {
        return takenSlots.indexOf(s) === -1;
      })
    }));

  } catch(err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
  }

  return output;
}
