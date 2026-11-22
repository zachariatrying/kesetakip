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
  discountRate: number;
  targetCategories: SubCategory[];
  actionUrl: string;
  actionLabel: string;
}

export const SAVINGS_DEALS: SavingsDeal[] = [
  {
    id: 'deal-cashback',
    badge: 'Cashback',
    title: 'Dijital Kart Cashback İadesi (Papara / Nays / Enpara)',
    detail: 'Yayın ve müzik aboneliklerini cashback destekli dijital kartlarla ödeyerek ortalama %20–%50 nakit iade alabilirsin.',
    discountRate: 0.25,
    targetCategories: ['Yayın', 'Müzik'],
    actionUrl: 'https://www.papara.com/cashback',
    actionLabel: 'Cashback İncele',
  },
  {
    id: 'deal-family',
    badge: 'Plan İpucu',
    title: 'Aile veya Öğrenci Planına Geçiş',
    detail: 'YouTube Premium veya Spotify’da Aile/Öğrenci planına geçmek kişi başı maliyeti %40’a kadar düşürür.',
    discountRate: 0.4,
    targetCategories: ['Yayın', 'Müzik'],
    actionUrl: 'https://www.spotify.com/tr/student/',
    actionLabel: 'Planları Gör',
  },
  {
    id: 'deal-yearly',
    badge: 'Plan İpucu',
    title: 'Yıllık Peşin Ödeme İndirimi',
    detail: 'Bulut, AI ve alışveriş aboneliklerinde yıllık peşin ödeme seçmek ortalama %16 (~2 ay) tasarruf sağlar.',
    discountRate: 0.16,
    targetCategories: ['Bulut & AI', 'Alışveriş'],
    actionUrl: 'https://one.google.com/about/plans',
    actionLabel: 'Yıllık Planlar',
  },
  {
    id: 'deal-partner',
    badge: 'İş Ortaklığı',
    title: 'Operatör & Market Paket Birleştirme',
    detail: 'GSM ve ev interneti tarifelerindeki hediye dijital üyelikleri kullanarak çift ödemeyi önleyebilirsin.',
    discountRate: 0.15,
    targetCategories: ['Yaşam', 'Alışveriş'],
    actionUrl: 'https://www.amazon.com.tr/prime',
    actionLabel: 'Fırsata Bak',
  },
];

export function monthlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry / 12 : item.priceTry;
}

export function yearlyEquivalent(item: SubscriptionItem): number {
  return item.cycle === 'yearly' ? item.priceTry : item.priceTry * 12;
}
