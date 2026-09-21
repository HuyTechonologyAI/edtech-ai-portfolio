"use client";

import { AppHeader } from "./AppHeader";
import { HeroSection } from "./HeroSection";
import { MetricCards } from "./MetricCards";
import { AgentHierarchyDiagram } from "./AgentHierarchyDiagram";
import { CoreBusinessUnits } from "./CoreBusinessUnits";
import { SolutionsSection } from "./SolutionsSection";
import { FlagshipProducts } from "./FlagshipProducts";
import { TechnologyArchitecture } from "./TechnologyArchitecture";
import { SecurityGovernance } from "./SecurityGovernance";
import { CaseStudiesSection } from "./CaseStudiesSection";
import { MediaEcosystem } from "./MediaEcosystem";
import { FounderSection } from "./FounderSection";
import { ResourcesResearch } from "./ResourcesResearch";
import { FinalCTA } from "./FinalCTA";
import { AppFooter } from "./AppFooter";

export function CorporateHomePageV2() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-white selection:bg-[#00E5FF] selection:text-black">
      {/* 01. App Header */}
      <AppHeader />

      <main id="main-content" className="flex-1">
        {/* 02. Hero Section */}
        <HeroSection />

        {/* 03. Trust & Metrics Section */}
        <MetricCards />

        {/* 04 & 06. Core Business Units & Ecosystem Overview */}
        <CoreBusinessUnits />

        {/* 05. AI Agency Operating Model (5-Layer Orchestration) */}
        <AgentHierarchyDiagram />

        {/* 07. Enterprise Solutions */}
        <SolutionsSection />

        {/* 08. Flagship Products & Platforms */}
        <FlagshipProducts />

        {/* 09. Technology Architecture & HAIP */}
        <TechnologyArchitecture />

        {/* 10. Responsible AI & Security Governance */}
        <SecurityGovernance />

        {/* 11. Selected Case Studies & Proven Metrics */}
        <CaseStudiesSection />

        {/* 12. Media Ecosystem (3 Media Agencies) */}
        <MediaEcosystem />

        {/* 13. Founder & Leadership Credibility */}
        <FounderSection />

        {/* 14. Latest Resources & Research */}
        <ResourcesResearch />

        {/* 15. Final Conversion CTA Banner */}
        <FinalCTA />
      </main>

      {/* 16. Multi-Entity Corporate Footer */}
      <AppFooter />
    </div>
  );
}
