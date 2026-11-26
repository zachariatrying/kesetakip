import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BellRing,
  Check,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
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
  } catch {}
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
    } catch {}
  }, [appliedDealIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
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
    } catch {}
  }, []);

  const activeItems = useMemo(() => items.filter((i) => i.active), [items]);
  const pausedItems = useMemo(() => items.filter((i) => !i.active), [items]);
  const monthlyTotal = useMemo(() => activeItems.reduce((sum, i) => sum + monthlyEquivalent(i), 0), [activeItems]);
  const yearlyTotal = useMemo(() => activeItems.reduce((sum, i) => sum + yearlyEquivalent(i), 0), [activeItems]);
  const yearlySavedFromPaused = useMemo(() => pausedItems.reduce((sum, i) => sum + yearlyEquivalent(i), 0), [pausedItems]);

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
    for (const i of activeItems) sums.set(i.category, (sums.get(i.category) ?? 0) + monthlyEquivalent(i));
    return [...sums.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, monthly]) => ({
        category: cat,
        monthly,
        pct: monthlyTotal > 0 ? Math.round((monthly / monthlyTotal) * 100) : 0,
      }));
  }, [activeItems, monthlyTotal]);

  const upcoming7Days = useMemo(() => {
    const today = new Date().getDate();
    return activeItems.filter((i) => ((i.billingDay - today + 31) % 31) <= 7);
  }, [activeItems]);

  const handleAddFromCatalog = (tplId: string) => {
    const tpl = SUB_CATALOG.find((t) => t.id === tplId);
    if (!tpl) return;
    setItems((prev) => [
      { id: `s-${Date.now()}`, name: tpl.name, category: tpl.category, priceTry: tpl.priceTry, cycle: tpl.cycle, billingDay: Math.min(28, new Date().getDate() + 3), active: true, priceHikeAlert: true },
      ...prev,
    ]);
  };

  const handleAddCustom = (e: FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(',', '.'));
    const dayNum = Math.min(31, Math.max(1, Math.round(Number(billingDay) || 1)));
    if (!name.trim() || !Number.isFinite(numPrice) || numPrice <= 0) return;
    setItems((prev) => [
      { id: `s-${Date.now()}`, name: name.trim(), category, priceTry: numPrice, cycle, billingDay: dayNum, active: true, priceHikeAlert: true },
      ...prev,
    ]);
    setName('');
    setPrice('');
  };

  const toggleActive = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

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
      prev.map((i) => (i.id === id ? { ...i, name: editName.trim(), priceTry: numPrice, cycle: editCycle, billingDay: dayNum } : i))
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
      } catch {}
    };
    reader.readAsText(file);
  };

  const handlePurgeAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setConfirmDelete(false);
    setKvkkOpen(false);
  };

  const billingDaysMap = useMemo(() => {
    const map = new Map<number, SubscriptionItem[]>();
    for (const it of activeItems) {
      const arr = map.get(it.billingDay) ?? [];
      arr.push(it);
      map.set(it.billingDay, arr);
    }
    return map;
  }, [activeItems]);

  return (
    <div className="min-h-screen bg-[#0B0E0D] text-[#E7EFEA] flex flex-col">
      {/* Asymmetric Ledger Layout — Zero Solid Sticky Clone Header */}
      <main className="mx-auto max-w-6xl w-full flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT STICKY STATEMENT SLIP */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 bg-[#131917] border border-[#1F2925] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dashed border-[#2A3832] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={`${import.meta.env.BASE_URL}store-assets/kesetakip_icon.png`}
                  alt="KeseTakip"
                  className="w-8 h-8 rounded-md object-cover border border-[#2A3832]"
                />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white leading-none">KeseTakip</h1>
                  <span className="font-ledger-mono text-[11px] text-[#8DA196]">Cihaz İçi Abonelik Defteri</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKvkkOpen(true)}
                className="p-2 rounded-md border border-[#1F2925] text-[#8DA196] hover:text-[#34D399] hover:border-[#34D399]/50 cursor-pointer"
                title="KVKK & Yedek"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Annual Burn Statement */}
            <div className="px-5 py-5 border-b border-dashed border-[#2A3832] space-y-4">
              <div>
                <div className="text-xs text-[#8DA196]">Yıllık Toplam Çıkış</div>
                <div className="font-ledger-display text-4xl font-bold text-[#34D399] tabular-nums mt-1">
                  ₺{yearlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1F2925]">
                <div>
                  <div className="text-[11px] text-[#8DA196]">Aylık Yük</div>
                  <div className="font-ledger-mono text-lg font-semibold text-white mt-0.5">
                    ₺{monthlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8DA196]">Simüle Tasarruf</div>
                  <div className="font-ledger-mono text-lg font-semibold text-[#FBBF24] mt-0.5">
                    ₺{yearlySaved.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1F2925] text-[#8DA196]">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-[#34D399]" />
                  7 gün içinde {upcoming7Days.length} çekim
                </span>
                <button
                  type="button"
                  onClick={() => downloadKeseCardPng(items)}
                  className="font-ledger-mono text-[#34D399] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PNG Röntgen
                </button>
              </div>
            </div>

            {/* Inline Quick-Add Form Inside Slip */}
            <form onSubmit={handleAddCustom} className="px-5 py-4 space-y-2.5 bg-[#0F1412]">
              <div className="text-xs font-semibold text-[#E7EFEA]">Yeni Abonelik İşle</div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hizmet adı (ör. YouTube Premium)"
                className="w-full rounded-md border border-[#1F2925] bg-[#0B0E0D] px-3 py-2 text-xs text-white placeholder:text-[#5B6E64]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Tutar (₺)"
                  className="rounded-md border border-[#1F2925] bg-[#0B0E0D] px-3 py-2 text-xs font-ledger-mono text-white placeholder:text-[#5B6E64]"
                />
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value as BillingCycle)}
                  className="rounded-md border border-[#1F2925] bg-[#0B0E0D] px-2.5 py-2 text-xs text-white"
                >
                  <option value="monthly">Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubCategory)}
                  className="rounded-md border border-[#1F2925] bg-[#0B0E0D] px-2.5 py-2 text-xs text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  placeholder="Gün (1-31)"
                  className="rounded-md border border-[#1F2925] bg-[#0B0E0D] px-3 py-2 text-xs font-ledger-mono text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-[#34D399] py-2 text-xs font-bold text-[#062419] hover:bg-[#6EE7B7] transition-colors cursor-pointer"
              >
                Deftere Ekle
              </button>
            </form>
          </aside>

          {/* RIGHT WORKSPACE */}
          <div className="lg:col-span-8 space-y-7">
            {/* 1-31 Day Billing Ruler */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Aylık Kesim Cetveli (1–31)</h2>
                <span className="font-ledger-mono text-[11px] text-[#8DA196]">
                  {activeItems.length} aktif kalem
                </span>
              </div>
              <div className="grid grid-cols-11 sm:grid-cols-16 gap-1 bg-[#131917] p-2.5 border border-[#1F2925] rounded-lg">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hits = billingDaysMap.get(day) ?? [];
                  const isToday = new Date().getDate() === day;
                  return (
                    <div
                      key={day}
                      title={hits.length ? hits.map((h) => `${h.name} (₺${h.priceTry})`).join(', ') : `${day}. gün`}
                      className={`h-7 rounded flex items-center justify-center font-ledger-mono text-[10px] border ${
                        hits.length > 0
                          ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399] font-bold'
                          : isToday
                          ? 'bg-[#1F2925] border-[#8DA196] text-white'
                          : 'bg-[#0B0E0D] border-[#1A231F] text-[#5B6E64]'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Catalog Ticker */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white">Hızlı Türkiye Abonelik Kataloğu</h2>
              <div className="flex flex-wrap gap-1.5">
                {SUB_CATALOG.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleAddFromCatalog(tpl.id)}
                    className="inline-flex items-center gap-1.5 rounded border border-[#1F2925] bg-[#131917] px-2.5 py-1 text-xs text-[#E7EFEA] hover:border-[#34D399] cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#34D399]" />
                    <span>{tpl.name}</span>
                    <span className="font-ledger-mono text-[#8DA196]">₺{tpl.priceTry}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Hairline Ledger Table */}
            <section className="border-t border-b border-[#1F2925]">
              <div className="py-3 flex items-center justify-between border-b border-[#1F2925]">
                <h2 className="text-sm font-bold text-white">Kayıtlı Kalemler ({items.length})</h2>
                <span className="text-xs text-[#8DA196]">İptal simülasyonu için duruma dokun</span>
              </div>
              {items.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8DA196]">
                  Defter boş. Sol panelden veya katalogdan abonelik ekleyebilirsin.
                </div>
              ) : (
                <div className="divide-y divide-[#1F2925]">
                  {items.map((item) => (
                    <div key={item.id} className={`py-3 ${item.active ? '' : 'opacity-60'}`}>
                      {editingId === item.id ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="col-span-2 rounded border border-[#2A3832] bg-[#131917] px-2.5 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="rounded border border-[#2A3832] bg-[#131917] px-2.5 py-1.5 text-xs font-ledger-mono text-white"
                          />
                          <select
                            value={editCycle}
                            onChange={(e) => setEditCycle(e.target.value as BillingCycle)}
                            className="rounded border border-[#2A3832] bg-[#131917] px-2 py-1.5 text-xs text-white"
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
                              className="w-12 rounded border border-[#2A3832] bg-[#131917] px-2 py-1.5 text-xs font-ledger-mono text-white"
                            />
                            <button type="button" onClick={() => saveEdit(item.id)} className="rounded bg-[#34D399] p-1.5 text-[#062419] cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="rounded border border-[#2A3832] p-1.5 text-[#8DA196] cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold truncate ${item.active ? 'text-white' : 'line-through text-[#8DA196]'}`}>
                                {item.name}
                              </span>
                              <span className="font-ledger-mono text-[10px] px-1.5 py-0.5 rounded bg-[#131917] border border-[#1F2925] text-[#8DA196]">
                                {item.category}
                              </span>
                            </div>
                            <div className="font-ledger-mono text-xs text-[#8DA196] mt-0.5">
                              ₺{item.priceTry.toLocaleString('tr-TR')} / {item.cycle === 'yearly' ? 'yıl' : 'ay'} · Yıllık ₺{Math.round(yearlyEquivalent(item)).toLocaleString('tr-TR')} · {item.billingDay}. gün
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button type="button" onClick={() => startEdit(item)} className="p-1.5 text-[#8DA196] hover:text-white cursor-pointer">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(item.id)}
                              className={`rounded px-2.5 py-1 font-ledger-mono text-[11px] font-semibold cursor-pointer ${
                                item.active
                                  ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                                  : 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                              }`}
                            >
                              {item.active ? 'Aktif' : 'İptal Sim.'}
                            </button>
                            <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 text-[#8DA196] hover:text-rose-400 cursor-pointer">
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

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-sm font-bold text-white">Kategori Dağılımı</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {categoryBreakdown.map((row) => (
                    <div key={row.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#E7EFEA]">{row.category}</span>
                        <span className="font-ledger-mono text-[#8DA196]">
                          ₺{Math.round(row.monthly).toLocaleString('tr-TR')} (%{row.pct})
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1F2925] overflow-hidden">
                        <div className="h-full bg-[#34D399]" style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Savings Deals */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#34D399]" /> Cashback &amp; Tasarruf Rehberi
                </h2>
              </div>
              <div className="divide-y divide-[#1F2925] border-y border-[#1F2925]">
                {SAVINGS_DEALS.map((deal) => {
                  const estSave = dealSavingsById.get(deal.id) ?? 0;
                  const isApplied = appliedDealIds.includes(deal.id);
                  return (
                    <div key={deal.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-ledger-mono text-[10px] px-1.5 py-0.5 rounded bg-[#131917] border border-[#34D399]/40 text-[#34D399]">
                            {deal.badge}
                          </span>
                          <span className="text-xs font-bold text-white">{deal.title}</span>
                        </div>
                        <p className="text-xs text-[#8DA196]">{deal.detail}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-ledger-mono text-xs text-[#FBBF24]">
                          {estSave > 0 ? `~₺${estSave}/yıl` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAppliedDealIds((prev) => (prev.includes(deal.id) ? prev.filter((x) => x !== deal.id) : [...prev, deal.id]))
                          }
                          className={`rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                            isApplied ? 'bg-[#34D399] text-[#062419]' : 'border border-[#2A3832] text-[#E7EFEA]'
                          }`}
                        >
                          {isApplied ? 'Simülatörde' : 'Ekle'}
                        </button>
                        <a href={deal.actionUrl} target="_blank" rel="noreferrer" className="p-1.5 text-[#8DA196] hover:text-white">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1F2925] py-4 text-center text-xs text-[#8DA196] px-4">
        KeseTakip banka şifresi istemez; tüm veriler yalnızca cihazınızda tutulur.
      </footer>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#2A3832] bg-[#131917] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">KVKK &amp; Veri Kontrolü</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 text-[#8DA196] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8DA196]">Kayıtlar sunucuya gitmez; yalnızca tarayıcı hafızasında tutulur.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleExportJson} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#2A3832] py-2 text-xs font-semibold text-white cursor-pointer">
                <Download className="w-3.5 h-3.5" /> JSON İndir
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#2A3832] py-2 text-xs font-semibold text-white cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> JSON Yükle
                <input type="file" accept="application/json" className="hidden" onChange={(e) => handleImportJson(e.target.files?.[0])} />
              </label>
            </div>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="w-full rounded-md border border-rose-800 bg-rose-950/40 py-2 text-xs font-bold text-rose-300 cursor-pointer">
                Tüm Verileri Kalıcı Sil
              </button>
            ) : (
              <button type="button" onClick={handlePurgeAll} className="w-full rounded-md bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer">
                Eminim, Tüm Kayıtları Sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
