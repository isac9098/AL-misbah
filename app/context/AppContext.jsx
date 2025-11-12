"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const DICT = {
  AR: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    topics: "المواضيع",
    cart: "السلة",
    welcome: "مرحباً",
    logout: "تسجيل خروج",
    newUser: "مستخدم جديد",
    about_title: "من نحن",
    privacy_title: "سياسة الخصوصية",
    contact_title: "تواصل معنا",
    campaigns_title: "حملاتنا الإعلانية",
    add_course: "إضافة دورة",
    courses: "الدورات",
    Human_Resources_Manager:" مدير الموارد البشرية", 
  },
  EN: {
    login: "Login",
    register: "Register",
    topics: "Topics",
    cart: "Cart",
    welcome: "Welcome",
    logout: "Logout",
    newUser: "New User",
    about_title: "About Us",
    privacy_title: "Privacy Policy",
    contact_title: "Contact Us",
    campaigns_title: "Our Campaigns",
    add_course: "Add Course",
    courses: "Courses",
    Human_Resources_Manager:"Human Resources Manager", 
  },
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState("AR");
  const [currency, setCurrency] = useState("QAR");
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, QAR: 3.64 });

  // تحميل القيم من localStorage
  useEffect(() => {
    const sLang = localStorage.getItem("app_lang");
    const sCur = localStorage.getItem("app_currency");
    const savedRates = localStorage.getItem("exchange_rates");
    if (sLang) setLang(sLang);
    if (sCur) setCurrency(sCur);
    if (savedRates) setExchangeRates(JSON.parse(savedRates));
  }, []);

  // حفظ القيم وتحديث الاتجاه
  useEffect(() => {
    localStorage.setItem("app_lang", lang);
    localStorage.setItem("app_currency", currency);
    document.documentElement.lang = lang === "EN" ? "en" : "ar";
    document.documentElement.dir = lang === "EN" ? "ltr" : "rtl";
  }, [lang, currency]);

  // جلب أسعار الصرف من API
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("https://api.exchangerate.host/latest?base=USD");
        const data = await res.json();
        if (data?.rates) {
          setExchangeRates(data.rates);
          localStorage.setItem("exchange_rates", JSON.stringify(data.rates));
        }
      } catch (err) {
        console.error("فشل في جلب أسعار الصرف:", err);
      }
    }
    fetchRates();
  }, []);

  // تبديل اللغة
  const toggleLang = () => {
    const newLang = lang === "AR" ? "EN" : "AR";
    setLang(newLang);
  };

  // ترجمة المفاتيح
  const t = (key) => DICT[lang]?.[key] || key;

  // 🔢 تنسيق العملة - الأرقام تبقى إنجليزية دائمًا
  const formatCurrency = (value) => {
    if (!value) return "";
    const num =
      typeof value === "number"
        ? value
        : parseFloat(value.toString().replace(/[^\d.-]/g, "")) || 0;

    const baseUSD = num / (exchangeRates["QAR"] || 3.64);
    const converted = baseUSD * (exchangeRates[currency] || 1);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        currency,
        setCurrency,
        t,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
