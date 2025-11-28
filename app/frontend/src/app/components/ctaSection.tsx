"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="w-full pt-12 md:pt-20 pb-10 md:pb-20 px-5 relative flex flex-col justify-center items-center overflow-visible">
      {/* Text & CTA */}
      <div className="relative z-10 flex flex-col justify-start items-center gap-9 max-w-4xl mx-auto">
        <div className="flex flex-col justify-start items-center gap-4 text-center">
          <h2 className="text-white text-4xl md:text-5xl lg:text-[68px] font-semibold leading-tight md:leading-tight lg:leading-[76px] bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Smarter way to manage your placements
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
            Join students already using our AI-powered placement mail assistant
            to organize updates, deadlines, and interviews automatically.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            onClick={onGetStarted}
            className="px-[30px] py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-[99px] shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
