"use client";

import { useEffect, useRef, useState } from "react";

export default function WhatsappBubble() {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return; // حماية SSR

    if (window.__ednaLoaded) return;
    window.__ednaLoaded = true;

    // إنشاء عنصر host للـ Shadow DOM
    const host = document.createElement("div");
    containerRef.current = host;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const widgetWrapper = document.createElement("div");
    widgetWrapper.setAttribute(
      "style",
      `
        all: initial;
        direction: ltr;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        transition: transform 0.3s ease, opacity 0.3s ease;
      `
    );
    shadow.appendChild(widgetWrapper);

    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src =
      "https://edna.io/wp-content/plugins/whatsapp-widget-generator/js/generator.js?96996";

    const options = {
      host: "https://edna.io",
      enabled: true,
      chatButtonSetting: {
        backgroundColor: "#22c55e",
        ctaText: "Contact us",
        icon: "whatsapp",
        position: "left",
      },
      brandSetting: {
        backgroundColor: "#7b0b4c",
        brandImg: "https://i.postimg.cc/c1fVxG4K/logo1.png",
        brandName: "Al Misbah Center",
        brandSubTitle: "Learn to Lead",
        ctaText: "Start Chat",
        phoneNumber: "97472041794",
        welcomeText: "مرحباً بك في مركز المصباح!",
      },
    };

    s.onload = () => {
      if (typeof CreateWhatsappChatWidget !== "undefined") {
        CreateWhatsappChatWidget(options);
      }
    };

    widgetWrapper.appendChild(s);

    // مراقبة السحب للأسفل لتصغير البوب أب
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll.current + 10) {
        setIsMinimized(true);
      } else if (currentScroll < lastScroll.current - 10) {
        setIsMinimized(false);
      }
      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (containerRef.current) containerRef.current.remove();
    };
  }, []);

  // تحديث CSS للعرض المصغر
  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;
    const widgetWrapper = shadow.querySelector("div");
    if (!widgetWrapper) return;

    if (isMinimized) {
      widgetWrapper.style.transform = "translateY(60px)";
      widgetWrapper.style.opacity = "0.8";
    } else {
      widgetWrapper.style.transform = "translateY(0)";
      widgetWrapper.style.opacity = "1";
    }
  }, [isMinimized]);

  return null;
}
