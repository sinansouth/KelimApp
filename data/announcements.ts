
export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isNew?: boolean;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_004', // Her yeni duyuru için bu ID'yi değiştirin (örn: ann_002)
    title: "Yeni Modlar, Yeni Avatarlar",
    date: "03.11.2025",
    content: "Avatarlar güncellendi. Yeni kelime çalışma modları eklendi: Labirent, Bulmaca, Eşleştirme, Kelime Türetmece, Yazma.",
    isNew: true
  },
  {
    id: 'ann_003', // Her yeni duyuru için bu ID'yi değiştirin (örn: ann_002)
    title: "Lider Tablosu, Günlük Görevler",
    date: "27.11.2025",
    content: "Lider Tablosu ve Günlük Görevler eklendi.",
    isNew: true
  },
  {
    id: 'ann_002', // Her yeni duyuru için bu ID'yi değiştirin (örn: ann_002)
    title: "Yeni Özellikler",
    date: "26.11.2025",
    content: "XP, Seviye, Kozmetikler, Rozetler ve daha birçok özellik eklendi.",
    isNew: true
  },
  {
    id: 'ann_001', // Her yeni duyuru için bu ID'yi değiştirin (örn: ann_002)
    title: "KelimApp'e Hoşgeldiniz",
    date: "25.11.2025",
    content: "Genel İngilizce dışında tüm düzeylerin kelimeleri tamamlandı ve gramer konuları kısaca eklendi.",
    isNew: true
  },
  // Yeni duyuruları buraya ekleyebilirsiniz. En üstteki en güncel kabul edilir.
];
