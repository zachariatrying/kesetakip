import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BellRing,
  Check,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import {
  SAVINGS_DEALS,
  SUB_CATALOG,
  monthlyEquivalent,
  yearlyEquivalent,
  type BillingCycle,
  type SubCategory,
  type SubscriptionItem,
} from './data/subscriptions';
import { downloadKeseCardPng } from './utils/shareCard';

const STORAGE_KEY = 'kesetakip_subs_v1';
const CATEGORIES: SubCategory[] = ['Yayın', 'Müzik', 'Bulut & AI', 'Alışveriş', 'Yaşam'];

function loadItems(): SubscriptionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SubscriptionItem[];
  } catch {
    // Ignore storage errors
  }
  return [
    { id: 's-1', name: 'Netflix Standart', category: 'Yayın', priceTry: 229.99, cycle: 'monthly', billingDay: 15, active: true, priceHikeAlert: true },
    { id: 's-2', name: 'Spotify Bireysel', category: 'Müzik', priceTry: 59.99, cycle: 'monthly', billingDay: 24, active: true, priceHikeAlert: true },
    { id: 's-3', name: 'iCloud+ (200 GB)', category: 'Bulut & AI', priceTry: 99.99, cycle: 'monthly', billingDay: 5, active: true, priceHikeAlert: true },
  ];
}

