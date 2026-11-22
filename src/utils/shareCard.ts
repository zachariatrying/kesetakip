import { yearlyEquivalent, type SubscriptionItem } from '../data/subscriptions';

export function downloadKeseCardPng(items: SubscriptionItem[]): void {
  const active = items.filter((i) => i.active);
  const paused = items.filter((i) => !i.active);
  const yearlyTotal = active.reduce((s, i) => s + yearlyEquivalent(i), 0);
  const monthlyTotal = yearlyTotal / 12;
  const yearlySaved = paused.reduce((s, i) => s + yearlyEquivalent(i), 0);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#F6F8F7';
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.fillStyle = '#0D5C43';
  ctx.fillRect(0, 0, 1080, 18);

  ctx.fillStyle = '#111F19';
  ctx.textAlign = 'center';
  ctx.font = '800 54px sans-serif';
  ctx.fillText('KeseTakip · Abonelik Röntgenim', 540, 130);

  ctx.fillStyle = '#4B6358';
  ctx.font = '500 28px sans-serif';
  ctx.fillText(`${active.length} aktif abonelik · Banka şifresi olmadan`, 540, 182);

  // Main Card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(90, 240, 900, 340);
  ctx.strokeStyle = '#D7E2DC';
  ctx.lineWidth = 3;
  ctx.strokeRect(90, 240, 900, 340);

  ctx.fillStyle = '#0D5C43';
  ctx.font = '800 84px sans-serif';
  ctx.fillText(`₺${Math.round(yearlyTotal).toLocaleString('tr-TR')}`, 540, 370);

  ctx.fillStyle = '#4B6358';
  ctx.font = '600 32px sans-serif';
  ctx.fillText(`Yıllık Toplam (Aylık ₺${Math.round(monthlyTotal).toLocaleString('tr-TR')})`, 540, 435);

  if (yearlySaved > 0) {
    ctx.fillStyle = '#B45309';
    ctx.font = '700 30px sans-serif';
    ctx.fillText(`Simülatörle yıllık ₺${Math.round(yearlySaved).toLocaleString('tr-TR')} tasarruf!`, 540, 510);
  }

  // Top 5 list
  const top5 = [...active].sort((a, b) => yearlyEquivalent(b) - yearlyEquivalent(a)).slice(0, 5);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111F19';
  ctx.font = '700 32px sans-serif';
  ctx.fillText('En Yüksek 5 Abonelik (Yıllık):', 110, 660);

  top5.forEach((sub, idx) => {
    const y = 730 + idx * 96;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(90, y - 50, 900, 76);
    ctx.strokeStyle = '#E2EBE6';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, y - 50, 900, 76);

    ctx.fillStyle = '#111F19';
    ctx.font = '700 28px sans-serif';
    ctx.fillText(`${idx + 1}. ${sub.name}`, 120, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0D5C43';
    ctx.fillText(`₺${Math.round(yearlyEquivalent(sub)).toLocaleString('tr-TR')}/yıl`, 960, y);
    ctx.textAlign = 'left';
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64796F';
  ctx.font = '500 24px sans-serif';
  ctx.fillText('kesetakip · Gizlilik odaklı akıllı abonelik takibi', 540, 1290);

  const a = document.createElement('a');
  a.download = `kesetakip-rontgen-${new Date().toISOString().slice(0, 10)}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
