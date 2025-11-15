"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCalendarDay, 
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaImage,
  FaTag,
  FaPercent,
  FaBook
} from "react-icons/fa";

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
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-[#7a1353]";

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
    schedule_time: "", // تم التعديل
    start_date: "",
    meeting_days: "" // تم التعديل
  });
  const [imageFile, setImageFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const COURSES_BUCKET = "courses-images";

  useEffect(() => {
    fetchCourses();
    getUserName();
  }, []);

  // دالة لجلب اسم المستخدم من Supabase Auth
  async function getUserName() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("❌ خطأ في جلب بيانات المستخدم:", error);
        setUserName("مدير النظام");
        return;
      }

      if (user) {
        const name = user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    "مدير النظام";
        setUserName(name);
      } else {
        setUserName("مدير النظام");
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      setUserName("مدير النظام");
    }
  }

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ خطأ في جلب الدورات:", error);
      showToast("❌ فشل في تحميل الدورات", "error");
      return;
    }

    // استخدام البيانات مباشرة من الحقول الجديدة
    setCourses(data || []);
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

    // إرسال البيانات مباشرة في الحقول الأساسية - تم التعديل
    const courseData = {
      title: newCourse.title,
      description: newCourse.description,
      image: imageUrl,
      price: newCourse.price,
      discount: newCourse.discount,
      category: newCourse.category,
      schedule_time: newCourse.schedule_time || "", // تم التعديل
      start_date: newCourse.start_date || "",
      meeting_days: newCourse.meeting_days || "" // تم التعديل
    };

    const { data, error } = await supabase
      .from("courses")
      .insert([courseData])
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
        schedule_time: "", // تم التعديل
        start_date: "",
        meeting_days: "" // تم التعديل
      });
      setImageFile(null);
    }
  }

  async function updateCourse(courseId, updates) {
    try {
      // إرسال البيانات مباشرة في الحقول الأساسية - تم التعديل
      const courseData = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        discount: updates.discount,
        category: updates.category,
        schedule_time: updates.schedule_time || "", // تم التعديل
        start_date: updates.start_date || "",
        meeting_days: updates.meeting_days || "" // تم التعديل
      };

      console.log('🔄 محاولة تحديث الدورة:', courseId, courseData);

      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", courseId);

      if (error) {
        console.error("❌ خطأ في تحديث الدورة:", error);
        showToast(`❌ حدث خطأ أثناء التحديث: ${error.message}`, "error");
        return false;
      } else {
        // تحديث البيانات المحلية
        setCourses(courses.map(course => 
          course.id === courseId ? { 
            ...course, 
            ...courseData
          } : course
        ));
        setEditingCourse(null);
        showToast("✅ تم تحديث الدورة بنجاح!", "success");
        return true;
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع أثناء التحديث", "error");
      return false;
    }
  }

  const handleSaveCourse = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      await updateCourse(courseId, {
        title: course.title,
        description: course.description,
        price: course.price,
        discount: course.discount,
        category: course.category,
        schedule_time: course.schedule_time || "", // تم التعديل
        start_date: course.start_date || "",
        meeting_days: course.meeting_days || "" // تم التعديل
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleInputChange = (courseId, field, value) => {
    setCourses(courses.map(course => 
      course.id === courseId ? { ...course, [field]: value } : course
    ));
  };

  const handleNewCourseInputChange = (field, value) => {
    setNewCourse(prev => ({ ...prev, [field]: value }));
  };

  async function deleteCourse(id) {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8 text-right">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 w-full max-w-7xl">
        {/* الهيدر */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#f8e8f1] rounded-full flex items-center justify-center">
                <FaBook className="text-[#7a1353] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم الدورات</h1>
                <p className="text-gray-600 mt-1 text-sm">
                  مرحباً 👋 {userName || "مدير النظام"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/course-schedule")}
              className="px-4 py-2 bg-[#7a1353] text-white rounded-lg hover:bg-[#6a124a] transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FaCalendarAlt />
              عرض جدول الدورات
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FaArrowLeft />
              الرئيسية
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-all ${
              activeTab === "courses" 
                ? "border-[#7a1353] text-[#7a1353]" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🎓 إدارة الدورات
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-all ${
              activeTab === "campaigns" 
                ? "border-[#7a1353] text-[#7a1353]" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🖼️ الحملات الإعلانية
          </button>
        </div>

        {activeTab === "courses" && (
          <>
            {/* نموذج إضافة دورة */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaPlus className="text-[#7a1353]" />
                إضافة دورة جديدة
              </h2>

              <form onSubmit={addCourse}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* المعلومات الأساسية */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">المعلومات الأساسية</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الدورة *</label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={(e) => handleNewCourseInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                        placeholder="أدخل عنوان الدورة"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
                      <textarea
                        value={newCourse.description}
                        onChange={(e) => handleNewCourseInputChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all resize-none"
                        rows="3"
                        placeholder="وصف مختصر للدورة"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaTag />
                          السعر *
                        </label>
                        <input
                          type="text"
                          value={newCourse.price}
                          onChange={(e) => handleNewCourseInputChange('price', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                          placeholder="السعر"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaPercent />
                          الخصم
                        </label>
                        <input
                          type="text"
                          value={newCourse.discount}
                          onChange={(e) => handleNewCourseInputChange('discount', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                          placeholder="الخصم (اختياري)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                      <input
                        type="text"
                        value={newCourse.category}
                        onChange={(e) => handleNewCourseInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                        placeholder="مثلاً: القانون / اللغة / التقنية"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaImage />
                        صورة الدورة
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#7a1353] file:text-white file:cursor-pointer transition-all"
                      />
                    </div>
                  </div>

                  {/* الجدول الزمني */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">الجدول الزمني</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt />
                        تاريخ البدء
                      </label>
                      <input
                        type="date"
                        value={newCourse.start_date}
                        onChange={(e) => handleNewCourseInputChange('start_date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaClock />
                        الموعد
                      </label>
                      <input
                        type="text"
                        value={newCourse.schedule_time} // تم التعديل
                        onChange={(e) => handleNewCourseInputChange('schedule_time', e.target.value)} // تم التعديل
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                        placeholder="6:00 مساءً - 8:00 مساءً"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarDay />
                        أيام الإنعقاد
                      </label>
                      <input
                        type="text"
                        value={newCourse.meeting_days} // تم التعديل
                        onChange={(e) => handleNewCourseInputChange('meeting_days', e.target.value)} // تم التعديل
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all"
                        placeholder="السبت، الإثنين، الأربعاء"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7a1353] text-white px-8 py-4 rounded-lg hover:bg-[#6a124a] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  إضافة الدورة
                </button>
              </form>
            </div>

            {/* قائمة الدورات */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaBook className="text-[#7a1353]" />
                الدورات الحالية ({courses.length})
              </h2>

              {courses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBook className="text-4xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد دورات حالياً</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-[#7a1353]/30 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            {course.image && (
                              <img 
                                src={course.image} 
                                alt={course.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{course.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-[#f8e8f1] text-[#7a1353] rounded-full text-xs font-medium">
                                  {course.category}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {course.price}
                                </span>
                                {course.discount && (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    خصم: {course.discount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingCourse(editingCourse === course.id ? null : course.id)}
                            className="px-4 py-2 bg-[#7a1353] text-white rounded-lg hover:bg-[#6a124a] transition flex items-center gap-2 text-sm font-medium"
                          >
                            <FaEdit />
                            {editingCourse === course.id ? 'إلغاء' : 'تعديل الجدول'}
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm font-medium"
                          >
                            <FaTrash />
                            حذف
                          </button>
                        </div>
                      </div>

                      {/* عرض بيانات الجدول الزمني - تم التعديل */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarAlt className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">تاريخ البدء</p>
                          </div>
                          <p className="font-semibold text-gray-800">
                            {course.start_date ? new Date(course.start_date).toLocaleDateString('ar-EG') : "غير محدد"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">الموعد</p>
                          </div>
                          <p className="font-semibold text-gray-800">{course.schedule_time || "غير محدد"}</p> {/* تم التعديل */}
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarDay className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">أيام الإنعقاد</p>
                          </div>
                          <p className="font-semibold text-gray-800">{course.meeting_days || "غير محدد"}</p> {/* تم التعديل */}
                        </div>
                      </div>

                      {editingCourse === course.id && (
                        // وضع التعديل - الجدول الزمني فقط - تم التعديل
                        <div className="bg-white border border-[#7a1353]/20 rounded-xl p-6 mt-4">
                          <h4 className="font-semibold text-[#7a1353] mb-4 text-lg flex items-center gap-2">
                            <FaEdit />
                            تعديل الجدول الزمني
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">تاريخ البدء</label>
                              <input
                                type="date"
                                value={course.start_date || ""}
                                onChange={(e) => handleInputChange(course.id, 'start_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">الموعد</label>
                              <input
                                type="text"
                                value={course.schedule_time || ""} // تم التعديل
                                onChange={(e) => handleInputChange(course.id, 'schedule_time', e.target.value)} // تم التعديل
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none"
                                placeholder="6:00 مساءً - 8:00 مساءً"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">أيام الإنعقاد</label>
                              <input
                                type="text"
                                value={course.meeting_days || ""} // تم التعديل
                                onChange={(e) => handleInputChange(course.id, 'meeting_days', e.target.value)} // تم التعديل
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none"
                                placeholder="السبت، الإثنين، الأربعاء"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 space-x-reverse justify-end mt-6">
                            <button
                              onClick={handleCancelEdit}
                              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                            >
                              <FaTimes />
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleSaveCourse(course.id)}
                              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                            >
                              <FaSave />
                              حفظ التغييرات
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <CampaignsManager showToast={showToast} />
          </div>
        )}
      </div>
    </div>
  );
}

/* 👇 الكومبوننت الخاص بالحملات */
function CampaignsManager({ showToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const CAMPAIGN_BUCKET = "campaigns-images";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("❌ خطأ في جلب الحملات:", error);
    else setCampaigns(data || []);
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from(CAMPAIGN_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error("❌ خطأ أثناء رفع صورة الحملة:", error);
      showToast("فشل رفع الصورة!", "error");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(CAMPAIGN_BUCKET)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async function addCampaignImage(e) {
    e.preventDefault();
    if (!imageFile) {
      showToast("⚠️ الرجاء اختيار صورة أولاً", "warning");
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImage(imageFile);
    setUploading(false);

    if (!imageUrl) return;

    const { data, error } = await supabase
      .from("campaigns")
      .insert([{ image: imageUrl }])
      .select();

    if (error) {
      showToast("❌ حدث خطأ أثناء إضافة الصورة!", "error");
      console.error(error);
    } else {
      showToast("✅ تمت إضافة الصورة بنجاح!", "success");
      setCampaigns([data[0], ...campaigns]);
      setImageFile(null);
    }
  }

  async function deleteCampaign(id) {
    if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return;
    
    const campaignToDelete = campaigns.find(c => c.id === id);
    if (!campaignToDelete) return;

    const fileName = getFileNameFromUrl(campaignToDelete.image, CAMPAIGN_BUCKET);

    const { error: dbError } = await supabase.from("campaigns").delete().eq("id", id);

    if (dbError) {
      showToast(`❌ فشل حذف السجل من قاعدة البيانات. الخطأ: ${dbError.message}`, "error");
      console.error("Database Delete Failed:", dbError);
      return;
    }

    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from(CAMPAIGN_BUCKET)
        .remove([fileName]);

      if (storageError) {
        console.warn("⚠️ فشل حذف الصورة من التخزين (السجل حُذف):", storageError);
      }
    }

    setCampaigns(campaigns.filter((c) => c.id !== id));
    showToast("✅ تم حذف الحملة والصورة المرتبطة بها بنجاح!", "success");
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaImage className="text-[#7a1353]" />
        إدارة الحملات الإعلانية
      </h2>

      <div className="bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200 mb-6">
        <form onSubmit={addCampaignImage} className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 file:mr-3 file:py-2 file:px-4 file:rounded-md file:bg-[#7a1353] file:text-white file:border-none file:cursor-pointer w-full sm:w-auto transition-all duration-300"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#7a1353] text-white px-6 py-3 rounded-lg hover:bg-[#6a124a] transition-all duration-300 w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <FaPlus />
            {uploading ? "جاري الرفع..." : "رفع الصورة"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
            <img src={c.image} alt="campaign" className="w-full h-48 object-cover" />
            <div className="p-4 flex justify-between items-center">
              <span className="text-gray-600 text-sm">حملة #{c.id}</span>
              <button
                onClick={() => deleteCampaign(c.id)}
                className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <FaTrash />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}