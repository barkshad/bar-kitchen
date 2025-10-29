
export interface HeroData {
  title: string;
  subtitle: string;
}

export interface MenuItem {
  name: string;
  price: string;
  image?: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuData {
  overview: MenuCategory[];
  fullMenu: MenuCategory[];
}

export interface EventData {
  image: string;
  title: string;
  date: string;
  description: string;
}

export interface GalleryImage {
  src: string;
  caption: string;
}

export interface TestimonialData {
  quote: string;
  author: string;
  location: string;
}

export interface TeamMemberData {
  image: string;
  name: string;
  role: string;
  bio: string;
}

export interface ContactData {
  address: string;
  phone: string;
}

export interface AppData {
  hero: HeroData;
  about: string;
  specials: string;
  menu: MenuData;
  events: EventData[];
  gallery: GalleryImage[];
  testimonials: TestimonialData[];
  team: TeamMemberData[];
  rules: string[];
  contact: ContactData;
}
