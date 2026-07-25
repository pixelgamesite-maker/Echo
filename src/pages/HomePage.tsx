import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedAgents } from "@/components/FeaturedAgents";
import { Categories } from "@/components/Categories";
import { LiveMintFeed } from "@/components/LiveMintFeed";
import { Collections } from "@/components/Collections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedAgents />
      <Categories />
      <LiveMintFeed />
      <Collections />
    </>
  );
}
