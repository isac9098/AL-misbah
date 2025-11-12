"use client";

import { useApp } from "./context/AppContext";

import Header from "../components/Header";
import Hero from "../components/Hero";
import FeaturesBar from "../components/FeaturesBar";
import CoursesCarousel from "../components/CoursesCarousel";
import OnlineLearningSection from "../components/OnlineLearningSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";
import WhatsappBubble from "../components/WhatsappBubble";

export default function LandingPage() {
  const { t, lang } = useApp();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans transition-all">
      {/* الهيدر */}
      <Header />

      {/* قسم البطل */}
      <Hero />

      {/* شريط المميزات */}
      <FeaturesBar />

      {/* الكاروسيل الخاص بالدورات */}
      <CoursesCarousel />

      {/* القسم الجديد (التعلم عن بعد) */}
      <OnlineLearningSection />

      {/* قسم آراء العملاء */}
      <TestimonialsSection />

      {/* الفوتر */}
      <Footer />

      {/* فقاعة واتساب */}
      <WhatsappBubble />

    </div>
  );
}
