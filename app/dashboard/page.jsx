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
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";

// 🧩 مكون Toast احترافي
function Toast({ message, type = "info", onClose, action }) {
  useEffect(() => {
    const timer = setTimeout(onClose, type === "confirm" ? 10000 : 5000);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  const bgColor = {
    error: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    confirm: "bg-orange-500"
  }[type];

  const icon = {
    error: <FaTimes className="text-lg" />,
    success: <FaCheck className="text-lg" />,
    warning: <FaExclamationTriangle className="text-lg" />,
    info: <FaInfoCircle className="text-lg" />,
    confirm: <FaExclamationTriangle className="text-lg" />
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg max-w-sm z-[9999] animate-slide-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {action && type === "confirm" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={action.onConfirm}
                className="px-3 py-1 bg-white text-red-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                نعم، احذف
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}

// 🧩 مكون لحقول الإدخال مع التحقق من الصحة
function InputField({ label, type = "text", value, onChange, placeholder, required, error, disabled, icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}

// 🧩 مكون للنصوص الطويلة مع التحقق
function TextareaField({ label, value, onChange, placeholder, required, error, disabled, rows = 3, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all resize-none bg-white placeholder-gray-500 text-gray-700 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}

// 🧩 مكون لكلمة المرور مع إظهار/إخفاء
function PasswordField({ label, value, onChange, placeholder, required, error, disabled, showPassword, onToggleShowPassword }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7a1353] focus:border-[#7a1353] outline-none transition-all bg-white placeholder-gray-500 text-gray-700 pr-10 ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onToggleShowPassword}
          disabled={disabled}
        >
          <FaEye className={`text-lg ${showPassword ? "text-[#7a1353]" : ""}`} />
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}

// 🧩 مكون لعرض المعلومات
function InfoCard({ icon, label, value, className = "" }) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-semibold text-gray-800 ${className}`}>{value}</p>
      </div>
      {icon}
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
  const showToast = (msg, type = "info", action = null) => setToast({ msg, type, action });

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
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const COURSES_BUCKET = "courses-images";

  useEffect(() => {
    fetchCourses();
    getUserName();
  }, []);

  // التحقق من صحة النموذج
  const validateForm = () => {
    const errors = {};
    
    if (!newCourse.title.trim()) {
      errors.title = "حقل العنوان مطلوب";
    }
    
    if (!newCourse.description.trim()) {
      errors.description = "حقل الوصف مطلوب";
    }
    
    if (!newCourse.price.trim()) {
      errors.price = "حقل السعر مطلوب";
    } else if (isNaN(Number(newCourse.price))) {
      errors.price = "السعر يجب أن يكون رقماً";
    }
    
    if (!newCourse.category.trim()) {
      errors.category = "حقل الفئة مطلوب";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // دالة لجلب اسم المستخدم
  async function getUserName() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single();

        setUserName(userData?.name || user.email?.split('@')[0] || "مدير النظام");
      }
    } catch (error) {
      console.error("❌ خطأ في جلب بيانات المستخدم:", error);
      setUserName("مدير النظام");
    }
  }

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("❌ خطأ في جلب الدورات:", error);
      showToast("❌ فشل في تحميل الدورات", "error");
    }
  }

  async function uploadImage(file) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(COURSES_BUCKET)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(COURSES_BUCKET)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("❌ خطأ في رفع الصورة:", error);
      showToast("❌ فشل في رفع الصورة", "error");
      return null;
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("⚠️ يوجد أخطاء في النموذج، يرجى تصحيحها", "warning");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
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

      if (error) throw error;

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
      setFormErrors({});
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("❌ خطأ أثناء إضافة الدورة:", error);
      showToast(`❌ حدث خطأ أثناء الإضافة: ${error.message}`, "error");
    } finally {
      setLoading(false);
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
    // مسح خطأ الحقل عند البدء بالكتابة
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // دالة الحذف مع تأكيد
  const confirmDelete = (courseId, courseTitle) => {
    showToast(
      `هل أنت متأكد من حذف الدورة "${courseTitle}"؟`,
      "confirm",
      {
        onConfirm: () => deleteCourse(courseId)
      }
    );
  };

  async function deleteCourse(id) {
    try {
      const courseToDelete = courses.find((c) => c.id === id);
      if (!courseToDelete) return;

      const { error: dbError } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      if (courseToDelete.image) {
        const fileName = getFileNameFromUrl(courseToDelete.image, COURSES_BUCKET);
        if (fileName) {
          await supabase.storage
            .from(COURSES_BUCKET)
            .remove([fileName]);
        }
      }

      setCourses(courses.filter((c) => c.id !== id));
      showToast("✅ تم حذف الدورة بنجاح!", "success");
    } catch (error) {
      console.error("❌ خطأ في الحذف:", error);
      showToast("❌ فشل في حذف الدورة", "error");
    }
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
          action={toast.action}
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
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
            
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

        {/* زر القائمة للهواتف */}
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

                    <InputField
                      label="عنوان الدورة"
                      value={newCourse.title}
                      onChange={(e) => handleNewCourseInputChange('title', e.target.value)}
                      placeholder="أدخل عنوان الدورة هنا"
                      required
                      error={formErrors.title}
                      disabled={loading}
                      icon={<FaBook />}
                    />

                    <TextareaField
                      label="الوصف"
                      value={newCourse.description}
                      onChange={(e) => handleNewCourseInputChange('description', e.target.value)}
                      placeholder="اكتب وصفاً للدورة"
                      required
                      error={formErrors.description}
                      disabled={loading}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="السعر"
                        value={newCourse.price}
                        onChange={(e) => handleNewCourseInputChange('price', e.target.value)}
                        placeholder="مثال: 500"
                        required
                        error={formErrors.price}
                        disabled={loading}
                        icon={<FaTag />}
                      />
                      <InputField
                        label="الخصم"
                        value={newCourse.discount}
                        onChange={(e) => handleNewCourseInputChange('discount', e.target.value)}
                        placeholder="السعر بعد الخصم"
                        disabled={loading}
                        icon={<FaPercent />}
                      />
                    </div>

                    <InputField
                      label="الفئة"
                      value={newCourse.category}
                      onChange={(e) => handleNewCourseInputChange('category', e.target.value)}
                      placeholder="مثال: القانون، اللغة، التقنية"
                      required
                      error={formErrors.category}
                      disabled={loading}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaImage />
                        صورة الدورة
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // إزالة التحقق من حجم الصورة
                            if (!file.type.startsWith('image/')) {
                              showToast('الرجاء اختيار ملف صورة فقط', "error");
                              e.target.value = '';
                              return;
                            }
                            setImageFile(file);
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#7a1353] file:text-white file:cursor-pointer transition-all bg-white text-gray-700 disabled:opacity-50"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">جميع أحجام الصور مقبولة - الصيغ المدعومة: JPG, PNG, GIF, WebP</p>
                    </div>
                  </div>

                  {/* الجدول الزمني */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">الجدول الزمني</h3>

                    <InputField
                      label="تاريخ البدء"
                      type="date"
                      value={newCourse.start_date}
                      onChange={(e) => handleNewCourseInputChange('start_date', e.target.value)}
                      disabled={loading}
                      icon={<FaCalendarAlt />}
                    />

                    <InputField
                      label="الموعد"
                      value={newCourse.schedule_time}
                      onChange={(e) => handleNewCourseInputChange('schedule_time', e.target.value)}
                      placeholder="مثال: 6:00 مساءً - 8:00 مساءً"
                      disabled={loading}
                      icon={<FaClock />}
                    />

                    <InputField
                      label="أيام الإنعقاد"
                      value={newCourse.meeting_days}
                      onChange={(e) => handleNewCourseInputChange('meeting_days', e.target.value)}
                      placeholder="مثال: السبت، الإثنين، الأربعاء"
                      disabled={loading}
                      icon={<FaCalendarDay />}
                    />
                  </div>
                </div>
                
                {/* زر الإضافة مع سبينر */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#7a1353] text-white px-6 py-3 rounded-lg hover:bg-[#6a1248] transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        إضافة الدورة
                      </>
                    )}
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
                            onClick={() => confirmDelete(course.id, course.title)}
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
                            <InputField
                              label="تاريخ البدء"
                              type="date"
                              value={course.start_date || ""}
                              onChange={(e) => handleInputChange(course.id, 'start_date', e.target.value)}
                            />
                            <InputField
                              label="الموعد"
                              value={course.schedule_time || ""}
                              onChange={(e) => handleInputChange(course.id, 'schedule_time', e.target.value)}
                              placeholder="مثال: 6:00 مساءً - 8:00 مساءً"
                            />
                            <InputField
                              label="أيام الإنعقاد"
                              value={course.meeting_days || ""}
                              onChange={(e) => handleInputChange(course.id, 'meeting_days', e.target.value)}
                              placeholder="مثال: السبت، الإثنين، الأربعاء"
                            />
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

/* 👇 الكومبوننت الخاص بالحملات الإعلانية */
function CampaignsManager({ showToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const CAMPAIGN_BUCKET = "campaigns-images";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("❌ خطأ في جلب الحملات:", error);
      showToast("❌ فشل في تحميل الحملات", "error");
    }
  }

  async function uploadImage(file) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(CAMPAIGN_BUCKET)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(CAMPAIGN_BUCKET)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("❌ خطأ في رفع الصورة:", error);
      showToast("❌ فشل في رفع الصورة", "error");
      return null;
    }
  }

  const validateFile = (file) => {
    const errors = {};
    
    if (!file) {
      errors.file = "يجب اختيار صورة";
      return errors;
    }

    // إزالة التحقق من حجم الصورة
    if (!file.type.startsWith('image/')) {
      errors.file = "الرجاء اختيار ملف صورة فقط";
    }

    return errors;
  };

  async function addCampaignImage(e) {
    e.preventDefault();
    
    if (!imageFile) {
      showToast("⚠️ الرجاء اختيار صورة أولاً", "warning");
      return;
    }

    const errors = validateFile(imageFile);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("⚠️ يوجد خطأ في الملف المرفوع", "warning");
      return;
    }

    setUploading(true);
    setFormErrors({});

    try {
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setUploading(false);
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .insert([{ image: imageUrl }])
        .select();

      if (error) throw error;

      showToast("✅ تمت إضافة الصورة بنجاح!", "success");
      setCampaigns([data[0], ...campaigns]);
      setImageFile(null);
      
      // إعادة تعيين حقل الملف
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("❌ خطأ أثناء إضافة الحملة:", error);
      showToast(`❌ حدث خطأ أثناء الإضافة: ${error.message}`, "error");
    } finally {
      setUploading(false);
    }
  }

  const confirmDeleteCampaign = (campaignId) => {
    showToast(
      "هل أنت متأكد من حذف هذه الحملة الإعلانية؟",
      "confirm",
      {
        onConfirm: () => deleteCampaign(campaignId)
      }
    );
  };

  async function deleteCampaign(id) {
    try {
      const campaignToDelete = campaigns.find(c => c.id === id);
      if (!campaignToDelete) return;

      const { error: dbError } = await supabase.from("campaigns").delete().eq("id", id);
      if (dbError) throw dbError;

      if (campaignToDelete.image) {
        const fileName = getFileNameFromUrl(campaignToDelete.image, CAMPAIGN_BUCKET);
        if (fileName) {
          await supabase.storage
            .from(CAMPAIGN_BUCKET)
            .remove([fileName]);
        }
      }

      setCampaigns(campaigns.filter((c) => c.id !== id));
      showToast("✅ تم حذف الحملة بنجاح!", "success");
    } catch (error) {
      console.error("❌ خطأ في الحذف:", error);
      showToast("❌ فشل في حذف الحملة", "error");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <FaAd className="text-[#7a1353]" />
        إدارة الحملات الإعلانية
      </h2>

      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner border border-gray-200 mb-4 sm:mb-6">
        <form onSubmit={addCampaignImage} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                if (file) {
                  const errors = validateFile(file);
                  setFormErrors(errors);
                } else {
                  setFormErrors({});
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-gray-800 file:mr-2 file:py-2 file:px-4 file:rounded-md file:bg-[#7a1353] file:text-white file:border-none file:cursor-pointer transition-all duration-300 bg-white"
              placeholder="اختر صورة للحملة الإعلانية"
              disabled={uploading}
            />
            {formErrors.file && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" />
                {formErrors.file}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">جميع أحجام الصور مقبولة - الصيغ المدعومة: JPG, PNG, GIF, WebP</p>
          </div>
          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="bg-[#7a1353] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#6a124a] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <FaPlus />
                رفع الصورة
              </>
            )}
          </button>
        </form>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <FaAd className="text-4xl mx-auto mb-4 opacity-50" />
          <p className="text-lg">لا توجد حملات إعلانية حالياً</p>
          <p className="text-sm text-gray-400 mt-2">قم برفع صورة لإضافة حملة إعلانية جديدة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 group">
              <div className="relative overflow-hidden">
                <img 
                  src={c.image} 
                  alt={`حملة إعلانية ${c.id}`} 
                  className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => confirmDeleteCampaign(c.id)}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    title="حذف الحملة"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4 flex justify-between items-center">
                <span className="text-gray-600 text-sm">حملة #{c.id}</span>
                <button
                  onClick={() => confirmDeleteCampaign(c.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors flex items-center gap-1 sm:hidden"
                >
                  <FaTrash />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [formErrors, setFormErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const { data: userTableData } = await supabase
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
      console.error("❌ خطأ في جلب بيانات المستخدم:", error);
      showToast("❌ فشل في تحميل بيانات المستخدم", "error");
    }
  }

  const validatePasswordForm = () => {
    const errors = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else if (newPassword.length < 6) {
      errors.newPassword = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleChangePassword(e) {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      showToast("⚠️ يوجد أخطاء في النموذج، يرجى تصحيحها", "warning");
      return;
    }

    setLoading(true);

    try {
      if (!userData || !userData.email) {
        throw new Error("لا يمكن الوصول إلى بيانات المستخدم");
      }

      // التحقق من كلمة المرور الحالية
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: currentPassword
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("كلمة المرور الحالية غير صحيحة");
        } else if (authError.message.includes("Email not confirmed")) {
          throw new Error("البريد الإلكتروني غير مفعل");
        } else {
          throw new Error(`خطأ في المصادقة: ${authError.message}`);
        }
      }

      // تحديث كلمة المرور
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw new Error(`فشل في تغيير كلمة المرور: ${updateError.message}`);

      showToast("✅ تم تغيير كلمة المرور بنجاح", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormErrors({});
      
    } catch (error) {
      console.error("❌ خطأ في تغيير كلمة المرور:", error);
      showToast(`❌ ${error.message}`, "error");
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
            <InfoCard 
              icon={<FaUser className="text-[#7a1353]" />}
              label="معرف المستخدم"
              value={`${userData?.id?.substring(0, 8)}...`}
              className="font-mono text-xs"
            />

            <InfoCard 
              icon={<FaUser className="text-[#7a1353]" />}
              label="الاسم"
              value={userData?.name}
            />

            <InfoCard 
              icon={<FaEnvelope className="text-[#7a1353]" />}
              label="البريد الإلكتروني"
              value={userData?.email}
            />

            <InfoCard 
              icon={<FaLock className="text-[#7a1353]" />}
              label="الصلاحية"
              value={
                userData?.role === 'super_admin' ? 'المشرف العام' : 
                userData?.role === 'manager' ? 'مدير' : 
                userData?.role === 'hr' ? 'مدير موارد بشرية' : 
                userData?.role === 'content' ? 'مدير محتوى' : 'مستخدم'
              }
            />

            <InfoCard 
              icon={<FaCalendarAlt className="text-[#7a1353]" />}
              label="تاريخ الإنشاء"
              value={userData?.created_at ? new Date(userData.created_at).toLocaleDateString('ar-EG') : "غير معروف"}
            />
          </div>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaLock className="text-[#7a1353]" />
            تغيير كلمة المرور
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              label="كلمة المرور الحالية"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (formErrors.currentPassword) {
                  setFormErrors(prev => ({ ...prev, currentPassword: "" }));
                }
              }}
              placeholder="أدخل كلمة المرور الحالية"
              required
              error={formErrors.currentPassword}
              disabled={loading}
              showPassword={showCurrentPassword}
              onToggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordField
              label="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formErrors.newPassword) {
                  setFormErrors(prev => ({ ...prev, newPassword: "" }));
                }
                if (formErrors.confirmPassword) {
                  setFormErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
              }}
              placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
              required
              error={formErrors.newPassword}
              disabled={loading}
              showPassword={showNewPassword}
              onToggleShowPassword={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordField
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formErrors.confirmPassword) {
                  setFormErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
              }}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              required
              error={formErrors.confirmPassword}
              disabled={loading}
              showPassword={showConfirmPassword}
              onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <button
              type="submit"
              className="w-full bg-[#7a1353] text-white py-3 px-4 rounded-lg hover:bg-[#6a1248] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  جاري التحديث...
                </>
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
              <li>• استخدم كلمة مرور لا تقل عن 8 أحرف</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ إضافة قسم إدارة المشرفين لجميع المستخدمين المسجلين */}
{userData && userData.id && (
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
  const [formErrors, setFormErrors] = useState({});

  // جميع الأدوار متاحة لجميع المستخدمين
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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminsList(data || []);
    } catch (error) {
      console.error('❌ خطأ في جلب قائمة المشرفين:', error);
      showToast("❌ فشل في تحميل قائمة المشرفين", "error");
    }
  }

  const validateAdminForm = () => {
    const errors = {};

    if (!newAdminEmail.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!newAdminName.trim()) {
      errors.name = "الاسم الكامل مطلوب";
    } else if (newAdminName.trim().length < 2) {
      errors.name = "الاسم يجب أن يكون على الأقل حرفين";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!validateAdminForm()) {
      showToast("⚠️ يوجد أخطاء في النموذج، يرجى تصحيحها", "warning");
      return;
    }

    setAddingAdmin(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newAdminEmail.trim().toLowerCase(),
        password: "123456",
        options: {
          data: {
            name: newAdminName,
            role: newAdminRole
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error("هذا البريد الإلكتروني مسجل بالفعل");
        } else {
          throw new Error(`خطأ في إنشاء المستخدم: ${error.message}`);
        }
      }

      if (data.user) {
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
          // حذف المستخدم من Auth إذا فشل إنشاء السجل في الجدول
          await supabase.auth.admin.deleteUser(data.user.id);
          throw new Error("فشل في إنشاء حساب المشرف");
        }

        showToast(`✅ تم إنشاء المشرف ${newAdminName} بنجاح! كلمة المرور: 123456`, "success");

        fetchAdmins();
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminRole("manager");
        setFormErrors({});
      }
    } catch (error) {
      console.error("❌ خطأ في إضافة المشرف:", error);
      showToast(`❌ ${error.message}`, "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  const confirmDeleteAdmin = (adminId, adminName) => {
    // التحقق مما إذا كان المستخدم يحاول حذف نفسه
    if (adminId === userData.id) {
      showToast("❌ لا يمكنك حذف حسابك الخاص", "error");
      return;
    }
    
    showToast(
      `هل أنت متأكد من حذف المشرف "${adminName}"؟`,
      "confirm",
      {
        onConfirm: () => deleteAdmin(adminId)
      }
    );
  };

  async function deleteAdmin(adminId) {
    try {
      // التحقق مما إذا كان المستخدم يحاول حذف نفسه
      if (adminId === userData.id) {
        throw new Error("لا يمكنك حذف حسابك الخاص");
      }

      // حذف من جدول users أولاً
      const { error: userTableError } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);

      if (userTableError) throw new Error(`فشل حذف المشرف: ${userTableError.message}`);

      // حذف من Authentication
      const { error: authError } = await supabase.auth.admin.deleteUser(adminId);

      if (authError) {
        console.warn("⚠️ تم حذف المشرف من القائمة ولكن قد يبقى في نظام المصادقة:", authError);
      }

      showToast("✅ تم حذف المشرف بنجاح", "success");
      fetchAdmins();
    } catch (error) {
      console.error("❌ خطأ غير متوقع:", error);
      showToast(`❌ ${error.message}`, "error");
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
          <InputField
            label="البريد الإلكتروني"
            type="email"
            value={newAdminEmail}
            onChange={(e) => {
              setNewAdminEmail(e.target.value);
              if (formErrors.email) {
                setFormErrors(prev => ({ ...prev, email: "" }));
              }
            }}
            placeholder="أدخل البريد الإلكتروني"
            required
            error={formErrors.email}
            disabled={addingAdmin}
          />

          <InputField
            label="الاسم الكامل"
            value={newAdminName}
            onChange={(e) => {
              setNewAdminName(e.target.value);
              if (formErrors.name) {
                setFormErrors(prev => ({ ...prev, name: "" }));
              }
            }}
            placeholder="أدخل الاسم الكامل"
            required
            error={formErrors.name}
            disabled={addingAdmin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصلاحية
          </label>
          <select
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1353] outline-none bg-white"
            disabled={addingAdmin}
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
            <br /><strong>جميع المستخدمين يمكنهم إضافة مشرفين بجميع الصلاحيات</strong>
          </p>
        </div>

        <button
          type="submit"
          disabled={addingAdmin}
          className="w-full bg-[#7a1353] text-white px-6 py-3 rounded-lg hover:bg-[#6a124a] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {addingAdmin ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            <>
              <FaUserPlus />
              إضافة مشرف جديد
            </>
          )}
        </button>
      </form>

      {/* قائمة المشرفين الحاليين */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          قائمة المشرفين ({adminsList.length})
        </h4>

        {adminsList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FaUser className="text-3xl mx-auto mb-2 opacity-50" />
            <p>لا يوجد مشرفين مضافين حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminsList.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#7a1353]/30 transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f8e8f1] rounded-full flex items-center justify-center">
                      <FaUser className="text-[#7a1353]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{admin.name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          admin.role === 'super_admin' 
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : admin.role === 'manager'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {getRoleLabel(admin.role)}
                        </span>
                        {admin.id === userData.id && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            أنت
                          </span>
                        )}
                      </div>
                      {admin.created_by && (
                        <p className="text-xs text-gray-500 mt-1">
                          أضيف بواسطة: {admin.created_by === userData.id ? "أنت" : "مدير آخر"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {admin.id !== userData.id ? (
                    <button
                      onClick={() => confirmDeleteAdmin(admin.id, admin.name)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف المشرف"
                    >
                      <FaTrash />
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400 px-2">حسابك</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}