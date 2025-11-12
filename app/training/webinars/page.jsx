export default function WebinarsPage() {
  const images = [
    "https://images.unsplash.com/photo-1581093588401-22f636d1d1b3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center py-16"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl max-w-5xl text-center shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-[#7a1353]">
          الندوات التفاعلية (Webinars)
        </h1>
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
          نقدم في مركز <span className="font-semibold text-[#7a1353]">المصباح للتدريب المهني</span>{" "}
          مجموعة من الندوات التفاعلية التي تجمع بين التعلم والمعرفة في بيئة رقمية تفاعلية.
          تهدف هذه الندوات إلى تعزيز التواصل المباشر بين المدرب والمتدرب عبر الإنترنت.
        </p>
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
          تشمل مواضيع الندوات مجالات مهنية متعددة مثل القيادة والإدارة، 
          التسويق الرقمي، تطوير الذات، والمهارات التقنية الحديثة، 
          مع إمكانية المشاركة من أي مكان في العالم.
        </p>
        <p className="text-lg text-gray-800 leading-relaxed mb-8">
          الندوات لدينا مصممة بأسلوب احترافي يعتمد على الحوار، الأسئلة المباشرة، 
          ودراسة الحالات الواقعية لزيادة التفاعل والفهم العميق.
        </p>

        {/* شبكة الصور */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <img
                src={src}
                alt={`ندوة ${idx + 1}`}
                className="w-full h-56 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
{/* الفاصل السفلي */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-50 text-sm">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </div>
  );
}
