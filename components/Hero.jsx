"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { createPortal } from "react-dom";

// ✅ إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ مكون Toast
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

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [toast, setToast] = useState(null); // ✅ حالة للـ Toast
  const searchContainerRef = useRef(null);

  // ✅ إظهار Toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ✅ إغلاق Toast
  const closeToast = () => {
    setToast(null);
  };

  // ✅ إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ البحث المباشر من Supabase مع الاقتراحات
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category, description, price, image")
        .ilike("title", `%${searchQuery}%`)
        .limit(6);

      if (!error) {
        setSuggestions(data || []);
      } else {
        console.error("خطأ في جلب نتائج البحث:", error);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // تمرير قيمة البحث إلى سكشن CoursesCarousel
    const coursesSection = document.getElementById("CoursesCarousel");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" });
      localStorage.setItem("searchQuery", searchQuery);
    }

    // إغلاق القائمة بعد البحث
    setSuggestions([]);
  };

  // ✅ عند الضغط على اقتراح من القائمة - فتح النافذة المنبثقة
  const handleSelect = (course) => {
    setSelectedCourse(course);
    setSearchQuery(course.title);
    setSuggestions([]);
  };

  // ✅ إغلاق النافذة المنبثقة
  const handleClosePopup = () => {
    setSelectedCourse(null);
  };

  // ✅ إضافة الدورة إلى السلة
  const handleAddToCart = (course) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(item => item.id === course.id);
    
    if (!existingItem) {
      cart.push({
        ...course,
        price: course.price || "0 QAR"
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      showToast("تمت إضافة الدورة إلى السلة بنجاح!", "success");
    } else {
      showToast("هذه الدورة موجودة بالفعل في السلة!", "warning");
    }
    handleClosePopup();
  };

  // ✅ وظيفة للتمرير وتمييز الدورة في الكاروسيل
  const highlightAndScrollToCourse = (courseId) => {
    let attempts = 0;
    const maxAttempts = 10;

    const tryFindCourse = () => {
      const courseElement = document.getElementById(`course-${courseId}`);

      if (courseElement) {
        courseElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest",
          inline: "center"
        });

        courseElement.classList.add(
          "ring-4", 
          "ring-[#7b0b4c]", 
          "ring-opacity-70", 
          "scale-105",
          "transition-all", 
          "duration-500"
        );

        setTimeout(() => {
          courseElement.classList.remove(
            "ring-4", 
            "ring-[#7b0b4c]", 
            "ring-opacity-70", 
            "scale-105"
          );
        }, 4000);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryFindCourse, 200);
      }
    };

    tryFindCourse();
  };

  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Laptop hero"
          className="w-full h-[56vh] lg:h-[64vh] object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-[56vh] lg:h-[64vh]">
        <div className="mt-8 md:mt-0 max-w-2xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-snug text-white mb-4">
            تعلّم اليوم، لِتقودَّ غدًا
          </h1>
          <p className="mt-3 text-lg text-white/80 mb-6">
            تعلّم.. طوِّر.. وحقق نجاحك مع مركز المصباح للتدريب الفني والعمالة
          </p>

          {/* ✅ شريط البحث مع الاقتراحات */}
          <div ref={searchContainerRef} className="mt-6 w-full max-w-md relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دورة تدريبية..."
                  className="w-full rounded-2xl bg-white/95 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7b0b4c]/40 px-14 py-4 text-lg placeholder-gray-400"
                />

                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#7b0b4c]"
                  aria-label="بحث"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path
                      fill="currentColor"
                      d="M10 2a8 8 0 1 1 5.293 13.707l4 4-1.414 1.414-4-4A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* ✅ قائمة الاقتراحات */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl mt-2 max-h-60 overflow-y-auto z-50">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">جاري البحث...</div>
                ) : (
                  suggestions.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleSelect(course)}
                      className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-[#7b0b4c]">
                        {course.title}
                      </div>
                      {course.category && (
                        <div className="text-sm text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {course.category}
                        </div>
                      )}
                      {course.price && (
                        <div className="text-xs text-gray-600 mt-1">
                          السعر: {course.price}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ النافذة المنبثقة لتفاصيل الدورة */}
      {selectedCourse && (
        <CoursePopup 
          course={selectedCourse} 
          onClose={handleClosePopup}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ✅ عرض Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast}
        />
      )}
    </section>
  );
}

/* ======================= CoursePopup ======================= */
function CoursePopup({ course, onClose, onAddToCart }) {
  // ✅ دالة لتنسيق السعر
  const formatCurrency = (price) => {
    const priceNumber = parseFloat(price?.replace(/[^\d.]/g, "") || 0);
    return `${priceNumber.toLocaleString('ar-QA')} QAR`;
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                {course.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدة:</span>
                    <span className="text-[#7b0b4c] font-medium">{course.duration}</span>
                  </div>
                )}
                {course.instructor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدرب:</span>
                    <span className="text-[#7b0b4c] font-medium">{course.instructor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-[#7b0b4c]">
                  {formatCurrency(course.price)}
                </div>
                <div className="text-sm text-gray-600 mt-1">سعر الدورة</div>
              </div>
              
              <button
                onClick={() => onAddToCart(course)}
                className="w-full bg-[#7b0b4c] text-white py-3 rounded-lg font-semibold hover:bg-[#5e0839] transition-colors"
              >
                أضف إلى السلة
              </button>
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
    </div>
  );
}