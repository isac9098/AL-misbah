"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";

export default function TermsPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen flex flex-col items-center justify-start px-4 py-16 overflow-hidden"
    >
      {/* خلفية الصورة */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('/images/recorded-courses.jpg')", 
        }}
      ></div>

      {/* تظليل خفيف */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-pink-50/90 backdrop-blur-sm"></div>

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-5xl">
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-[#7b0b4c] mb-6 text-center"
        >
          الشروط والأحكام
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-gray-500 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          من خلال استخدامك لموقعنا أو التسجيل في إحدى دوراتنا، فإنك توافق على
          الالتزام بجميع الشروط والأحكام التالية الخاصة بمركز المصباح للتدريب.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-white/90 shadow-xl rounded-2xl p-8 space-y-8 backdrop-blur-sm"
        >
          <Section
            title="1. التسجيل واستخدام الموقع"
            content="يجب أن تكون المعلومات التي تقدمها صحيحة ومحدثة. يحتفظ المركز بحق تعليق أو إلغاء أي حساب في حال تقديم معلومات غير صحيحة أو استخدام غير قانوني للموقع."
          />
          <Section
            title="2. الدورات والدفع"
            content="يحق للمركز تعديل مواعيد أو محتوى الدورات بما يتناسب مع متطلبات الجودة. يتم الدفع وفقاً لسياسات المركز، وقد تُتاح خطط تقسيط محددة. لا تُسترد الرسوم بعد بدء الدورة إلا حسب سياسة الاسترجاع."
          />
          <Section
            title="3. حقوق الملكية الفكرية"
            content="جميع الحقوق محفوظة لمركز المصباح للتدريب. يُمنع نسخ أو إعادة نشر أي محتوى دون إذن كتابي مسبق."
          />
          <Section
            title="4. سياسة الخصوصية"
            content="يلتزم المركز بحماية خصوصية بيانات المستخدمين وعدم مشاركتها مع أي طرف ثالث دون موافقة، إلا في الحالات التي يتطلبها القانون."
          />
          <Section
            title="5. الإلغاء والتعديلات"
            content="يحق للمركز تعديل هذه الشروط في أي وقت، وسيُعتبر استمرارك في استخدام الموقع موافقة على التعديلات الجديدة."
          />
          <Section
            title="6. المسؤولية القانونية"
            content="المركز غير مسؤول عن أي أضرار ناتجة عن سوء استخدام الموقع أو الخدمات. يتحمل المستخدم كامل المسؤولية عن استخدامه للموقع بما يتوافق مع القوانين المحلية."
          />
          <Section
            title="7. التواصل معنا"
            content="لأي استفسارات، يمكنكم التواصل معنا عبر الخيارات التالية:"
          />

          {/* أزرار التواصل */}
          <div className="flex flex-col items-center gap-4 mt-6">
            <a
              href="tel:+974 7204 1794"
              className="flex items-center justify-center gap-2 bg-[#7b0b4c] text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition"
            >
              <Phone className="w-5 h-5" />
              <span>اتصال مباشر</span>
            </a>
            <a
              href="https://wa.me/+974 7204 1794"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تواصل عبر واتساب</span>
            </a>
          </div>
        </motion.div>

        {/* الحقوق */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          © 2025 مركز المصباح للتدريب – جميع الحقوق محفوظة
        </motion.p>
      </div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6 }}
      className="border-r-4 border-[#7b0b4c] pr-4"
    >
      <h2 className="text-2xl font-bold text-[#7b0b4c] mb-3">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </motion.div>
  );
}
