"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // تأكد من المسار الصحيح لملف supabaseClient.js

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    // 🔹 جلب الصور من جدول "campaigns"
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ خطأ في جلب الحملات:", error);
    } else {
      setCampaigns(data || []);
    }
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* 🔹 خلفية ثابتة داكنة */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80')",
          filter: "brightness(0.35)",
        }}
      ></div>

      {/* 🔹 طبقة غامقة نصف شفافة فوق الخلفية */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* 🔹 المحتوى */}
      <div className="relative z-10 py-24 px-6 flex flex-col items-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center text-[#c51f7c] mb-14"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          حملاتنا الإعلانية في مجالات متعددة
        </motion.h1>

        {/* ✅ عرض الحملات الفعلية */}
        {campaigns.length === 0 ? (
          <p className="text-gray-300 text-lg mt-12">لا توجد حملات إعلانية حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
            {campaigns.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative group overflow-hidden rounded-2xl shadow-2xl border border-white/10"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Image
                  src={item.image}
                  alt={`حملة رقم ${item.id}`}
                  width={600}
                  height={400}
                  className="object-cover w-full h-72 transform group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                  <p className="text-lg font-semibold">حملة #{item.id}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
{/* الفاصل السفلي */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-50 text-sm">
        © {new Date().getFullYear()} مركز المصباح للتدريب المهني — جميع الحقوق محفوظة.
      </div>
    </div>
  );
}
