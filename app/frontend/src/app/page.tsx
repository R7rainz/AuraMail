"use client";

import { HeroSection } from "./components/heroSection";
import { FeaturesSection } from "./components/featuresSection";
import { PricingSection } from "./components/pricingSection";
import { CTASection } from "./components/ctaSection";
import { AnimatedSection } from "./components/animatedSection";
import { useAuth } from "./lib/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          {/* Hero Section */}
          <HeroSection
            onGetStarted={handleGetStarted}
            isAuthenticated={user !== null && !loading}
          />
        </main>

        {/* Features Section */}
        <AnimatedSection
          id="features-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-16"
          delay={0.2}
        >
          <FeaturesSection />
        </AnimatedSection>

        {/* Pricing Section */}
        <div className="relative z-10 max-w-[1320px] mx-auto mt-16">
          <PricingSection />
        </div>

        {/* CTA Section */}
        <AnimatedSection
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <CTASection onGetStarted={handleGetStarted} />
        </AnimatedSection>
      </div>
    </div>
  );
}
