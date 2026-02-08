// Ad Campaign Configuration for MaskingTech
// Based on the provided mockups and sitelink structure

export interface SitelinkItem {
  text: string;
  description1: string;
  description2: string;
  url: string;
}

export interface AdCampaign {
  headline: string;
  description: string;
  displayUrl: string;
  finalUrl: string;
  sitelinks: SitelinkItem[];
}

// Main ad campaign configuration
export const carStudioCampaign: AdCampaign = {
  headline: "Get Free AI Car Studio Credits - Boost Car Sales with AI",
  description: "We help car dealerships and marketplaces create stunning, studio-grade visuals. Increase your dealership's visibility with our custom background swap service.",
  displayUrl: "www.maskingtech.com",
  finalUrl: "https://www.maskingtech.com",
  sitelinks: [
    {
      text: "Get 50 Free Credits",
      description1: "Start your free trial today.",
      description2: "No credit card required.",
      url: "/signup"
    },
    {
      text: "View Studio Demo",
      description1: "See our AI in action.",
      description2: "Before/After gallery.",
      url: "/demo"
    },
    {
      text: "Developer API Docs",
      description1: "Integrate in minutes.",
      description2: "Scalable B2B solutions.",
      url: "/docs"
    },
    {
      text: "Enterprise Solutions",
      description1: "Bulk pricing for groups.",
      description2: "Custom branded templates.",
      url: "/enterprise"
    }
  ]
};

// Helper function to generate ad campaign tracking URLs
export function getTrackingUrl(baseUrl: string, campaign: string, source: string, medium: string): string {
  const url = new URL(baseUrl, "https://www.maskingtech.com");
  url.searchParams.append("utm_campaign", campaign);
  url.searchParams.append("utm_source", source);
  url.searchParams.append("utm_medium", medium);
  return url.toString();
}

// Generate tracking URLs for the campaign
export function getAdCampaignWithTracking(campaign: AdCampaign, campaignName: string, source: string, medium: string): AdCampaign {
  const trackedCampaign = { ...campaign };
  
  // Add tracking to final URL
  trackedCampaign.finalUrl = getTrackingUrl(campaign.finalUrl, campaignName, source, medium);
  
  // Add tracking to sitelinks
  trackedCampaign.sitelinks = campaign.sitelinks.map(sitelink => ({
    ...sitelink,
    url: getTrackingUrl(sitelink.url, campaignName, source, medium)
  }));
  
  return trackedCampaign;
}
