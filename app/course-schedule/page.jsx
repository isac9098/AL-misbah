"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCalendarDay, 
  FaSearch, 
  FaChevronDown, 
  FaChevronUp,
  FaBook,
  FaGraduationCap,
  FaTimes
} from "react-icons/fa";
import { 
  IoBook, 
  IoLanguage, 
  IoCodeSlash, 
  IoScale 
} from "react-icons/io5";

import Footer from "@/components/Footer";

/* =========================  
      Small reusable Toast  
========================= */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-[#7b0b4c]";

  return (
    <div
      className={`${bg} text-white fixed left-1/2 -translate-x-1/2 top-20 z-50 px-5 py-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-3`}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/* =========================  
      Icons Mapping  
========================= */

const ICONS = {
  category: <FaBook className="inline ml-2" />,
  calendar: <FaCalendarAlt className="inline ml-2" />,
  clock: <FaClock className="inline ml-2" />,
  days: <FaCalendarDay className="inline ml-2" />,
  search: <FaSearch className="inline ml-2" />,
  expand: <FaChevronDown className="inline" />,
  collapse: <FaChevronUp className="inline" />,
};

const categoryMeta = {
  "قانون": { 
    icon: <IoScale className="text-lg" />, 
    color: "bg-red-50 text-red-700" 
  },
  "لغة": { 
    icon: <IoLanguage className="text-lg" />, 
    color: "bg-blue-50 text-blue-700" 
  },
  "تقنية": { 
    icon: <IoCodeSlash className="text-lg" />, 
    color: "bg-green-50 text-green-700" 
  },
  default: { 
    icon: <IoBook className="text-lg" />, 
    color: "bg-gray-50 text-gray-700" 
  },
};

/* =========================  
      PAGE  
========================= */

export default function CoursesSchedule() {
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredCourses(
        courses.filter((c) => c.category === selectedCategory)
      );
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        showToast("فشل في تحميل الدورات", "error");
      } else {
        setCourses(data || []);
        const uniqueCategories = [
          ...new Set((data || []).map((c) => c.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        if (!data || data.length === 0)
          showToast("لا توجد دورات متاحة حالياً", "warning");
        else showToast(`تم تحميل ${data.length} دورة`, "success");
      }
    } catch {
      showToast("حدث خطأ غير متوقع", "error");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const toggleCourse = (id) =>
    setExpandedCourse(expandedCourse === id ? null : id);

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">

      {/* Global animations */}
      <style jsx>{`
        .accordion-content {
          transition: max-height 320ms cubic-bezier(.2,.9,.3,1), opacity 260ms ease;
        }
        .gradient-divider {
          background: linear-gradient(
            90deg,
            rgba(123,11,76,0.0),
            rgba(123,11,76,0.12),
            rgba(94,8,57,0.0)
          );
          height: 2px;
        }
      `}</style>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7b0b4c] to-[#5e0839]">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ textShadow: "0 6px 18px rgba(0,0,0,0.25)" }}
            >
              <span className="inline-flex items-center justify-center">
                <FaCalendarAlt className="ml-3" />
                جدول الدورات القادمة
              </span>
            </h1>

            <p className="text-lg sm:text-xl opacity-95 max-w-2xl mx-auto leading-relaxed">
              يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة — اختر فئة وشاهد التفاصيل داخل كل دورة.
            </p>
          </div>
        </div>

        <div className="absolute left-4 top-4 opacity-20 text-6xl select-none pointer-events-none">
          <FaGraduationCap />
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="flex-grow py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">

          {/* ================= CATEGORY SELECTOR ================= */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <label className="block text-lg font-semibold text-gray-800 mb-3 text-center flex items-center justify-center">
                <FaSearch className="ml-2" />
                اختر مجال الدورات
              </label>

              <div className="flex gap-3 items-start">
                {/* LEFT SIDE: Dropdown Select */}
                <div className="flex-1" ref={dropdownRef}>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] focus:border-transparent outline-none text-gray-800 text-right flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-400">
                        {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                      <span>
                        {selectedCategory || "اختر فئة الدورات"}
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        <button
                          onClick={() => {
                            setSelectedCategory("");
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-700 transition-colors flex items-center justify-between"
                        >
                          جميع الدورات
                          <FaTimes className="text-gray-400" />
                        </button>
                        {categories.map((cat, idx) => {
                          const meta = categoryMeta[cat] || categoryMeta.default;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-right px-4 py-3 hover:bg-gray-50 flex items-center justify-between gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-md flex items-center justify-center ${meta.color}`}
                                >
                                  {meta.icon}
                                </div>
                                <span className="text-gray-900">{cat}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: Category info card */}
                <div className="w-80 hidden sm:block">
                  <div className="p-4 border rounded-lg h-full bg-gradient-to-br from-white to-gray-50">
                    <h4 className="text-sm text-gray-600">تفاصيل الفئة</h4>

                    {selectedCategory ? (
                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md flex items-center justify-center bg-[#f8edf0] text-[#7b0b4c] text-lg">
                            {(categoryMeta[selectedCategory] || categoryMeta.default).icon}
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-gray-900 text-lg">
                              {selectedCategory}
                            </div>

                            <div className="text-gray-500 text-sm">
                              عدد الدورات:{" "}
                              {courses.filter((c) => c.category === selectedCategory).length}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={() => setSelectedCategory("")}
                            className="w-full text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <FaTimes />
                            مسح الفئة
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-gray-500 text-right">
                        اختر فئة لعرض التفاصيل هنا.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full border-4 border-[#7b0b4c] border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل الدورات...</p>
            </div>
          )}

          {/* ================= COURSES ================= */}
          {!loading && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#7b0b4c] mb-2 flex items-center justify-center">
                  <FaBook className="ml-2" />
                  الدورات المتاحة
                </h2>

                {selectedCategory && (
                  <p className="text-gray-600">
                    في مجال{" "}
                    <span className="font-semibold text-[#7b0b4c]">
                      {selectedCategory}
                    </span>
                  </p>
                )}

                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    إجمالي الدورات: {filteredCourses.length}
                  </span>
                </div>
              </div>

              {/* If no courses */}
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-5xl mb-4 opacity-50">
                    <FaBook />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    لا توجد دورات متاحة
                  </h3>
                  <p className="text-gray-500">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => {
                    const meta = categoryMeta[course.category] || categoryMeta.default;

                    return (
                      <article
                        key={course.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      >
                        {/* HEADER */}
                        <header
                          className="p-4 cursor-pointer flex items-start justify-between gap-4"
                          onClick={() => toggleCourse(course.id)}
                          aria-expanded={expandedCourse === course.id}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`w-12 h-12 rounded-md flex items-center justify-center ${meta.color}`}
                            >
                              {meta.icon}
                            </div>

                            <div className="flex-1 text-right">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {course.description}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`transform transition-transform duration-300 ${
                              expandedCourse === course.id ? "rotate-180" : ""
                            }`}
                          >
                            <span className="text-xl text-gray-400">
                              {expandedCourse === course.id
                                ? <FaChevronUp />
                                : <FaChevronDown />
                              }
                            </span>
                          </div>
                        </header>

                        <div className="gradient-divider" />

                        {/* CONTENT */}
                        <div
                          className="accordion-content bg-gray-50 px-4"
                          style={{
                            maxHeight: expandedCourse === course.id ? 280 : 0,
                            opacity: expandedCourse === course.id ? 1 : 0,
                          }}
                          aria-hidden={expandedCourse !== course.id}
                        >
                          <div className="p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-right table-auto">
                                <thead>
                                  <tr className="text-sm text-gray-600">
                                    <th className="p-2 flex items-center justify-end gap-2">
                                      <FaCalendarAlt />
                                      التاريخ
                                    </th>
                                    <th className="p-2 flex items-center justify-end gap-2">
                                      <FaClock />
                                      الموعد
                                    </th>
                                    <th className="p-2 flex items-center justify-end gap-2">
                                      <FaCalendarDay />
                                      أيام الإنعقاد
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  <tr className="bg-white">
                                    <td className="p-3 border">
                                      {course.start_date
                                        ? formatDate(course.start_date)
                                        : course.date || "سيعلن لاحقاً"}
                                    </td>

                                    <td className="p-3 border">
                                      {course.schedule || "غير محدد"}
                                    </td>

                                    <td className="p-3 border">
                                      {course.days || "سيعلن لاحقاً"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}