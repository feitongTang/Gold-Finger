import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
} from "@/features/theme/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gold-Finger",
  description: "个人月度财务复盘工具",
};

const themeBootstrapScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var a=${JSON.stringify(THEMES.map((theme) => theme.id))};if(a.indexOf(t)>-1){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html data-theme={DEFAULT_THEME} lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
