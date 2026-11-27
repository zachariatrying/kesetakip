import { useEffect, useState } from 'react';
import { BookOpen, CalendarClock, CreditCard, PiggyBank, PlusCircle, X } from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: PlusCircle,
    badge: '01 · HIZLI ABONELİK EKLEME',
    title: 'Hazır Şablonlar veya Özel Tutar',
    desc: 'Dijital yayın, müzik, bulut ve yapay zekâ aboneliklerini tek tıkla ekleyin veya kendi özel abonelik tutarınızı tanımlayın.',
  },
  {
    icon: CreditCard,
    badge: '02 · AYLIK & YILLIK EŞDEĞER',
    title: 'Gerçek Sabit Giderini Gör',
    desc: 'Yıllık ödenen abonelikler otomatik olarak aylık eşdeğerine bölünür; toplam aylık ve yıllık yükünüzü net kuruşuna kadar izlersiniz.',
  },
  {
    icon: CalendarClock,
    badge: '03 · YENİLEME GÜNÜ TAKİBİ',
    title: 'Yaklaşan Tahsilatları Kaçırma',
    desc: 'Aboneliklerin yenileme günlerini görerek kullanmadığınız paketleri çekim yapılmadan önce fark edin ve iptal edin.',
  },
  {
    icon: PiggyBank,
    badge: '04 · CASHBACK & TASARRUF REHBERİ',
    title: 'Kampanyalarla Aylık İade Hesapla',
    desc: 'Banka ve ön ödemeli kartların aktif iade kampanyalarını işaretleyerek aylık net cashback tasarrufunuzu hemen görün.',
  },
];

export function GuideWidget() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('rehber') === '1' || window.location.hash === '#rehber';
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="KeseTakip kullanım rehberini aç"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[#059669]/40 bg-[#0F291E] hover:bg-[#194231] text-white px-4 py-2.5 text-xs font-bold font-ledger-display shadow-md cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
      >
        <BookOpen className="w-4 h-4" />
        <span>Rehber</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-guide-title"
        >
          <div
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-[#D8E4DD] bg-white text-[#0F291E] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D8E4DD] bg-[#F4F7F5] px-5 py-4 rounded-t-2xl">
              <div>
                <div className="font-ledger-mono text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                  KeseTakip Abonelik &amp; Cashback Rehberi
                </div>
                <h2 id="app-guide-title" className="font-ledger-display text-xl font-bold">
                  Nasıl Kullanılır?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Rehberi kapat"
                className="rounded-lg p-1.5 border border-[#D8E4DD] bg-white hover:bg-[#F4F7F5] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {GUIDE_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.badge}
                    className="rounded-xl border border-[#D8E4DD] bg-[#F4F7F5]/60 p-3.5 flex items-start gap-3"
                  >
                    <div className="shrink-0 rounded-lg bg-[#E6F4EE] text-[#059669] p-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-ledger-mono text-[10px] font-bold text-[#059669]">
                        {step.badge}
                      </div>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                      <p className="text-xs text-[#4B6358] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl border border-[#D8E4DD] bg-[#E6F4EE] px-3.5 py-2.5 text-[11px] text-[#0F291E]">
                Banka bağlantısı veya kart şifresi istenmez; tüm abonelik verileriniz yalnızca cihazınızda saklanır.
              </div>
            </div>

            <div className="border-t border-[#D8E4DD] px-5 py-3 flex justify-end bg-[#F4F7F5] rounded-b-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#0F291E] hover:bg-[#194231] text-white px-4 py-2 text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
