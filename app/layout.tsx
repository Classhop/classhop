import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClassHop",
  description: "Discover interesting UC Berkeley lectures that fit your free time."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 sm:px-8">
          {/* Nav */}
          <header className="flex items-center justify-between py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003262]">
                <span className="text-[13px] font-bold text-[#FDB515]">CH</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                ClassHop
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-500 tracking-wide">
                Spring 2025
              </span>
            </div>
          </header>

          <main className="flex-1 py-10">{children}</main>

          <footer className="border-t border-slate-100 py-6 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
            <span className="font-medium text-slate-500">ClassHop · UC Berkeley</span>
            <span>Times are approximations — verify with the official schedule.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
