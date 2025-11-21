import React from 'react';
import { ChevronLeft, Brain, Clock, Target, MessageCircle, Layers, Zap, Lightbulb } from 'lucide-react';

interface InfoViewProps {
  onBack: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Toolbar */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <ChevronLeft size={20} />
          <span>Geri Dön</span>
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-6 shadow-sm">
          <Lightbulb size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-4">Bilmen Gerekenler</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg">
          Daha hızlı ve kalıcı kelime öğrenmek için bilimsel olarak kanıtlanmış yöntemler ve ipuçları.
        </p>
      </div>

      <div className="space-y-6 pb-12">
        
        {/* Card 1: Spaced Repetition */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Clock size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aralıklı Tekrar (Spaced Repetition)</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Beynimiz, öğrendiği bilgiyi kısa süre sonra unutmaya meyillidir. Bunu yenmenin yolu, kelimeyi unutmak üzereyken tekrar etmektir.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 text-sm text-blue-800 dark:text-blue-200 font-medium">
                    💡 Uygulamadaki "Günlük Tekrar" özelliği bu prensibe göre çalışır. Kelimeleri düzenli aralıklarla (1 gün, 3 gün, 1 hafta...) karşına çıkarırız.
                </div>
            </div>
        </div>

        {/* Card 2: Context */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <Layers size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Bağlam İçinde Öğrenme</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Kelimeyi tek başına ezberlemek zordur. Kelimeyi bir cümlenin, bir hikayenin veya bir durumun parçası olarak öğrenirsen akılda kalıcılığı %70 artar.
                </p>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-800/30 text-sm text-green-800 dark:text-green-200 font-medium">
                    💡 Kartların arkasındaki "Context" ve örnek cümlelere mutlaka dikkat et. Kelimeyi o cümleyle hayal et.
                </div>
            </div>
        </div>

        {/* Card 3: Active Recall */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Brain size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aktif Hatırlama (Active Recall)</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Sadece okumak yeterli değildir. Beynini zorlayarak "Bu kelime neydi?" diye sorman gerekir. Cevabı görmeden önce tahmin etmeye çalışmak nöron bağlarını güçlendirir.
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30 text-sm text-purple-800 dark:text-purple-200 font-medium">
                    💡 Quiz modunu sık sık kullan. Yanlış yapmaktan korkma, yanlış yaptığın kelimeyi daha iyi öğrenirsin.
                </div>
            </div>
        </div>

        {/* Card 4: Consistency */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <Target size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Damlaya Damlaya Göl Olur</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Haftada bir gün 5 saat çalışmak yerine, her gün 15 dakika çalışmak dil öğreniminde çok daha etkilidir. Küçük adımlar zamanla devasa sonuçlar doğurur.
                </p>
            </div>
        </div>

        {/* Card 5: Use It */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <MessageCircle size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Kullanmazsan Kaybedersin</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Öğrendiğin yeni bir kelimeyi gün içinde kendi kendine kurduğun bir cümlede kullan. Telefonundaki notlara yaz veya bir arkadaşına mesaj atarken kullanmaya çalış.
                </p>
            </div>
        </div>

      </div>

      <div className="mt-auto flex justify-center pb-8">
         <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap size={20} className="fill-current" /> Anladım, Çalışmaya Başla
          </button>
      </div>

    </div>
  );
};

export default InfoView;