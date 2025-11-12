"use client";

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('/images/pngtree-ai-generated-cyber-security-and-data-privacy-lock-symbol-and-protection-picture-image_15511358.jpg')",
      }}
    >
      {/* المحتوى الرئيسي */}
      <div className="bg-white/90 p-8 sm:p-10 rounded-2xl shadow-2xl max-w-4xl text-gray-800 backdrop-blur-md border border-[#800020]/30">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-center text-[#800020]">
          سياسة الخصوصية
        </h1>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          في{" "}
          <span className="font-semibold text-[#800020]">
            مركز المصباح للتدريب المهني
          </span>{" "}
          نؤمن بأن الخصوصية حق أساسي لكل مستخدم وزائر. نحن ملتزمون بحماية
          بياناتك الشخصية والحفاظ عليها بسرية تامة وفقًا لأفضل المعايير القانونية
          والأمنية العالمية.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          يتم جمع المعلومات الشخصية فقط عند الضرورة، مثل التسجيل في الدورات أو
          التواصل معنا للحصول على خدماتنا التدريبية. وتشمل هذه البيانات الاسم،
          رقم الهاتف، البريد الإلكتروني، وأي معلومات مطلوبة لتقديم الخدمة بأعلى
          جودة ممكنة.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          نحن لا نشارك بياناتك مع أي طرف ثالث إلا في حال وجود التزام قانوني أو
          بموافقتك المسبقة. كما نحرص على تطبيق تقنيات متقدمة لحماية البيانات
          ومنع أي استخدام غير مصرح به.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          يحتفظ مركز المصباح بالحق في تحديث سياسة الخصوصية من وقت لآخر لضمان
          التوافق مع التطورات التقنية والقانونية، وسنعلن عن أي تغييرات جوهرية
          بوضوح في هذه الصفحة.
        </p>

        <p className="text-base sm:text-lg leading-relaxed text-[#800020] font-semibold text-center">
          نقدر ثقتك، ونعاهدك على أن تبقى خصوصيتك أمانة في عنقنا.
        </p>
      </div>

      {/* الفاصل السفلي (حقوق النشر) */}
      <div className="w-full text-center text-gray-100 text-sm py-4 mt-10 border-t border-gray-500 bg-black/40 backdrop-blur-sm">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </div>
  );
}
