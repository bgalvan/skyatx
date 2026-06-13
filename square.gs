// ── Square Payment Link Helper ────────────────────────────────────────────
// Called from doGet() in the calendar script when action=squareLink.
// ─────────────────────────────────────────────────────────────────────────

var SQUARE_ACCESS_TOKEN = 'EAAAl7wwO8TuHZh3zzQLGhcrxrFGkW-iVAHbW_-NSFPakDCgwzEBMEPYhkFDZgtu';
var SQUARE_LOCATION_ID  = 'SPBRH4D7YS05X';
var SQUARE_BASE_URL     = 'https://connect.squareup.com';

function createSquarePaymentLink(amountDollars) {
  var amountCents = Math.round(parseFloat(amountDollars) * 100);

  var response = UrlFetchApp.fetch(SQUARE_BASE_URL + '/v2/online-checkout/payment-links', {
    method:          'post',
    contentType:     'application/json',
    headers: {
      'Authorization':  'Bearer ' + SQUARE_ACCESS_TOKEN,
      'Square-Version': '2024-02-28'
    },
    payload: JSON.stringify({
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
    return { url: result.payment_link.url };
  }

  var errMsg = (result.errors && result.errors[0]) ? result.errors[0].detail : 'Unknown Square error';
  return { error: errMsg };
}
