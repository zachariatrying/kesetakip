export type SubCategory = 'Yayın' | 'Müzik' | 'Bulut & AI' | 'Alışveriş' | 'Yaşam';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionItem {
  id: string;
  name: string;
  category: SubCategory;
  priceTry: number;
  cycle: BillingCycle;
  billingDay: number;
  active: boolean;
  priceHikeAlert: boolean;
  previousPriceTry?: number;
}

export interface CatalogTemplate {
  id: string;
  name: string;
  category: SubCategory;
  priceTry: number;
  cycle: BillingCycle;
}

export const SUB_CATALOG: CatalogTemplate[] = [
  { id: 'netflix', name: 'Netflix Standart', category: 'Yayın', priceTry: 229.99, cycle: 'monthly' },
  { id: 'spotify', name: 'Spotify Bireysel', category: 'Müzik', priceTry: 59.99, cycle: 'monthly' },
  { id: 'youtube', name: 'YouTube Premium', category: 'Yayın', priceTry: 79.99, cycle: 'monthly' },
  { id: 'exxen', name: 'Exxen Reklamsız', category: 'Yayın', priceTry: 219.0, cycle: 'monthly' },
  { id: 'blutv', name: 'BluTV / Max', category: 'Yayın', priceTry: 199.9, cycle: 'monthly' },
  { id: 'disney', name: 'Disney+', category: 'Yayın', priceTry: 164.9, cycle: 'monthly' },
  { id: 'gain', name: 'GAİN', category: 'Yayın', priceTry: 149.0, cycle: 'monthly' },
  { id: 'tod', name: 'TOD / beIN Connect', category: 'Yayın', priceTry: 349.0, cycle: 'monthly' },
  { id: 'prime', name: 'Amazon Prime', category: 'Alışveriş', priceTry: 49.0, cycle: 'monthly' },
  { id: 'hb', name: 'Hepsiburada Premium', category: 'Alışveriş', priceTry: 49.9, cycle: 'monthly' },
  { id: 'icloud', name: 'iCloud+ (200 GB)', category: 'Bulut & AI', priceTry: 99.99, cycle: 'monthly' },
  { id: 'googleone', name: 'Google One (100 GB)', category: 'Bulut & AI', priceTry: 49.99, cycle: 'monthly' },
  { id: 'chatgpt', name: 'ChatGPT Plus', category: 'Bulut & AI', priceTry: 699.0, cycle: 'monthly' },
  { id: 'applemusic', name: 'Apple Music', category: 'Müzik', priceTry: 59.99, cycle: 'monthly' },
  { id: 'gsm', name: 'Mobil Hat Faturası', category: 'Yaşam', priceTry: 420.0, cycle: 'monthly' },
  { id: 'internet', name: 'Ev İnterneti (Fiber)', category: 'Yaşam', priceTry: 550.0, cycle: 'monthly' },
  { id: 'gym', name: 'Spor Salonu Üyeliği', category: 'Yaşam', priceTry: 1450.0, cycle: 'monthly' },
  { id: 'coffee', name: 'Kahve / Su Aboneliği', category: 'Yaşam', priceTry: 320.0, cycle: 'monthly' },
];

export function monthlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry / 12 : item.priceTry;
}

export function yearlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry : item.priceTry * 12;
}
