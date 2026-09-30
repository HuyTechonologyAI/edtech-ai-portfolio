export interface FolderItem {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
}

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  link: string;
  type: string;
  category?: string;
  youtubeUrl: string;
  duration: string;
  created_at: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  folderId?: number | null;
  folder_id?: number | null;
}

export interface ContentForm {
  title?: string;
  description?: string;
  link?: string;
  type?: string;
  category?: string;
  youtubeUrl?: string;
  duration?: string;
  isFeatured?: boolean | string;
  isPremium?: boolean | string;
  folder_id?: number | null;
}

export interface MatrixFeature {
  name: string;
  [tier: string]: string | boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  target: string;
  priceMonthly: number;
  priceYearly: number;
  originalYearly?: number;
  popular?: boolean;
  featured?: boolean;
  desc: string;
  cta?: string;
  href?: string;
  features?: string[];
}
