"use client";

import { useEffect, useRef, useState } from "react";

export default function WhatsappBubble() {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lastScroll = useRef(0);

  // بيانات الـ widget - يمكن تعديلها بسهولة
  const widgetData = {
    phoneNumber: "97472041794", // رقم الهاتف هنا
    welcomeMessage: "مرحباً بك في مركز المصباح!",
    brandName: "Al Misbah Center",
    brandSubtitle: "Learn to Lead",
    brandImage: "https://i.postimg.cc/c1fVxG4K/logo1.png"
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // إنشاء العنصر الرئيسي
    const host = document.createElement("div");
    containerRef.current = host;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // إضافة CSS
    const style = document.createElement("style");
    style.textContent = `
      .whatsapp-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        direction: ltr;
      }
      
      .whatsapp-button {
        width: 60px;
        height: 60px;
        background-color: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
      }
      
      .whatsapp-button:hover {
        transform: scale(1.1);
      }
      
      .whatsapp-icon {
        width: 30px;
        height: 30px;
        color: white;
      }
      
      .chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        overflow: hidden;
        direction: ltr;
        text-align: left;
      }
      
      .chat-header {
        background: #7b0b4c;
        padding: 15px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .brand-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .brand-info {
        flex: 1;
      }
      
      .brand-name {
        font-weight: bold;
        font-size: 14px;
      }
      
      .brand-subtitle {
        font-size: 12px;
        opacity: 0.9;
      }
      
      .chat-body {
        padding: 15px;
        background: #f8f9fa;
        min-height: 100px;
      }
      
      .welcome-text {
        background: white;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-size: 14px;
        direction: rtl;
        text-align: right;
      }
      
      .phone-info {
        background: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .chat-footer {
        padding: 15px;
        background: white;
      }
      
      .start-chat-btn {
        width: 100%;
        padding: 12px;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      }
      
      .start-chat-btn:hover {
        background: #16a34a;
      }
      
      .minimized {
        transform: translateY(60px);
        opacity: 0.8;
      }
      
      .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
      }
    `;
    shadow.appendChild(style);

    // إنشاء واجهة الـ widget
    const widgetContainer = document.createElement("div");
    widgetContainer.className = `whatsapp-widget ${isMinimized ? 'minimized' : ''}`;
    
    // زر الواتساب
    const whatsappButton = document.createElement("div");
    whatsappButton.className = "whatsapp-button";
    whatsappButton.innerHTML = `
      <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.176-1.24-6.165-3.495-8.411"/>
      </svg>
    `;
    
    // نافذة الدردشة
    const chatWindow = document.createElement("div");
    chatWindow.className = "chat-window";
    chatWindow.style.display = isOpen ? 'block' : 'none';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <img src="${widgetData.brandImage}" alt="${widgetData.brandName}" class="brand-img">
        <div class="brand-info">
          <div class="brand-name">${widgetData.brandName}</div>
          <div class="brand-subtitle">${widgetData.brandSubtitle}</div>
        </div>
        <button class="close-button">&times;</button>
      </div>
      <div class="chat-body">
        <div class="welcome-text">${widgetData.welcomeMessage}</div>
        <div class="phone-info">Phone: ${widgetData.phoneNumber}</div>
      </div>
      <div class="chat-footer">
        <button class="start-chat-btn">
          Start Chat on WhatsApp
        </button>
      </div>
    `;

    // إضافة العناصر
    widgetContainer.appendChild(whatsappButton);
    widgetContainer.appendChild(chatWindow);
    shadow.appendChild(widgetContainer);

    // إضافة event listeners
    whatsappButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    });

    // زر الإغلاق
    const closeButton = chatWindow.querySelector('.close-button');
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setIsOpen(false);
    });

    // زر بدء المحادثة
    const startChatBtn = chatWindow.querySelector('.start-chat-btn');
    startChatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // فتح رابط الواتساب مع رقم الهاتف
      window.open(`https://wa.me/${widgetData.phoneNumber}`, '_blank');
      setIsOpen(false);
    });

    // إغلاق النافذة عند الضغط خارجها
    const handleClickOutside = (event) => {
      if (!widgetContainer.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // مراقبة السحب
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll.current + 10) {
        setIsMinimized(true);
      } else if (currentScroll < lastScroll.current - 10) {
        setIsMinimized(false);
      }
      lastScroll.current = currentScroll;
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      if (containerRef.current) {
        containerRef.current.remove();
      }
    };
  }, []);

  // تحديث حالة التصغير
  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;
    
    const widget = shadow.querySelector('.whatsapp-widget');
    if (!widget) return;

    if (isMinimized) {
      widget.classList.add('minimized');
    } else {
      widget.classList.remove('minimized');
    }
  }, [isMinimized]);

  // تحديث حالة الفتح والإغلاق
  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;
    
    const chatWindow = shadow.querySelector('.chat-window');
    if (!chatWindow) return;

    chatWindow.style.display = isOpen ? 'block' : 'none';
  }, [isOpen]);

  return null;
}