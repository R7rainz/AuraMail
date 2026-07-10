"use client"

import { useState, useEffect } from "react"
import {
  Mail,
  Sparkles,
  Calendar,
  Bell,
  Search,
  ArrowRight,
  Check,
  Github,
  Twitter,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function LandingPage() {
  // Initialize visibility state - will be set to true after mount for animation
  const [isVisible, setIsVisible] = useState(false)
  const [beamsAccelerated, setBeamsAccelerated] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  useEffect(() => {
    // Trigger entrance animation after mount - this pattern is intentional
    // for CSS transitions that need to start after initial render
    const visibilityTimer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    
    const accelTimer = setTimeout(() => {
      setBeamsAccelerated(true)
    }, 3000)

    return () => {
      cancelAnimationFrame(visibilityTimer)
      clearTimeout(accelTimer)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setHoveredCard(cardId)
  }

  const features = [
    {
      id: "f1",
      icon: Sparkles,
      title: "AI-Powered Summaries",
      desc: "Get instant, intelligent summaries of every placement email.",
    },
    {
      id: "f2",
      icon: Search,
      title: "Smart Organization",
      desc: "Automatically categorizes internships, jobs, exams, and announcements.",
    },
    {
      id: "f3",
      icon: Calendar,
      title: "Calendar Integration",
      desc: "Add deadlines to Google Calendar with one click.",
    },
    {
      id: "f4",
      icon: Bell,
      title: "Key Info Extraction",
      desc: "Extracts company, role, eligibility, salary, and deadlines.",
    },
  ]

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Apple-style Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto h-12 flex items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <Mail className="w-5 h-5" />
            <span className="font-medium text-sm">AuraMail</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-xs text-neutral-400 hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <button
            onClick={handleLogin}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero Section with Light Beams */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated diagonal light beams - BRIGHTER */}
        <div className={`absolute inset-0 overflow-hidden ${beamsAccelerated ? 'beams-fast' : 'beams-slow'}`}>
          <div className="beam-line beam-1" />
          <div className="beam-line beam-2" />
          <div className="beam-line beam-3" />
          <div className="beam-line beam-4" />
          <div className="beam-line beam-5" />
          <div className="beam-line beam-6" />
          <div className="beam-line beam-7" />
          <div className="beam-line beam-8" />
          <div className="beam-line beam-9" />
          <div className="beam-line beam-10" />
          <div className="beam-line beam-11" />
          <div className="beam-line beam-12" />
          
          <div className="beam-line beam-accent-1" />
          <div className="beam-line beam-accent-2" />
          <div className="beam-line beam-accent-3" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div
            className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-neutral-400 mb-8">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Built for VIT Students
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight leading-[1.05] mb-6">
              <span className="block">Placement emails,</span>
              <span className="block bg-gradient-to-r from-neutral-500 via-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                simplified.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Stop drowning in placement emails. AuraMail uses AI to summarize, 
              organize, and help you never miss a deadline.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogin}
                className="group inline-flex items-center justify-center gap-2 h-12 px-7 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Watch the demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-9 border border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-0.5 h-2 bg-white/50 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* App Preview with hover effect */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-neutral-500 mb-6">The dashboard</p>
          
          <div 
            className="relative group cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, 'preview')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Mouse follow glow */}
            {hoveredCard === 'preview' && (
              <div
                className="absolute w-[400px] h-[400px] rounded-full pointer-events-none transition-opacity duration-300 z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                  left: mousePos.x - 200,
                  top: mousePos.y - 200,
                }}
              />
            )}
            
            {/* Border glow on hover */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <div className="relative bg-neutral-950 rounded-2xl overflow-hidden border border-white/[0.08] group-hover:border-white/[0.15] transition-colors duration-500 shadow-2xl">
              {/* Shine sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900/80 border-b border-white/[0.05]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10 group-hover:bg-red-500/50 transition-colors duration-300" />
                  <div className="w-3 h-3 rounded-full bg-white/10 group-hover:bg-yellow-500/50 transition-colors duration-300" />
                  <div className="w-3 h-3 rounded-full bg-white/10 group-hover:bg-green-500/50 transition-colors duration-300" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-md text-xs text-neutral-500">
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    auramail.app
                  </div>
                </div>
              </div>
              
              <div className="flex min-h-[420px]">
                <div className="w-52 p-4 border-r border-white/[0.05] bg-neutral-950">
                  <div className="space-y-1">
                    {["All Emails", "Internships", "Jobs", "Exams"].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                          i === 0 ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded ${i === 0 ? "bg-white/20" : "bg-white/10"}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 p-4 space-y-2 bg-gradient-to-b from-neutral-950 to-neutral-900">
                  {[
                    { company: "Microsoft", role: "SWE Intern", time: "Today", urgent: true },
                    { company: "Google", role: "STEP Intern", time: "Yesterday" },
                    { company: "Amazon", role: "SDE Intern", time: "2d ago" },
                  ].map((email, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        i === 0
                          ? "bg-white/[0.04] border-white/[0.08]"
                          : "bg-transparent border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${i === 0 ? "text-white" : "text-neutral-400"}`}>
                          {email.company}
                        </span>
                        <span className="text-xs text-neutral-600">{email.time}</span>
                      </div>
                      <p className="text-sm text-neutral-500">{email.role}</p>
                      {email.urgent && (
                        <div className="mt-2">
                          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            Deadline: Feb 15
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with spotlight hover */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Features
            </h2>
            <p className="text-neutral-500 text-lg">
              Everything you need to stay ahead during placements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="relative group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
                onMouseMove={(e) => handleMouseMove(e, feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Spotlight effect */}
                {hoveredCard === feature.id && (
                  <div
                    className="absolute w-[300px] h-[300px] rounded-full pointer-events-none transition-all duration-100"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
                      left: mousePos.x - 150,
                      top: mousePos.y - 150,
                    }}
                  />
                )}
                
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Top shine line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:bg-white/[0.1] group-hover:border-white/[0.15] group-hover:scale-110 transition-all duration-500">
                    <feature.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works with hover effects */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-neutral-500 text-lg">
              Get started in under a minute.
            </p>
          </div>

          <div className="space-y-0">
            {[
              { id: "s1", step: "01", title: "Connect your Gmail", desc: "Sign in with Google. We only access placement-related emails." },
              { id: "s2", step: "02", title: "AI analyzes your inbox", desc: "Our AI extracts company, role, deadlines, and key details." },
              { id: "s3", step: "03", title: "Stay organized", desc: "Browse by category, add events to calendar, never miss a deadline." },
            ].map((item) => (
              <div 
                key={item.id} 
                className="relative group flex gap-8 py-8 border-b border-white/[0.05] last:border-0 cursor-default"
                onMouseMove={(e) => handleMouseMove(e, item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Spotlight */}
                {hoveredCard === item.id && (
                  <div
                    className="absolute w-[400px] h-[200px] rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
                      left: mousePos.x - 200,
                      top: mousePos.y - 100,
                    }}
                  />
                )}
                
                {/* Left glow bar on hover */}
                <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <span className="relative text-5xl font-light text-neutral-800 group-hover:text-neutral-600 transition-colors duration-500">{item.step}</span>
                <div className="relative pt-2">
                  <h3 className="text-xl font-medium mb-2 group-hover:text-white transition-colors duration-300">{item.title}</h3>
                  <p className="text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing with hover effects */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Pricing
            </h2>
            <p className="text-neutral-500 text-lg">
              Free during beta. Simple pricing when we launch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div 
              className="relative group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
              onMouseMove={(e) => handleMouseMove(e, 'free')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Spotlight */}
              {hoveredCard === 'free' && (
                <div
                  className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                    left: mousePos.x - 150,
                    top: mousePos.y - 150,
                  }}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-lg font-medium mb-1">Free</h3>
                <p className="text-sm text-neutral-500 mb-6">For getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-semibold">$0</span>
                  <span className="text-neutral-500">/month</span>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full h-11 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-medium hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 mb-6"
                >
                  Get Started
                </button>
                <ul className="space-y-3">
                  {["AI summaries", "Auto-categorization", "Calendar sync", "Key info extraction"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro */}
            <div 
              className="relative group p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 overflow-hidden"
              onMouseMove={(e) => handleMouseMove(e, 'pro')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Spotlight with blue tint */}
              {hoveredCard === 'pro' && (
                <div
                  className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
                    left: mousePos.x - 150,
                    top: mousePos.y - 150,
                  }}
                />
              )}
              
              {/* Animated border gradient */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundSize: '200% 100%', animation: 'gradientMove 3s linear infinite' }} />
              
              <div className="absolute inset-[1px] bg-black rounded-2xl" />
              
              <div className="relative z-10">
                <div className="absolute top-0 right-0">
                  <span className="text-xs text-neutral-500 bg-white/[0.05] px-2 py-1 rounded">Coming soon</span>
                </div>
                <h3 className="text-lg font-medium mb-1">Pro</h3>
                <p className="text-sm text-neutral-500 mb-6">For power users</p>
                <div className="mb-6">
                  <span className="text-4xl font-semibold">$5</span>
                  <span className="text-neutral-500">/month</span>
                </div>
                <button
                  disabled
                  className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium opacity-50 cursor-not-allowed mb-6"
                >
                  Coming Soon
                </button>
                <ul className="space-y-3">
                  {["Everything in Free", "Email alerts", "Priority processing", "Analytics"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                      <Check className="w-4 h-4 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
            Ready to simplify your inbox?
          </h2>
          <p className="text-lg text-neutral-500 mb-10">
            Join hundreds of students using AuraMail.
          </p>
          <button
            onClick={handleLogin}
            className="group inline-flex items-center justify-center gap-2 h-12 px-7 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Mail className="w-4 h-4" />
            <span className="text-sm">AuraMail</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Twitter className="w-3 h-3" />
            </a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style jsx global>{`
        .beam-line {
          position: absolute;
          height: 2px;
          width: 300%;
          left: -100%;
          transform: rotate(-35deg);
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 40%, 
            rgba(255,255,255,0.1) 45%,
            rgba(255,255,255,0.4) 50%, 
            rgba(255,255,255,0.1) 55%,
            transparent 60%, 
            transparent 100%
          );
          opacity: 0;
          filter: blur(0.5px);
        }

        .beam-accent-1, .beam-accent-2, .beam-accent-3 {
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 40%, 
            rgba(59,130,246,0.2) 45%,
            rgba(59,130,246,0.7) 50%, 
            rgba(139,92,246,0.7) 50%,
            rgba(139,92,246,0.2) 55%,
            transparent 60%, 
            transparent 100%
          );
          filter: blur(1px);
        }

        .beam-1 { top: 5%; animation: beam 8s 0s infinite; }
        .beam-2 { top: 12%; animation: beam 9s 0.5s infinite; }
        .beam-3 { top: 20%; animation: beam 7s 1s infinite; }
        .beam-4 { top: 28%; animation: beam 10s 1.5s infinite; }
        .beam-5 { top: 36%; animation: beam 8s 2s infinite; }
        .beam-6 { top: 44%; animation: beam 9s 2.5s infinite; }
        .beam-7 { top: 52%; animation: beam 7s 3s infinite; }
        .beam-8 { top: 60%; animation: beam 8s 3.5s infinite; }
        .beam-9 { top: 68%; animation: beam 10s 4s infinite; }
        .beam-10 { top: 76%; animation: beam 9s 4.5s infinite; }
        .beam-11 { top: 84%; animation: beam 7s 5s infinite; }
        .beam-12 { top: 92%; animation: beam 8s 5.5s infinite; }
        
        .beam-accent-1 { top: 30%; animation: beam 12s 0.8s infinite; }
        .beam-accent-2 { top: 55%; animation: beam 11s 2.3s infinite; }
        .beam-accent-3 { top: 75%; animation: beam 13s 3.8s infinite; }

        @keyframes beam {
          0% {
            transform: rotate(-35deg) translateX(-30%);
            opacity: 0;
          }
          3% {
            opacity: 1;
          }
          45% {
            opacity: 1;
          }
          50% {
            transform: rotate(-35deg) translateX(30%);
            opacity: 0;
          }
          100% {
            transform: rotate(-35deg) translateX(30%);
            opacity: 0;
          }
        }

        .beams-fast .beam-line {
          animation-duration: 1.5s !important;
        }
        
        .beams-fast .beam-accent-1,
        .beams-fast .beam-accent-2,
        .beams-fast .beam-accent-3 {
          animation-duration: 2s !important;
        }

        @keyframes scroll {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(4px);
            opacity: 0.3;
          }
        }
        
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}
