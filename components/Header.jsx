"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, Search, Globe, DollarSign } from "lucide-react";
import { useApp } from "../app/context/AppContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ✅ إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [showLanguageButton, setShowLanguageButton] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single();
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.email,
          role: profile?.role || 'user'
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Fallback to localStorage if no session but user exists in localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    };
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
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
            <span className="font-extrabold tracking-wide text-[#7b0b4c]" style={{ fontFamily: 'var(--font-aref)' }}>
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
              showLanguageButton={showLanguageButton}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute top-16 left-0 w-full bg-white/10 backdrop-blur-sm z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-800 hover:text-[#7b0b4c]">
            {/* يمكن إضافة أي عناصر إضافية هنا */}
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

/* ======================= SearchButton ======================= */
function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const { formatCurrency } = useApp();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      console.log('🔍 جاري البحث عن:', query);

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, category, description, price, discount, image")
          .or(`title.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10);

        console.log('📊 نتائج البحث:', data);

        if (error) {
          console.error("خطأ في جلب نتائج البحث:", error);
          setError(`خطأ في البحث: ${error.message}`);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error("خطأ غير متوقع:", err);
        setError(`خطأ غير متوقع: ${err.message}`);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    localStorage.setItem("searchQuery", query.toLowerCase());
    scrollToCourses();
    setOpen(false);
  };

  const handleSelect = (course) => {
    setSelectedCourse(course);
    setQuery("");
    setOpen(false);
    setSuggestions([]);
  };

  const handleClosePopup = () => {
    setSelectedCourse(null);
  };

  const handleAddToCart = (course) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(item => item.id === course.id);

    if (!existingItem) {
      cart.push({
        ...course,
        // استخدام سعر الخصم إذا كان متوفراً، وإلا استخدام السعر العادي
        price: course.discount && course.discount !== course.price ? course.discount : course.price || "0 QAR"
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      showToast("تمت إضافة الدورة إلى السلة بنجاح!", "success");
    } else {
      showToast("هذه الدورة موجودة بالفعل في السلة!", "warning");
    }
    handleClosePopup();
  };

  const scrollToCourses = () => {
    const section = document.getElementById("courses-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.search-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // دالة مساعدة للحصول على السعر المعروض
  const getDisplayPrice = (course) => {
    return course.discount && course.discount !== course.price ? course.discount : course.price;
  };

  // التحقق مما إذا كانت الدورة لديها خصم
  const hasDiscount = (course) => {
    return course.discount && course.discount !== course.price;
  };

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

      {/* مربع البحث */}
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
                placeholder="اكتب اسم الدورة أو التصنيف..."
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

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 text-sm font-medium">{error}</div>
                <div className="text-red-600 text-xs mt-1">
                  تحقق من اتصال الإنترنت أو حاول لاحقاً
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7b0b4c]"></div>
                <span className="mr-2 text-sm text-gray-500">جاري البحث...</span>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="border border-gray-100 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  {suggestions.length} نتيجة
                </div>
                {suggestions.map((course) => {
                  const displayPrice = getDisplayPrice(course);
                  const hasDisc = hasDiscount(course);
                  
                  return (
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
                      {/* عرض وسم الخصم إذا كان هناك خصم */}
                      {hasDisc && (
                        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block mr-1 border border-green-200">
                          🏷️ عرض خاص
                        </div>
                      )}
                      {displayPrice && (
                        <div className="text-xs text-gray-600 mt-1">
                          {/* عرض سعر الخصم */}
                          <span className="text-[#7b0b4c] font-semibold">
                            السعر: {formatCurrency(parseFloat(displayPrice.replace(/[^\d.]/g, "") || 0))}
                          </span>
                          {/* عرض السعر الأصلي مشطوب إذا كان هناك خصم */}
                          {hasDisc && course.price && (
                            <span className="text-gray-400 line-through mr-2 text-xs">
                              {formatCurrency(parseFloat(course.price.replace(/[^\d.]/g, "") || 0))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && query && suggestions.length === 0 && !error && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <div className="text-2xl mb-2">🔍</div>
                لا توجد نتائج مطابقة لـ "{query}"
                <div className="text-xs text-gray-400 mt-2">
                  جرب كلمات بحث مختلفة أو تحقق من كتابة الكلمات
                </div>
              </div>
            )}

            {!loading && !query && (
              <div className="text-center py-4 text-gray-400 text-sm">
                <div className="text-2xl mb-2">📚</div>
                ابدأ بالكتابة للبحث عن الدورات المتاحة
                <div className="text-xs text-gray-400 mt-2">
                  يمكنك البحث باسم الدورة أو التصنيف
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* النافذة المنبثقة لتفاصيل الدورة */}
      {selectedCourse && (
        <CoursePopup 
          course={selectedCourse} 
          onClose={handleClosePopup}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* عرض Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast}
        />
      )}
    </div>
  );
}

/* ======================= CoursePopup ======================= */
function CoursePopup({ course, onClose, onAddToCart }) {
  const { formatCurrency } = useApp();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // تحديد السعر المعروض (الخصم أولاً)
  const displayPrice = course.discount && course.discount !== course.price ? course.discount : course.price;
  const hasDiscount = course.discount && course.discount !== course.price;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-[#7b0b4c] text-center pr-8">
            {course.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Course Image */}
          {course.image && (
            <div className="mb-6">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">معلومات الدورة</h3>
              <div className="space-y-2 text-sm">
                {course.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">التصنيف:</span>
                    <span className="text-[#7b0b4c] font-medium">{course.category}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">المستوى:</span>
                    <span className="text-[#7b0b4c] font-medium">{course.level}</span>
                  </div>
                )}
                {/* عرض معلومات الخصم إذا كان متوفراً */}
                {hasDiscount && (
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                      🏷️ عرض خاص
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                {/* عرض سعر الخصم */}
                <div className="text-3xl font-bold text-[#7b0b4c]">
                  {formatCurrency(parseFloat(displayPrice?.replace(/[^\d.]/g, "") || 0))}
                </div>
                
                {/* عرض السعر الأصلي مشطوب إذا كان هناك خصم */}
                {hasDiscount && course.price && (
                  <div className="text-lg text-gray-500 line-through mt-1">
                    {formatCurrency(parseFloat(course.price.replace(/[^\d.]/g, "") || 0))}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 mt-1">
                  {hasDiscount ? "السعر بعد الخصم" : "سعر الدورة"}
                </div>

                {/* عرض نسبة الخصم إذا كان متوفراً */}
                {hasDiscount && course.price && displayPrice && (
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                      وفر {calculateDiscountPercentage(course.price, displayPrice)}%
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onAddToCart(course)}
                className="w-full bg-[#7b0b4c] text-white py-3 rounded-lg font-semibold hover:bg-[#5e0839] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                أضف إلى السلة
              </button>

              {/* ملاحظة حول الخصم */}
              {hasDiscount && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                    🎉 هذا العرض لفترة محدودة فقط
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">وصف الدورة</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {course.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ======================= Toast ======================= */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-yellow-500";
  const textColor = "text-white";

  return createPortal(
    <div className="fixed top-4 right-4 z-[10000] animate-scale-in">
      <div className={`${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-2`}>
        {type === "success" ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {message}
      </div>
    </div>,
    document.body
  );
}

/* ======================= CartButton ======================= */
function CartButton() {
  const { currency, formatCurrency, t } = useApp();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

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
    // استخدام سعر الخصم إذا كان متوفراً، وإلا استخدام السعر العادي
    const priceToUse = c.discount && c.discount !== c.price ? c.discount : c.price;
    const priceNumber = parseFloat(priceToUse.replace(/[^\d.]/g, "")) || 0;
    return sum + priceNumber;
  }, 0);

  const handleRemove = (id) => {
    const updated = cart.filter((c) => c.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("تم إزالة الدورة من السلة", "success");
  };

  const handleWhatsAppOrder = () => {
    if (!cart.length) {
      showToast("السلة فارغة!", "warning");
      return;
    }

    const message =
      "مرحباً! أود طلب الدورات التالية:\n\n" +
      cart
        .map((c, i) => {
          // استخدام سعر الخصم في رسالة واتساب
          const priceToUse = c.discount && c.discount !== c.price ? c.discount : c.price;
          return `${i + 1}- ${c.title} (${formatCurrency(parseFloat(priceToUse.replace(/[^\d.]/g, "")))})`;
        })
        .join("\n") +
      `\n\n${t("cart")} الإجمالي: ${formatCurrency(totalPrice)}`;
    window.open("https://wa.me/+97472041794?text=" + encodeURIComponent(message), "_blank");
    setOpen(false);
    showToast("جاري فتح واتساب لإكمال الطلب...", "success");
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in text-right">
        <button 
          onClick={() => setOpen(false)} 
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-xl transition-colors"
        >
          ✕
        </button>

        <h3 className="font-bold text-[#7b0b4c] mb-4 text-lg border-b pb-2 border-gray-100">
          {t("cart")}
        </h3>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500 text-sm">السلة فارغة</p>
            <p className="text-gray-400 text-xs mt-1">قم بإضافة دورات لتظهر هنا</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((c) => {
                // تحديد السعر المعروض (الخصم أولاً)
                const displayPrice = c.discount && c.discount !== c.price ? c.discount : c.price;
                const hasDiscount = c.discount && c.discount !== c.price;
                
                return (
                  <li key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{c.title}</div>
                      {c.category && (
                        <div className="text-xs text-gray-500 mt-1 bg-white px-2 py-1 rounded-full inline-block border border-gray-200">
                          {c.category}
                        </div>
                      )}
                      {/* عرض وسم الخصم إذا كان هناك خصم */}
                      {hasDiscount && (
                        <div className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded-full inline-block border border-green-200">
                          🏷️ عرض خاص
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {/* عرض سعر الخصم */}
                        <span className="text-[#7b0b4c] font-semibold text-sm whitespace-nowrap">
                          {formatCurrency(parseFloat(displayPrice.replace(/[^\d.]/g, "")))}
                        </span>
                        {/* عرض السعر الأصلي مشطوب إذا كان هناك خصم */}
                        {hasDiscount && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatCurrency(parseFloat(c.price.replace(/[^\d.]/g, "")))}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleRemove(c.id)} 
                        className="text-gray-400 hover:text-red-500 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="إزالة"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-center text-sm font-medium mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-semibold">الإجمالي:</span>
              <span className="text-[#7b0b4c] font-bold text-lg">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#1eb15a] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.18-1.24-6.169-3.495-8.418"/>
              </svg>
              طلب عبر واتساب
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" 
        aria-label="السلة" 
        onClick={() => setOpen(true)}
      >
        {/* استبدال أيقونة السلة بأيقونة من مكتبة Heroicons */}
        <svg 
          className="w-6 h-6 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#7b0b4c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cart.length}
          </span>
        )}
      </button>

      {open && typeof window !== "undefined" && createPortal(modal, document.body)}

      {/* عرض Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast}
        />
      )}
    </div>
  );
}

/* ======================= LangCurrencyFixed ======================= */
function LangCurrencyFixed({ currency, toggleCurrency, lang, toggleLang, showLanguageButton = false }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        onClick={toggleCurrency}
        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <DollarSign className="w-4 h-4" />
        <span>{currency}</span>
      </div>

      {/* زر اللغة - مخفي افتراضياً */}
      {showLanguageButton && (
        <div
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>{lang}</span>
        </div>
      )}
    </div>
  );
}

/* ======================= LoginModal ======================= */
function LoginModal({ mode, onClose, setAuthMode, setUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ✅ قائمة البريد المسموح فقط - 3 مشرفين فقط
  const allowedEmails = [
    "fayhaalfatihhamida@gmail.com",
    "alfathhamid599@gmail.com", 
    "atag4052@gmail.com"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // مسح جميع الأخطاء السابقة
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    try {
      const form = new FormData(e.target);
      const email = form.get("email").trim().toLowerCase();
      const password = form.get("password");

      // ✅ التحقق إذا كان البريد مسموحاً
      if (!allowedEmails.includes(email)) {
        setEmailError("❌ هذا البريد الإلكتروني غير مسموح بالدخول");
        setLoading(false);
        return;
      }

      // ✅ التحقق من صحة البريد الإلكتروني
      if (!email || !email.includes('@')) {
        setEmailError("❌ يرجى إدخال بريد إلكتروني صحيح");
        setLoading(false);
        return;
      }

      // ✅ التحقق من كلمة المرور
      if (!password || password.length < 6) {
        setPasswordError("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        setLoading(false);
        return;
      }

      console.log('🔐 محاولة تسجيل الدخول:', email);

      // تسجيل الدخول باستخدام Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);

        if (error.message.includes('Invalid login credentials')) {
          setPasswordError("❌ كلمة المرور غير صحيحة");
        } else if (error.message.includes('Email not confirmed')) {
          setGeneralError("❌ يرجى تأكيد بريدك الإلكتروني أولاً");
        } else {
          setGeneralError(`❌ خطأ في التسجيل: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('✅ تم تسجيل الدخول بنجاح:', data.user);

        // ✅ التأكد من أن المستخدم مضاف في جدول users كمشرف عام
        await ensureUserInTable(data.user);

        // جلب بيانات المستخدم الإضافية
        const { data: userTableData, error: userError } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: userTableData?.name || data.user.user_metadata?.name || data.user.email,
          role: userTableData?.role || 'super_admin' // ✅ دور افتراضي كمشرف عام
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        onClose();
        
        // ✅ إرسال إشارة تحديث للفقاعة
        window.dispatchEvent(new Event('authChange'));
        
        // ✅ الانتقال للداشبورد مع إعادة تحميل الصفحة لتظهر الفقاعة
        router.push("/dashboard").then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      setGeneralError("❌ حدث خطأ غير متوقع أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة للتأكد من وجود المستخدم في جدول users كمشرف عام
  const ensureUserInTable = async (user) => {
    try {
      // التحقق إذا كان المستخدم موجوداً في الجدول
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // المستخدم غير موجود - إنشاء سجل جديد كمشرف عام
        console.log('📝 إنشاء مستخدم جديد في الجدول كمشرف عام:', user.email);

        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'المشرف',
              role: 'super_admin', // ✅ جميع المستخدمين المسموحين يكونون مشرفين عامين
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('❌ خطأ في إنشاء المستخدم:', insertError);
        } else {
          console.log('✅ تم إنشاء المستخدم كمشرف عام في الجدول');
        }
      } else if (existingUser && existingUser.role !== 'super_admin') {
        // ✅ تحديث الصلاحية إلى مشرف عام إذا لم يكن كذلك
        console.log('🔄 تحديث صلاحية المستخدم إلى مشرف عام:', user.email);

        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ خطأ في تحديث الصلاحية:', updateError);
        } else {
          console.log('✅ تم تحديث الصلاحية إلى مشرف عام');
        }
      } else {
        console.log('✅ المستخدم موجود مسبقاً كمشرف عام في الجدول');
      }
    } catch (error) {
      console.error('❌ خطأ في ensureUserInTable:', error);
    }
  };

  // ✅ إخفاء زر إنشاء حساب جديد - فقط تسجيل الدخول مسموح
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-scale-in text-right" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 text-gray-500 hover:text-gray-700">✕</button>

        <h2 className="text-xl font-semibold text-center mb-4 text-[#7b0b4c]">
          تسجيل الدخول للإدارة
        </h2>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm font-medium">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b0b4c] ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل بريدك الإلكتروني"
              disabled={loading}
              onChange={() => setEmailError("")} // مسح الخطأ عند الكتابة
            />
            {emailError && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {emailError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              required 
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b0b4c] ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`} 
              placeholder="أدخل كلمة المرور"
              disabled={loading}
              onChange={() => setPasswordError("")} // مسح الخطأ عند الكتابة
            />
            {passwordError && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {passwordError}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#7b0b4c] text-white py-2 rounded-lg font-medium hover:bg-[#5e0839] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        {/* ✅ معلومات إضافية - تم تبسيطها */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            نظام الدخول مخصص للمشرفين المعتمدين فقط
          </p>
        </div>
      </div>
    </div>
  );
}