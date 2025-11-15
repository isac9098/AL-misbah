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
      PAGE  
========================= */

export default function CoursesSchedule() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        console.error("فشل في تحميل الدورات:", error);
      } else {
        // استخدام البيانات مباشرة من الحقول الجديدة
        setCourses(data || []);
        const uniqueCategories = [
          ...new Set(data.map((c) => c.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("حدث خطأ غير متوقع:", error);
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
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">

      <style jsx>{`
        .accordion-content {
          transition: max-height 320ms cubic-bezier(.2,.9,.3,1), opacity 260ms ease;
        }
      `}</style>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-[#7a1353] min-h-[50vh] flex items-center">
        {/* تأثيرات الخلفية */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                <FaCalendarAlt className="text-3xl text-white" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              جدول الدورات القادمة
            </h1>

            <p className="text-xl sm:text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed font-light">
              اكتشف مواعيد انعقاد الدورات التي تهمك بكل سهولة ويسر
            </p>
          </div>
        </div>

        <div className="absolute left-8 top-8 opacity-10 text-8xl">
          <FaGraduationCap />
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="flex-grow py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">

          {/* ================= CATEGORY SELECTOR ================= */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#f8e8f1] rounded-full flex items-center justify-center hover:bg-[#f0d4e4] transition-all duration-300">
                    <FaSearch className="text-[#7a1353] text-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    اختر مجال الدورات
                  </h2>
                </div>
                <p className="text-gray-600">اختر التخصص الذي تريد استعراض دوراته</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* LEFT SIDE: Dropdown Select */}
                <div className="flex-1 w-full" ref={dropdownRef}>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none text-gray-800 text-right flex items-center justify-between bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    >
                      <span className="text-gray-400">
                        {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                      <span className="text-lg">
                        {selectedCategory || "اختر فئة الدورات"}
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                        <button
                          onClick={() => {
                            setSelectedCategory("");
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-right px-6 py-4 hover:bg-gray-50 border-b border-gray-100 text-gray-700 transition-colors flex items-center justify-between text-lg hover:text-[#7a1353]"
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
                              className="w-full text-right px-6 py-4 hover:bg-gray-50 flex items-center justify-between gap-4 border-b border-gray-100 last:border-b-0 transition-colors hover:text-[#7a1353]"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.color} hover:scale-110 transition-transform duration-200`}
                                >
                                  {meta.icon}
                                </div>
                                <span className="text-gray-900 text-lg">{cat}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: Category info card */}
                <div className="w-full lg:w-80">
                  <div className="p-6 border-2 border-gray-100 rounded-xl h-full bg-white shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الفئة</h4>

                    {selectedCategory ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#f8e8f1] text-[#7a1353] text-xl hover:bg-[#f0d4e4] transition-all duration-300">
                            {(categoryMeta[selectedCategory] || categoryMeta.default).icon}
                          </div>

                          <div className="text-right flex-1">
                            <div className="font-bold text-gray-900 text-xl">
                              {selectedCategory}
                            </div>

                            <div className="text-gray-600">
                              {courses.filter((c) => c.category === selectedCategory).length} دورة
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedCategory("")}
                          className="w-full text-gray-700 border-2 border-gray-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:border-[#7a1353] hover:text-[#7a1353] transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <FaTimes />
                          مسح الفئة
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <IoBook className="text-4xl mx-auto mb-3 opacity-50" />
                        <p>اختر فئة لعرض التفاصيل</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#7a1353] border-t-transparent animate-spin mb-6"></div>
              <p className="text-gray-600 text-lg">جاري تحميل الدورات...</p>
            </div>
          )}

          {/* ================= COURSES ================= */}
          {!loading && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-[#f8e8f1] rounded-full flex items-center justify-center hover:bg-[#f0d4e4] transition-all duration-300">
                    <FaBook className="text-[#7a1353] text-xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    الدورات المتاحة
                  </h2>
                </div>

                {selectedCategory && (
                  <p className="text-gray-600 text-lg mb-4">
                    في مجال{" "}
                    <span className="font-semibold text-[#7a1353]">
                      {selectedCategory}
                    </span>
                  </p>
                )}

                <div className="inline-flex items-center px-6 py-3 bg-white rounded-full text-gray-700 shadow-sm border border-gray-200 text-lg hover:border-[#7a1353] transition-colors">
                  إجمالي الدورات: <span className="font-bold text-[#7a1353] mr-2">{filteredCourses.length}</span>
                </div>
              </div>

              {/* If no courses */}
              {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-[#f8e8f1] transition-all duration-300">
                    <FaBook className="text-4xl text-gray-400 hover:text-[#7a1353] transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                    لا توجد دورات متاحة
                  </h3>
                  <p className="text-gray-500 text-lg">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCourses.map((course) => {
                    const meta = categoryMeta[course.category] || categoryMeta.default;

                    return (
                      <article
                        key={course.id}
                        className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-[#7a1353]/20 transition-all duration-300 overflow-hidden"
                      >
                        {/* HEADER */}
                        <header
                          className="p-6 cursor-pointer flex items-start justify-between gap-6"
                          onClick={() => toggleCourse(course.id)}
                          aria-expanded={expandedCourse === course.id}
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-14 h-14 rounded-xl flex items-center justify-center ${meta.color} flex-shrink-0 hover:scale-105 transition-transform duration-200`}
                            >
                              {meta.icon}
                            </div>

                            <div className="flex-1 text-right">
                              <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#7a1353] transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-gray-600 leading-relaxed text-lg">
                                {course.description}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`transform transition-transform duration-300 flex-shrink-0 ${
                              expandedCourse === course.id ? "rotate-180" : ""
                            }`}
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#f8e8f1] transition-all duration-300">
                              {expandedCourse === course.id
                                ? <FaChevronUp className="text-gray-600 text-lg hover:text-[#7a1353]" />
                                : <FaChevronDown className="text-gray-600 text-lg hover:text-[#7a1353]" />
                              }
                            </div>
                          </div>
                        </header>

                        {/* CONTENT */}
                        <div
                          className="accordion-content bg-gray-50 border-t border-gray-200"
                          style={{
                            maxHeight: expandedCourse === course.id ? 400 : 0,
                            opacity: expandedCourse === course.id ? 1 : 0,
                          }}
                          aria-hidden={expandedCourse !== course.id}
                        >
                          <div className="p-4 md:p-8">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                              {/* تصميم متجاوب للهواتف */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {/* التاريخ */}
                                <div className="text-center p-3 md:p-4 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20 hover:bg-[#f0d4e4] transition-all duration-300">
                                  <div className="flex justify-center mb-2 md:mb-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                      <FaCalendarAlt className="text-[#7a1353] text-lg md:text-xl" />
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">التاريخ</div>
                                  <div className="font-bold text-gray-800 text-sm md:text-lg leading-tight">
                                    {course.start_date
                                      ? formatDate(course.start_date)
                                      : "سيعلن لاحقاً"}
                                  </div>
                                </div>

                                {/* الموعد */}
                                <div className="text-center p-3 md:p-4 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20 hover:bg-[#f0d4e4] transition-all duration-300">
                                  <div className="flex justify-center mb-2 md:mb-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                      <FaClock className="text-[#7a1353] text-lg md:text-xl" />
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">الموعد</div>
                                  <div className="font-bold text-gray-800 text-sm md:text-lg leading-tight">
                                    {course.schedule || "غير محدد"}
                                  </div>
                                </div>

                                {/* أيام الإنعقاد */}
                                <div className="text-center p-3 md:p-4 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20 hover:bg-[#f0d4e4] transition-all duration-300">
                                  <div className="flex justify-center mb-2 md:mb-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                      <FaCalendarDay className="text-[#7a1353] text-lg md:text-xl" />
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">أيام الإنعقاد</div>
                                  <div className="font-bold text-gray-800 text-sm md:text-lg leading-tight">
                                    {course.days || "سيعلن لاحقاً"}
                                  </div>
                                </div>
                              </div>

                              {/* معلومات إضافية - اختيارية */}
                              {(course.instructor || course.duration) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                  {course.instructor && (
                                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="text-xs md:text-sm text-gray-600 mb-1">المدرب</div>
                                      <div className="font-bold text-gray-800 text-sm md:text-base">
                                        {course.instructor}
                                      </div>
                                    </div>
                                  )}
                                  {course.duration && (
                                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                      <div className="text-xs md:text-sm text-gray-600 mb-1">المدة</div>
                                      <div className="font-bold text-gray-800 text-sm md:text-base">
                                        {course.duration}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* تصميم أفقي للهواتف */}
                              <div className="md:hidden mt-4">
                                <div className="overflow-x-auto">
                                  <div className="flex space-x-4 space-x-reverse min-w-max">
                                    <div className="flex-shrink-0 w-48 text-center p-3 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20">
                                      <FaCalendarAlt className="text-[#7a1353] text-lg mx-auto mb-2" />
                                      <div className="text-xs text-gray-600 mb-1">التاريخ</div>
                                      <div className="font-bold text-gray-800 text-sm">
                                        {course.start_date
                                          ? formatDate(course.start_date)
                                          : "سيعلن لاحقاً"}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 w-48 text-center p-3 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20">
                                      <FaClock className="text-[#7a1353] text-lg mx-auto mb-2" />
                                      <div className="text-xs text-gray-600 mb-1">الموعد</div>
                                      <div className="font-bold text-gray-800 text-sm">
                                        {course.schedule || "غير محدد"}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 w-48 text-center p-3 bg-[#f8e8f1] rounded-lg border border-[#7a1353]/20">
                                      <FaCalendarDay className="text-[#7a1353] text-lg mx-auto mb-2" />
                                      <div className="text-xs text-gray-600 mb-1">أيام الإنعقاد</div>
                                      <div className="font-bold text-gray-800 text-sm">
                                        {course.days || "سيعلن لاحقاً"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
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