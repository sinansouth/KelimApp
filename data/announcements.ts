
export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isNew?: boolean;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_v2',
    title: "v2.0: Lider Tablosu & Yeni Oyunlar",
    date: "04.12.2024",
    content: "Beklenen güncelleme geldi! Lider Tablosu ile arkadaşlarınla yarışabilir, Günlük Görevleri tamamlayarak ekstra XP kazanabilirsin. Ayrıca Market açıldı; rozetler, temalar ve güçlendirmeler seni bekliyor. Labirent ve Bulmaca oyunlarını denemeyi unutma!",
    isNew: true
  },
  {
    id: 'ann_v1_3',
    title: "v1.3: Akıllı Tekrar & Seslendirme",
    date: "30.11.2024",
    content: "Öğrendiklerini unutmamak için SRS (Aralıklı Tekrar Sistemi) devreye alındı. Arayüzde iyileştirmeler yapıldı.",
    isNew: false
  },
  {
    id: 'ann_v1_2',
    title: "v1.2: Oyunlaştırma & XP Sistemi",
    date: "28.11.2024",
    content: "Artık çalışırken XP kazanıp seviye atlayabilirsin! Öğrenmeyi eğlenceli hale getirmek için 'Eşleştirme' ve 'Yazma' oyun modları eklendi. Bakalım en yüksek skoru kim yapacak?",
    isNew: false
  },
  {
    id: 'ann_v1_1',
    title: "v1.1: Quiz Modu Yayında",
    date: "26.11.2024",
    content: "Sadece kartlara bakmak yetmez! Bilgini ölçmek için çoktan seçmeli Quiz modu eklendi. Doğru ve yanlışlarını anlık olarak takip edebilir, zorlandığın kelimeleri favorilere ekleyebilirsin.",
    isNew: false
  },
  {
    id: 'ann_v1_0',
    title: "KelimApp Deneme Sürümüne Hoş Geldin!",
    date: "25.10.2024",
    content: "İlkokul, Ortaokul ve Lise müfredatına uygun binlerce kelime ile İngilizce öğrenme yolculuğun başlıyor. Üniteleri seç, kartları çevir ve kelime hazineni geliştir!",
    isNew: false
  }
];
