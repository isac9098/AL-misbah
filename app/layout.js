import "./globals.css";
import { Cairo, Aref_Ruqaa_Ink } from "next/font/google";
import { AppProvider } from "./context/AppContext";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-cairo",
});

const aref = Aref_Ruqaa_Ink({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-aref",
});

export const metadata = {
  title: "مركز المصباح للتدريب.",
  description: "موقع تدريب ودورات أونلاين",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`cairo.variable{aref.variable} font-sans bg-white text-gray-900`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}