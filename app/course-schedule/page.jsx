"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown, Loader2, BookOpen } from "lucide-react";

export default function CourseSchedulePage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error(error);
        toast.error("حدث خطأ أثناء تحميل الفئات");
      } else {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  // Fetch courses when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    async function fetchCourses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("category_id", selectedCategory);

      if (error) {
        toast.error("تعذر تحميل الدورات");
      } else {
        setCourses(data);
      }
      setLoading(false);
    }
    fetchCourses();
  }, [selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#7b0b4c] text-white py-16 px-4 text-center overflow-hidden">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          جدول الدورات القادمة
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto text-lg text-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          يمكنك معرفة مواعيد إنعقاد الدورات التي تهمك بسهولة! قم باختيار الموضوع من القائمة أدناه لتتمكن من استعراض مواعيد جميع الدورات المتعلقة.
        </motion.p>
      </section>

      {/* Content */}
      <main className="flex-1 container mx-auto py-10 px-4">
        {/* Dropdown */}
        <div className="max-w-md mx-auto mb-8">
          <select
            className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">اختر فئة الدورة</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Courses */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#7b0b4c] animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            <AnimatePresence>
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-lg transition"
                >
                  <button
                    onClick={() =>
                      setExpandedCourse(
                        expandedCourse === course.id ? null : course.id
                      )
                    }
                    className="flex justify-between items-center w-full text-right"
                  >
                    <span className="font-semibold text-[#7b0b4c] flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> {course.name}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedCourse === course.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 text-sm text-gray-700 space-y-1"
                      >
                        <p>
                          <strong>المستوى:</strong> {course.level}
                        </p>
                        <p>
                          <strong>المدة:</strong> {course.duration}
                        </p>
                        <p>
                          <strong>تاريخ البداية:</strong> {course.start_date}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
