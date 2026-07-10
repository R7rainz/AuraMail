"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface PricingTierProps {
  name: string
  priceINR: string
  priceUSD: string
  description: string
  features: string[]
  isPopular?: boolean
  index: number
  currency: "INR" | "USD"
  onSelect: () => void
}

const PricingCard = ({
  name,
  priceINR,
  priceUSD,
  description,
  features,
  isPopular,
  index,
  currency,
  onSelect,
}: PricingTierProps) => (
  <motion.div
    className={`relative p-8 rounded-xl border transition-all duration-300 backdrop-blur-sm ${isPopular
      ? "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-blue-500/20"
      : "border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 hover:bg-white/8"
      }`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-xs font-semibold text-white">
        Most Popular
      </div>
    )}

    <div className="mb-6">
      <h3 className="text-white text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>

    <div className="mb-6">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">{currency === "INR" ? priceINR : priceUSD}</span>
        {priceINR !== "Custom" && <span className="text-gray-500 text-sm">/month</span>}
      </div>
    </div>

    <Button
      onClick={onSelect}
      className={`w-full mb-8 py-2 rounded-lg font-semibold transition-all duration-300 ${isPopular
        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
        : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
        }`}
    >
      Get Started
    </Button>

    <div className="space-y-3">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-300 text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </motion.div>
)

export function PricingSection() {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR")
  const [exchangeRate, setExchangeRate] = useState(83.5)

  useEffect(() => {
    // Fetch current exchange rate
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates.INR) {
          setExchangeRate(data.rates.INR)
        }
      })
      .catch(() => {
        // Fallback rate
        setExchangeRate(83.5)
      })
  }, [])

  const tiers = [
    {
      name: "Starter",
      priceINR: "₹749",
      priceUSD: "$9",
      description: "Perfect for getting started",
      features: [
        "AI-organized placement emails",
        "Basic calendar integration",
        "Up to 100 emails/month",
        "Email support",
        "Basic analytics",
      ],
    },
    {
      name: "Professional",
      priceINR: "₹2,449",
      priceUSD: "$29",
      description: "For active job seekers",
      features: [
        "Everything in Starter",
        "Google Classroom manager",
        "Unlimited emails",
        "n8n automation workflows",
        "Priority support",
        "Advanced analytics",
        "Smart notifications",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      priceINR: "Custom",
      priceUSD: "Custom",
      description: "For teams and organizations",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated support",
        "Team management",
        "Advanced security",
        "Custom workflows",
        "API access",
      ],
    },
  ]

  const handleSelectPlan = (planName: string) => {
    console.log(`Selected plan: ${planName}`)
  }

  return (
    <section className="relative w-full px-4 py-20 md:py-32 bg-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your placement journey.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-white/10 rounded-lg border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${currency === "INR" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${currency === "USD" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              $ USD
            </button>
          </div>

          {/* Exchange Rate Display */}
          <div className="mt-4 text-sm text-gray-500">1 USD = ₹{exchangeRate.toFixed(2)}</div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              {...tier}
              index={index}
              currency={currency}
              onSelect={() => handleSelectPlan(tier.name)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
