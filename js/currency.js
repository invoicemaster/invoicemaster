/* Currency helpers — supports the small set of currencies most small businesses
   actually use, and falls back to whatever Intl knows for anything else.
   Locale defaults to en-US for formatting; users can pick another locale later. */

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar (USD $)' },
  { code: 'EUR', label: 'Euro (EUR €)' },
  { code: 'GBP', label: 'British Pound (GBP £)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', label: 'Australian Dollar (AUD)' },
  { code: 'NZD', label: 'New Zealand Dollar (NZD)' },
  { code: 'JPY', label: 'Japanese Yen (JPY ¥)' },
  { code: 'CNY', label: 'Chinese Yuan (CNY ¥)' },
  { code: 'INR', label: 'Indian Rupee (INR ₹)' },
  { code: 'MXN', label: 'Mexican Peso (MXN)' },
  { code: 'BRL', label: 'Brazilian Real (BRL R$)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'SEK', label: 'Swedish Krona (SEK)' },
  { code: 'NOK', label: 'Norwegian Krone (NOK)' },
  { code: 'DKK', label: 'Danish Krone (DKK)' },
  { code: 'ZAR', label: 'South African Rand (ZAR)' },
  { code: 'SGD', label: 'Singapore Dollar (SGD)' },
  { code: 'HKD', label: 'Hong Kong Dollar (HKD)' },
  { code: 'KRW', label: 'Korean Won (KRW ₩)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
];

const SYMBOL_TO_CODE = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR', '₩': 'KRW', 'R$': 'BRL' };

/* Older records stored a symbol ('$') instead of an ISO code ('USD'). Normalize. */
export function normalizeCurrency(value) {
  if (!value) return 'USD';
  const v = String(value).trim();
  if (/^[A-Z]{3}$/.test(v)) return v;
  return SYMBOL_TO_CODE[v] || 'USD';
}

const formatters = new Map();
function fmtFor(code, locale = 'en-US') {
  const key = `${locale}|${code}`;
  let f = formatters.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(locale, { style: 'currency', currency: code });
    } catch {
      f = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' });
    }
    formatters.set(key, f);
  }
  return f;
}

export function formatMoney(amount, currency = 'USD', locale = 'en-US') {
  const code = normalizeCurrency(currency);
  const n = Number(amount) || 0;
  return fmtFor(code, locale).format(n);
}

/* Just the currency symbol (e.g. "$") for cases where we want to display it
   alongside an editable number input rather than a fully-formatted total. */
export function currencySymbol(currency = 'USD', locale = 'en-US') {
  const code = normalizeCurrency(currency);
  // formatToParts gives us the bare symbol without the digits
  const parts = fmtFor(code, locale).formatToParts(0);
  const sym = parts.find((p) => p.type === 'currency');
  return sym ? sym.value : code;
}
