
export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isNew?: boolean;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_001', // Her yeni duyuru için bu ID'yi değiştirin (örn: ann_002)
    title: "KelimApp'e Hoş Geldiniz! 🎉",
    date: "25.05.2024",
    content: "Bu bir deneme sürümüdür. İlkokul 2-3-4. Sınıflar ve 8. Sınıfların tüm kelime listeleri tam olmakla beraber, kalan sınıfların kelime listeleri ve tüm gramer konuları ileride eklenecektir.",
    isNew: true
  }
  // Yeni duyuruları buraya ekleyebilirsiniz. En üstteki en güncel kabul edilir.
];
