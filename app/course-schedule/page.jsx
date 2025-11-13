"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ==========================
   Toast Component (Custom)
========================== */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-[#7b0b4c]",
  };

  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 text-white rounded-xl shadow-lg z-[9999] text-sm md:text-base transition-all duration-500 animate-fadeInUp ${colors[type]}`}
    >
      {message}
    </div>
  );
}

/* ==========================
   Main Page Component
========================== */
export default function CourseSchedule() {
  const router = useRouter();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredCourses(
        courses.filter((course) => course.category === selectedCategory)
      );
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  async function checkAdminStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setIsAdmin(true);
  }

  async function fetchCourses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ خطأ في جلب الدورات:", error);
      showToast("فشل في تحميل الدورات", "error");
    } else {
      setCourses(data || []);
      const uniqueCats = [
        ...new Set(data.map((c) => c.category).filter(Boolean)),
      ];
      setCategories(uniqueCats);
    }
    setLoading(false);
  }

  async function updateCourseSchedule(courseId, updates) {
    const { error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) {
      console.error("❌ خطأ في التحديث:", error);
      showToast("حدث خطأ أثناء التحديث", "error");
    } else {
      setCourses(
        courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
      );
      setEditingCourse(null);
      showToast("تم تحديث الجدول بنجاح ✅", "success");
    }
  }

  const toggleCourse = (id) =>
    setExpandedCourse(expandedCourse === id ? null : id);

  const handleEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course.id);
  };

  const handleSave = (id) => {
    const c = courses.find((x) => x.id === id);
    if (c)
      updateCourseSchedule(id, {
        level: c.level,
        duration: c.duration,
        schedule: c.schedule,
      });
  };

  const handleCancel = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleInputChange = (id, field, value) =>
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ✅ Header */}
      <Header />

      {/* ✅ Hero Section */}
      <section
        className="relative bg-cover bg-center bg-fixed py-20 text-white text-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(123, 11, 76, 0.8), rgba(123, 11, 76, 0.9)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          📅 جدول الدورات القادمة
        </h1>
        <p className="text-xl md:text-2xl mb-6">
          يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
        </p>
        <p className="max-w-3xl mx-auto text-lg opacity-90">
          قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد إنعقاد
          جميع الدورات المتعلقة به.
        </p>
      </section>

      {/* ✅ محتوى الصفحة */}
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* قائمة الفئات */}
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              🎯 اختر مجال الدورات
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#7b0b4c] rounded-xl text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none transition-all text-lg"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* حالة التحميل */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-16 w-16 border-b-2 border-[#7b0b4c] mx-auto rounded-full"></div>
              <p className="text-gray-600 mt-4 text-lg">جاري تحميل الدورات...</p>
            </div>
          )}

          {/* قائمة الدورات */}
          {!loading && (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredCourses.length === 0 ? (
                <div className="text-center bg-white py-12 rounded-2xl shadow">
                  <div className="text-6xl mb-2">📭</div>
                  <p className="text-gray-600">لا توجد دورات حالياً</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl shadow transition hover:shadow-lg overflow-hidden"
                  >
                    <div
                      className="p-6 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          📘 {course.title}
                        </h3>
                        <p className="text-gray-600">{course.description}</p>
                      </div>
                      <div
                        className={`transition-transform duration-300 ${
                          expandedCourse === course.id ? "rotate-180" : ""
                        }`}
                      >
                        ⬇️
                      </div>
                    </div>

                    <div
                      className={`transition-all overflow-hidden duration-500 ${
                        expandedCourse === course.id
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-6 border-t bg-gray-50">
                        {editingCourse === course.id ? (
                          <>
                            <div className="grid md:grid-cols-3 gap-4">
                              {["level", "duration", "schedule"].map((f) => (
                                <input
                                  key={f}
                                  type="text"
                                  placeholder={f}
                                  value={course[f] || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      course.id,
                                      f,
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7b0b4c]"
                                />
                              ))}
                            </div>
                            <div className="flex justify-end mt-4 gap-3">
                              <button
                                onClick={handleCancel}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleSave(course.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg"
                              >
                                حفظ
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="grid md:grid-cols-3 gap-4 text-center">
                            <div>
                              🎯 <p>{course.level || "غير محدد"}</p>
                            </div>
                            <div>
                              ⏰ <p>{course.duration || "غير محددة"}</p>
                            </div>
                            <div>
                              📅 <p>{course.schedule || "غير محدد"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
}

/* ✨ Animation (Tailwind) */
const style = document?.createElement?.("style");
if (style) {
  style.innerHTML = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeInUp { animation: fadeInUp 0.4s ease-out; }
  `;
  document.head.appendChild(style);
}
