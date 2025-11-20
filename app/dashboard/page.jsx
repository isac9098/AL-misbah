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
  FaBook,
  FaUser,
  FaLock,
  FaEnvelope,
  FaBars,
  FaUserPlus,
  FaAd,
  FaCog,
  FaEye,
  FaSpinner
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
    schedule_time: "",
    start_date: "",
    meeting_days: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const COURSES_BUCKET = "courses-images";

  useEffect(() => {
    fetchCourses();
    getUserName();
  }, []);

  // دالة لجلب اسم المستخدم من Supabase Auth وجدول users
  async function getUserName() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("❌ خطأ في جلب بيانات المستخدم:", error);
        setUserName("مدير النظام");
        return;
      }

      if (user) {
        // جلب البيانات من جدول users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error("❌ خطأ في جلب بيانات الجدول:", userError);
          // استخدام البيانات من Auth كبديل
          const name = user.user_metadata?.name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      "مدير النظام";
          setUserName(name);
        } else {
          setUserName(userData?.name || user.email?.split('@')[0] || "مدير النظام");
        }
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

    const courseData = {
      title: newCourse.title,
      description: newCourse.description,
      image: imageUrl,
      price: newCourse.price,
      discount: newCourse.discount,
      category: newCourse.category,
      schedule_time: newCourse.schedule_time || "",
      start_date: newCourse.start_date || "",
      meeting_days: newCourse.meeting_days || ""
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
        schedule_time: "",
        start_date: "",
        meeting_days: ""
      });
      setImageFile(null);
    }
  }

  async function updateCourse(courseId, updates) {
    try {
      const courseData = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        discount: updates.discount,
        category: updates.category,
        schedule_time: updates.schedule_time || "",
        start_date: updates.start_date || "",
        meeting_days: updates.meeting_days || ""
      };

      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", courseId);

      if (error) {
        console.error("❌ خطأ في تحديث الدورة:", error);
        showToast(`❌ حدث خطأ أثناء التحديث: ${error.message}`, "error");
        return false;
      } else {
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
        schedule_time: course.schedule_time || "",
        start_date: course.start_date || "",
        meeting_days: course.meeting_days || ""
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

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
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
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
            
            {/* زر القائمة للهواتف */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-3 rounded-lg bg-[#7a1353] text-white hover:bg-[#6a124a] transition-all duration-300"
            >
              <FaBars className="text-lg" />
            </button>
          </div>

          <div className="hidden sm:flex gap-3">
            <button
              onClick={() => router.push("/course-schedule")}
              className="px-4 py-2 bg-[#7a1353] text-white rounded-lg hover:bg-[#6a124a] transition flex items-center gap-2"
            >
              <FaCalendarAlt />
              عرض جدول الدورات
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <FaArrowLeft />
              الرئيسية
            </button>
          </div>
        </div>

        {/* القائمة الجانبية للهواتف */}
        {mobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* القائمة */}
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-[#7a1353]">القائمة الرئيسية</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  <button
                    onClick={() => handleTabChange("courses")}
                    className={`w-full text-right px-4 py-4 rounded-lg transition-all flex items-center gap-3 text-lg ${
                      activeTab === "courses" 
                        ? "bg-[#7a1353] text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <FaBook className="text-lg" />
                    إدارة الدورات
                  </button>

                  <button
                    onClick={() => handleTabChange("campaigns")}
                    className={`w-full text-right px-4 py-4 rounded-lg transition-all flex items-center gap-3 text-lg ${
                      activeTab === "campaigns" 
                        ? "bg-[#7a1353] text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <FaAd className="text-lg" />
                    الحملات الإعلانية
                  </button>

                  <button
                    onClick={() => handleTabChange("account")}
                    className={`w-full text-right px-4 py-4 rounded-lg transition-all flex items-center gap-3 text-lg ${
                      activeTab === "account" 
                        ? "bg-[#7a1353] text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <FaUser className="text-lg" />
                    إدارة الحساب
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <button
                    onClick={() => {
                      router.push("/course-schedule");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition flex items-center gap-3"
                  >
                    <FaCalendarAlt />
                    عرض جدول الدورات
                  </button>
                  <button
                    onClick={() => {
                      router.push("/");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-3"
                  >
                    <FaArrowLeft />
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* التبويبات للشاشات الكبيرة */}
        <div className="hidden sm:flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange("courses")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "courses" 
                ? "border-[#7a1353] text-[#7a1353]" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaBook />
            إدارة الدورات
          </button>
          <button
            onClick={() => handleTabChange("campaigns")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "campaigns" 
                ? "border-[#7a1353] text-[#7a1353]" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaAd />
            الحملات الإعلانية
          </button>
          <button
            onClick={() => handleTabChange("account")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "account" 
                ? "border-[#7a1353] text-[#7a1353]" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUser />
            إدارة الحساب
          </button>
        </div>

        {/* زر القائمة للهواتف - يظهر بدل التبويبات */}
        <div className="sm:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-full bg-[#7a1353] text-white py-4 rounded-lg font-medium flex items-center justify-center gap-3 text-lg shadow-lg hover:bg-[#6a124a] transition-all duration-300"
          >
            <FaBars />
            عرض القائمة - { 
              activeTab === "courses" ? "إدارة الدورات" :
              activeTab === "campaigns" ? "الحملات الإعلانية" :
              "إدارة الحساب"
            }
          </button>
        </div>

        {activeTab === "courses" && (
          <>
            {/* نموذج إضافة دورة */}
<div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 shadow-md border border-gray-200">
  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
    <FaPlus className="text-[#7a1353]" />
    إضافة دورة جديدة
  </h2>

  <form onSubmit={addCourse}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* المعلومات الأساسية */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">المعلومات الأساسية</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الدورة *</label>
          <input
            type="text"
            value={newCourse.title}
            onChange={(e) => handleNewCourseInputChange('title', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
            placeholder="أدخل عنوان الدورة هنا"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
          <textarea
            value={newCourse.description}
            onChange={(e) => handleNewCourseInputChange('description', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all resize-none bg-white placeholder-gray-500 text-gray-700"
            rows="3"
            placeholder="اكتب وصفاً للدورة"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaTag />
              السعر *
            </label>
            <input
              type="text"
              value={newCourse.price}
              onChange={(e) => handleNewCourseInputChange('price', e.target.value)}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
              placeholder="مثال: 500"
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
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
              placeholder="السعر بعد الخصم"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
          <input
            type="text"
            value={newCourse.category}
            onChange={(e) => handleNewCourseInputChange('category', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
            placeholder="مثال: القانون، اللغة، التقنية"
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
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#7a1353] file:text-white file:cursor-pointer transition-all bg-white text-gray-700"
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
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaClock />
            الموعد
          </label>
          <input
            type="text"
            value={newCourse.schedule_time}
            onChange={(e) => handleNewCourseInputChange('schedule_time', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
            placeholder="مثال: 6:00 مساءً - 8:00 مساءً"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaCalendarDay />
            أيام الإنعقاد
          </label>
          <input
            type="text"
            value={newCourse.meeting_days}
            onChange={(e) => handleNewCourseInputChange('meeting_days', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700"
            placeholder="مثال: السبت، الإثنين، الأربعاء"
          />
        </div>
      </div>
    </div>
    
    {/* زر الإضافة */}
    <div className="flex justify-end">
      <button
        type="submit"
        className="bg-[#7a1353] text-white px-6 py-3 rounded-lg hover:bg-[#6a1248] transition-all duration-200 font-medium flex items-center gap-2"
      >
        <FaPlus />
        إضافة الدورة
      </button>
    </div>
  </form>
</div>

            {/* قائمة الدورات */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <FaBook className="text-[#7a1353]" />
                الدورات الحالية ({courses.length})
              </h2>

              {courses.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <FaBook className="text-4xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد دورات حالياً</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-[#7a1353]/30 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 sm:gap-4 mb-3">
                            {course.image && (
                              <img 
                                src={course.image} 
                                alt={course.title}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{course.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-[#f8e8f1] text-[#7a1353] rounded-full text-xs font-medium">
                                  {course.category}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {course.price}
                                </span>
                                {course.discount && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                            className="px-3 py-2 sm:px-4 sm:py-2 bg-[#7a1353] text-white rounded-lg hover:bg-[#6a124a] transition flex items-center gap-2 text-sm font-medium"
                          >
                            <FaEdit />
                            {editingCourse === course.id ? 'إلغاء' : 'تعديل'}
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm font-medium"
                          >
                            <FaTrash />
                            حذف
                          </button>
                        </div>
                      </div>

                      {/* عرض بيانات الجدول الزمني */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarAlt className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">تاريخ البدء</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {course.start_date ? new Date(course.start_date).toLocaleDateString('ar-EG') : "غير محدد"}
                          </p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">الموعد</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{course.schedule_time || "غير محدد"}</p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarDay className="text-[#7a1353]" />
                            <p className="text-sm text-gray-600">أيام الإنعقاد</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{course.meeting_days || "غير محدد"}</p>
                        </div>
                      </div>

                      {editingCourse === course.id && (
                        <div className="bg-white border border-[#7a1353]/20 rounded-xl p-4 sm:p-6 mt-4">
                          <h4 className="font-semibold text-[#7a1353] mb-4 text-lg flex items-center gap-2">
                            <FaEdit />
                            تعديل الجدول الزمني
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">تاريخ البدء</label>
                              <input
                                type="date"
                                value={course.start_date || ""}
                                onChange={(e) => handleInputChange(course.id, 'start_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">الموعد</label>
                              <input
                                type="text"
                                value={course.schedule_time || ""}
                                onChange={(e) => handleInputChange(course.id, 'schedule_time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white placeholder-gray-500"
                                placeholder="مثال: 6:00 مساءً - 8:00 مساءً"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">أيام الإنعقاد</label>
                              <input
                                type="text"
                                value={course.meeting_days || ""}
                                onChange={(e) => handleInputChange(course.id, 'meeting_days', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white placeholder-gray-500"
                                placeholder="مثال: السبت، الإثنين، الأربعاء"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 space-x-reverse justify-end mt-6">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm"
                            >
                              <FaTimes />
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleSaveCourse(course.id)}
                              className="px-4 py-2 sm:px-6 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 text-sm"
                            >
                              <FaSave />
                              حفظ
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
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200">
            <CampaignsManager showToast={showToast} />
          </div>
        )}

        {activeTab === "account" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200">
            <AccountManager showToast={showToast} userName={userName} />
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
      <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <FaAd className="text-[#7a1353]" />
        إدارة الحملات الإعلانية
      </h2>

      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner border border-gray-200 mb-4 sm:mb-6">
        <form onSubmit={addCampaignImage} className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-gray-800 file:mr-2 file:py-2 file:px-4 file:rounded-md file:bg-[#7a1353] file:text-white file:border-none file:cursor-pointer w-full sm:w-auto transition-all duration-300 bg-white"
            placeholder="اختر صورة للحملة الإعلانية"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#7a1353] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#6a124a] transition-all duration-300 w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <FaPlus />
            {uploading ? "جاري الرفع..." : "رفع الصورة"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
            <img src={c.image} alt="campaign" className="w-full h-40 sm:h-48 object-cover" />
            <div className="p-3 sm:p-4 flex justify-between items-center">
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

/* 👇 الكومبوننت الخاص بإدارة الحساب */
function AccountManager({ showToast, userName }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("❌ خطأ في جلب بيانات المستخدم:", error);
        showToast("❌ فشل في تحميل بيانات المستخدم", "error");
        return;
      }

      if (user) {
        // جلب البيانات من جدول users بدلاً من profiles
        const { data: userTableData, error: userError } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single();

        setUserData({
          id: user.id,
          email: user.email,
          name: userTableData?.name || user.user_metadata?.name || user.email?.split('@')[0],
          role: userTableData?.role || 'user',
          created_at: user.created_at
        });
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع", "error");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoading(true);

    if (!userData || !userData.email) {
      showToast("❌ لا يمكن الوصول إلى بيانات المستخدم", "error");
      setLoading(false);
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("⚠️ الرجاء إدخال جميع الحقول", "error");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("⚠️ كلمة المرور الجديدة غير متطابقة", "error");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      showToast("⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: currentPassword
      });

      if (authError) {
        console.error("❌ خطأ في المصادقة:", authError);

        if (authError.message.includes("Invalid login credentials")) {
          showToast("❌ كلمة المرور الحالية غير صحيحة", "error");
        } else if (authError.message.includes("Email not confirmed")) {
          showToast("❌ البريد الإلكتروني غير مفعل", "error");
        } else {
          showToast(`❌ خطأ في المصادقة: ${authError.message}`, "error");
        }

        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("❌ خطأ في تغيير كلمة المرور:", updateError);
        showToast(`❌ فشل في تغيير كلمة المرور: ${updateError.message}`, "error");
      } else {
        showToast("✅ تم تغيير كلمة المرور بنجاح", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        getUserData();
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع أثناء تغيير كلمة المرور", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!userData) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
          <FaUser className="text-[#7a1353]" />
          إدارة الحساب
        </h2>
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a1353] mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المستخدم...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <FaUser className="text-[#7a1353]" />
        إدارة الحساب
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* معلومات الحساب */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUser className="text-[#7a1353]" />
            المعلومات الشخصية
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">معرف المستخدم</p>
                <p className="font-semibold text-gray-800 text-xs font-mono">
                  {userData?.id?.substring(0, 8)}...
                </p>
              </div>
              <FaUser className="text-[#7a1353]" />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-semibold text-gray-800">{userData?.name}</p>
              </div>
              <FaUser className="text-[#7a1353]" />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold text-gray-800">{userData?.email}</p>
              </div>
              <FaEnvelope className="text-[#7a1353]" />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">الصلاحية</p>
                <p className="font-semibold text-gray-800">
                  {userData?.role === 'super_admin' ? 'المشرف العام' : 
                   userData?.role === 'manager' ? 'مدير' : 
                   userData?.role === 'hr' ? 'مدير موارد بشرية' : 
                   userData?.role === 'content' ? 'مدير محتوى' : 'مستخدم'}
                </p>
              </div>
              <FaLock className="text-[#7a1353]" />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                <p className="font-semibold text-gray-800">
                  {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('ar-EG') : "غير معروف"}
                </p>
              </div>
              <FaCalendarAlt className="text-[#7a1353]" />
            </div>
          </div>
        </div>

        {/* تغيير كلمة المرور */}
<div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
    <FaLock className="text-[#7a1353]" />
    تغيير كلمة المرور
  </h3>

  <form onSubmit={handleChangePassword} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        كلمة المرور الحالية
      </label>
      <div className="relative">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700 pr-10"
          placeholder="أدخل كلمة المرور الحالية"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => {
            const input = e.target.closest('.relative').querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
          }}
        >
          <FaEye className="text-lg" />
        </button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        كلمة المرور الجديدة
      </label>
      <div className="relative">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700 pr-10"
          placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
          required
          minLength="6"
          disabled={loading}
        />
        <button
          type="button"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => {
            const input = e.target.closest('.relative').querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
          }}
        >
          <FaEye className="text-lg" />
        </button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        تأكيد كلمة المرور الجديدة
      </label>
      <div className="relative">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700 pr-10"
          placeholder="أعد إدخال كلمة المرور الجديدة"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => {
            const input = e.target.closest('.relative').querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
          }}
        >
          <FaEye className="text-lg" />
        </button>
      </div>
    </div>

    <button
      type="submit"
      className="w-full bg-[#7a1353] text-white py-3 px-4 rounded-lg hover:bg-[#6a1248] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin" />
          جاري التحديث...
        </span>
      ) : (
        'تغيير كلمة المرور'
      )}
    </button>
  </form>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <FaCog />
              نصائح لأمان أفضل
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
              <li>• لا تستخدم كلمات مرور مستخدمة في حسابات أخرى</li>
              <li>• غير كلمة المرور بانتظام</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ إضافة قسم إدارة المشرفين للمشرف العام فقط */}
      {userData?.role === 'super_admin' && (
        <AdminManager showToast={showToast} userData={userData} />
      )}
    </div>
  );
}

/* 👇 الكومبوننت الخاص بإضافة المشرفين الجدد */
function AdminManager({ showToast, userData }) {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("manager");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminsList, setAdminsList] = useState([]);

  // ✅ قائمة الأدوار المتاحة
  const roles = [
    { value: "super_admin", label: "المشرف العام" },
    { value: "manager", label: "مدير" },
    { value: "hr", label: "مدير موارد بشرية" },
    { value: "content", label: "مدير محتوى" }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    const { data, error } = await supabase
      .from('users') // ✅ تغيير من profiles إلى users
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ في جلب قائمة المشرفين:', error);
    } else {
      setAdminsList(data || []);
    }
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminName) {
      showToast("⚠️ الرجاء إدخال جميع البيانات", "error");
      return;
    }

    // ✅ التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      showToast("❌ يرجى إدخال بريد إلكتروني صحيح", "error");
      return;
    }

    setAddingAdmin(true);

    try {
      // ✅ إنشاء المستخدم الجديد في Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: newAdminEmail.trim().toLowerCase(),
        password: "123456", // كلمة مرور افتراضية
        options: {
          data: {
            name: newAdminName,
            role: newAdminRole
          }
        }
      });

      if (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
        
        if (error.message.includes('User already registered')) {
          showToast("❌ هذا البريد الإلكتروني مسجل بالفعل", "error");
        } else {
          showToast(`❌ خطأ في إنشاء المستخدم: ${error.message}`, "error");
        }
        return;
      }

      if (data.user) {
        // ✅ إضافة المستخدم إلى جدول users بدلاً من profiles
        const { error: userTableError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: newAdminEmail.trim().toLowerCase(),
              name: newAdminName,
              role: newAdminRole,
              created_by: userData.id,
              created_at: new Date().toISOString()
            }
          ]);

        if (userTableError) {
          console.error("❌ خطأ في إنشاء المستخدم في الجدول:", userTableError);
          
          // حذف المستخدم من Auth إذا فشل إنشاء السجل في الجدول
          await supabase.auth.admin.deleteUser(data.user.id);
          showToast("❌ فشل في إنشاء حساب المشرف", "error");
          return;
        }

        showToast(`✅ تم إنشاء المشرف ${newAdminName} بنجاح! كلمة المرور: 123456`, "success");
        
        // تحديث القائمة
        fetchAdmins();
        
        // مسح الحقول
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminRole("manager");
      }
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ غير متوقع", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  async function deleteAdmin(adminId) {
    if (!confirm("هل أنت متأكد من حذف هذا المشرف؟")) return;

    try {
      // حذف من جدول users أولاً
      const { error: userTableError } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);

      if (userTableError) {
        showToast(`❌ فشل حذف المشرف: ${userTableError.message}`, "error");
        return;
      }

      // حذف من Authentication (يتطلب صلاحيات admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
      
      if (authError) {
        console.warn("⚠️ تم حذف المشرف من القائمة ولكن قد يبقى في نظام المصادقة:", authError);
      }

      showToast("✅ تم حذف المشرف بنجاح", "success");
      fetchAdmins();
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast("❌ حدث خطأ أثناء حذف المشرف", "error");
    }
  }

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaUserPlus className="text-[#7a1353]" />
        إدارة المشرفين
      </h3>

      {/* نموذج إضافة مشرف جديد */}
      <form onSubmit={handleAddAdmin} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white placeholder-gray-500"
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل *
            </label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white placeholder-gray-500"
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصلاحية
          </label>
          <select
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            <strong>ملاحظة:</strong> كلمة المرور الافتراضية هي <strong>123456</strong> 
            <br />يمكن للمشرف تغييرها بعد تسجيل الدخول أول مرة
          </p>
        </div>

        <button
          type="submit"
          disabled={addingAdmin}
          className="w-full bg-[#7a1353] text-white px-6 py-3 rounded-lg hover:bg-[#6a124a] transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaUserPlus />
          {addingAdmin ? "جاري الإضافة..." : "إضافة مشرف جديد"}
        </button>
      </form>

      {/* قائمة المشرفين الحاليين */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          قائمة المشرفين ({adminsList.length})
        </h4>
        
        {adminsList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>لا يوجد مشرفين مضافين حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminsList.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f8e8f1] rounded-full flex items-center justify-center">
                      <FaUser className="text-[#7a1353]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{admin.name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs mt-1">
                        {getRoleLabel(admin.role)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {admin.id !== userData.id && (
                  <button
                    onClick={() => deleteAdmin(admin.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="حذف المشرف"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}