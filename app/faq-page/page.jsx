"use client";

import Link from "next/link";
import { useState } from "react";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "كيف أسجل في دورة؟",
    answer: `يمكنك التسجيل عن طريق اختيار الدورة المطلوبة وإضافتها للسلة، ثم تقوم بطلب هذه الدورة، أو زيارة مركز التدريب الخاص بنا شخصيًا.`,
  },
  {
    question: "هل هناك متطلبات مسبقة لدوراتكم؟",
    answer: `معظم دوراتنا لا تتطلب متطلبات محددة مسبقة. ومع ذلك، يوصى بمعرفة أساسية بالكمبيوتر لجميع البرامج.`,
  },
  {
    question: "ما هي الشهادات التي سأحصل عليها بعد الانتهاء؟",
    answer: `تحصل على شهادة رسمية من مركز المصباح، وبعض الدورات مثل ICDL تمنح شهادة معترف بها دوليًا.`,
  },
  {
    question: "هل تقدمون خطط دفع مرنة؟",
    answer: `نعم، نقدم خيارات دفع مرنة بما في ذلك خطط التقسيط.`,
  },
  {
    question: "هل يمكنني زيارة المنشأة قبل التسجيل؟",
    answer: `بالطبع! يمكنك زيارة مركز التدريب أو جدولة مقابلة مسبقة.`,
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-right">
      {/* رأس الصفحة */}
      <header className="py-16 px-6 bg-[#601a43] text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4">الأسئلة المتكررة</h1>
          <p className="text-gray-200">
            اعثر على إجابات للأسئلة الشائعة حول دوراتنا وعملية التسجيل والمزيد.
          </p>
        </div>
      </header>

      {/* المحتوى */}
      <main className="flex-1 max-w-4xl mx-auto p-6 space-y-4">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-4 rounded-xl shadow cursor-pointer"
            onClick={() => setExpanded(expanded === idx ? null : idx)}
          >
            <h2 className="font-semibold text-[#601a43]">{faq.question}</h2>
            {expanded === idx && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </motion.div>
        ))}
      </main>

      {/* التذييل */}
      <footer className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Link
          href="tel:+97472041794"
          className="flex items-center gap-2 bg-[#601a43] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          <FaPhone /> اتصال مباشر
        </Link>
        <Link
          href="https://wa.me/+97472041794"
          className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          <FaWhatsapp /> تواصل عبر واتساب
        </Link>
      </footer>

      {/* سطر الحقوق */}
      <div className="text-center text-gray-500 text-sm pb-6">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </div>
  );
}
