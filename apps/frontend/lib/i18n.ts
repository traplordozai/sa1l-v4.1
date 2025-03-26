/**
 * Internationalization utility functions
 */

import { useLocalStorage } from "@/hooks/utils/useLocalStorage"

// Define available locales
export const locales = ["en", "fr", "es", "zh", "ar"]

// Define locale direction
export const rtlLocales = ["ar"]

// Sample translations (in a real app, these would be loaded from JSON files)
const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome to our application",
    dashboard: "Dashboard",
    users: "Users",
    settings: "Settings",
    logout: "Logout",
    profile: "Profile",
    notifications: "Notifications",
    search: "Search",
    help: "Help",
    about: "About",
    contact: "Contact",
  },
  fr: {
    welcome: "Bienvenue dans notre application",
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    settings: "Paramètres",
    logout: "Déconnexion",
    profile: "Profil",
    notifications: "Notifications",
    search: "Rechercher",
    help: "Aide",
    about: "À propos",
    contact: "Contact",
  },
  es: {
    welcome: "Bienvenido a nuestra aplicación",
    dashboard: "Panel de control",
    users: "Usuarios",
    settings: "Configuración",
    logout: "Cerrar sesión",
    profile: "Perfil",
    notifications: "Notificaciones",
    search: "Buscar",
    help: "Ayuda",
    about: "Acerca de",
    contact: "Contacto",
  },
  zh: {
    welcome: "欢迎使用我们的应用程序",
    dashboard: "仪表板",
    users: "用户",
    settings: "设置",
    logout: "登出",
    profile: "个人资料",
    notifications: "通知",
    search: "搜索",
    help: "帮助",
    about: "关于",
    contact: "联系",
  },
  ar: {
    welcome: "مرحبًا بك في تطبيقنا",
    dashboard: "لوحة القيادة",
    users: "المستخدمين",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    profile: "الملف الشخصي",
    notifications: "الإشعارات",
    search: "بحث",
    help: "مساعدة",
    about: "حول",
    contact: "اتصل بنا",
  },
}

/**
 * Translates a key to the current locale
 * @param key The translation key
 * @param locale The locale to use (defaults to current locale)
 * @returns The translated string or the key if no translation is found
 */
export function translate(key: string, locale?: string): string {
  // In a browser environment, get the locale from localStorage
  const currentLocale = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : locale || "en"

  return translations[currentLocale]?.[key] || translations["en"][key] || key
}

/**
 * Hook to use translations in components
 * @returns Object with translation function and current locale
 */
export function useTranslation() {
  const [locale] = useLocalStorage("language", "en")

  const t = (key: string) => translate(key, locale)

  return {
    t,
    locale,
    isRtl: rtlLocales.includes(locale),
  }
}

/**
 * Formats a date according to the current locale
 * @param date The date to format
 * @param options Intl.DateTimeFormat options
 * @returns The formatted date string
 */
export function formatDate(date: Date | number, options?: Intl.DateTimeFormatOptions, locale?: string): string {
  const currentLocale = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : locale || "en"

  return new Intl.DateTimeFormat(currentLocale, options).format(date)
}

/**
 * Formats a number according to the current locale
 * @param number The number to format
 * @param options Intl.NumberFormat options
 * @returns The formatted number string
 */
export function formatNumber(number: number, options?: Intl.NumberFormatOptions, locale?: string): string {
  const currentLocale = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : locale || "en"

  return new Intl.NumberFormat(currentLocale, options).format(number)
}

