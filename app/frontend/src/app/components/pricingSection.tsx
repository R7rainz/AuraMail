"use client";

import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  index: number;
  onSelect: () => void;
}

const PricingCard = ({
  name,
  price,
  description,
  features,
  isPopular,
  index,
  onSelect,
}: PricingTierProps) => (
  <motion.div
    className={`relative p-8 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
      isPopular
        ? "border-white/20 bg-gradient-to-br from-white/8 to-white/2 hover:from-white/12 hover:to-white/4 ring-1 ring-white/10"
        : "border-white/8 bg-gradient-to-br from-white/3 to-white/1 hover:from-white/6 hover:to-white/2"
    }`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-white/10 to-white/5 border border-white/15 rounded-full text-xs font-semibold text-gray-300">
        Most Popular
      </div>
    )}

    <div className="mb-6">
      <h3 className="text-white text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>

    <div className="mb-6">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          {price}
        </span>
        {price !== "Custom" && (
          <span className="text-gray-500 text-sm">/month</span>
        )}
      </div>
    </div>

    <Button
      onClick={onSelect}
      className={`w-full mb-8 py-2 rounded-lg font-semibold transition-all duration-300 ${
        isPopular
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
          : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
      }`}
    >
      Get Started
    </Button>

    <div className="space-y-4">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-400 text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export function PricingSection() {
  const tiers = [
    {
      name: "Starter",
      price: "$9",
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
      price: "$29",
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
      price: "Custom",
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
  ];

  const handleSelectPlan = (planName: string) => {
    console.log(`Selected plan: ${planName}`);
  };

  return (
    <section className="w-full px-5 py-16 md:py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-[1220px] mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl md:text-5xl font-semibold mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your placement journey. Always flexible
            to scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              {...tier}
              index={index}
              onSelect={() => handleSelectPlan(tier.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
