"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

/* ---------------------- 🟣 Sidebar ---------------------- */
function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 bg-[#7b0b4c] text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6">لوحة التحكم</h2>

      <nav className="space-y-4">
        <a className="block py-2 px-3 hover:bg-white/10 rounded-lg cursor-pointer">
          🏠 الرئيسية
        </a>
        <a className="block py-2 px-3 hover:bg-white/10 rounded-lg cursor-pointer">
          🎓 إدارة الدورات
        </a>
        <a className="block py-2 px-3 hover:bg-white/10 rounded-lg cursor-pointer">
          🖼️ الحملات الإعلانية
        </a>
        <a className="block py-2 px-3 hover:bg-white/10 rounded-lg cursor-pointer">
          ⚙️ الإعدادات
        </a>
      </nav>
    </div>
  );
}

/* ---------------------- 🔵 Navbar ---------------------- */
function Navbar({ userName }) {
  return (
    <div className="w-full bg-white shadow flex items-center justify-between px-6 py-4 mb-6">
      <h1 className="text-xl font-bold text-[#7b0b4c]">لوحة التحكم</h1>

      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">👤 {userName}</span>
      </div>
    </div>
  );
}

/* ---------------------- 🟡 Toast Component ---------------------- */
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

/* ---------------------- 🔧 Helpers ---------------------- */
function getFileNameFromUrl(url, bucketName) {
  if (!url) return null;
  const path = url.split(bucketName + "/")[1];
  return path || null;
}

