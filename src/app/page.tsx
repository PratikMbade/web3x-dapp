
import { HeroSection } from "@/components/home-page/hero-section"
import { FeaturesSection } from "@/components/home-page/features-section"
import { JoinPlatformSection } from "@/components/home-page/join-platform"
import { HowItWorksSection } from "@/components/home-page/how-it-works-section"
import { FAQSection } from "@/components/home-page/faq-section"
import { Footer } from "@/components/home-page/footer"
import { HorseTimeline } from "@/components/home-page/time-line"
import { SmartContractsSection } from "@/components/home-page/smart-contract"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
 
      <HeroSection />
      <FeaturesSection />
      {/* <JoinPlatformSection /> */}
      <HowItWorksSection />
      <SmartContractsSection/>
      <HorseTimeline/>
      <FAQSection />
      <Footer />
    </main>
  )
}
