export default function OnlineTrainingPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl max-w-4xl text-center shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-[#7a1353]">
          التدريب عن بُعد
        </h1>
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
        قريباً  <span className="font-semibold text-[#7a1353]">المصباح للتدريب المهني</span>، 
          سيقدم برامج تدريبية إلكترونية تتيح للمتدربين التعلم من أي مكان في العالم بسهولة ومرونة.
        </p>
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
          تشمل برامجنا التدريبية عبر الإنترنت مجالات متنوعة مثل الإدارة، 
          تطوير الذات، تكنولوجيا المعلومات، اللغات، وخدمة العملاء، 
          وتُقدَّم من قبل مدربين معتمدين وذوي خبرة عالية.
        </p>
        <p className="text-lg text-gray-800 leading-relaxed">
          نهدف من خلال التدريب عن بُعد إلى تمكين الأفراد من 
          اكتساب مهارات عملية ومهنية باستخدام أحدث أساليب التعليم الرقمي، 
          مع الحفاظ على جودة التدريب والتفاعل المستمر بين المدرب والمتدرب.
        </p>

      </div>
{/* الفاصل السفلي */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-50 text-sm">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </div>
      
  );
}
