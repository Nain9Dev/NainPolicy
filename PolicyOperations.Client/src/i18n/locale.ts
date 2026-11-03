import { computed, ref } from 'vue';
import { LOCALES, MESSAGES, type Locale, type Messages } from './messages';

export const LOCALE_STORAGE_KEY = 'nainpolicy_locale';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

/** Stored preference first, then the browser language, then English (REQ-174). Pure. */
export function detectLocale(stored: string | null, navigatorLanguage: string | undefined): Locale {
  if (isLocale(stored)) return stored;
  return (navigatorLanguage ?? '').toLowerCase().startsWith('es') ? 'es' : 'en';
}

function readStored(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(locale: Locale) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Private mode or blocked storage: the choice simply does not persist.
  }
}

function applyToDocument(locale: Locale) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

const current = ref<Locale>(detectLocale(readStored(), typeof navigator === 'undefined' ? undefined : navigator.language));
applyToDocument(current.value);

/** One shared locale for the whole client; `t` is the active message catalogue. */
export function useLocale() {
  const t = computed<Messages>(() => MESSAGES[current.value]);

  function setLocale(locale: Locale) {
    current.value = locale;
    writeStored(locale);
    applyToDocument(locale);
  }

  function toggleLocale() {
    setLocale(current.value === 'es' ? 'en' : 'es');
  }

  return { locale: current, t, setLocale, toggleLocale };
}
