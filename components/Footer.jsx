"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

export default function Footer() {
  const social = {
    facebook: "https://www.facebook.com/almsbah.lltdryb",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "https://wa.me/97472041794",
  };

  const trainingLinks = [
    { label: "التدريب عن بُعد", href: "/training/online" },
    { label: "ندوات تفاعلية", href: "/training/webinars" },
    { label: "الحملات الإعلانية", href: "/campaigns" },
    { label: "أسئلة متكررة", href: "/faq-page" },
    { label: "الأحكام والشروط", href: "/terms" },
    { label: "سياسة الخصوصية", href: "/privacy" },
  ];

  const centerLinks = [
    { label: "معلومات عنا", href: "/about" },
    { label: "تواصل معنا", href: "/contact" },
  ];

  const address = "الدوحة - قطر";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  return (
    <footer
      className="relative text-[#4a0c2d] pt-10 overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-white/60 backdrop-blur-lg py-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-right"
        >
          {/* العمود الأول */}
          <div>
            <h3 className="text-2xl font-bold mb-3 text-[#7a1353]">
              مركز المصباح للتدريب المهني
            </h3>
            <p className="mb-4 leading-relaxed text-[#3a0f24]">
              نعمل في مركز المصباح على تقديم برامج تدريبية متخصصة تواكب متطلبات
              سوق العمل، ونؤمن بأن التطوير المستمر هو مفتاح النجاح المهني
              والتميز في الأداء.
            </p>
            <p>
              <Link
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#7a1353]"
              >
                {address}
              </Link>
            </p>
            <p className="mt-3">
              📞{" "}
              <a href="tel:+97472041794" className="hover:text-[#7a1353]">
                +974 7204 1794
              </a>
            </p>
            <p className="mt-1">
              ✉️{" "}
              <a
                href="mailto:fayhaalfatihhamida@gmail.com"
                className="hover:text-[#7a1353]"
              >
                fayhaalfatihhamida@gmail.com
              </a>
            </p>
          </div>

          {/* العمود الثاني */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4 text-[#7a1353]">
              خدمات التدريب
            </h3>
            <ul className="space-y-2">
              {trainingLinks.map((ln) => (
                <li key={ln.href}>
                  <Link href={ln.href} className="hover:text-[#7a1353]">
                    {ln.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* العمود الثالث */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4 text-[#7a1353]">
              عن المركز
            </h3>
            <ul className="space-y-2">
              {centerLinks.map((ln) => (
                <li key={ln.href}>
                  <Link href={ln.href} className="hover:text-[#7a1353]">
                    {ln.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* الجزء السفلي */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-[#7a1353]/30 mt-10 pt-6"
        >
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <div className="flex gap-6 justify-center mb-4">
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="hover:text-[#7a1353] transition-transform transform hover:scale-110"
              >
                <FaFacebookF size={22} />
              </a>
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="انستغرام"
                className="hover:text-[#7a1353] transition-transform transform hover:scale-110"
              >
                <FaInstagram size={22} />
              </a>
             
              <a
                href={social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
                className="hover:text-[#7a1353] transition-transform transform hover:scale-110"
              >
                <FaWhatsapp size={22} />
              </a>
            </div>

           <p className="text-sm text-[#3a0f24]">
  © {new Date().getFullYear()} مركز المصباح للتدريب المهني. جميع الحقوق محفوظة.
  شركة <a 
    href="https://www.facebook.com/profile.php?id=61578234835457" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-[#7a1353] hover:underline"
  >
     DevSeed
  </a> للتطوير البرمجي
</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
