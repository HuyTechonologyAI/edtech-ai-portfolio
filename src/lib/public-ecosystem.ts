import rawData from "@/data/public-ecosystem.json";

export interface PublicOrganization {
  id: string;
  display_name: string;
  short_description: string;
  brand_role: string;
  accent_color: string;
  badge_bg: string;
  badge_text: string;
  gradient: string;
  icon_name: string;
  public_capabilities: string[];
  public_product_groups: string[];
  public_website_target: string;
  public_status: "ACTIVE" | "MAINTENANCE";
}

export const PUBLIC_ECOSYSTEM: PublicOrganization[] = rawData.public_ecosystem as PublicOrganization[];

export function getOrganizationById(id: string): PublicOrganization | undefined {
  return PUBLIC_ECOSYSTEM.find((org) => org.id === id);
}

export function getParentHolding(): PublicOrganization {
  return PUBLIC_ECOSYSTEM[0];
}

export function getOperatingBUs(): PublicOrganization[] {
  return PUBLIC_ECOSYSTEM.slice(1);
}
