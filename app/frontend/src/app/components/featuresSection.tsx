"use client";

import {
  Mail,
  Calendar,
  BookOpen,
  Zap,
  Bell,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) => (
  <motion.div
    className="group p-6 rounded-xl bg-gradient-to-br from-white/3 to-white/1 hover:from-white/6 hover:to-white/2 transition-all duration-300 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-gradient-to-br from-white/8 to-white/2 group-hover:from-white/12 group-hover:to-white/4 transition-all duration-300">
        <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-2 group-hover:text-gray-100 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

export function FeaturesSection() {
  const features = [
    {
      icon: Mail,
      title: "AI-Organized Placement Emails",
      description:
        "Automatically categorize and organize placement-related emails with intelligent AI analysis.",
    },
    {
      icon: Calendar,
      title: "Smart Calendar Integration",
      description:
        "Mark important emails and automatically sync them to Google Calendar with notifications.",
    },
    {
      icon: BookOpen,
      title: "Google Classroom Manager",
      description:
        "Seamlessly manage your courses, track assignments, and stay updated with classroom activities.",
    },
    {
      icon: Zap,
      title: "n8n Automation",
      description:
        "Trigger automated workflows based on email events and placement updates.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Get real-time alerts on your devices for important placement opportunities and deadlines.",
    },
    {
      icon: BarChart3,
      title: "Placement Analytics",
      description:
        "Track your placement journey with detailed insights and progress metrics.",
    },
  ];

  return (
    <section className="w-full px-5 py-16 md:py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-[1220px] mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl md:text-5xl font-semibold mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Powerful Features for Your Success
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need to manage your academic and professional journey
            in one unified platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
