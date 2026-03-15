import { en } from "./en";
import { ja } from "./ja";
import type { Locale, TranslationKey, Translations } from "./types";

export type { Locale, TranslationKey, Translations };

const STORAGE_KEY = "circa-input-lang";

const translations: Record<Locale, Translations> = { ja, en };

let currentLocale: Locale = "en";

/**
 * Detect the user's preferred locale.
 * Priority: URL param > localStorage > navigator.language > fallback "en"
 */
export function detectLocale(): Locale {
  const params = new URLSearchParams(window.location.search);
  const paramLang = params.get("lang");
  if (paramLang === "ja" || paramLang === "en") return paramLang;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ja" || stored === "en") return stored;

  const navLang = navigator.language.split("-")[0];
  if (navLang === "ja") return "ja";

  return "en";
}

/**
 * Get the current locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Set the locale, persist to localStorage, and update the page.
 */
export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  translatePage();
}

/**
 * Get a translated string by key.
 */
export function t(key: TranslationKey): string {
  return translations[currentLocale][key];
}

/**
 * Translate all elements with `data-i18n` or `data-i18n-html` attributes.
 *
 * - `data-i18n="key"` sets textContent (safe for plain text)
 * - `data-i18n-html="key"` sets innerHTML (for trusted translations containing HTML tags)
 * - `data-i18n-attr="attrName"` with `data-i18n` sets an attribute value
 *
 * All translation strings are defined in this project's translation files
 * and are never derived from user input.
 */
export function translatePage(): void {
  // Plain text translations
  const textElements = document.querySelectorAll<HTMLElement>("[data-i18n]");
  for (const el of textElements) {
    const key = el.dataset.i18n as TranslationKey;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  }

  // HTML translations (for trusted content with <strong>, <code>, <br>, <em>)
  const htmlElements =
    document.querySelectorAll<HTMLElement>("[data-i18n-html]");
  for (const el of htmlElements) {
    const key = el.dataset.i18nHtml as TranslationKey;
    // These values come from our own translation files, not user input
    el.innerHTML = t(key);
  }
}

/**
 * Initialize i18n: set the document lang and translate the page.
 */
export function initI18n(): void {
  currentLocale = detectLocale();
  document.documentElement.lang = currentLocale;
  translatePage();
}
