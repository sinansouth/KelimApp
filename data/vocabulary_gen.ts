import { WordCard } from '../types';

export const VOCABULARY_GEN: Record<string, WordCard[]> = {
  'gen_a1': [
    { english: "book", turkish: "kitap", exampleEng: "This is a book.", exampleTr: "Bu bir kitaptır.", context: "A1 - Objects" },
    { english: "cat", turkish: "kedi", exampleEng: "The cat sleeps.", exampleTr: "Kedi uyur.", context: "A1 - Animals" },
    { english: "red", turkish: "kırmızı", exampleEng: "The apple is red.", exampleTr: "Elma kırmızıdır.", context: "A1 - Colors" }
  ],
  'gen_a2': [
    { english: "holiday", turkish: "tatil", exampleEng: "We are on holiday.", exampleTr: "Biz tatildeyiz.", context: "A2 - Travel" },
    { english: "expensive", turkish: "pahalı", exampleEng: "This car is expensive.", exampleTr: "Bu araba pahalıdır.", context: "A2 - Adjectives" },
    { english: "yesterday", turkish: "dün", exampleEng: "I saw him yesterday.", exampleTr: "Onu dün gördüm.", context: "A2 - Time" }
  ],
  'gen_b1': [
    { english: "experience", turkish: "deneyim", exampleEng: "It was a great experience.", exampleTr: "Harika bir deneyimdi.", context: "B1 - Life" },
    { english: "opportunity", turkish: "fırsat", exampleEng: "Don't miss this opportunity.", exampleTr: "Bu fırsatı kaçırma.", context: "B1 - General" },
    { english: "definitely", turkish: "kesinlikle", exampleEng: "I will definitely come.", exampleTr: "Kesinlikle geleceğim.", context: "B1 - Adverbs" }
  ],
  'gen_b2': [
    { english: "significant", turkish: "önemli / kayda değer", exampleEng: "There is a significant change.", exampleTr: "Kayda değer bir değişiklik var.", context: "B2 - General" },
    { english: "approximately", turkish: "yaklaşık olarak", exampleEng: "It costs approximately 50 dollars.", exampleTr: "Yaklaşık 50 dolar tutuyor.", context: "B2 - Adverbs" },
    { english: "convince", turkish: "ikna etmek", exampleEng: "I tried to convince him.", exampleTr: "Onu ikna etmeye çalıştım.", context: "B2 - Verbs" }
  ],
  'gen_c1': [
    { english: "inevitable", turkish: "kaçınılmaz", exampleEng: "Change is inevitable.", exampleTr: "Değişim kaçınılmazdır.", context: "C1 - General" },
    { english: "comprehensive", turkish: "kapsamlı", exampleEng: "We need a comprehensive plan.", exampleTr: "Kapsamlı bir plana ihtiyacımız var.", context: "C1 - Adjectives" },
    { english: "articulate", turkish: "kendini iyi ifade edebilen", exampleEng: "She is a very articulate speaker.", exampleTr: "O kendini çok iyi ifade edebilen bir konuşmacı.", context: "C1 - Adjectives" }
  ],
  'gen_c2': [
    { english: "meticulous", turkish: "titiz", exampleEng: "He is meticulous about his work.", exampleTr: "İşi konusunda titizdir.", context: "C2 - Adjectives" },
    { english: "ephemeral", turkish: "kısa ömürlü / geçici", exampleEng: "Fashion is ephemeral.", exampleTr: "Moda geçicidir.", context: "C2 - Abstract" },
    { english: "serendipity", turkish: "şans eseri buluş", exampleEng: "It was pure serendipity that we met.", exampleTr: "Tanışmamız tamamen şans eseriydi.", context: "C2 - Nouns" }
  ]
};
