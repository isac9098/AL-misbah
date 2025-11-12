"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, Search, Globe, DollarSign } from "lucide-react";
import { useApp } from "../app/context/AppContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* ======================= GlobalAnimations ======================= */
function GlobalAnimations() {
  useEffect(() => {
    const id = "header-anim-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
      @keyframes scale-in { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
      .animate-fade-in { animation: fade-in .25s ease-out forwards; }
      .animate-scale-in { animation: scale-in .25s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

/* ======================= Header ======================= */
export default function Header() {
  const { currency, setCurrency, t, lang, toggleLang } = useApp();
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const toggleCurrency = () => setCurrency(currency === "USD" ? "QAR" : "USD");

  return (
    <header className="sticky top-0 z-40" dir={lang === "EN" ? "ltr" : "rtl"}>
      <GlobalAnimations />

      {/* Top Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo1.png" alt="AL Misbah Logo" className="w-10 h-10 object-contain" />
            <span className="hidden sm:block font-extrabold tracking-wide text-[#7b0b4c]">
              مركز المصباح
            </span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <SearchButton />
            <CartButton />
            <LangCurrencyFixed
              currency={currency}
              toggleCurrency={toggleCurrency}
              lang={lang}
              toggleLang={toggleLang}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute top-16 left-0 w-full bg-white/10 backdrop-blur-sm z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-800 hover:text-[#7b0b4c]">
            <span className="text-sm">{t("topics")}</span>
          </button>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => setAuthMode("login")}
                  className="px-4 py-1.5 rounded-lg border border-[#7b0b4c] text-[#7b0b4c] bg-white/70 backdrop-blur-sm hover:bg-[#7b0b4c] hover:text-white text-sm"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className="px-4 py-1.5 rounded-lg bg-[#7b0b4c] text-white hover:bg-[#5e0839] text-sm"
                >
                  {t("register")}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#7b0b4c]">
                  {t("welcome")}, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {authMode && (
        <LoginModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          setAuthMode={setAuthMode}
          setUser={setUser}
        />
      )}
    </header>
  );
}

// ✅ إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);


/* ======================= SearchButton ======================= */
function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ البحث المباشر من Supabase
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      console.log('🔍 جاري البحث عن:', query); // للتحقق
      
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category")
        .ilike("title", `%${query}%`)
        .limit(6);

      console.log('📊 نتائج البحث:', data); // للتحقق
      
      if (!error) {
        setSuggestions(data || []);
      } else {
        console.error("خطأ في جلب نتائج البحث:", error);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // ✅ عند تنفيذ البحث الكامل
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    localStorage.setItem("searchQuery", query.toLowerCase());
    scrollToCourses();
    setOpen(false);
  };

  // ✅ عند الضغط على اقتراح
  const handleSelect = (course) => {
    localStorage.setItem("searchQuery", course.title.toLowerCase());
    localStorage.setItem("selectedCourseId", course.id);
    setQuery("");
    setOpen(false);
    setSuggestions([]);
    
    // الانتقال إلى قسم الدورات
    setTimeout(() => {
      scrollToCourses();
    }, 100);
  };

  // ✅ الانتقال إلى قسم الدورات
  const scrollToCourses = () => {
    const section = document.getElementById("courses-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      
      // إذا كان هناك دورة محددة مختارة، قم بتمييزها
      setTimeout(() => {
        const selectedCourseId = localStorage.getItem("selectedCourseId");
        if (selectedCourseId) {
          const courseElement = document.getElementById(`course-${selectedCourseId}`);
          if (courseElement) {
            courseElement.scrollIntoView({ behavior: "smooth", block: "center" });
            courseElement.classList.add("ring-2", "ring-[#7b0b4c]");
            setTimeout(() => {
              courseElement.classList.remove("ring-2", "ring-[#7b0b4c]");
            }, 3000);
          }
          localStorage.removeItem("selectedCourseId");
        }
      }, 500);
    }
  };

  // ✅ إغلاق البحث عند النقر خارج المربع
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.search-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative search-container">
      {/* زر البحث */}
      <button
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="بحث"
        onClick={() => setOpen((v) => !v)}
      >
        <Search className="w-5 h-5 text-gray-700" />
      </button>

      {/* مربع البحث - في المنتصف الآن */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-4 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#7b0b4c]">ابحث عن الدورات</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="إغلاق البحث"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 items-center mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسم الدورة..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b0b4c] focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#7b0b4c] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5e0839] transition-colors whitespace-nowrap"
              >
                بحث
              </button>
            </form>

            {/* قائمة النتائج */}
            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7b0b4c]"></div>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="border border-gray-100 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  {suggestions.length} نتيجة
                </div>
                {suggestions.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleSelect(course)}
                    className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                  >
                    <div className="font-medium text-[#7b0b4c] mb-1 group-hover:text-[#5e0839]">
                      {course.title}
                    </div>
                    {course.category && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                        {course.category}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && query && suggestions.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <div className="text-2xl mb-2">🔍</div>
                لا توجد نتائج مطابقة لـ "{query}"
              </div>
            )}

            {!loading && !query && (
              <div className="text-center py-4 text-gray-400 text-sm">
                <div className="text-2xl mb-2">📚</div>
                ابدأ بالكتابة للبحث عن الدورات المتاحة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================= CartButton ======================= */
function CartButton() {
  const { currency, formatCurrency, t } = useApp();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadCart = () => setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cartUpdated", loadCart);
    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const totalPrice = cart.reduce((sum, c) => {
    const priceNumber = parseFloat(c.price.replace(/[^\d.]/g, "")) || 0;
    return sum + priceNumber;
  }, 0);

  const handleRemove = (id) => {
    const updated = cart.filter((c) => c.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleWhatsAppOrder = () => {
    if (!cart.length) return alert("السلة فارغة!");
    const message =
      "مرحباً! أود طلب الدورات التالية:\n\n" +
      cart
        .map((c, i) => `${i + 1}- ${c.title} (${formatCurrency(parseFloat(c.price.replace(/[^\d.]/g, "")))})`)
        .join("\n") +
      `\n\n${t("cart")} الإجمالي: ${formatCurrency(totalPrice)}`;
    window.open("https://wa.me/+97472041794?text=" + encodeURIComponent(message), "_blank");
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in text-right">
        <button onClick={() => setOpen(false)} className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 text-xl">
          ✕
        </button>
        <h3 className="font-bold text-[#7b0b4c] mb-4 text-lg">{t("cart")}</h3>
        {cart.length === 0 ? (
          <p className="text-sm text-gray-500">السلة فارغة.</p>
        ) : (
          <>
            <ul className="space-y-2 mb-3 max-h-64 overflow-y-auto">
              {cart.map((c) => (
                <li key={c.id} className="flex items-center justify-between border-b pb-1 text-sm">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    {c.category && <div className="text-xs text-gray-500">{c.category}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7b0b4c] font-semibold">
                      {formatCurrency(parseFloat(c.price.replace(/[^\d.]/g, "")))}
                    </span>
                    <button onClick={() => handleRemove(c.id)} className="text-gray-400 hover:text-red-500 text-xs">
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm font-medium mb-4">
              <span>الإجمالي:</span>
              <span className="text-[#7b0b4c]">{formatCurrency(totalPrice)}</span>
            </div>
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#1eb15a]"
            >
              طلب عبر واتساب
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button className="relative p-2 rounded-full hover:bg-gray-100" aria-label="السلة" onClick={() => setOpen(true)}>
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -left-1 bg-[#7b0b4c] text-white text-xs rounded-full px-1.5">{cart.length}</span>
        )}
      </button>
      {open && typeof window !== "undefined" && createPortal(modal, document.body)}
    </div>
  );
}

/* ======================= LangCurrencyFixed ======================= */
function LangCurrencyFixed({ currency, toggleCurrency, lang, toggleLang }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        onClick={toggleCurrency}
        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <DollarSign className="w-4 h-4" />
        <span>{currency}</span>
      </div>
      <div
        onClick={toggleLang}
        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <Globe className="w-4 h-4" />
        <span>{lang}</span>
      </div>
    </div>
  );
}

/* ======================= LoginModal ======================= */
function LoginModal({ mode, onClose, setAuthMode, setUser }) {
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = [
      { name: "المدير العام", email: "alfathhamid599@gmail.com", password: "123456", role: "general_manager" },
      { name: "المدير التنفيذي", email: "fayhaalfatihhamida@gmail.com", password: "123456", role: "executive" },
      { name: "مدير الموارد البشرية", email: "atag4052@gmail.com", password: "123456", role: "hr" },
    ];

    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");
    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
      onClose();
      router.push("/dashboard");
    } else {
      alert("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-scale-in text-right" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 text-gray-500 hover:text-gray-700">✕</button>
        <h2 className="text-xl font-semibold text-center mb-4 text-[#7b0b4c]">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">كلمة المرور</label>
            <input type="password" name="password" required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <button type="submit" className="w-full bg-[#7b0b4c] text-white py-2 rounded-lg font-medium hover:bg-[#5e0839]">
            {mode === "login" ? "تسجيل الدخول" : "تسجيل"}
          </button>
        </form>
      </div>
    </div>
  );
}