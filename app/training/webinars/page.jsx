export default function WebinarsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* المحتوى الرئيسي */}
      <div 
        className="flex-1 bg-cover bg-center bg-fixed flex flex-col items-center justify-center py-16"
        style={{
          backgroundImage: "url('/images/dom-fou-YRMWVcdyhmI-unsplash.jpg')",
        }}
      >
        <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-2xl max-w-4xl text-center shadow-2xl mx-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#7a1353]">
            الندوات التفاعلية (Webinars)
          </h1>
          <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-4">
            نقدم في مركز <span className="font-semibold text-[#7a1353]">المصباح للتدريب المهني</span>{" "}
            مجموعة من الندوات التفاعلية التي تجمع بين التعلم والمعرفة في بيئة رقمية تفاعلية.
            تهدف هذه الندوات إلى تعزيز التواصل المباشر بين المدرب والمتدرب عبر الإنترنت.
          </p>
          <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-4">
            تشمل مواضيع الندوات مجالات مهنية متعددة مثل القيادة والإدارة، 
            التسويق الرقمي، تطوير الذات، والمهارات التقنية الحديثة، 
            مع إمكانية المشاركة من أي مكان في العالم.
          </p>
          <p className="text-base md:text-lg text-gray-800 leading-relaxed">
            الندوات لدينا مصممة بأسلوب احترافي يعتمد على الحوار، الأسئلة المباشرة، 
            ودراسة الحالات الواقعية لزيادة التفاعل والفهم العميق.
          </p>
        </div>
      </div>

            {/* الفوتر في أسفل الشاشة */}
      <footer className="py-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}