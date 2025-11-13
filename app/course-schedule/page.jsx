"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient"; // مسار نسبي صحيح
import Header from "../components/Header";
import Footer from "../components/Footer";

// قائمة المشرفين
const ADMINS = [
  "atag4052@gmail.com",
  "fayhaalfatihhamida@gmail.com",
  "alfathhamid599@gmail.com",
];

// 🧩 مكون Toast بدون مكتبة خارجية
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-[#7b0b4c]";

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 ${bgColor} text-white
        px-5 py-3 rounded-xl shadow-lg text-sm md:text-base z-[9999] transition-all duration-500`}
      style={{ top: "70px" }}
    >
      {message}
    </div>
  );
}

export default function CoursesSchedule() {
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

  // التحقق من تسجيل الدخول وحالة المشرف
  useEffect(() => {
    checkAdminStatus();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = courses.filter(
        (course) => course.category === selectedCategory
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  async function checkAdminStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && ADMINS.includes(user.email)) {
      setIsAdmin(true);
    }
  }

  async function fetchCourses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ خطأ في جلب الدورات:", error);
      showToast("❌ فشل في تحميل الدورات", "error");
    } else {
      setCourses(data || []);
      const uniqueCategories = [
        ...new Set(data.map((course) => course.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  }

  async function updateCourseSchedule(courseId, updates) {
    const { error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) {
      console.error("❌ خطأ في تحديث الجدول:", error);
      showToast("❌ حدث خطأ أثناء التحديث", "error");
    } else {
      setCourses(
        courses.map((course) =>
          course.id === courseId ? { ...course, ...updates } : course
        )
      );
      setEditingCourse(null);
      showToast("✅ تم تحديث الجدول بنجاح!", "success");
    }
  }

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course.id);
  };

  const handleSave = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      updateCourseSchedule(courseId, {
        level: course.level,
        duration: course.duration,
        schedule: course.schedule,
      });
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleInputChange = (courseId, field, value) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Header />

      {/* الهيرو */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(123, 11, 76, 0.7), rgba(123, 11, 76, 0.8)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            📅 جدول الدورات القادمة
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
          </p>
          <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد
            إنعقاد جميع الدورات المتعلقة به
          </p>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          {/* قائمة الفئات المنسدلة */}
          <div className="max-w-2xl mx-auto mb-12">
            <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
              🎯 اختر مجال الدورات
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#7b0b4c] rounded-xl text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] focus:border-transparent outline-none transition-all duration-300 text-lg"
            >
              <option value="">جميع الفئات</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* حالة التحميل */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7b0b4c] mx-auto"></div>
              <p className="text-gray-600 mt-4 text-lg">جاري تحميل الدورات...</p>
            </div>
          )}

          {/* قائمة الدورات */}
          {!loading && (
            <div className="max-w-4xl mx-auto">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    لا توجد دورات متاحة
                  </h3>
                  <p className="text-gray-500">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200"
                    >
                      {/* عنوان الدورة */}
                      <div
                        className="p-6 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleCourse(course.id)}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-2xl">📖</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{course.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 space-x-reverse">
                          {isAdmin && (
                            <button
                              onClick={(e) => handleEdit(course, e)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                            >
                              ✏️ تعديل
                            </button>
                          )}
                          <div
                            className={`transform transition-transform duration-300 ${
                              expandedCourse === course.id ? "rotate-180" : ""
                            }`}
                          >
                            <span className="text-2xl">⬇️</span>
                          </div>
                        </div>
                      </div>

                      {/* محتوى قابل للطي */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          expandedCourse === course.id
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                          {editingCourse === course.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🎯 المستوى
                                  </label>
                                  <input
                                    type="text"
                                    value={course.level || ""}
                                    onChange={(e) =>
                                      handleInputChange(course.id, "level", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                                    placeholder="مثال: مبتدئ - متوسط - متقدم"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ⏰ المدة
                                  </label>
                                  <input
                                    type="text"
                                    value={course.duration || ""}
                                    onChange={(e) =>
                                      handleInputChange(course.id, "duration", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                                    placeholder="مثال: 4 أسابيع - 30 ساعة"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 الموعد
                                  </label>
                                  <input
                                    type="text"
                                    value={course.schedule || ""}
                                    onChange={(e) =>
                                      handleInputChange(course.id, "schedule", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                                    placeholder="مثال: السبت والثلاثاء 6-8 مساءً"
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-3 space-x-reverse justify-end">
                                <button
                                  onClick={handleCancel}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleSave(course.id)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                  حفظ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="text-center">
                                <div className="text-3xl mb-2">🎯</div>
                                <h4 className="font-semibold text-gray-800 mb-2">المستوى</h4>
                                <p className="text-gray-600">{course.level || "غير محدد"}</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl mb-2">⏰</div>
                                <h4 className="font-semibold text-gray-800 mb-2">المدة الزمنية</h4>
                                <p className="text-gray-600">{course.duration || "غير محددة"}</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl mb-2">📅</div>
                                <h4 className="font-semibold text-gray-800 mb-2">موعد الإنعقاد</h4>
                                <p className="text-gray-600">{course.schedule || "غير محدد"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
