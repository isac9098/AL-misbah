'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function FloatingAdminBubble() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // ✅ التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuth = () => {
      try {
        // التحقق من localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsVisible(true);
        } else {
          setUser(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error("❌ خطأ في قراءة بيانات المستخدم:", error);
        setUser(null);
        setIsVisible(false);
      }
    };

    // التحقق فوراً
    checkAuth();

    // ✅ الاستماع لتغييرات localStorage
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ الانتقال إلى Dashboard
  const goToDashboard = () => {
    if (user) {
      router.push("/dashboard");
    }
  };

  // ✅ إخفاء الفقاعة إذا لم يكن هناك مستخدم مسجل
  if (!isVisible || !user) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-50"
      title="لوحة التحكم - انقر للانتقال"
    >
      <button
        onClick={goToDashboard}
        className="flex items-center justify-center w-14 h-14 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-all"
      >
        {/* أيقونة الترس */}
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
      </button>
    </div>
  );
}

export default FloatingAdminBubble;