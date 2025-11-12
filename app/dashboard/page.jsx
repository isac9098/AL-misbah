"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

// 🧩 مكون Toast بسيط
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

// دالة مساعدة لاستخراج اسم الملف من رابط Supabase Storage
function getFileNameFromUrl(url, bucketName) {
  if (!url) return null;
  const path = url.split(bucketName + "/")[1];
  return path || null;
}

export default function CoursesDashboard() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info") => setToast({ msg, type });

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    discount: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const COURSES_BUCKET = "courses-images";

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error("❌ خطأ في جلب الدورات:", error);
    else setCourses(data);
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(COURSES_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error("❌ خطأ أثناء رفع الصورة:", error);
      showToast("فشل رفع الصورة!", "error");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(COURSES_BUCKET)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async function addCourse(e) {
    e.preventDefault();

    if (
      !newCourse.title ||
      !newCourse.description ||
      !newCourse.price ||
      !newCourse.category
    ) {
      showToast("⚠️ الرجاء إدخال جميع البيانات المطلوبة", "error");
      return;
    }

    let imageUrl = newCourse.image;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([{ ...newCourse, image: imageUrl }])
      .select();

    if (error) {
      console.error("❌ خطأ أثناء الإضافة:", error);
      showToast(`حدث خطأ أثناء الإضافة: ${error.message}`, "error");
    } else {
      showToast("✅ تمت إضافة الدورة بنجاح!", "success");
      setCourses([data[0], ...courses]);
      setNewCourse({
        title: "",
        description: "",
        image: "",
        price: "",
        discount: "",
        category: "",
      });
      setImageFile(null);
    }
  }

  async function deleteCourse(id) {
    const courseToDelete = courses.find((c) => c.id === id);
    if (!courseToDelete) return;

    const { error: dbError } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (dbError) {
      showToast(`❌ فشل حذف الدورة: ${dbError.message}`, "error");
      return;
    }

    if (courseToDelete.image) {
      const fileName = getFileNameFromUrl(courseToDelete.image, COURSES_BUCKET);
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from(COURSES_BUCKET)
          .remove([fileName]);
        if (storageError)
          console.warn("⚠️ فشل حذف الصورة من التخزين:", storageError);
      }
    }

    setCourses(courses.filter((c) => c.id !== id));
    showToast("✅ تم حذف الدورة بنجاح!", "success");
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center p-4 sm:p-8 text-right"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 sm:p-8 w-full max-w-5xl animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-[#7b0b4c]">🎓 إدارة الدورات</h1>
            <p className="text-gray-700 mt-1 text-sm font-medium">
              مرحباً 👋 مدير الموارد البشرية
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#7b0b4c] text-white rounded-lg hover:bg-[#5e0839] transition w-full sm:w-auto"
          >
            ← الرجوع للصفحة الرئيسية
          </button>
        </div>

        {/* نموذج إضافة دورة */}
        <form
          onSubmit={addCourse}
          className="bg-gray-50 rounded-xl p-4 mb-8 shadow-inner"
        >
          <h2 className="text-lg font-semibold mb-4 text-[#7b0b4c]">
            ➕ إضافة دورة جديدة
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان الدورة"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            />
            <input
              type="text"
              placeholder="الوصف"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="border rounded-lg px-3 py-2 text-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:bg-[#7b0b4c] file:text-white"
            />
            <input
              type="text"
              placeholder="السعر"
              value={newCourse.price}
              onChange={(e) =>
                setNewCourse({ ...newCourse, price: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            />
            <input
              type="text"
              placeholder="الخصم (اختياري)"
              value={newCourse.discount}
              onChange={(e) =>
                setNewCourse({ ...newCourse, discount: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            />
            <input
              type="text"
              placeholder="الفئة (مثلاً: القانون / اللغة / التقنية)"
              value={newCourse.category}
              onChange={(e) =>
                setNewCourse({ ...newCourse, category: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#7b0b4c] outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-[#7b0b4c] text-white px-6 py-2 rounded-lg hover:bg-[#5e0839] transition w-full sm:w-auto"
          >
            إضافة الدورة
          </button>
        </form>

        {/* قائمة الدورات */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#7b0b4c]">
            📚 الدورات الحالية
          </h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">لا توجد دورات حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={course.image || "https://via.placeholder.com/300x150"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-gray-900 font-bold mb-1">
                      {course.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {course.description}
                    </p>
                    <p className="text-[#5e0839] font-semibold mb-1">
                      السعر: {course.price}
                    </p>
                    {course.discount && (
                      <p className="text-green-700 text-sm">
                        الخصم: {course.discount}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2">
                      الفئة: {course.category}
                    </p>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="mt-3 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
