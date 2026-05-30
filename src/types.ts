export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  marketplaceLink?: string;
}

export interface GlobalSettings {
  whatsappNumber: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  primaryColor: string;
  fontHeading: string;
  fontBody: string;
}
