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
  { id: 'netflix-temel', name: 'Netflix Temel', category: 'Yayın', priceTry: 149.99, cycle: 'monthly' },
  { id: 'netflix', name: 'Netflix Standart', category: 'Yayın', priceTry: 229.99, cycle: 'monthly' },
  { id: 'netflix-ozel', name: 'Netflix Özel (4K)', category: 'Yayın', priceTry: 299.99, cycle: 'monthly' },
  { id: 'spotify', name: 'Spotify Bireysel', category: 'Müzik', priceTry: 59.99, cycle: 'monthly' },
  { id: 'spotify-ogrenci', name: 'Spotify Öğrenci', category: 'Müzik', priceTry: 32.99, cycle: 'monthly' },
  { id: 'spotify-aile', name: 'Spotify Aile (6 Kişi)', category: 'Müzik', priceTry: 99.99, cycle: 'monthly' },
  { id: 'youtube', name: 'YouTube Premium Bireysel', category: 'Yayın', priceTry: 79.99, cycle: 'monthly' },
  { id: 'youtube-ogrenci', name: 'YouTube Premium Öğrenci', category: 'Yayın', priceTry: 52.99, cycle: 'monthly' },
  { id: 'youtube-aile', name: 'YouTube Premium Aile', category: 'Yayın', priceTry: 159.99, cycle: 'monthly' },
  { id: 'exxen', name: 'Exxen Reklamsız', category: 'Yayın', priceTry: 219.0, cycle: 'monthly' },
  { id: 'blutv', name: 'BluTV / Max', category: 'Yayın', priceTry: 199.9, cycle: 'monthly' },
  { id: 'disney', name: 'Disney+', category: 'Yayın', priceTry: 164.9, cycle: 'monthly' },
  { id: 'gain', name: 'GAİN', category: 'Yayın', priceTry: 149.0, cycle: 'monthly' },
  { id: 'tod', name: 'TOD / beIN Connect', category: 'Yayın', priceTry: 349.0, cycle: 'monthly' },
  { id: 'prime', name: 'Amazon Prime', category: 'Alışveriş', priceTry: 49.0, cycle: 'monthly' },
  { id: 'hb', name: 'Hepsiburada Premium', category: 'Alışveriş', priceTry: 49.9, cycle: 'monthly' },
  { id: 'icloud-50', name: 'iCloud+ (50 GB)', category: 'Bulut & AI', priceTry: 24.99, cycle: 'monthly' },
  { id: 'icloud', name: 'iCloud+ (200 GB)', category: 'Bulut & AI', priceTry: 99.99, cycle: 'monthly' },
  { id: 'icloud-2tb', name: 'iCloud+ (2 TB)', category: 'Bulut & AI', priceTry: 329.99, cycle: 'monthly' },
  { id: 'googleone', name: 'Google One (100 GB)', category: 'Bulut & AI', priceTry: 49.99, cycle: 'monthly' },
  { id: 'googleone-yillik', name: 'Google One (100 GB Yıllık)', category: 'Bulut & AI', priceTry: 499.99, cycle: 'yearly' },
  { id: 'chatgpt', name: 'ChatGPT Plus', category: 'Bulut & AI', priceTry: 699.0, cycle: 'monthly' },
  { id: 'applemusic', name: 'Apple Music', category: 'Müzik', priceTry: 59.99, cycle: 'monthly' },
  { id: 'gsm', name: 'Mobil Hat Faturası', category: 'Yaşam', priceTry: 420.0, cycle: 'monthly' },
  { id: 'internet', name: 'Ev İnterneti (Fiber)', category: 'Yaşam', priceTry: 550.0, cycle: 'monthly' },
  { id: 'gym', name: 'Spor Salonu Üyeliği', category: 'Yaşam', priceTry: 1450.0, cycle: 'monthly' },
  { id: 'coffee', name: 'Kahve / Su Aboneliği', category: 'Yaşam', priceTry: 320.0, cycle: 'monthly' },
];

export interface SavingsDeal {
  id: string;
  badge: 'Cashback' | 'Plan İpucu' | 'İş Ortaklığı';
  title: string;
  detail: string;
  estYearlySaveTry: number;
}

export const SAVINGS_DEALS: SavingsDeal[] = [
  {
    id: 'deal-cashback',
    badge: 'Cashback',
    title: 'Dijital Kart Cashback İadesi (Papara / Nays / Enpara)',
    detail: 'Netflix, Spotify ve YouTube ödemelerini dijital cashback kartlarıyla geçirerek aylık %10–%50 arası nakit iade alabilirsin.',
    estYearlySaveTry: 1200,
  },
  {
    id: 'deal-family',
    badge: 'Plan İpucu',
    title: 'Aile veya Öğrenci Planına Geçiş',
    detail: 'YouTube Premium Aile (6 kişi) veya Spotify Aile planını ev halkıyla paylaşmak kişi başı maliyeti %55’e kadar düşürür.',
    estYearlySaveTry: 950,
  },
  {
    id: 'deal-yearly',
    badge: 'Plan İpucu',
    title: 'Yıllık Peşin Ödeme İndirimi',
    detail: 'Google One, Hepsiburada Premium veya spor salonunda yıllık peşin plan seçmek genellikle 2 ay bedava avantajı sağlar.',
    estYearlySaveTry: 700,
  },
  {
    id: 'deal-partner',
    badge: 'İş Ortaklığı',
    title: 'Operatör & Market Paket Birleştirme',
    detail: 'Turkcell / Vodafone / Türk Telekom tarife hediyelerinde Prime, TV+ veya fizy ücretsiz dahil olabiliyor; çift ödeme yapma.',
    estYearlySaveTry: 600,
  },
];

export function monthlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry / 12 : item.priceTry;
}

export function yearlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry : item.priceTry * 12;
}