export default function App() {
  const [items, setItems] = useState<SubscriptionItem[]>(() => loadItems());
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<SubCategory>('Yayın');
  const [billingDay, setBillingDay] = useState('15');
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCycle, setEditCycle] = useState<BillingCycle>('monthly');
  const [editDay, setEditDay] = useState('15');
  const [appliedDealIds, setAppliedDealIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('kesetakip_deals_v1');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kesetakip_deals_v1', JSON.stringify(appliedDealIds));
    } catch {
      // Ignore
    }
  }, [appliedDealIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items]);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const utm_source = sp.get('utm_source');
      const utm_campaign = sp.get('utm_campaign');
      if (utm_source || utm_campaign) {
        localStorage.setItem(
          'kesetakip_utm_v1',
          JSON.stringify({ utm_source, utm_campaign, landedAt: new Date().toISOString() })
        );
      }
    } catch {
      // Ignore
    }
  }, []);

  const activeItems = useMemo(() => items.filter((i) => i.active), [items]);
  const pausedItems = useMemo(() => items.filter((i) => !i.active), [items]);

  const monthlyTotal = useMemo(
    () => activeItems.reduce((sum, i) => sum + monthlyEquivalent(i), 0),
    [activeItems]
  );
  const yearlyTotal = useMemo(
    () => activeItems.reduce((sum, i) => sum + yearlyEquivalent(i), 0),
    [activeItems]
  );
  const yearlySavedFromPaused = useMemo(
    () => pausedItems.reduce((sum, i) => sum + yearlyEquivalent(i), 0),
    [pausedItems]
  );

  const dealSavingsById = useMemo(() => {
    const map = new Map<string, number>();
    for (const deal of SAVINGS_DEALS) {
      const matchingYearly = activeItems
        .filter((i) => deal.targetCategories.includes(i.category))
        .reduce((s, i) => s + yearlyEquivalent(i), 0);
      map.set(deal.id, Math.round(matchingYearly * deal.discountRate));
    }
    return map;
  }, [activeItems]);

  const yearlyDealSaved = useMemo(
    () => appliedDealIds.reduce((sum, id) => sum + (dealSavingsById.get(id) ?? 0), 0),
    [appliedDealIds, dealSavingsById]
  );

  const yearlySaved = yearlySavedFromPaused + yearlyDealSaved;

  const categoryBreakdown = useMemo(() => {
    const sums = new Map<SubCategory, number>();
    for (const i of activeItems) {
      sums.set(i.category, (sums.get(i.category) ?? 0) + monthlyEquivalent(i));
    }
    return [...sums.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val]) => ({
        category: cat,
        monthly: val,
        pct: monthlyTotal > 0 ? Math.round((val / monthlyTotal) * 100) : 0,
      }));
  }, [activeItems, monthlyTotal]);

  const upcoming7Days = useMemo(() => {
    const today = new Date().getDate();
    return activeItems.filter((i) => {
      const diff = (i.billingDay - today + 31) % 31;
      return diff >= 0 && diff <= 7;
    });
  }, [activeItems]);

  const topCategory = useMemo(() => {
    const sums = new Map<SubCategory, number>();
    for (const i of activeItems) {
      sums.set(i.category, (sums.get(i.category) ?? 0) + monthlyEquivalent(i));
    }
    let best: SubCategory | null = null;
    let bestVal = 0;
    for (const [k, v] of sums) {
      if (v > bestVal) {
        best = k;
        bestVal = v;
      }
    }
    return best;
  }, [activeItems]);

  const handleAddCustom = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numPrice = Number(price.replace(',', '.'));
    const dayNum = Math.min(31, Math.max(1, Math.round(Number(billingDay) || 1)));
    if (!cleanName || !Number.isFinite(numPrice) || numPrice <= 0) return;

    setItems((prev) => [
      {
        id: `s-${Date.now()}`,
        name: cleanName,
        category,
        priceTry: numPrice,
        cycle,
        billingDay: dayNum,
        active: true,
        priceHikeAlert: true,
      },
      ...prev,
    ]);
    setName('');
    setPrice('');
  };

  const handleAddFromCatalog = (tplId: string) => {
    const tpl = SUB_CATALOG.find((c) => c.id === tplId);
    if (!tpl) return;
    setItems((prev) => [
      {
        id: `s-${Date.now()}-${tpl.id}`,
        name: tpl.name,
        category: tpl.category,
        priceTry: tpl.priceTry,
        cycle: tpl.cycle,
        billingDay: new Date().getDate(),
        active: true,
        priceHikeAlert: true,
      },
      ...prev,
    ]);
  };

  const toggleActive = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (item: SubscriptionItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.priceTry));
    setEditCycle(item.cycle);
    setEditDay(String(item.billingDay));
  };

  const saveEdit = (id: string) => {
    const numPrice = Number(editPrice.replace(',', '.'));
    const dayNum = Math.min(31, Math.max(1, Math.round(Number(editDay) || 1)));
    if (!editName.trim() || !Number.isFinite(numPrice) || numPrice <= 0) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, name: editName.trim(), priceTry: numPrice, cycle: editCycle, billingDay: dayNum }
          : i
      )
    );
    setEditingId(null);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kesetakip-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SubscriptionItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
  };

  const handlePurgeAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setConfirmDelete(false);
    setKvkkOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7]">
      <header className="sticky top-0 z-30 border-b border-[#0A4935] bg-[#0D5C43] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}store-assets/kesetakip_icon.png`}
              alt="KeseTakip"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">KeseTakip</h1>
              <p className="text-[11px] text-[#D1FAE5]/90 hidden sm:block mt-0.5">
                Banka şifresi istemeyen abonelik &amp; zam takipçisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadKeseCardPng(items)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-[#0D5C43] px-3 py-1.5 text-xs font-extrabold hover:bg-[#ECFDF5] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Röntgen PNG</span>
            </button>
            <button
              type="button"
              onClick={() => setKvkkOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">KVKK &amp; Yedek</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl w-full flex-1 px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-[#DCE5E0] bg-white p-4">
            <div className="text-xs font-semibold text-[#4B6358]">Aylık Toplam</div>
            <div className="text-2xl font-extrabold text-[#111F19] tabular-nums mt-1">
              ₺{monthlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-[#64796F] mt-1">{activeItems.length} aktif abonelik</div>
          </div>

          <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
            <div className="text-xs font-semibold text-[#047857]">Yıllık Röntgen</div>
            <div className="text-2xl font-extrabold text-[#0D5C43] tabular-nums mt-1">
              ₺{yearlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-[#065F46] mt-1">
              {topCategory ? `En yüksek: ${topCategory}` : 'Henüz kayıt yok'}
            </div>
          </div>

          <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
            <div className="text-xs font-semibold text-[#92400E] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Tasarruf Simülatörü
            </div>
            <div className="text-2xl font-extrabold text-[#B45309] tabular-nums mt-1">
              ₺{yearlySaved.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-[#92400E] mt-1">
              {pausedItems.length} iptal + {appliedDealIds.length} fırsat / yıl
            </div>
          </div>

          <div className="rounded-2xl border border-[#DCE5E0] bg-white p-4">
            <div className="text-xs font-semibold text-[#4B6358] flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5 text-[#0D5C43]" /> 7 Gün İçinde Yenileme
            </div>
            <div className="text-2xl font-extrabold text-[#111F19] tabular-nums mt-1">
              {upcoming7Days.length}
            </div>
            <div className="text-[11px] text-[#64796F] truncate mt-1">
              {upcoming7Days.length > 0
                ? upcoming7Days.map((u) => u.name).join(', ')
                : 'Yaklaşan çekim yok'}
            </div>
          </div>
        </section>

        {/* Quick Catalog Add */}
        <section className="rounded-2xl border border-[#DCE5E0] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#111F19] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0D5C43]" /> Türkiye Popüler Aboneliklerinden Tek Tıkla Ekle
            </h2>
            <span className="text-[11px] text-[#64796F]">Cihaz içi, banka şifresiz</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUB_CATALOG.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleAddFromCatalog(tpl.id)}
                className="inline-flex items-center gap-1 rounded-full border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-1 text-xs font-semibold text-[#111F19] hover:border-[#0D5C43] hover:bg-[#ECFDF5] cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#0D5C43]" />
                {tpl.name} <span className="text-[#4B6358] tabular-nums">₺{tpl.priceTry}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Add Form */}
          <form
            onSubmit={handleAddCustom}
            className="rounded-2xl border border-[#DCE5E0] bg-white p-4 space-y-3 h-fit"
          >
            <h2 className="text-sm font-extrabold text-[#111F19]">Özel Abonelik Ekle</h2>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Abonelik adı (örn. Su Arıtma)"
              className="w-full rounded-xl border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Tutar (₺)"
                className="rounded-xl border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-2 text-sm"
              />
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as BillingCycle)}
                className="rounded-xl border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-2 text-sm"
              >
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubCategory)}
                className="rounded-xl border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={31}
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                placeholder="Kesim günü (1-31)"
                className="rounded-xl border border-[#DCE5E0] bg-[#F6F8F7] px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#0D5C43] py-2.5 text-sm font-bold text-white hover:bg-[#0A4935] cursor-pointer"
            >
              Listeme Ekle
            </button>
          </form>

          {/* Active Subscriptions List + Simulator */}
          <section className="lg:col-span-2 rounded-2xl border border-[#DCE5E0] bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2EBE6] bg-[#F9FBFA] flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#111F19]">
                Aboneliklerin ({items.length})
              </h2>
              <span className="text-[11px] text-[#4B6358]">
                Anahtarı kapatarak iptal tasarrufunu simüle et
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64796F]">
                Henüz abonelik eklemedin. Yukarıdan popüler servislere tıklayarak başlayabilirsin.
              </div>
            ) : (
              <div className="divide-y divide-[#E2EBE6]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 space-y-2 ${
                      item.active ? 'bg-white' : 'bg-[#FFFBEB]/60 opacity-75'
                    }`}
                  >
                    {editingId === item.id ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="col-span-2 rounded-lg border border-[#DCE5E0] px-2.5 py-1.5 text-xs"
                          placeholder="Plan adı"
                        />
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="rounded-lg border border-[#DCE5E0] px-2.5 py-1.5 text-xs"
                          placeholder="Tutar (₺)"
                        />
                        <select
                          value={editCycle}
                          onChange={(e) => setEditCycle(e.target.value as BillingCycle)}
                          className="rounded-lg border border-[#DCE5E0] px-2 py-1.5 text-xs"
                        >
                          <option value="monthly">Aylık</option>
                          <option value="yearly">Yıllık</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={editDay}
                            onChange={(e) => setEditDay(e.target.value)}
                            className="w-12 rounded-lg border border-[#DCE5E0] px-2 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="rounded-lg bg-[#0D5C43] p-1.5 text-white cursor-pointer"
                            title="Kaydet"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-[#DCE5E0] p-1.5 text-[#64796F] cursor-pointer"
                            title="İptal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold truncate ${item.active ? 'text-[#111F19]' : 'line-through text-[#64796F]'}`}>
                              {item.name}
                            </span>
                            <span className="rounded bg-[#F1F5F3] px-2 py-0.5 text-[10px] font-bold text-[#0D5C43]">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs text-[#4B6358] mt-0.5 tabular-nums">
                            ₺{item.priceTry.toLocaleString('tr-TR')} / {item.cycle === 'yearly' ? 'yıl' : 'ay'} ·{' '}
                            Yıllık ₺{Math.round(yearlyEquivalent(item)).toLocaleString('tr-TR')} · Her ayın {item.billingDay}. günü
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            aria-label="Planı düzenle"
                            className="rounded-lg p-1.5 text-[#64796F] hover:text-[#0D5C43] cursor-pointer"
                            title="Plan / fiyat düzelt"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(item.id)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                              item.active
                                ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                                : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            }`}
                          >
                            {item.active ? 'Aktif' : 'İptal Sim.'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label="Sil"
                            className="rounded-lg p-1.5 text-[#64796F] hover:text-[#DC2626] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <section className="rounded-2xl border border-[#DCE5E0] bg-white p-4 space-y-2.5">
            <h2 className="text-sm font-extrabold text-[#111F19]">Kategori Harcama Dağılımı (Aylık)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryBreakdown.map((row) => (
                <div key={row.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111F19]">{row.category}</span>
                    <span className="tabular-nums text-[#4B6358]">
                      ₺{Math.round(row.monthly).toLocaleString('tr-TR')} (%{row.pct})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E2EBE6] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0D5C43] transition-all duration-300"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Savings & Partner Deals Section */}
        <section className="rounded-2xl border border-[#DCE5E0] bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-[#111F19] flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#0D5C43]" />
              Tasarruf Fırsatları &amp; Cashback Rehberi
            </h2>
            <span className="text-[11px] text-[#64796F]">
              Listene göre gerçek tasarrufunu hesapla · iş ortaklığı alanları işaretlidir
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAVINGS_DEALS.map((deal) => {
              const estSave = dealSavingsById.get(deal.id) ?? 0;
              const isApplied = appliedDealIds.includes(deal.id);
              return (
                <article
                  key={deal.id}
                  className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
                    isApplied
                      ? 'border-[#0D5C43] bg-[#ECFDF5]/60'
                      : 'border-[#E2EBE6] bg-[#F9FBFA]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                      {deal.badge}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#0D5C43] tabular-nums">
                      {estSave > 0
                        ? `Listende ~₺${estSave.toLocaleString('tr-TR')}/yıl tasarruf`
                        : 'İlgili abonelik ekleyince hesaplanır'}
                    </span>
                  </div>
                  <h3 className="text-xs font-extrabold text-[#111F19]">{deal.title}</h3>
                  <p className="text-[11px] text-[#4B6358] leading-relaxed">{deal.detail}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setAppliedDealIds((prev) =>
                          prev.includes(deal.id)
                            ? prev.filter((x) => x !== deal.id)
                            : [...prev, deal.id]
                        )
                      }
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                        isApplied
                          ? 'bg-[#0D5C43] text-white'
                          : 'border border-[#0D5C43]/30 bg-white text-[#0D5C43] hover:bg-[#ECFDF5]'
                      }`}
                    >
                      {isApplied ? '✓ Simülatörde Aktif' : 'Simülatöre Ekle'}
                    </button>
                    <a
                      href={deal.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0D5C43] hover:underline"
                    >
                      {deal.actionLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DCE5E0] bg-white py-3.5 text-center text-[11px] text-[#4B6358] px-4">
        KeseTakip banka şifresi veya kart bilgisi istemez; tüm abonelik verileriniz yalnızca cihazınızda saklanır.
      </footer>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#111F19]">KVKK &amp; Veri Kontrolü</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#4B6358]">
              Tüm kayıtlar yalnızca bu tarayıcı/cihazda tutulur. Yedek alabilir veya tüm verileri tek seferde silebilirsin.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCE5E0] py-2 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> JSON İndir
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCE5E0] py-2 text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> JSON Yükle
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleImportJson(e.target.files?.[0])}
                />
              </label>
            </div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-xl border border-[#FECACA] bg-[#FEF2F2] py-2 text-xs font-bold text-[#B91C1C] cursor-pointer"
              >
                Tüm Verileri Kalıcı Sil
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePurgeAll}
                className="w-full rounded-xl bg-[#DC2626] py-2 text-xs font-bold text-white cursor-pointer"
              >
                Eminim, Tüm Kayıtları Sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
