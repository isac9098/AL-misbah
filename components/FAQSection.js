"use client";

import { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  primaryDark: "#0d1b2a",
  accent: "#fbc02d",
  maroon: "#601a43",
};

const faqData = [
  {
    question: "كيف أسجل في دورة؟",
    answer:
      "يمكنك التسجيل عن طريق ملء نموذج الاتصال في هذه الصفحة، أو الاتصال بمكتب القبول لدينا، أو زيارة مركز التدريب الخاص بنا شخصيًا. سيرشدك فريقنا خلال عملية التسجيل.",
  },
  {
    question: "هل هناك متطلبات مسبقة لدوراتكم؟",
    answer:
      "معظم دوراتنا لا تتطلب متطلبات محددة مسبقة. ومع ذلك، يوصى بمعرفة أساسية بالكمبيوتر لجميع البرامج. دورة ICDL مناسبة للمبتدئين، في حين أن بعض وحدات المحاسبة الإلكترونية المتقدمة قد تتطلب معرفة أساسية بالمحاسبة.",
  },
  {
    question: "ما هي الشهادات التي سأحصل عليها بعد الانتهاء؟",
    answer:
      "عند الانتهاء بنجاح من دورتك واجتياز التقييمات المطلوبة، ستحصل على شهادة رسمية. بالنسبة لـ ICDL، ستحصل على شهادة ICDL معترف بها دوليًا. توفر برامج المحاسبة الإلكترونية وتخليص المستندات شهادات المصباح التي يتم الاعتراف بها جيدًا من قبل أصحاب العمل المحليين.",
  },
  {
    question: "هل تقدمون خطط دفع مرنة؟",
    answer:
      "نعم، نقدم خيارات دفع مرنة بما في ذلك خطط التقسيط. يرجى الاتصال بمكتب القبول لدينا للحصول على تفاصيل حول خطط الدفع المتاحة لدورتك المحددة التي تهتم بها.",
  },
  {
    question: "هل يمكنني زيارة المنشأة قبل التسجيل؟",
    answer:
      "بالتأكيد! نشجع الطلاب المحتملين على زيارة مركز التدريب الخاص بنا. يمكنك جدولة جولة بالاتصال بنا عبر الهاتف أو البريد الإلكتروني، وسيكون فريقنا سعيدًا بإظهار مرافقنا والإجابة على أي أسئلة.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const lastScroll = useRef(0);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current) {
        setShowWhatsApp(false);
      } else {
        setShowWhatsApp(true);
      }
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0d1b2a]">
      {/* الهيرو */}
      <section
        className="relative text-white py-20 px-6 overflow-hidden"
        style={{ backgroundColor: COLORS.primaryDark }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-right"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            الأسئلة المتكررة
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl">
            اعثر على إجابات للأسئلة الشائعة حول دوراتنا وعملية التسجيل والمزيد.
          </p>
        </motion.div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-5xl mx-auto py-16 px-6 text-right">
        {faqData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="mb-4 border-b border-gray-300 pb-4"
          >
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full flex justify-between items-center py-3 text-lg font-semibold hover:text-[#fbc02d] transition"
            >
              {item.question}
              <span className="text-2xl">{openIndex === idx ? "-" : "+"}</span>
            </button>

            <AnimatePresence>
              {openIndex === idx && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-gray-700 leading-relaxed"
                >
                  {item.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        <p className="mt-6 text-gray-600">
          هل لا تزال لديك أسئلة؟ اتصل بنا مباشرة للحصول على مزيد من المعلومات.
        </p>

        {/* أزرار التواصل */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="tel:+97472041794"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#601a43] text-white font-semibold hover:bg-[#4e1334] transition"
          >
            <FaPhoneAlt /> اتصال مباشر
          </a>
        </div>

        {/* WhatsApp Floating */}
        <motion.a
          href="https://wa.me/+97472041794"
          target="_blank"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: showWhatsApp ? 1 : 0, y: showWhatsApp ? 0 : 50 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1eb15a] cursor-pointer"
        >
          <FaWhatsapp className="w-6 h-6" />
          {showWhatsApp && <span className="font-semibold">تواصل عبر واتساب</span>}
        </motion.a>
      </section>
    </div>
  );
}
