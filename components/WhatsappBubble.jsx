"use client";

import { useEffect, useRef, useState } from "react";

export default function WhatsappBubble() {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lastScroll = useRef(0);

  const widgetData = {
    phoneNumber: "97472041794",
    welcomeMessage: "مرحباً بك في مركز المصباح!",
    brandName: "Al Misbah Center",
    brandSubtitle: "Learn to Lead",
    brandImage: "https://i.postimg.cc/c1fVxG4K/logo1.png"
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const host = document.createElement("div");
    containerRef.current = host;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // CSS معدل
    const style = document.createElement("style");
    style.textContent = `
      .edna-whatsapp-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        direction: ltr;
      }
      
      .edna-whatsapp-button {
        width: 60px;
        height: 60px;
        background: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        outline: none;
      }
      
      .edna-whatsapp-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
      }
      
      .edna-whatsapp-icon {
        width: 30px;
        height: 30px;
        fill: white;
      }
      
      .edna-chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 320px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        animation: edna-slideUp 0.3s ease-out;
        direction: ltr;
      }
      
      @keyframes edna-slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .edna-chat-header {
        background: linear-gradient(135deg, #7b0b4c, #9a2c6e);
        padding: 20px;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
      }
      
      .edna-brand-img-container {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      .edna-brand-img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .edna-brand-info {
        flex: 1;
      }
      
      .edna-brand-name {
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .edna-brand-subtitle {
        font-size: 13px;
        opacity: 0.9;
        font-weight: 400;
        margin-bottom: 4px;
      }
      
      .edna-online-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        opacity: 0.9;
      }
      
      .edna-status-dot {
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        animation: edna-pulse 2s infinite;
      }
      
      @keyframes edna-pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      .edna-chat-body {
        padding: 20px;
        background: #e5ddd5;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2390a4ae' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        min-height: 120px;
        border-bottom: 1px solid #e9ecef;
      }
      
      .edna-message-container {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 16px;
      }
      
      .edna-welcome-message {
        background: #ffffff;
        padding: 12px 16px 8px 16px;
        border-radius: 8px 8px 8px 0;
        font-size: 14px;
        line-height: 1.5;
        color: #303030;
        max-width: 80%;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        position: relative;
        direction: rtl;
        text-align: right;
      }
      
      .edna-message-tail {
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 0 8px 8px;
        border-color: transparent transparent #ffffff transparent;
      }
      
      .edna-message-time {
        font-size: 11px;
        color: #667781;
        text-align: left;
        margin-top: 4px;
        direction: ltr;
      }
      
      .edna-response-time {
        background: rgba(255, 255, 255, 0.9);
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 13px;
        color: #6c757d;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
      }
      
      .edna-clock-icon {
        width: 14px;
        height: 14px;
        fill: #6c757d;
      }
      
      .edna-chat-footer {
        padding: 20px;
        background: white;
      }
      
      .edna-start-chat-btn {
        width: 100%;
        padding: 14px 20px;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 600;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .edna-start-chat-btn:hover {
        background: #16a34a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }
      
      .edna-whatsapp-btn-icon {
        width: 18px;
        height: 18px;
        fill: white;
      }
      
      .edna-close-button {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }
      
      .edna-close-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .edna-minimized {
        transform: translateY(60px);
        opacity: 0.8;
      }
      
      .edna-hidden {
        display: none !important;
      }
    `;
    shadow.appendChild(style);

    // إنشاء الـ widget
    const widgetContainer = document.createElement("div");
    widgetContainer.className = `edna-whatsapp-widget ${isMinimized ? 'edna-minimized' : ''}`;
    
    // زر الواتساب الرئيسي
    const whatsappButton = document.createElement("button");
    whatsappButton.className = "edna-whatsapp-button";
    whatsappButton.innerHTML = `
      <svg class="edna-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.176-1.24-6.165-3.495-8.411"/>
      </svg>
    `;
    
    // نافذة الدردشة
    const chatWindow = document.createElement("div");
    chatWindow.className = `edna-chat-window ${isOpen ? '' : 'edna-hidden'}`;
    chatWindow.innerHTML = `
      <div class="edna-chat-header">
        <div class="edna-brand-img-container">
          <img src="${widgetData.brandImage}" alt="${widgetData.brandName}" class="edna-brand-img">
        </div>
        <div class="edna-brand-info">
          <div class="edna-brand-name">${widgetData.brandName}</div>
          <div class="edna-brand-subtitle">${widgetData.brandSubtitle}</div>
          <div class="edna-online-status">
            <div class="edna-status-dot"></div>
            <span>Online</span>
          </div>
        </div>
        <button class="edna-close-button">&times;</button>
      </div>
      
      <div class="edna-chat-body">
        <div class="edna-message-container">
          <div class="edna-welcome-message">
            ${widgetData.welcomeMessage}
            <div class="edna-message-tail"></div>
            <div class="edna-message-time">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          </div>
        </div>
        <div class="edna-response-time">
          <svg class="edna-clock-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12.5 13H7V11.5H11V7H12.5V13Z"/>
          </svg>
          We typically reply within minutes
        </div>
      </div>
      
      <div class="edna-chat-footer">
        <button class="edna-start-chat-btn">
          <svg class="edna-whatsapp-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.176-1.24-6.165-3.495-8.411"/>
          </svg>
          Start Chat
        </button>
      </div>
    `;

    // إضافة العناصر
    widgetContainer.appendChild(whatsappButton);
    widgetContainer.appendChild(chatWindow);
    shadow.appendChild(widgetContainer);

    // Event Listeners
    whatsappButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    });

    const closeButton = chatWindow.querySelector('.edna-close-button');
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setIsOpen(false);
    });

    const startChatBtn = chatWindow.querySelector('.edna-start-chat-btn');
    startChatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(`https://wa.me/${widgetData.phoneNumber}`, '_blank');
      setIsOpen(false);
    });

    const handleClickOutside = (event) => {
      if (!widgetContainer.contains(event.target)) {
        setIsOpen(false);
      }
    };

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

  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;
    
    const widget = shadow.querySelector('.edna-whatsapp-widget');
    if (!widget) return;

    if (isMinimized) {
      widget.classList.add('edna-minimized');
    } else {
      widget.classList.remove('edna-minimized');
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!containerRef.current) return;
    const shadow = containerRef.current.shadowRoot;
    if (!shadow) return;
    
    const chatWindow = shadow.querySelector('.edna-chat-window');
    if (!chatWindow) return;

    if (isOpen) {
      chatWindow.classList.remove('edna-hidden');
    } else {
      chatWindow.classList.add('edna-hidden');
    }
  }, [isOpen]);

  return null;
}