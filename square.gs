// ── SKYATX Square Payment Link Creator ───────────────────────────────────
// Add this as a new .gs file inside your existing Apps Script project,
// then redeploy the web app (Deploy → Manage deployments → edit → new version).
// ─────────────────────────────────────────────────────────────────────────

var SQUARE_ACCESS_TOKEN = 'sandbox-sq0idb-_VDrYYY6G-yp54bo1PEr0g';
var SQUARE_LOCATION_ID  = 'LTBG1Q0FW27C6';
var SQUARE_BASE_URL     = 'https://connect.squareupsandbox.com'; // swap to https://connect.squareup.com for production

function doPost(e) {
  try {
    var data        = JSON.parse(e.postData.contents);
    var amountCents = Math.round(parseFloat(data.amount) * 100);

    var response = UrlFetchApp.fetch(SQUARE_BASE_URL + '/v2/online-checkout/payment-links', {
      method:          'post',
      contentType:     'application/json',
      headers: {
        'Authorization': 'Bearer ' + SQUARE_ACCESS_TOKEN,
        'Square-Version': '2024-02-28'
      },
      payload:          JSON.stringify({
        idempotency_key: Utilities.getUuid(),
        quick_pay: {
          name:        'SKYATX Booking Deposit',
          price_money: { amount: amountCents, currency: 'USD' },
          location_id: SQUARE_LOCATION_ID
        }
      }),
      muteHttpExceptions: true
    });

    var result = JSON.parse(response.getContentText());

    if (result.payment_link && result.payment_link.url) {
      return ContentService
        .createTextOutput(JSON.stringify({ url: result.payment_link.url }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var errMsg = (result.errors && result.errors[0]) ? result.errors[0].detail : 'Unknown Square error';
    return ContentService
      .createTextOutput(JSON.stringify({ error: errMsg }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
