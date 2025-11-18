import "./globals.css";
import { Cairo } from "next/font/google";
import { AppProvider } from "./context/AppContext";
import dynamic from 'next/dynamic';

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700"],
});

// ✅ تحميل المكون ديناميكياً مع تعطيل SSR
const FloatingAdminBubble = dynamic(() => import('../components/FloatingAdminBubble'), {
  ssr: false
});

export const metadata = {
  title: "مركز المصباح للتدريب",
  description: "موقع تدريب ودورات أونلاين",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${cairo.className} bg-white text-gray-900`}>
        <AppProvider>
          {children}
          <FloatingAdminBubble />
        </AppProvider>
      </body>
    </html>
  );
}