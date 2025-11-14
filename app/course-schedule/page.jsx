"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 🧩 مكون Toast بسيط محسن
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-600 border-red-700"
      : type === "success"
      ? "bg-green-600 border-green-700"
      : type === "warning"
      ? "bg-yellow-500 border-yellow-600"
      : "bg-[#7b0b4c] border-[#8a1a5c]";

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 ${bgColor} text-white 
      px-6 py-4 rounded-2xl shadow-2xl text-base font-semibold z-[9999] transition-all duration-500
      backdrop-blur-sm border-2 min-w-[300px] text-center animate-fade-in-down`}
      style={{ top: "90px" }}
    >
      <div className="flex items-center justify-center space-x-2 space-x-reverse">
        {type === "success" && <span className="text-lg">✅</span>}
        {type === "error" && <span className="text-lg">❌</span>}
        {type === "warning" && <span className="text-lg">⚠️</span>}
        <span className="text-white drop-shadow-sm">{message}</span>
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
          showToast(`مرحباً ${currentUser.email} - يمكنك التعديل من لوحة التحكم`, "success");
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
          showToast("ℹ️ لا توجد دورات متاحة حالياً", "warning");
        } else {
          showToast(`✅ تم تحميل ${data.length} دورة بنجاح`, "success");
        }
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع", "error");
    }
    setLoading(false);
  }

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // دالة للتنقل إلى Dashboard للتعديل
  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header />
      
      {/* قسم الهيرو المحسن بشكل احترافي */}
      <section className="relative bg-gradient-to-br from-[#7b0b4c] via-[#8a1a5c] to-[#6a0840] py-20 lg:py-28 overflow-hidden">
        {/* تأثيرات خلفية ديناميكية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center text-white">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
              {/* شارة المسؤول */}
              {isAdmin && (
                <div className="inline-flex items-center px-6 py-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full mb-6">
                  <span className="text-green-300 text-sm font-bold">🛠️ وضع المسؤول - يمكنك التعديل من لوحة التحكم</span>
                </div>
              )}
              
              <h1 className="text-4xl lg:text-6xl font-black mb-6 text-white drop-shadow-2xl leading-tight">
                🗓️ جدول الدورات القادمة
              </h1>
              <p className="text-xl lg:text-2xl mb-6 leading-relaxed font-medium text-white/95">
                يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
              </p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-white to-white/50 mx-auto mb-8 rounded-full shadow-lg"></div>
              <p className="text-lg lg:text-xl opacity-95 leading-relaxed max-w-3xl mx-auto text-white/90">
                قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد إنعقاد جميع الدورات المتعلقة به
              </p>

              {/* زر الانتقال للوحة التحكم للمسؤولين */}
              {isAdmin && (
                <div className="mt-8">
                  <button
                    onClick={navigateToDashboard}
                    className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl hover:bg-white/30 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="ml-2">⚙️</span>
                    الذهاب إلى لوحة التحكم للتعديل
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* قائمة الفئات المنسدلة */}
          <div className="max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/60 backdrop-blur-sm">
              <label className="block text-xl font-black text-gray-800 mb-4 text-center">
                🎯 اختر مجال الدورات
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-6 py-4 border-2 border-[#7b0b4c] rounded-2xl text-gray-800 focus:ring-4 focus:ring-[#7b0b4c]/20 focus:border-[#7b0b4c] outline-none transition-all duration-300 text-lg font-semibold bg-white shadow-lg hover:shadow-xl"
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
              <p className="text-gray-600 text-xl font-semibold">جاري تحميل الدورات...</p>
              <p className="text-gray-500 mt-2">يرجى الانتظار قليلاً</p>
            </div>
          )}

          {/* قائمة الدورات */}
          {!loading && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-200/60 backdrop-blur-sm">
                <h2 className="text-2xl lg:text-3xl font-black text-[#7b0b4c] text-center mb-2">
                  📚 الدورات المتاحة
                </h2>
                {selectedCategory && (
                  <p className="text-gray-700 text-lg text-center font-semibold">
                    في مجال <span className="font-black text-[#7b0b4c]">{selectedCategory}</span>
                  </p>
                )}
                <div className="text-center mt-4">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                    📊 إجمالي الدورات: {filteredCourses.length}
                  </span>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-200/60 backdrop-blur-sm">
                  <div className="text-8xl mb-6 opacity-60">📭</div>
                  <h3 className="text-2xl font-black text-gray-700 mb-4">لا توجد دورات متاحة</h3>
                  <p className="text-gray-500 text-lg">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:gap-8">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-200/60 hover:border-[#7b0b4c]/40 backdrop-blur-sm group"
                    >
                      {/* عنوان الدورة */}
                      <div
                        className="p-6 lg:p-8 cursor-pointer flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-gradient-to-r from-white to-gray-50/80 hover:from-gray-50 hover:to-white transition-all duration-300 border-b border-gray-200/40"
                        onClick={() => toggleCourse(course.id)}
                      >
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <div className="text-3xl bg-gradient-to-br from-[#7b0b4c] to-[#9a2c6e] text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            📖
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl lg:text-2xl font-black text-gray-800 mb-2 leading-tight">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">{course.description}</p>
                            <div className="flex flex-wrap gap-3 mt-4">
                              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold shadow-sm">
                                💰 {course.price}
                              </span>
                              {course.discount && (
                                <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold shadow-sm">
                                  🎁 {course.discount}
                                </span>
                              )}
                              <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-bold shadow-sm">
                                📚 {course.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className={`transform transition-transform duration-500 ${
                            expandedCourse === course.id ? 'rotate-180 scale-110' : ''
                          }`}>
                            <div className="bg-gradient-to-br from-[#7b0b4c] to-[#9a2c6e] text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <span className="text-xl font-bold">⬇️</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* محتوى قابل للطي */}
                      <div className={`overflow-hidden transition-all duration-700 ${
                        expandedCourse === course.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50/50 to-white/80 backdrop-blur-sm">
                          {/* جدول المعلومات */}
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                              {/* المستوى */}
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200 shadow-lg">
                                <div className="text-4xl mb-4">🎯</div>
                                <h4 className="font-black text-gray-800 mb-3 text-lg">المستوى</h4>
                                <p className="text-gray-700 text-xl font-black bg-white/50 rounded-xl py-2">
                                  {course.level || "غير محدد"}
                                </p>
                              </div>

                              {/* المدة الزمنية */}
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border-2 border-green-200 shadow-lg">
                                <div className="text-4xl mb-4">⏰</div>
                                <h4 className="font-black text-gray-800 mb-3 text-lg">المدة الزمنية</h4>
                                <p className="text-gray-700 text-xl font-black bg-white/50 rounded-xl py-2">
                                  {course.duration || "غير محددة"}
                                </p>
                              </div>

                              {/* المدرب */}
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border-2 border-purple-200 shadow-lg">
                                <div className="text-4xl mb-4">👨‍🏫</div>
                                <h4 className="font-black text-gray-800 mb-3 text-lg">المدرب</h4>
                                <p className="text-gray-700 text-xl font-black bg-white/50 rounded-xl py-2">
                                  {course.instructor || "غير محدد"}
                                </p>
                              </div>

                              {/* موعد الإنعقاد */}
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border-2 border-orange-200 shadow-lg">
                                <div className="text-4xl mb-4">📅</div>
                                <h4 className="font-black text-gray-800 mb-3 text-lg">موعد الإنعقاد</h4>
                                <p className="text-gray-700 text-xl font-black bg-white/50 rounded-xl py-2">
                                  {course.schedule || "غير محدد"}
                                </p>
                              </div>
                            </div>

                            {/* جدول التواريخ */}
                            {(course.start_date || course.end_date) && (
                              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                                <h4 className="font-black text-gray-800 mb-6 text-xl text-center">📅 الفترة الزمنية للدورة</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="text-center bg-white/70 rounded-xl p-4 shadow-inner">
                                    <p className="text-gray-600 mb-3 font-semibold">📅 تاريخ البدء</p>
                                    <p className="text-2xl font-black text-[#7b0b4c] bg-gradient-to-r from-[#7b0b4c]/10 to-transparent rounded-lg py-3">
                                      {formatDate(course.start_date)}
                                    </p>
                                  </div>
                                  <div className="text-center bg-white/70 rounded-xl p-4 shadow-inner">
                                    <p className="text-gray-600 mb-3 font-semibold">📅 تاريخ الانتهاء</p>
                                    <p className="text-2xl font-black text-[#7b0b4c] bg-gradient-to-r from-[#7b0b4c]/10 to-transparent rounded-lg py-3">
                                      {formatDate(course.end_date)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* معلومات إضافية */}
                            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                              <h4 className="font-black text-gray-800 mb-6 text-xl text-center">ℹ️ معلومات إضافية</h4>
                              <div className="flex flex-wrap justify-center gap-6">
                                <div className="flex items-center space-x-4 space-x-reverse bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                                  <span className="text-3xl">💰</span>
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">السعر</p>
                                    <p className="text-gray-800 font-black text-2xl">{course.price}</p>
                                  </div>
                                </div>
                                {course.discount && (
                                  <div className="flex items-center space-x-4 space-x-reverse bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 rounded-2xl border-2 border-green-200 shadow-sm">
                                    <span className="text-3xl">🎁</span>
                                    <div>
                                      <p className="text-gray-600 text-sm font-semibold">الخصم</p>
                                      <p className="text-green-700 font-black text-2xl">{course.discount}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
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