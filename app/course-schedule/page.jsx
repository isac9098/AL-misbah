"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ChevronDown,
  Edit3,
  Loader2,
  X,
  Save,
} from "lucide-react";

export default function CourseSchedule() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null); // الكورس الذي يتم تعديله
  const [form, setForm] = useState({
    title: "",
    level: "",
    duration: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);

  // ===== جلب الفئات =====
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error) setCategories(data);
    };
    fetchCategories();

    // تحقق من المستخدم
    const checkUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.email === "admin@almisbah.com") {
        setUserRole("admin");
      } else {
        setUserRole("user");
      }
    };
    checkUser();
  }, []);

  // ===== جلب الدورات حسب الفئة =====
  const fetchCourses = async (category) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("category", category);
    if (error) {
      toast.error("حدث خطأ أثناء تحميل الدورات");
    } else {
      setCourses(data);
    }
    setLoading(false);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) fetchCourses(category);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  // ===== فتح نافذة التعديل =====
  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      level: course.level || "",
      duration: course.duration || "",
      date: course.date || "",
    });
  };

  // ===== حفظ التعديل =====
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title: form.title,
        level: form.level,
        duration: form.duration,
        date: form.date,
      })
      .eq("id", editingCourse.id);

    if (error) {
      toast.error("حدث خطأ أثناء التعديل");
    } else {
      toast.success("تم حفظ التعديلات بنجاح 🎉");
      // تحديث القائمة محلياً
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id ? { ...c, ...form } : c
        )
      );
      setEditingCourse(null);
    }
    setSaving(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#fdf8f9] to-white">
        {/* ===== Hero Section ===== */}
        <section className="text-center py-20 bg-gradient-to-r from-[#7b0b4c] to-[#9c175f] text-white shadow-lg">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold mb-4"
          >
            جدول الدورات القادمة
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg max-w-2xl mx-auto leading-relaxed"
          >
            يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة! قم باختيار
            الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد جميع الدورات
            المتعلقة به.
          </motion.p>
        </section>

        {/* ===== القائمة المنسدلة ===== */}
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="mb-10">
            <select
              onChange={handleCategoryChange}
              value={selectedCategory}
              className="px-6 py-3 rounded-xl border-2 border-[#7b0b4c] text-[#7b0b4c] font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c175f] bg-white"
            >
              <option value="">اختر فئة الدورة</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ===== تحميل ===== */}
          {loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin w-8 h-8 text-[#7b0b4c]" />
            </div>
          )}

          {/* ===== عرض الدورات ===== */}
          <AnimatePresence>
            {!loading && courses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto space-y-4 text-right"
              >
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    className="bg-white rounded-2xl shadow p-4 cursor-pointer border border-[#eee]"
                  >
                    <div
                      onClick={() => toggleExpand(course.id)}
                      className="flex justify-between items-center"
                    >
                      <h3 className="font-bold text-[#7b0b4c] text-lg">
                        {course.title}
                      </h3>
                      <ChevronDown
                        className={`transition-transform duration-300 ${
                          expanded === course.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {expanded === course.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 text-sm text-gray-700 overflow-hidden"
                        >
                          <p>
                            <span className="font-semibold">المستوى:</span>{" "}
                            {course.level || "غير محدد"}
                          </p>
                          <p>
                            <span className="font-semibold">المدة:</span>{" "}
                            {course.duration || "غير محددة"}
                          </p>
                          <p>
                            <span className="font-semibold">التاريخ:</span>{" "}
                            {course.date || "سيعلن لاحقاً"}
                          </p>

                          {userRole === "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(course);
                              }}
                              className="flex items-center gap-1 mt-3 px-3 py-1 text-sm bg-[#7b0b4c] text-white rounded-xl hover:bg-[#9c175f]"
                            >
                              <Edit3 className="w-4 h-4" />
                              تعديل
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && selectedCategory && courses.length === 0 && (
              <p className="text-gray-500 font-medium">
                لا توجد دورات في هذه الفئة حالياً.
              </p>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />

      {/* ===== نافذة التعديل ===== */}
      <AnimatePresence>
        {editingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative"
            >
              <button
                onClick={() => setEditingCourse(null)}
                className="absolute top-3 left-3 text-gray-500 hover:text-[#7b0b4c]"
              >
                <X />
              </button>
              <h2 className="text-2xl font-bold text-[#7b0b4c] mb-4 text-center">
                تعديل الدورة
              </h2>

              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="اسم الدورة"
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b0b4c]"
                />
                <input
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value })
                  }
                  placeholder="المستوى"
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b0b4c]"
                />
                <input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="المدة"
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b0b4c]"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b0b4c]"
                />

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full bg-[#7b0b4c] hover:bg-[#9c175f] text-white py-2 rounded-xl mt-3"
                >
                  {saving ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  حفظ التغييرات
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
