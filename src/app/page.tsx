import { Navbar } from "@/components/home-page/navbar"
import { HeroSection } from "@/components/home-page/hero-section"
import { FeaturesSection } from "@/components/home-page/features-section"
import { JoinPlatformSection } from "@/components/home-page/join-platform"
import { HowItWorksSection } from "@/components/home-page/how-it-works-section"
import { RoadmapSection } from "@/components/home-page/roadmap-section"
import { FAQSection } from "@/components/home-page/faq-section"
import { Footer } from "@/components/home-page/footer"
import { ScrollProgress } from "@/components/home-page/scroll-progress"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <JoinPlatformSection />
      <HowItWorksSection />
      <RoadmapSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
