"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginPage from "@/app/login/page";

type Phase = "start" | "converge" | "logo" | "hold" | "exit";

export default function HomePage() {
  const router = useRouter();

  const [phase, setPhase] = React.useState<Phase>("start");

  React.useEffect(() => {
    // Start almost immediately
    const t1 = setTimeout(() => setPhase("converge"), 50);

    // Logo appears much earlier
    const t2 = setTimeout(() => setPhase("logo"), 350);

    // Give logo time to settle and hold
    const t3 = setTimeout(() => setPhase("hold"), 950);

    const t4 = setTimeout(() => setPhase("exit"), 2200);

    const t5 = setTimeout(() => router.replace("/login"), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [router]);

  const exiting = phase === "exit";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">
      {/* LOGIN PAGE BEHIND */}
      <div className="absolute inset-0">
        <LoginPage />
      </div>

      {/* INTRO */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white transform-gpu transition-opacity duration-700 ${
          exiting
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Logo */}
        <div
          className={`relative z-10 transform-gpu ${
            phase === "start"
              ? "scale-[0.35] opacity-0 translate-y-10"
              : phase === "converge"
                ? "scale-[0.75] opacity-0 translate-y-4"
                : phase === "logo"
                  ? "scale-[1.12] opacity-100 translate-y-0"
                  : phase === "hold"
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-[1.25] opacity-0 translate-y-0"
          } transition-all ${
            phase === "logo"
              ? "duration-[550ms] ease-[cubic-bezier(0.16,1.25,0.3,1)]"
              : phase === "exit"
                ? "duration-[650ms] ease-in"
                : "duration-[400ms] ease-out"
          }`}
        >
          <Image
            src="/images/HDFC_LOGO.jpeg"
            alt="HDFC Life"
            width={520}
            height={200}
            priority
            className="h-32 w-auto object-contain sm:h-40 md:h-44"
          />
        </div>

        {/* Clean white hold */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            phase === "hold"
              ? "opacity-0"
              : "opacity-100"
          }`}
        />
      </div>
    </main>
  );
}