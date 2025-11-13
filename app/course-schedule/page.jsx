"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient"; // تأكد من المسار الصحيح
import { motion, AnimatePresence } from "framer-motion";

export default function CourseSchedulePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    checkAdminStatus();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredCourses(courses.filter(c => c.category === selectedCategory));
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  const [filteredCourses, setFilteredCourses] = useState([]);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setIsAdmin(true);
  }

  async function fetchCourses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("❌ خطأ في تحميل الدورات");
    } else {
      setCourses(data || []);
      const uniqueCategories = [...new Set(data.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);
      setFilteredCourses(data || []);
    }
    setLoading(false);
  }

  async function updateCourseSchedule(courseId, updates) {
    const { error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) {
      console.error(error);
      showToast("❌ حدث خطأ أثناء التحديث");
    } else {
      setCourses(courses.map(c => c.id === courseId ? { ...c, ...updates } : c));
      setEditingCourse(null);
      showToast("✅ تم تحديث الدورة بنجاح");
    }
  }

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course.id);
  };

  const handleCancel = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleSave = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      updateCourseSchedule(courseId, {
        level: course.level,
        duration: course.duration,
        schedule: course.schedule,
      });
    }
  };

  const handleInputChange = (courseId, field, value) => {
    setCourses(courses.map(c => c.id === courseId ? { ...c, [field]: value } : c));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#7b0b4c] text-white px-6 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      <Header />

      <section className="bg-gradient-to-r from-[#7b0b4c] to-[#b01b68] text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">جدول الدورات القادمة</h1>
        <p className="text-lg">
          يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة!
          <br />
          قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد إنعقاد جميع الدورات المتعلقة.
        </p>
      </section>

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 w-64 text-gray-700 focus:ring-2 focus:ring-[#7b0b4c]"
          >
            <option value="">جميع الفئات</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7b0b4c] mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg">جاري تحميل الدورات...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد دورات متاحة</h3>
            <p className="text-gray-500">لا توجد دورات في هذه الفئة حالياً</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {filteredCourses.map(course => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => toggleCourse(course.id)}>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-2xl">📖</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                        <p className="text-gray-600 mt-1">{course.description}</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-300 ${expandedCourse === course.id ? 'rotate-180' : ''}`}>
                      <span className="text-2xl">⬇️</span>
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-500 ${expandedCourse === course.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      {editingCourse === course.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">🎯 المستوى</label>
                              <input
                                type="text"
                                value={course.level || ""}
                                onChange={e => handleInputChange(course.id, 'level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">⏰ المدة</label>
                              <input
                                type="text"
                                value={course.duration || ""}
                                onChange={e => handleInputChange(course.id, 'duration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">📅 التاريخ</label>
                              <input
                                type="text"
                                value={course.schedule || ""}
                                onChange={e => handleInputChange(course.id, 'schedule', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b0b4c] outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-3 space-x-reverse justify-end">
                            <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">إلغاء</button>
                            <button onClick={() => handleSave(course.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                          <div>
                            <div className="text-3xl mb-2">🎯</div>
                            <h4 className="font-semibold text-gray-800 mb-2">المستوى</h4>
                            <p className="text-gray-600">{course.level || "غير محدد"}</p>
                          </div>
                          <div>
                            <div className="text-3xl mb-2">⏰</div>
                            <h4 className="font-semibold text-gray-800 mb-2">المدة الزمنية</h4>
                            <p className="text-gray-600">{course.duration || "غير محددة"}</p>
                          </div>
                          <div>
                            <div className="text-3xl mb-2">📅</div>
                            <h4 className="font-semibold text-gray-800 mb-2">موعد الإنعقاد</h4>
                            <p className="text-gray-600">{course.schedule || "غير محدد"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
