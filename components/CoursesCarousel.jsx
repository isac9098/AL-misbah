"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useApp } from "../app/context/AppContext";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Toast مخصص ومحسّن
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
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

// -------- بطاقة الدورة --------
function CourseCard({ course, onClick, formatCurrency }) {
  const fallback = "https://source.unsplash.com/400x300/?education,course";
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-[#7b0b4c]/30 group w-full"
    >
      <img
        src={course.image || fallback}
        alt={course.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => (e.currentTarget.src = fallback)}
      />
      <div className="p-5">
        <h3 className="text-xl font-bold text-[#7b0b4c] mb-3 group-hover:text-[#5e0839] transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p
          className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3"
        >
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {course.price && course.price !== course.discount && (
              <span className="line-through text-gray-400 text-sm mr-2">
                {formatCurrency(parseFloat(course.price.replace(/[^\d.]/g, "") || 0))}
              </span>
            )}
            <span className="font-bold text-[#7b0b4c] text-lg">
              {formatCurrency(parseFloat(course.discount?.replace(/[^\d.]/g, "") || course.price?.replace(/[^\d.]/g, "") || 0))}
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {course.category}
          </span>
        </div>
      </div>
    </div>
  );
}

// -------- النافذة المنبثقة لتفاصيل الدورة --------
function CoursePopup({ course, onClose, onAddToCart }) {
  const { formatCurrency } = useApp();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const fallbackImage = "https://source.unsplash.com/800x450/?education,course";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl transition-colors"
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
          <div className="mb-6">
            <img
              src={course.image || fallbackImage}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => (e.currentTarget.src = fallbackImage)}
            />
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">معلومات الدورة</h3>
              <div className="space-y-3 text-sm">
                {course.category && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">التصنيف:</span>
                    <span className="text-[#7b0b4c] font-medium bg-gray-50 px-3 py-1 rounded-full text-xs">
                      {course.category}
                    </span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">المدة:</span>
                    <span className="text-gray-800 font-medium">{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">المستوى:</span>
                    <span className="text-gray-800 font-medium">{course.level}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-[#7b0b4c] mb-2">
                  {formatCurrency(parseFloat(course.discount?.replace(/[^\d.]/g, "") || course.price?.replace(/[^\d.]/g, "") || 0))}
                </div>
                {course.price && course.price !== course.discount && (
                  <div className="text-lg text-gray-500 line-through mb-1">
                    {formatCurrency(parseFloat(course.price.replace(/[^\d.]/g, "") || 0))}
                  </div>
                )}
                <div className="text-sm text-gray-600">سعر الدورة</div>
              </div>
              
              <button
                onClick={() => onAddToCart(course)}
                className="w-full bg-[#7b0b4c] text-white py-3 rounded-lg font-semibold hover:bg-[#5e0839] transition-colors shadow-md hover:shadow-lg"
              >
                أضف إلى السلة
              </button>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="border-t border-gray-200 pt-4">
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

// -------- المكون الرئيسي --------
export default function CoursesCarousel() {
  const { formatCurrency } = useApp();
  const [categories, setCategories] = useState(["الكل"]);
  const [activeTab, setActiveTab] = useState("الكل");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // جلب البيانات من Supabase
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("خطأ في جلب البيانات:", error);
    } else {
      const processed = data.map((c) =>
        c.title?.toLowerCase().includes("ccna")
          ? { ...c, category: "مهارات الحاسوب" }
          : c
      );
      setCourses(processed);
      const cats = Array.from(new Set(processed.map((c) => c.category))).filter(
        Boolean
      );
      setCategories(["الكل", ...cats]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
    const savedQuery = localStorage.getItem("searchQuery");
    if (savedQuery) {
      setActiveTab("الكل");
      setSearchFilter(savedQuery.toLowerCase());
      localStorage.removeItem("searchQuery");
    }

    const channel = supabase
      .channel("courses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchCourses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredCourses =
    activeTab === "الكل"
      ? courses.filter((c) => c.title.toLowerCase().includes(searchFilter))
      : courses
          .filter((c) => c.category === activeTab)
          .filter((c) => c.title.toLowerCase().includes(searchFilter));

  // ✅ دوال التصفح بالأسهم - بعد تعريف filteredCourses
  const nextCourse = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === filteredCourses.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevCourse = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? filteredCourses.length - 1 : prevIndex - 1
    );
  };

  // ✅ التصبح بالسهام على الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextCourse();
      } else if (e.key === 'ArrowLeft') {
        prevCourse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCourses.length]);

  // ✅ إعادة تعيين الفهرس عند تغيير التبويب أو البحث
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab, searchFilter]);

  // دالة إضافة الدورة للسلة
  const addToCart = (course) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!currentCart.find((c) => c.id === course.id)) {
      currentCart.push(course);
      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cartUpdated"));
      showToast("تمت إضافة الدورة إلى السلة بنجاح!", "success");
    } else {
      showToast("هذه الدورة موجودة بالفعل في السلة!", "warning");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="courses-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 text-right">
          تصفّح <span className="text-[#7b0b4c]">الدورات</span> الأكثر طلبًا
        </h2>

        {/* ✅ Dropdown في الهاتف */}
        <div className="mb-10">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setSearchFilter("");
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7b0b4c] focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* أزرار الفئات للشاشات الكبيرة */}
          <div className="hidden sm:flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setSearchFilter("");
                }}
                className={`px-5 py-2.5 rounded-full text-sm md:text-base transition-all duration-300 border ${
                  activeTab === cat
                    ? "bg-[#7b0b4c] text-white border-[#7b0b4c] shadow-lg shadow-[#7b0b4c]/20"
                    : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-[#7b0b4c] hover:text-[#7b0b4c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ منطقة عرض الدورة الواحدة مع الأسهم */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b0b4c]"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">لا توجد دورات مطابقة للبحث</p>
            <p className="text-gray-400 text-sm mt-2">جرب تغيير الفئة أو كلمات البحث</p>
          </div>
        ) : (
          <div className="relative">
            {/* ✅ زر السابق */}
            <button
              onClick={prevCourse}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:border-[#7b0b4c] group"
              aria-label="الدورة السابقة"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-[#7b0b4c] transition-colors" />
            </button>

            {/* ✅ منطقة عرض الدورة الحالية */}
            <div className="mx-16 flex justify-center">
              <div className="w-full max-w-md transform transition-all duration-500 ease-in-out">
                {filteredCourses[currentIndex] && (
                  <CourseCard
                    key={filteredCourses[currentIndex].id}
                    course={filteredCourses[currentIndex]}
                    formatCurrency={formatCurrency}
                    onClick={() => setSelectedCourse(filteredCourses[currentIndex])}
                  />
                )}
              </div>
            </div>

            {/* ✅ زر التالي */}
            <button
              onClick={nextCourse}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:border-[#7b0b4c] group"
              aria-label="الدورة التالية"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-[#7b0b4c] transition-colors" />
            </button>

            {/* ✅ مؤشر التقدم */}
            <div className="flex justify-center mt-8 space-x-2">
              {filteredCourses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-[#7b0b4c] scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`انتقل إلى الدورة ${index + 1}`}
                />
              ))}
            </div>

            {/* ✅ عداد الدورات */}
            <div className="text-center mt-4 text-sm text-gray-500">
              {currentIndex + 1} من {filteredCourses.length}
            </div>
          </div>
        )}
      </div>

      {/* النافذة المنبثقة لتفاصيل الدورة */}
      {selectedCourse && (
        <CoursePopup 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)}
          onAddToCart={addToCart}
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