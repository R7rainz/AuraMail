"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export function HeroSection({
  onGetStarted,
  isAuthenticated,
}: HeroSectionProps) {
  return (
    <>
      {/* Enhanced Background effects */}
      <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-slate-600/5 to-transparent rounded-full blur-3xl opacity-30"></div>
      </div>

      <section
        className="flex flex-col items-center text-center relative mx-auto rounded-2xl overflow-hidden my-6 py-0 px-4
           w-full h-[400px] md:w-[1220px] md:h-[500px] lg:h-[600px] md:px-0 z-10"
      >
        <div className="relative z-10 space-y-6 md:space-y-8 lg:space-y-10 mb-8 md:mb-10 lg:mb-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mt-20 md:mt-32 lg:mt-40 px-4">
          <h1 className="text-white text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Placement Mail Assistant
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
            Automatically fetch, summarize, and organize your college placement
            emails — powered by AI & n8n automation.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Button
            onClick={onGetStarted}
            className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 px-10 py-4 rounded-full font-semibold text-lg shadow-lg ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 hover:scale-105"
          >
            {isAuthenticated ? "Go to Dashboard" : "Continue with Google"}
          </Button>
        </motion.div>
      </section>
    </>
  );
}
