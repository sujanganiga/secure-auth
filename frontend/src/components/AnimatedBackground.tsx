"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-slate-100" />

      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-slate-300/40 blur-3xl animate-[moveOne_8s_ease-in-out_infinite]" />

      <div className="absolute -right-32 top-1/4 h-[450px] w-[450px] rounded-full bg-red-200/30 blur-3xl animate-[moveTwo_10s_ease-in-out_infinite]" />

      <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-slate-300/30 blur-3xl animate-[moveThree_12s_ease-in-out_infinite]" />

      <style>{`
        @keyframes moveOne {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(180px, 120px);
          }
        }

        @keyframes moveTwo {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-160px, 100px);
          }
        }

        @keyframes moveThree {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(120px, -100px);
          }
        }
      `}</style>
    </div>
  );
}