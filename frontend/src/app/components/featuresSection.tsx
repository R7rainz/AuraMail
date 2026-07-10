"use client"
import { Mail, Calendar, BookOpen, Zap, Bell, BarChart3, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => (
  <motion.div
    className="group relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/3 to-transparent hover:border-white/20 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>

    <div className="relative z-10 flex items-start gap-4">
      <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
)

export function FeaturesSection() {
  const features = [
    {
      icon: Mail,
      title: "AI-Organized Emails",
      description: "Automatically categorize and organize placement-related emails with intelligent AI analysis.",
    },
    {
      icon: Calendar,
      title: "Smart Calendar Sync",
      description: "Mark important emails and automatically sync them to Google Calendar with notifications.",
    },
    {
      icon: BookOpen,
      title: "Classroom Manager",
      description: "Seamlessly manage your courses, track assignments, and stay updated with classroom activities.",
    },
    {
      icon: Zap,
      title: "n8n Automation",
      description: "Trigger automated workflows based on email events and placement updates.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get real-time alerts on your devices for important placement opportunities.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your placement journey with detailed insights and progress metrics.",
    },
  ]

  return (
    <section className="relative w-full px-4 py-20 md:py-32 bg-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Everything You Need</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features designed to help you manage your academic and professional journey in one unified
            platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
