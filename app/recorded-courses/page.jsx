"use client"; // 👈 التوجيه الضروري لتشغيل useState والميزات التفاعلية

import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; // 👈 استيراد useState مباشرة

import { FaLaptopCode, FaBalanceScale, FaMicrophoneAlt, FaHandsHelping, FaChess, FaLanguage, FaOilCan, FaPlane, FaDesktop, FaPalette, FaUserTie, FaGraduationCap, FaMousePointer, FaHardHat } from "react-icons/fa";

// 🎨 تعاريف الألوان الجديدة
const PRIMARY_COLOR = "#601a43"; // لون خمري داكن / عنابي
const ACCENT_COLOR = "#fbc02d"; // لون أصفر ذهبي للنبرة

// بيانات تصنيفات الدورات 
const categories = [
  { name: "التصميم الجرافيكي والمعماري", icon: FaPalette, href: "/courses/design" },
  { name: "الإدارة والمحاسبة", icon: FaChess, href: "/courses/management" },
  { name: "البرمجة", icon: FaLaptopCode, href: "/courses/programming" },
  { name: "الشبكات وأمن المعلومات", icon: FaDesktop, href: "/courses/networking" },
  
  { name: "مهارات الحاسوب", icon: FaMousePointer, href: "/courses/computer-skills" },
  { name: "تكنولوجيا التعليم الرقمي", icon: FaGraduationCap, href: "/courses/edutech" },
  { name: "اللغات", icon: FaLanguage, href: "/courses/languages" },
  { name: "الهندسة", icon: FaHardHat, href: "/courses/engineering" },

  { name: "القانون", icon: FaBalanceScale, href: "/courses/law" },
  { name: "النفط والغاز", icon: FaOilCan, href: "/courses/oil-gas" },
  { name: "إدارة المطارات وعلوم السياحة والسفر", icon: FaPlane, href: "/courses/travel" },
  { name: "الرعاية الصحية (طبية)", icon: FaHandsHelping, href: "/courses/medical" },
  
  { name: "الصحافة والإعلام الرقمي", icon: FaMicrophoneAlt, href: "/courses/media" },
  { name: "السلامة والصحة المهنية", icon: FaHardHat, href: "/courses/safety" },
];

// 🔔 مكون رسالة "قريباً" (Toast Component)
const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4 bg-gray-800 text-white rounded-lg shadow-2xl opacity-90 transition-opacity duration-300">
      <p className="font-bold">{message}</p>
    </div>
  );
};


// مكون بطاقة التصنيف (يعمل الآن كزر يستدعي دالة onClick)
const CategoryCard = ({ name, icon: Icon, onClick }) => (
    // تم استبدال <Link> بـ <div> مع إضافة خاصية onClick
    <div 
        onClick={onClick} 
        className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg text-gray-700 hover:shadow-lg hover:border-[#601a43] transition duration-300 cursor-pointer text-center bg-white h-full"
        role="button" // لتحسين إمكانية الوصول
    >
        <Icon className="w-8 h-8 text-[#601a43] mb-3" /> {/* لون خمري للأيقونات */}
        <h3 className="font-medium text-sm md:text-base">{name}</h3>
    </div>
);


export default function RecordedCoursesPage() {
  const HERO_BG_IMAGE = "/images/maroon-bg.jpg"; 

  // حالة الإشعار
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // دالة عرض الإشعار
  const handleComingSoon = (message = "قريباً") => {
    setToastMessage(message);
    setIsToastVisible(true);
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔴 Hero Section - رأس الصفحة */}
      <section className="relative bg-[#381125] overflow-hidden"> 
        <Image 
          src="/images/3784896-scaled.jpg" 
          alt="خلفية الدورات المسجلة"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-70"
          priority
        />
        
        {/* محتوى الهيرو */}
        <div className="relative z-10 text-white pt-20 pb-28 md:py-32 px-6 max-w-7xl mx-auto">
          
          {/* شريط التنقل العلوي */}
          <nav className="text-sm flex justify-end gap-4 mb-10">
            <Link href="/" className="hover:text-[#fbc02d]">الرئيسية</Link> 
            <span className="text-gray-400">/</span>
            <span className="text-[#fbc02d]">المواضيع المسجلة</span> 
          </nav>

          <div className="flex flex-col md:flex-row items-center justify-between text-right">
            <div className="md:w-1/2">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                الدورات المسجلة
              </h1>
              <p className="text-3xl text-[#fbc02d] font-semibold"> 
                طور مهاراتك بدون قيود
              </p>
            </div>
            
            {/* أيقونة الفيديو */}
            <div className="md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0">
                <div className="p-8 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl relative -top-10 md:top-0">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6 19V5h12v14H6zm11-6l-5-3.05V15z"/>
                        <circle cx="9" cy="9" r="1"/>
                        <circle cx="15" cy="9" r="1"/>
                        <circle cx="9" cy="15" r="1"/>
                        <circle cx="15" cy="15" r="1"/>
                        <polygon points="12 12 12 15 15 12"/>
                    </svg>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* النص التعريفي أسفل الهيرو */}
      <div className="max-w-4xl mx-auto text-center py-10 px-6 bg-white shadow-md relative z-20 -mt-16 md:-mt-24 rounded-lg">
        <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
          مجموعة من الدورات المسجلة مسبقاً، تمكنك من تطوير
          <span className="font-semibold text-[#601a43]"> مهاراتك في الوقت المناسب لك</span> 
        </p>
      </div>

      {/* 🌟 Categories Grid - شبكة التصنيفات */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            // استدعاء دالة handleComingSoon لكل تصنيف
            <CategoryCard 
                key={category.name} 
                icon={category.icon}
                name={category.name}
                onClick={() => handleComingSoon(`تصنيف "${category.name}" قريباً...`)} 
            />
          ))}
        </div>
      </section>
      
      {/* 🔔 عرض رسالة قريباً */}
      <Toast message={toastMessage} isVisible={isToastVisible} />

    </div>
  );
}