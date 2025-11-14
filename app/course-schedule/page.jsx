"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 🧩 مكون Toast بسيط وأنيق
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-[#7b0b4c]";

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 ${bgColor} text-white 
      px-6 py-3 rounded-lg shadow-lg text-sm font-medium z-[9999] transition-all duration-300
      backdrop-blur-sm border border-white/20`}
      style={{ top: "80px" }}
    >
      <div className="flex items-center justify-center space-x-2 space-x-reverse">
        {type === "success" && <span>✓</span>}
        {type === "error" && <span>✕</span>}
        {type === "warning" && <span>⚠</span>}
        <span>{message}</span>
      </div>
    </div>
  );
}

// أيقونات من مكتبة (بدون تثبيت مكتبات إضافية)
const Icons = {
  calendar: "📅",
  clock: "⏰",
  level: "🎯",
  instructor: "👨‍🏫",
  category: "📚",
  price: "💰",
  discount: "🎁",
  expand: "⌄",
  collapse: "⌃",
  search: "🔍"
};

export default function CoursesSchedule() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info") => setToast({ msg, type });

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  async function fetchCourses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ خطأ في جلب الدورات:", error);
        showToast("فشل في تحميل الدورات", "error");
      } else {
        setCourses(data || []);
        
        // استخراج الفئات الفريدة
        const uniqueCategories = [...new Set(data.map(course => course.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        if (data.length === 0) {
          showToast("لا توجد دورات متاحة حالياً", "warning");
        } else {
          showToast(`تم تحميل ${data.length} دورة بنجاح`, "success");
        }
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("حدث خطأ غير متوقع", "error");
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header />
      
      {/* قسم الهيرو - متدرج للأسفل */}
      <section className="relative bg-gradient-to-b from-[#7b0b4c] to-[#5e0839] py-16 lg:py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              {Icons.calendar} جدول الدورات القادمة
            </h1>
            <p className="text-lg lg:text-xl mb-6 leading-relaxed opacity-95">
              يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
            </p>
            <div className="w-24 h-1 bg-white/50 mx-auto mb-6 rounded-full"></div>
            <p className="text-base lg:text-lg opacity-90 leading-relaxed max-w-2xl mx-auto">
              قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد إنعقاد جميع الدورات المتعلقة به
            </p>
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* قائمة الفئات المنسدلة */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <label className="block text-lg font-semibold text-gray-800 mb-3 text-center">
                {Icons.search} اختر مجال الدورات
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] focus:border-[#7b0b4c] outline-none transition-all duration-200 text-base font-medium bg-white"
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
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7b0b4c] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">جاري تحميل الدورات...</p>
            </div>
          )}

          {/* قائمة الدورات */}
          {!loading && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#7b0b4c] mb-2">
                  {Icons.category} الدورات المتاحة
                </h2>
                {selectedCategory && (
                  <p className="text-gray-600">
                    في مجال <span className="font-semibold text-[#7b0b4c]">{selectedCategory}</span>
                  </p>
                )}
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    إجمالي الدورات: {filteredCourses.length}
                  </span>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-5xl mb-4 opacity-50">{Icons.category}</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد دورات متاحة</h3>
                  <p className="text-gray-500">لا توجد دورات في هذه الفئة حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* عنوان الدورة */}
                      <div
                        className="p-4 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleCourse(course.id)}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse flex-1">
                          <div className="text-2xl text-[#7b0b4c]">
                            {Icons.category}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{course.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {Icons.price} {course.price}
                              </span>
                              {course.discount && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                                  {Icons.discount} {course.discount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-300 ${
                          expandedCourse === course.id ? 'rotate-180' : ''
                        }`}>
                          <span className="text-xl text-gray-500">
                            {expandedCourse === course.id ? Icons.collapse : Icons.expand}
                          </span>
                        </div>
                      </div>

                      {/* محتوى قابل للطي */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        expandedCourse === course.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                          {/* معلومات الدورة بشكل خطي */}
                          <div className="space-y-3">
                            {/* المستوى */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-lg">{Icons.level}</span>
                                <span className="text-gray-600 font-medium">المستوى:</span>
                              </div>
                              <span className="text-gray-800 font-semibold">{course.level || "غير محدد"}</span>
                            </div>

                            {/* المدة الزمنية */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-lg">{Icons.clock}</span>
                                <span className="text-gray-600 font-medium">المدة الزمنية:</span>
                              </div>
                              <span className="text-gray-800 font-semibold">{course.duration || "غير محددة"}</span>
                            </div>

                            {/* المدرب */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-lg">{Icons.instructor}</span>
                                <span className="text-gray-600 font-medium">المدرب:</span>
                              </div>
                              <span className="text-gray-800 font-semibold">{course.instructor || "غير محدد"}</span>
                            </div>

                            {/* موعد الإنعقاد */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-lg">{Icons.calendar}</span>
                                <span className="text-gray-600 font-medium">موعد الإنعقاد:</span>
                              </div>
                              <span className="text-gray-800 font-semibold">{course.schedule || "غير محدد"}</span>
                            </div>

                            {/* الفترة الزمنية */}
                            {(course.start_date || course.end_date) && (
                              <>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-lg">📅</span>
                                    <span className="text-gray-600 font-medium">تاريخ البدء:</span>
                                  </div>
                                  <span className="text-gray-800 font-semibold">{formatDate(course.start_date)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-lg">📅</span>
                                    <span className="text-gray-600 font-medium">تاريخ الانتهاء:</span>
                                  </div>
                                  <span className="text-gray-800 font-semibold">{formatDate(course.end_date)}</span>
                                </div>
                              </>
                            )}

                            {/* الفئة */}
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-lg">{Icons.category}</span>
                                <span className="text-gray-600 font-medium">الفئة:</span>
                              </div>
                              <span className="text-gray-800 font-semibold">{course.category}</span>
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