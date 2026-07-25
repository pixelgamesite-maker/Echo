import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedAgents } from "@/components/FeaturedAgents";
import { Categories } from "@/components/Categories";
import { Collections } from "@/components/Collections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedAgents />
      <Categories />
      <Collections />
    </>
  );
}
