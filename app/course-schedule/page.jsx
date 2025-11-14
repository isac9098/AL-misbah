"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 🧩 مكون Toast بسيط
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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
      px-6 py-4 rounded-xl shadow-2xl text-base font-medium z-[9999] transition-all duration-500
      backdrop-blur-sm border border-white/20`}
      style={{ top: "80px" }}
    >
      <div className="flex items-center space-x-2 space-x-reverse">
        {type === "success" && <span>✅</span>}
        {type === "error" && <span>❌</span>}
        {type === "warning" && <span>⚠️</span>}
        <span>{message}</span>
      </div>
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
  const [user, setUser] = useState(null);

  // قائمة البريد الإلكتروني للمسؤولين المسموح لهم
  const adminEmails = [
    "admin@almisbah.com",
    "manager@almisbah.com", 
    "hr@almisbah.com"
  ];

  useEffect(() => {
    checkAuthStatus();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = courses.filter(course => course.category === selectedCategory);
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  // التحقق من حالة المصادقة والصلاحيات
  async function checkAuthStatus() {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("❌ خطأ في التحقق من المستخدم:", error);
        return;
      }

      if (currentUser) {
        setUser(currentUser);
        // التحقق إذا كان البريد الإلكتروني للمستخدم في قائمة المسؤولين
        if (adminEmails.includes(currentUser.email?.toLowerCase())) {
          setIsAdmin(true);
          showToast(`مرحباً ${currentUser.email} - وضع المسؤول مفعل`, "success");
        }
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
    }
  }

  async function fetchCourses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ خطأ في جلب الدورات:", error);
        showToast("❌ فشل في تحميل الدورات", "error");
      } else {
        setCourses(data || []);
        
        // استخراج الفئات الفريدة
        const uniqueCategories = [...new Set(data.map(course => course.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        if (data.length === 0) {
          showToast("⚠️ لا توجد دورات متاحة حالياً", "warning");
        }
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع", "error");
    }
    setLoading(false);
  }

  async function updateCourseSchedule(courseId, updates) {
    try {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", courseId);

      if (error) {
        console.error("❌ خطأ في تحديث الجدول:", error);
        showToast("❌ حدث خطأ أثناء التحديث", "error");
        return false;
      } else {
        // تحديث البيانات المحلية
        setCourses(courses.map(course => 
          course.id === courseId ? { ...course, ...updates } : course
        ));
        setEditingCourse(null);
        showToast("✅ تم تحديث جدول الدورة بنجاح!", "success");
        return true;
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع", "error");
      return false;
    }
  }

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleEdit = (course, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      showToast("⛔ ليس لديك صلاحية للتعديل", "error");
      return;
    }
    setEditingCourse(course.id);
  };

  const handleSave = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const success = await updateCourseSchedule(courseId, {
        level: course.level,
        duration: course.duration,
        schedule: course.schedule,
        start_date: course.start_date,
        end_date: course.end_date,
        instructor: course.instructor
      });
      
      if (success) {
        setEditingCourse(null);
      }
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    fetchCourses(); // إعادة تحميل البيانات الأصلية
  };

  const handleInputChange = (courseId, field, value) => {
    setCourses(courses.map(course => 
      course.id === courseId ? { ...course, [field]: value } : course
    ));
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    try {
      return new Date(dateString).toLocaleDateString('ar-EG');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header />
      
      {/* قسم الهيرو المحسن */}
      <section className="relative bg-gradient-to-r from-[#7b0b4c] to-[#9a2c6e] py-20 lg:py-24">
        <div 
          className="absolute inset-0 bg-black/20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80')",
            backgroundBlendMode: "overlay"
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
                🗓️ جدول الدورات القادمة
              </h1>
              <p className="text-xl lg:text-2xl mb-6 leading-relaxed font-medium">
                يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-white to-transparent mx-auto mb-6 rounded-full"></div>
              <p className="text-lg lg:text-xl opacity-95 leading-relaxed">
                قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد إنعقاد جميع الدورات المتعلقة به
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* قائمة الفئات المنسدلة */}
          <div className="max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <label className="block text-xl font-bold text-gray-800 mb-4 text-center">
                🎯 اختر مجال الدورات
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-6 py-4 border-2 border-[#7b0b4c] rounded-2xl text-gray-800 focus:ring-4 focus:ring-[#7b0b4c]/30 focus:border-[#7b0b4c] outline-none transition-all duration-300 text-lg font-medium bg-white shadow-sm hover:shadow-md"
              >
                <option value="">جميع الفئات</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* حالة التحميل */}
          {loading && (
            <div className="text-center py-16 lg:py-20">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#7b0b4c] mx-auto mb-6"></div>
              <p className="text-gray-600 text-xl font-medium">جاري تحميل الدورات...</p>
              <p className="text-gray-500 mt-2">يرجى الانتظار قليلاً</p>
            </div>
          )}

          {/* قائمة الدورات */}
          {!loading && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8 border border-gray-200">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#7b0b4c] text-center mb-2">
                  📚 الدورات المتاحة
                </h2>
                {selectedCategory && (
                  <p className="text-gray-700 text-lg text-center">
                    في مجال <span className="font-semibold text-[#7b0b4c]">{selectedCategory}</span>
                  </p>
                )}
                {isAdmin && (
                  <div className="text-center mt-4">
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      🛠️ وضع المسؤول مفعل
                    </span>
                  </div>
                )}
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="text-8xl mb-6">📭</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">لا توجد دورات متاحة</h3>
                  <p className="text-gray-500 text-lg">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:gap-8">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-200 hover:border-[#7b0b4c]/30"
                    >
                      {/* عنوان الدورة */}
                      <div
                        className="p-6 lg:p-8 cursor-pointer flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-300"
                        onClick={() => toggleCourse(course.id)}
                      >
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <div className="text-3xl bg-[#7b0b4c] text-white p-3 rounded-2xl">📖</div>
                          <div className="flex-1">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                💰 {course.price}
                              </span>
                              {course.discount && (
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  🎁 {course.discount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          {isAdmin && (
                            <button
                              onClick={(e) => handleEdit(course, e)}
                              className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-base font-medium shadow-md hover:shadow-lg flex items-center space-x-2 space-x-reverse"
                            >
                              <span>✏️</span>
                              <span>تعديل الجدول</span>
                            </button>
                          )}
                          <div className={`transform transition-transform duration-500 ${
                            expandedCourse === course.id ? 'rotate-180' : ''
                          }`}>
                            <div className="bg-[#7b0b4c] text-white p-3 rounded-xl shadow-md">
                              <span className="text-xl">⬇️</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* محتوى قابل للطي */}
                      <div className={`overflow-hidden transition-all duration-700 ${
                        expandedCourse === course.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="p-6 lg:p-8 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                          {editingCourse === course.id ? (
                            // وضع التعديل
                            <div className="space-y-6">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                                <h4 className="text-lg font-bold text-yellow-800 mb-4 text-center">
                                  🛠️ تعديل جدول الدورة
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      🎯 المستوى
                                    </label>
                                    <input
                                      type="text"
                                      value={course.level || ""}
                                      onChange={(e) => handleInputChange(course.id, 'level', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                      placeholder="مثال: مبتدئ - متوسط - متقدم"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      ⏰ المدة الزمنية
                                    </label>
                                    <input
                                      type="text"
                                      value={course.duration || ""}
                                      onChange={(e) => handleInputChange(course.id, 'duration', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                      placeholder="مثال: 4 أسابيع - 30 ساعة"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      👨‍🏫 المدرب
                                    </label>
                                    <input
                                      type="text"
                                      value={course.instructor || ""}
                                      onChange={(e) => handleInputChange(course.id, 'instructor', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                      placeholder="اسم المدرب"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      📅 تاريخ البدء
                                    </label>
                                    <input
                                      type="date"
                                      value={course.start_date || ""}
                                      onChange={(e) => handleInputChange(course.id, 'start_date', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      📅 تاريخ الانتهاء
                                    </label>
                                    <input
                                      type="date"
                                      value={course.end_date || ""}
                                      onChange={(e) => handleInputChange(course.id, 'end_date', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                    />
                                  </div>
                                  <div className="lg:col-span-2 xl:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                      🕒 جدول المواعيد
                                    </label>
                                    <input
                                      type="text"
                                      value={course.schedule || ""}
                                      onChange={(e) => handleInputChange(course.id, 'schedule', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-300 bg-white"
                                      placeholder="مثال: السبت والثلاثاء 6-8 مساءً"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-4 space-x-reverse justify-end">
                                <button
                                  onClick={handleCancel}
                                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                                >
                                  إلغاء التعديل
                                </button>
                                <button
                                  onClick={() => handleSave(course.id)}
                                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center space-x-2 space-x-reverse"
                                >
                                  <span>💾</span>
                                  <span>حفظ التغييرات</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            // وضع العرض - تصميم جدول احترافي
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
                                  <div className="text-4xl mb-3">🎯</div>
                                  <h4 className="font-bold text-gray-800 mb-2 text-lg">المستوى</h4>
                                  <p className="text-gray-700 text-xl font-semibold">{course.level || "غير محدد"}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
                                  <div className="text-4xl mb-3">⏰</div>
                                  <h4 className="font-bold text-gray-800 mb-2 text-lg">المدة الزمنية</h4>
                                  <p className="text-gray-700 text-xl font-semibold">{course.duration || "غير محددة"}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
                                  <div className="text-4xl mb-3">👨‍🏫</div>
                                  <h4 className="font-bold text-gray-800 mb-2 text-lg">المدرب</h4>
                                  <p className="text-gray-700 text-xl font-semibold">{course.instructor || "غير محدد"}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border border-orange-200">
                                  <div className="text-4xl mb-3">📅</div>
                                  <h4 className="font-bold text-gray-800 mb-2 text-lg">موعد الإنعقاد</h4>
                                  <p className="text-gray-700 text-xl font-semibold">{course.schedule || "غير محدد"}</p>
                                </div>
                              </div>

                              {/* جدول التواريخ */}
                              {(course.start_date || course.end_date) && (
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                  <h4 className="font-bold text-gray-800 mb-4 text-lg text-center">📅 الفترة الزمنية</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center">
                                      <p className="text-gray-600 mb-2">تاريخ البدء</p>
                                      <p className="text-xl font-semibold text-[#7b0b4c]">{formatDate(course.start_date)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-gray-600 mb-2">تاريخ الانتهاء</p>
                                      <p className="text-xl font-semibold text-[#7b0b4c]">{formatDate(course.end_date)}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* معلومات إضافية */}
                              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 text-lg text-center">ℹ️ معلومات إضافية</h4>
                                <div className="flex flex-wrap justify-center gap-6">
                                  <div className="flex items-center space-x-3 space-x-reverse bg-gray-50 px-4 py-3 rounded-xl">
                                    <span className="text-2xl">💰</span>
                                    <div>
                                      <p className="text-gray-600 text-sm">السعر</p>
                                      <p className="text-gray-800 font-bold text-lg">{course.price}</p>
                                    </div>
                                  </div>
                                  {course.discount && (
                                    <div className="flex items-center space-x-3 space-x-reverse bg-green-50 px-4 py-3 rounded-xl">
                                      <span className="text-2xl">🎁</span>
                                      <div>
                                        <p className="text-gray-600 text-sm">الخصم</p>
                                        <p className="text-green-700 font-bold text-lg">{course.discount}</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-3 space-x-reverse bg-blue-50 px-4 py-3 rounded-xl">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                      <p className="text-gray-600 text-sm">الفئة</p>
                                      <p className="text-blue-700 font-bold text-lg">{course.category}</p>
                                    </div>
                                  </div>
                                </div>
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