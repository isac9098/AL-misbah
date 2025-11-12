"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useApp } from "../app/context/AppContext";

// إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Toast مخصص ومحسّن
function Toast({ message, onClose }) {
  // تحديد اللون حسب نوع الرسالة
  const getToastStyle = () => {
    if (message.includes("✅")) {
      return "bg-green-100 border-green-500 text-green-700";
    } else if (message.includes("⚠️")) {
      return "bg-yellow-100 border-yellow-500 text-yellow-700";
    } else if (message.includes("❌")) {
      return "bg-red-100 border-red-500 text-red-700";
    }
    return "bg-white border-gray-300 text-gray-800";
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 top-8 flex justify-center z-[1000] px-4">
      <div
        className={`shadow-xl border font-semibold px-6 py-3 rounded-xl animate-fade-in text-center ${getToastStyle()}`}
      >
        {message}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
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
      className="cursor-pointer bg-white rounded-xl border hover:shadow-lg transition overflow-hidden"
    >
      <img
        src={course.image || fallback}
        alt={course.title}
        className="w-full h-40 object-cover"
        onError={(e) => (e.currentTarget.src = fallback)}
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#7a1353] mb-2">
          {course.title}
        </h3>
        <p
          className="text-sm text-gray-600 mb-3"
          style={{ minHeight: "2.4rem" }}
        >
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="line-through text-gray-400 text-sm mr-2">
              {isNaN(course.price)
                ? course.price
                : formatCurrency(course.price)}
            </span>
            <span className="font-bold text-[#7a1353]">
              {isNaN(course.discount)
                ? course.discount
                : formatCurrency(course.discount)}
            </span>
          </div>
        </div>
      </div>
    </div>
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
  const [toast, setToast] = useState(null); // 👈 متغير لتخزين رسالة التوست

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // دالة إضافة الدورة للسلة
  const addToCart = (course) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!currentCart.find((c) => c.id === course.id)) {
      currentCart.push(course);
      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cartUpdated"));
      showToast("✅ تمت إضافة الدورة إلى السلة!");
    } else {
      showToast("⚠️ الدورة موجودة بالفعل في السلة.");
    }
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

  const visible = filteredCourses.slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
          تصفّح <span className="text-[#7a1353]">الدورات</span> الأكثر طلبًا
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
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* أزرار الفئات للشاشات الكبيرة */}
          <div className="hidden sm:flex flex-wrap items-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setSearchFilter("");
                }}
                className={`px-4 py-2 rounded-full text-sm md:text-base transition border ${
                  activeTab === cat
                    ? "bg-[#7a1353] text-white border-[#7a1353] shadow"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* عرض الدورات */}
        {loading ? (
          <p className="text-center text-gray-500">جاري تحميل الدورات...</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-500">
            لا توجد دورات مطابقة للبحث.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                formatCurrency={formatCurrency}
                onClick={() => setSelectedCourse(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الدورة */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <img
              src={
                selectedCourse.image ||
                "https://source.unsplash.com/800x450/?education,course"
              }
              alt={selectedCourse.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <h3 className="text-2xl font-bold mb-2 text-[#7a1353]">
              {selectedCourse.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              التصنيف:{" "}
              <span className="font-medium">{selectedCourse.category}</span>
            </p>
            <p className="text-sm text-gray-500 mb-2">
              السعر:{" "}
              <span className="font-medium">
                {formatCurrency(
                  parseFloat(selectedCourse.discount.replace(/[^\d.]/g, ""))
                )}
              </span>
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {selectedCourse.description}
            </p>

            <button
              onClick={() => addToCart(selectedCourse)}
              className="w-full bg-[#7a1353] text-white py-2 rounded-lg mt-4"
            >
              سجل في الدورة
            </button>
          </div>
        </div>
      )}

      {/* ✅ عرض Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
