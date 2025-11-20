"use client";
import { Facebook, Instagram, Linkedin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      {/* طبقة شفافة فوق الصورة */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>

      {/* المحتوى */}
      <div className="relative z-10 text-[#7b1e1e] max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center md:text-right">
        {/* القسم الأول */}
        <div>
          <h2 className="text-3xl font-bold mb-4">مركز المصباح للتدريب المهني</h2>
          <p className="leading-relaxed text-lg text-[#5c0f0f]">
            نحن في مركز المصباح للتدريب المهني نؤمن بأن التعليم المهني هو الركيزة
            الأساسية لبناء مستقبل ناجح.  
            نقدم برامج تدريبية متخصصة تهدف إلى صقل المهارات العملية وتأهيل الأفراد
            لسوق العمل.  
            رؤيتنا تتمثل في أن نكون مركزاً رائداً في تطوير الكفاءات المهنية على
            مستوى المنطقة.
          </p>
        </div>

        {/* القسم الثاني */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">تواصل معنا</h3>
          <p className="flex justify-center md:justify-start items-center gap-2 mb-3 text-lg">
            <Phone className="w-5 h-5 text-[#7b1e1e]" /> +974 7204 1794
          </p>
          <p className="flex justify-center md:justify-start items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-[#7b1e1e]" />
            <a
              href="mailto:info@almisbahcenter.com"
              className="hover:underline hover:text-[#a52a2a]"
            >
              info@almisbahcenter.com
            </a>
          </p>
        </div>

        {/* القسم الثالث */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">تابعنا على</h3>
          <div className="flex justify-center md:justify-start gap-6">
            <a
              href="https://www.facebook.com/almsbah.lltdryb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#a52a2a]"
            >
              <Facebook className="w-7 h-7" />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#a52a2a]"
            >
              <Instagram className="w-7 h-7" />
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#a52a2a]"
            >
              <Linkedin className="w-7 h-7" />
            </a>
            <a
              href="https://wa.me/97472041794"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#a52a2a]"
            >
              <Phone className="w-7 h-7" />
            </a>
          </div>
        </div>
      </div>

      {/* الفاصل السفلي */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[#5c0f0f] text-sm">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
