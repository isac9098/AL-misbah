"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ إعداد Supabase
const supabaseUrl = "https://kyazwzdyodysnmlqmljv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3emR5b2R5c25tbHFtbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMjI4ODcsImV4cCI6MjA3NTc5ODg4N30.5oPcHui5y6onGAr9EYkq8fSihKeb4iC8LQFsLijIco4";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);

  // ✅ إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ البحث المباشر من Supabase مع الاقتراحات
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category")
        .ilike("title", `%${searchQuery}%`)
        .limit(6);

      if (!error) {
        setSuggestions(data || []);
      } else {
        console.error("خطأ في جلب نتائج البحث:", error);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // تمرير قيمة البحث إلى سكشن CoursesCarousel
    const coursesSection = document.getElementById("CoursesCarousel");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" });
      // تخزين قيمة البحث مؤقتاً لتصفية الدورات
      localStorage.setItem("searchQuery", searchQuery);
    }

    // إغلاق القائمة بعد البحث
    setSuggestions([]);
  };

  // ✅ عند الضغط على اقتراح من القائمة
  const handleSelect = (course) => {
    localStorage.setItem("searchQuery", course.title.toLowerCase());
    localStorage.setItem("selectedCourseId", course.id);
    setSearchQuery(course.title);
    setSuggestions([]);

    // الانتقال إلى قسم CoursesCarousel في نفس الصفحة
    setTimeout(() => {
      const coursesSection = document.getElementById("CoursesCarousel");
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: "smooth" });

        // تمييز الدورة المحددة بعد الانتقال
        setTimeout(() => {
          const selectedCourseId = localStorage.getItem("selectedCourseId");
          if (selectedCourseId) {
            highlightAndScrollToCourse(selectedCourseId);
          }
        }, 800); // زيادة الوقت لضمان تحميل الكاروسيل
      }
    }, 100);
  };

  // ✅ وظيفة للتمرير وتمييز الدورة في الكاروسيل
  const highlightAndScrollToCourse = (courseId) => {
    // محاولة العثور على العنصر عدة مرات لأن الكاروسيل قد يحتاج وقت للتحميل
    let attempts = 0;
    const maxAttempts = 10;

    const tryFindCourse = () => {
      const courseElement = document.getElementById(`course-${courseId}`);

      if (courseElement) {
        // التمرير إلى الدورة في الكاروسيل
        courseElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest",
          inline: "center"
        });

        // إضافة تأثير التمييز
        courseElement.classList.add(
          "ring-4", 
          "ring-[#7b0b4c]", 
          "ring-opacity-70", 
          "scale-105",
          "transition-all", 
          "duration-500"
        );

        // إزالة التمييز بعد 4 ثوان
        setTimeout(() => {
          courseElement.classList.remove(
            "ring-4", 
            "ring-[#7b0b4c]", 
            "ring-opacity-70", 
            "scale-105"
          );
        }, 4000);

        localStorage.removeItem("selectedCourseId");
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryFindCourse, 200); // المحاولة مرة أخرى بعد 200ms
      } else {
        console.log("لم يتم العثور على الدورة في الكاروسيل");
        localStorage.removeItem("selectedCourseId");
      }
    };

    tryFindCourse();
  };

  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Laptop hero"
          className="w-full h-[56vh] lg:h-[64vh] object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60" /> {/* Overlay شفاف */}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-[56vh] lg:h-[64vh]">
        <div className="mt-8 md:mt-0 max-w-2xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-snug text-white mb-4">
            تعلّم اليوم، لِتقودَّ غدًا
          </h1>
          <p className="mt-3 text-lg text-white/80 mb-6">
            تعلّم.. طوِّر.. وحقق نجاحك مع مركز المصباح للتدريب الفني والعمالة
          </p>

          {/* ✅ شريط البحث مع الاقتراحات */}
          <div ref={searchContainerRef} className="mt-6 w-full max-w-md relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دورة تدريبية..."
                  className="w-full rounded-2xl bg-white/95 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7b0b4c]/40 px-14 py-4 text-lg placeholder-gray-400"
                />

                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#7b0b4c]"
                  aria-label="بحث"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path
                      fill="currentColor"
                      d="M10 2a8 8 0 1 1 5.293 13.707l4 4-1.414 1.414-4-4A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* ✅ قائمة الاقتراحات */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl mt-2 max-h-60 overflow-y-auto z-50">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">جاري البحث...</div>
                ) : (
                  suggestions.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleSelect(course)}
                      className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{course.category}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}