import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { MintWindow } from "./components/MintWindow";
import { HowItWorks } from "./components/HowItWorks";
import { FeaturedAgents } from "./components/FeaturedAgents";
import { Categories } from "./components/Categories";
import { LiveMintFeed } from "./components/LiveMintFeed";
import { Collections } from "./components/Collections";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <Navigation />
      <Hero />
      <MintWindow />
      <HowItWorks />
      <FeaturedAgents />
      <Categories />
      <LiveMintFeed />
      <Collections />
      <Footer />
    </div>
  );
}
