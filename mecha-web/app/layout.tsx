import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AIChatbox } from "@/components/shared/AIChatbox";

// Font chính - Inter: font hiện đại, dễ đọc, phù hợp giao diện kỹ thuật
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

// Font cho số liệu kỹ thuật - JetBrains Mono: font monospace chuyên nghiệp
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Getabec - Giải pháp Cơ khí Chuyên nghiệp",
  description: "Cung cấp linh kiện, phụ tùng và dịch vụ sửa chữa cơ khí chất lượng cao",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased dark:bg-gray-900`}>
        <Providers>
          {children}
          <AIChatbox />
        </Providers>
      </body>
    </html>
  );
}
