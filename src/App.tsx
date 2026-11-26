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
    <div className="min-h-screen bg-[#F4F7F5] text-[#0F291E] flex flex-col">
      <main className="mx-auto max-w-6xl w-full flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT STICKY DAYLIGHT BANKNOTE STATEMENT SLIP */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 bg-white border border-[#D8E4DD] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-dashed border-[#CBDAD1] flex items-center justify-between gap-3 bg-[#ECFDF5]/60">
              <div className="flex items-center gap-2.5">
                <img
                  src={`${import.meta.env.BASE_URL}store-assets/kesetakip_icon.png`}
                  alt="KeseTakip"
                  className="w-9 h-9 rounded-lg object-cover border border-[#D8E4DD]"
                />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-[#0F291E] leading-none">KeseTakip</h1>
                  <span className="font-ledger-mono text-[11px] text-[#4B6358]">Cihaz İçi Abonelik Defteri</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKvkkOpen(true)}
                className="p-2 rounded-lg border border-[#D8E4DD] bg-white text-[#4B6358] hover:text-[#059669] cursor-pointer"
                title="KVKK & Yedek"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 border-b border-dashed border-[#CBDAD1] space-y-4">
              <div>
                <div className="text-xs font-medium text-[#4B6358]">Yıllık Toplam Çıkış</div>
                <div className="font-ledger-display text-4xl font-bold text-[#059669] tabular-nums mt-1">
                  ₺{yearlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E6EFEA]">
                <div>
                  <div className="text-[11px] text-[#4B6358]">Aylık Yük</div>
                  <div className="font-ledger-mono text-lg font-bold text-[#0F291E] mt-0.5">
                    ₺{monthlyTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#4B6358]">Simüle Tasarruf</div>
                  <div className="font-ledger-mono text-lg font-bold text-[#D97706] mt-0.5">
                    ₺{yearlySaved.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E6EFEA] text-[#4B6358]">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-[#059669]" />
                  7 gün içinde {upcoming7Days.length} çekim
                </span>
                <button
                  type="button"
                  onClick={() => downloadKeseCardPng(items)}
                  className="font-ledger-mono font-semibold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PNG Röntgen
                </button>
              </div>
            </div>

            <form onSubmit={handleAddCustom} className="px-5 py-4 space-y-2.5 bg-[#FAFDFB]">
              <div className="text-xs font-bold text-[#0F291E]">Yeni Abonelik İşle</div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hizmet adı (ör. YouTube Premium)"
                className="w-full rounded-lg border border-[#D8E4DD] bg-white px-3 py-2 text-xs text-[#0F291E]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Tutar (₺)"
                  className="rounded-lg border border-[#D8E4DD] bg-white px-3 py-2 text-xs font-ledger-mono"
                />
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value as BillingCycle)}
                  className="rounded-lg border border-[#D8E4DD] bg-white px-2.5 py-2 text-xs"
                >
                  <option value="monthly">Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubCategory)}
                  className="rounded-lg border border-[#D8E4DD] bg-white px-2.5 py-2 text-xs"
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
                  className="rounded-lg border border-[#D8E4DD] bg-white px-3 py-2 text-xs font-ledger-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#059669] py-2.5 text-xs font-bold text-white hover:bg-[#047857] transition-colors cursor-pointer"
              >
                Deftere Ekle
              </button>
            </form>
          </aside>

          {/* RIGHT WORKSPACE */}
          <div className="lg:col-span-8 space-y-7">
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F291E]">Aylık Kesim Cetveli (1–31)</h2>
                <span className="font-ledger-mono text-[11px] text-[#4B6358]">
                  {activeItems.length} aktif kalem
                </span>
              </div>
              <div className="grid grid-cols-11 sm:grid-cols-16 gap-1 bg-white p-2.5 border border-[#D8E4DD] rounded-xl">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hits = billingDaysMap.get(day) ?? [];
                  const isToday = new Date().getDate() === day;
                  return (
                    <div
                      key={day}
                      title={hits.length ? hits.map((h) => `${h.name} (₺${h.priceTry})`).join(', ') : `${day}. gün`}
                      className={`h-7 rounded flex items-center justify-center font-ledger-mono text-[10px] border ${
                        hits.length > 0
                          ? 'bg-[#D1FAE5] border-[#059669] text-[#047857] font-bold'
                          : isToday
                          ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E] font-bold'
                          : 'bg-[#F8FAF9] border-[#E6EFEA] text-[#64796F]'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[#0F291E]">Hızlı Türkiye Abonelik Kataloğu</h2>
              <div className="flex flex-wrap gap-1.5">
                {SUB_CATALOG.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleAddFromCatalog(tpl.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8E4DD] bg-white px-2.5 py-1.5 text-xs text-[#0F291E] hover:border-[#059669] hover:bg-[#ECFDF5] cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#059669]" />
                    <span>{tpl.name}</span>
                    <span className="font-ledger-mono text-[#4B6358]">₺{tpl.priceTry}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#D8E4DD] rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#D8E4DD] bg-[#FAFDFB]">
                <h2 className="text-sm font-bold text-[#0F291E]">Kayıtlı Kalemler ({items.length})</h2>
                <span className="text-xs text-[#4B6358]">İptal simülasyonu için duruma dokun</span>
              </div>
              {items.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#4B6358]">
                  Defter boş. Sol panelden veya katalogdan abonelik ekleyebilirsin.
                </div>
              ) : (
                <div className="divide-y divide-[#E6EFEA]">
                  {items.map((item) => (
                    <div key={item.id} className={`px-4 py-3 ${item.active ? '' : 'bg-amber-50/50 opacity-75'}`}>
                      {editingId === item.id ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-2 rounded border border-[#D8E4DD] px-2.5 py-1.5 text-xs" />
                          <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="rounded border border-[#D8E4DD] px-2.5 py-1.5 text-xs font-ledger-mono" />
                          <select value={editCycle} onChange={(e) => setEditCycle(e.target.value as BillingCycle)} className="rounded border border-[#D8E4DD] px-2 py-1.5 text-xs">
                            <option value="monthly">Aylık</option>
                            <option value="yearly">Yıllık</option>
                          </select>
                          <div className="flex items-center gap-1">
                            <input type="number" min={1} max={31} value={editDay} onChange={(e) => setEditDay(e.target.value)} className="w-12 rounded border border-[#D8E4DD] px-2 py-1.5 text-xs font-ledger-mono" />
                            <button type="button" onClick={() => saveEdit(item.id)} className="rounded bg-[#059669] p-1.5 text-white cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setEditingId(null)} className="rounded border border-[#D8E4DD] p-1.5 text-[#4B6358] cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold truncate ${item.active ? 'text-[#0F291E]' : 'line-through text-[#4B6358]'}`}>
                                {item.name}
                              </span>
                              <span className="font-ledger-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F4F7F5] border border-[#D8E4DD] text-[#4B6358]">
                                {item.category}
                              </span>
                            </div>
                            <div className="font-ledger-mono text-xs text-[#4B6358] mt-0.5">
                              ₺{item.priceTry.toLocaleString('tr-TR')} / {item.cycle === 'yearly' ? 'yıl' : 'ay'} · Yıllık ₺{Math.round(yearlyEquivalent(item)).toLocaleString('tr-TR')} · {item.billingDay}. gün
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button type="button" onClick={() => startEdit(item)} className="p-1.5 text-[#4B6358] hover:text-[#059669] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                            <button
                              type="button"
                              onClick={() => toggleActive(item.id)}
                              className={`rounded-md px-2.5 py-1 font-ledger-mono text-[11px] font-semibold cursor-pointer ${
                                item.active ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]' : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              }`}
                            >
                              {item.active ? 'Aktif' : 'İptal Sim.'}
                            </button>
                            <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 text-[#4B6358] hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {categoryBreakdown.length > 0 && (
              <section className="bg-white border border-[#D8E4DD] rounded-xl p-4 space-y-2.5">
                <h2 className="text-sm font-bold text-[#0F291E]">Kategori Dağılımı</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {categoryBreakdown.map((row) => (
                    <div key={row.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{row.category}</span>
                        <span className="font-ledger-mono text-[#4B6358]">₺{Math.round(row.monthly).toLocaleString('tr-TR')} (%{row.pct})</span>
                      </div>
                      <div className="h-2 w-full bg-[#E6EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#059669] rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white border border-[#D8E4DD] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D8E4DD] bg-[#FAFDFB] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#059669]" />
                <h2 className="text-sm font-bold text-[#0F291E]">Cashback &amp; Tasarruf Rehberi</h2>
              </div>
              <div className="divide-y divide-[#E6EFEA]">
                {SAVINGS_DEALS.map((deal) => {
                  const estSave = dealSavingsById.get(deal.id) ?? 0;
                  const isApplied = appliedDealIds.includes(deal.id);
                  return (
                    <div key={deal.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-ledger-mono text-[10px] px-1.5 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]">
                            {deal.badge}
                          </span>
                          <span className="text-xs font-bold text-[#0F291E]">{deal.title}</span>
                        </div>
                        <p className="text-xs text-[#4B6358]">{deal.detail}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-ledger-mono text-xs font-bold text-[#D97706]">{estSave > 0 ? `~₺${estSave}/yıl` : '—'}</span>
                        <button
                          type="button"
                          onClick={() => setAppliedDealIds((prev) => (prev.includes(deal.id) ? prev.filter((x) => x !== deal.id) : [...prev, deal.id]))}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                            isApplied ? 'bg-[#059669] text-white' : 'border border-[#D8E4DD] text-[#0F291E]'
                          }`}
                        >
                          {isApplied ? 'Simülatörde' : 'Ekle'}
                        </button>
                        <a href={deal.actionUrl} target="_blank" rel="noreferrer" className="p-1.5 text-[#4B6358] hover:text-[#059669]">
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

      <footer className="border-t border-[#D8E4DD] bg-white py-4 text-center text-xs text-[#4B6358] px-4 space-y-1">
        <p>
          KeseTakip banka şifresi istemez; tüm veriler yalnızca cihazınızda tutulur. Finansal/yatırım danışmanlığı
          değildir; örnek marka adları yalnızca kendi gider takibiniz içindir.
        </p>
        <p>
          <a href="./privacy.html" className="underline font-bold text-[#059669]">
            Gizlilik &amp; KVKK Politikası
          </a>
        </p>
      </footer>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#D8E4DD] bg-white p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F291E]">KVKK &amp; Veri Kontrolü</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 text-[#4B6358] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[#4B6358]">Kayıtlar sunucuya gitmez; yalnızca tarayıcı hafızasında tutulur.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleExportJson} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D8E4DD] py-2 text-xs font-semibold cursor-pointer">
                <Download className="w-3.5 h-3.5" /> JSON İndir
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D8E4DD] py-2 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> JSON Yükle
                <input type="file" accept="application/json" className="hidden" onChange={(e) => handleImportJson(e.target.files?.[0])} />
              </label>
            </div>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="w-full rounded-lg border border-rose-300 bg-rose-50 py-2 text-xs font-bold text-rose-700 cursor-pointer">
                Tüm Verileri Kalıcı Sil
              </button>
            ) : (
              <button type="button" onClick={handlePurgeAll} className="w-full rounded-lg bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer">
                Eminim, Tüm Kayıtları Sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
