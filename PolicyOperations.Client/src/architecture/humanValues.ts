import type { Locale } from '../i18n/messages';

/** Human-readable money and dates for the practice inspector (spec 013). Pure. */

const TAG: Record<Locale, string> = { es: 'es-ES', en: 'en-GB' };

export function formatAmount(amount: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(TAG[locale], { style: 'currency', currency, currencyDisplay: 'symbol' }).format(amount);
  } catch {
    return `${new Intl.NumberFormat(TAG[locale], { minimumFractionDigits: 2 }).format(amount)} ${currency}`;
  }
}

/** `3 nov 2026` from an ISO calendar date (`YYYY-MM-DD`); the value itself if it is not one. */
export function formatDay(isoDate: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(TAG[locale], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(date)
    .replace(/\.$/, '')
    .replace(/ de /g, ' ');
}