/* ================================================================
   🔥 🔥 START DASHBOARD PAGE
================================================================ */
export default function CoursesDashboard() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
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
  const [userName, setUserName] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);

  const COURSES_BUCKET = "courses-images";

  const showToast = (msg, type = "info") => setToast({ msg, type });

  useEffect(() => {
    fetchCourses();
    getUserName();
  }, []);

  /* ----------------- Fetch User Name ----------------- */
  async function getUserName() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setUserName("مدير النظام");
        return;
      }

      if (user) {
        const name =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "مدير النظام";

        setUserName(name);
      }
    } catch {
      setUserName("مدير النظام");
    }
  }

  /* ----------------- Fetch Courses ----------------- */
  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      showToast("❌ فشل في تحميل الدورات", "error");
      return;
    }

    const processedData = data.map((course) => {
      if (course.metadata && typeof course.metadata === "object") {
        return {
          ...course,
          ...course.metadata,
        };
      }
      return course;
    });

    setCourses(processedData);
  }

  /* ----------------- Upload Image ----------------- */
  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(COURSES_BUCKET)
      .upload(fileName, file);

    if (error) {
      showToast("فشل رفع الصورة!", "error");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(COURSES_BUCKET)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  /* ----------------- Add Course ----------------- */
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

  /* ----------------- Update Course Schedule ----------------- */
  async function updateCourseSchedule(courseId, updates) {
    try {
      const existingFields = [
        "title",
        "description",
        "image",
        "price",
        "discount",
        "category",
      ];

      const safeUpdates = {};

      existingFields.forEach((f) => {
        if (updates[f] !== undefined) safeUpdates[f] = updates[f];
      });

      const newFields = [
        "level",
        "duration",
        "schedule",
        "start_date",
        "end_date",
        "instructor",
      ];

      const metadata = {};

      newFields.forEach((f) => {
        if (updates[f] !== undefined && updates[f] !== "") {
          metadata[f] = updates[f];
        }
      });

      if (Object.keys(metadata).length > 0) {
        safeUpdates.metadata = metadata;
      }

      const { error } = await supabase
        .from("courses")
        .update(safeUpdates)
        .eq("id", courseId);

      if (error) {
        showToast(`❌ حدث خطأ أثناء التحديث: ${error.message}`, "error");
        return false;
      } else {
        setCourses(
          courses.map((course) =>
            course.id === courseId
              ? { ...course, ...safeUpdates, ...metadata }
              : course
          )
        );

        setEditingCourse(null);
        showToast("✅ تم تحديث جدول الدورة بنجاح!", "success");
        return true;
      }
    } catch {
      showToast("❌ خطأ غير متوقع أثناء التحديث", "error");
      return false;
    }
  }

  const handleSaveSchedule = async (id) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    await updateCourseSchedule(id, {
      level: course.level || "",
      duration: course.duration || "",
      schedule: course.schedule || "",
      start_date: course.start_date || "",
      end_date: course.end_date || "",
      instructor: course.instructor || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleInputChange = (id, field, value) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  /* ----------------- Delete Course ----------------- */
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
      const fileName = getFileNameFromUrl(
        courseToDelete.image,
        COURSES_BUCKET
      );

      if (fileName) {
        await supabase.storage.from(COURSES_BUCKET).remove([fileName]);
      }
    }

    setCourses(courses.filter((c) => c.id !== id));
    showToast("✅ تم حذف الدورة بنجاح!", "success");
  }

  /* ===================================================================
     🎨 MAIN RETURN WITH SIDEBAR + NAVBAR + DASHBOARD CONTENT
  =================================================================== */
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ------ Sidebar ------ */}
      <Sidebar />

      {/* ------ Page Content ------ */}
      <div className="flex-1 p-4 md:p-8">

        {/* Navbar */}
        <Navbar userName={userName} />

        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* ORIGINAL CONTENT KEPT 100% */}
        {/* --------------------------------------------------------------- */}

        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6">

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#7b0b4c]">
                🎓 إدارة الدورات والمواعيد
              </h1>
              <p className="text-gray-700 mt-1 text-sm">
                مرحباً 👋 {userName}
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-[#7b0b4c] text-white rounded-lg hover:bg-[#5e0839]"
            >
              ← الرجوع للصفحة الرئيسية
            </button>
          </div>

          {/* نموذج الإضافة */}
          <form
            onSubmit={addCourse}
            className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#7b0b4c]">
              ➕ إضافة دورة جديدة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="عنوان الدورة *"
                value={newCourse.title}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="الوصف *"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-3"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="السعر *"
                value={newCourse.price}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, price: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="الخصم (اختياري)"
                value={newCourse.discount}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, discount: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="الفئة *"
                value={newCourse.category}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, category: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="mt-6 bg-[#7b0b4c] text-white px-8 py-3 rounded-lg hover:bg-[#5e0839]"
            >
              إضافة الدورة
            </button>
          </form>

          {/* ----------- إدارة المواعيد ----------- */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-[#7b0b4c]">
              🗓️ إدارة مواعيد وجداول الدورات
            </h2>

            {courses.length === 0 ? (
              <p className="text-gray-500 text-center">
                لا توجد دورات حالياً.
              </p>
            ) : (
              <div className="space-y-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl p-6 shadow border"
                  >
                    {/* ------------ Course Header ------------ */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingCourse(
                              editingCourse === course.id
                                ? null
                                : course.id
                            )
                          }
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          {editingCourse === course.id
                            ? "إلغاء"
                            : "✏️ تعديل الجدول"}
                        </button>

                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>

                    {/* ------------ EDITING MODE ------------ */}
                    {editingCourse === course.id ? (
                      <div className="bg-yellow-50 border rounded-xl p-6 mt-4">
                        <h4 className="font-semibold text-yellow-800 mb-4">
                          🛠️ تعديل جدول الدورة
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="المستوى"
                            value={course.level || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "level",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />

                          <input
                            type="text"
                            placeholder="المدة"
                            value={course.duration || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "duration",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />

                          <input
                            type="text"
                            placeholder="المدرب"
                            value={course.instructor || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "instructor",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />

                          <input
                            type="date"
                            value={course.start_date || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "start_date",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />

                          <input
                            type="date"
                            value={course.end_date || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "end_date",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />

                          <input
                            type="text"
                            placeholder="الجدول"
                            value={course.schedule || ""}
                            onChange={(e) =>
                              handleInputChange(
                                course.id,
                                "schedule",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded"
                          />
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                          >
                            إلغاء
                          </button>

                          <button
                            onClick={() => handleSaveSchedule(course.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                          >
                            حفظ التغييرات
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ------------ VIEW MODE ------------ */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          🎯 المستوى:
                          <p className="font-semibold">
                            {course.level || "غير محدد"}
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          ⏰ المدة:
                          <p className="font-semibold">
                            {course.duration || "غير محددة"}
                          </p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          👨‍🏫 المدرب:
                          <p className="font-semibold">
                            {course.instructor || "غير محدد"}
                          </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          📅 الموعد:
                          <p className="font-semibold">
                            {course.schedule || "غير محدد"}
                          </p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                          📅 تاريخ البدء:
                          <p className="font-semibold">
                            {course.start_date || "غير محدد"}
                          </p>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                          📅 تاريخ النهاية:
                          <p className="font-semibold">
                            {course.end_date || "غير محدد"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- حملات الإعلانات ---------------- */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4 text-[#7b0b4c]">
              🖼️ إدارة الحملات الإعلانية
            </h2>

            <CampaignsManager showToast={showToast} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
    📢 CAMPAIGNS COMPONENT
=================================================================== */
function CampaignsManager({ showToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CAMPAIGN_BUCKET = "campaigns-images";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("id", { ascending: false });

    setCampaigns(data || []);
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(CAMPAIGN_BUCKET)
      .upload(fileName, file);

    if (error) {
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

    const { data } = await supabase
      .from("campaigns")
      .insert([{ image: imageUrl }])
      .select();

    setCampaigns([data[0], ...campaigns]);
    setImageFile(null);
    showToast("تمت الإضافة بنجاح!", "success");
  }

  async function deleteCampaign(id) {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;

    const fileName = getFileNameFromUrl(campaign.image, CAMPAIGN_BUCKET);

    await supabase.from("campaigns").delete().eq("id", id);

    if (fileName) {
      await supabase.storage.from(CAMPAIGN_BUCKET).remove([fileName]);
    }

    setCampaigns(campaigns.filter((c) => c.id !== id));
    showToast("تم حذف الحملة!", "success");
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner border">
      <form
        onSubmit={addCampaignImage}
        className="flex flex-col sm:flex-row gap-4"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border p-3 rounded-lg w-full"
        />

        <button
          type="submit"
          disabled={uploading}
          className="bg-[#7b0b4c] text-white px-6 py-3 rounded-lg"
        >
          {uploading ? "جاري الرفع..." : "رفع الصورة"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-md border overflow-hidden"
          >
            <img
              src={c.image}
              alt="campaign"
              className="w-full h-48 object-cover"
            />

            <div className="p-4 flex justify-between items-center">
              <span className="text-gray-600">حملة #{c.id}</span>

              <button
                onClick={() => deleteCampaign(c.id)}
                className="text-red-600 font-semibold"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
