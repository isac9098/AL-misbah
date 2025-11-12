"use client";

import { useEffect, useRef, useState } from "react";

export default function WhatsappBubble() {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.__ednaLoaded) return;
    window.__ednaLoaded = true;

    // إنشاء عنصر host للـ Shadow DOM
    const host = document.createElement("div");
    containerRef.current = host;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // إضافة CSS لضمان الاتجاه من اليسار لليمين
    const style = document.createElement("style");
    style.textContent = `
      * {
        direction: ltr !important;
        text-align: left !important;
      }
      .edna-whatsapp-widget * {
        direction: ltr !important;
        text-align: left !important;
      }
    `;
    shadow.appendChild(style);

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
    widgetWrapper.className = "edna-whatsapp-widget";
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
        
        // إضافة مستمع حدث لاكتشاف فتح وإغلاق الـ widget
        setTimeout(() => {
          const chatButton = shadow.querySelector('.edna-open-chat');
          if (chatButton) {
            chatButton.addEventListener('click', () => {
              setIsWidgetOpen(true);
            });
          }
        }, 1000);
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

    // إغلاق الـ widget عند الضغط خارجها
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      
      const shadow = containerRef.current.shadowRoot;
      if (!shadow) return;
      
      const widget = shadow.querySelector('.edna-whatsapp-widget');
      if (!widget) return;
      
      // التحقق إذا كان النقر خارج الـ widget
      const isClickInsideWidget = widget.contains(event.target);
      const isClickOnHost = containerRef.current.contains(event.target);
      
      if (!isClickInsideWidget && !isClickOnHost && isWidgetOpen) {
        // البحث عن زر الإغلاق في الـ widget والضغط عليه برمجياً
        const closeButton = shadow.querySelector('.edna-close-chat, [onclick*="close"], .close-button');
        if (closeButton) {
          closeButton.click();
          setIsWidgetOpen(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      if (containerRef.current) containerRef.current.remove();
      window.__ednaLoaded = false;
    };
  }, [isWidgetOpen]);

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

  // إضافة CSS إضافي لضمان الاتجاه
  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;

    // إضافة CSS إضافي بشكل دوري لضمان تطبيق الاتجاه
    const interval = setInterval(() => {
      const allElements = shadow.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.style) {
          el.style.direction = 'ltr';
          el.style.textAlign = 'left';
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}