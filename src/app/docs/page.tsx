'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Coins, 
  Gift, 
  Users, 
  TrendingUp, 
  Shield,
  Sparkles,
  Trophy,
  Wallet,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  Zap,
  Heart,
  Star
} from 'lucide-react';

const sections = [
  { id: 'intro', title: 'Giriş', icon: BookOpen },
  { id: 'how-it-works', title: 'Nasıl Çalışır?', icon: Sparkles },
  { id: 'earning', title: 'Kazanç Modeli', icon: Coins },
  { id: 'use-cases', title: 'Kullanım Senaryoları', icon: Lightbulb },
  { id: 'benefits', title: 'Avantajlar', icon: Trophy },
  { id: 'security', title: 'Güvenlik', icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Gridotto Dokümantasyon
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Blokzincir üzerinde adil, şeffaf ve eğlenceli çekilişler düzenleyin. 
              Herkes kazanır, herkes mutlu!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <AnimatePresence mode="wait">
              {activeSection === 'intro' && <IntroSection key="intro" />}
              {activeSection === 'how-it-works' && <HowItWorksSection key="how-it-works" />}
              {activeSection === 'earning' && <EarningSection key="earning" />}
              {activeSection === 'use-cases' && <UseCasesSection key="use-cases" />}
              {activeSection === 'benefits' && <BenefitsSection key="benefits" />}
              {activeSection === 'security' && <SecuritySection key="security" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Gridotto Nedir?</h2>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            Gridotto, LUKSO blokzinciri üzerinde çalışan yenilikçi bir çekiliş platformudur. 
            Geleneksel çekiliş sistemlerinin aksine, Gridotto'da herkes kazanır!
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl"
        >
          <Users className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Topluluk Odaklı</h3>
          <p className="text-gray-600">
            Kullanıcılar kendi çekilişlerini oluşturabilir ve yönetebilir
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl"
        >
          <Shield className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">%100 Güvenli</h3>
          <p className="text-gray-600">
            Akıllı kontratlar ile tam şeffaflık ve güvenlik
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl"
        >
          <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Herkes Kazanır</h3>
          <p className="text-gray-600">
            Benzersiz kazanç modeli ile tüm katılımcılar fayda sağlar
          </p>
        </motion.div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Neden Gridotto?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">
              <strong>Adil Dağıtım:</strong> Ödül havuzu tüm katılımcılar arasında adil şekilde dağıtılır
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">
              <strong>Düşük Giriş Ücreti:</strong> Herkesin katılabileceği uygun fiyatlar
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">
              <strong>Çoklu Varlık Desteği:</strong> Token, NFT ve LSP7/LSP8 varlıkları desteklenir
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Çekiliş Oluştur",
      description: "Vermek istediğiniz ödülü seçin ve çekiliş parametrelerini belirleyin",
      icon: Gift,
      color: "blue"
    },
    {
      title: "Bilet Satışı",
      description: "Belirlediğiniz fiyattan biletler satılmaya başlar",
      icon: Wallet,
      color: "green"
    },
    {
      title: "Otomatik Çekiliş",
      description: "Süre dolduğunda veya biletler tükendiğinde çekiliş otomatik başlar",
      icon: Zap,
      color: "purple"
    },
    {
      title: "Ödül Dağıtımı",
      description: "Kazananlar belirlenir ve ödüller otomatik dağıtılır",
      icon: Trophy,
      color: "yellow"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gridotto'da çekiliş oluşturmak ve katılmak çok basit!
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full bg-${step.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 text-${step.color}-600`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-24 bg-gray-200 mx-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-blue-50 p-6 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Önemli Not</h4>
            <p className="text-blue-700">
              Tüm işlemler akıllı kontratlar üzerinden otomatik gerçekleşir. 
              İnsan müdahalesi olmadan, tamamen şeffaf ve güvenli!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EarningSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kazanç Modeli</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gridotto'da sadece büyük ödülü kazanan değil, herkes kazanır!
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Kazanç Dağılımı</h3>
        
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h4 className="text-lg font-semibold">Ana Ödül</h4>
              </div>
              <span className="text-2xl font-bold text-yellow-600">%60</span>
            </div>
            <p className="text-gray-600">
              Toplam havuzun büyük kısmı ana ödül kazananına gider
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <h4 className="text-lg font-semibold">Katılımcı Ödülleri</h4>
              </div>
              <span className="text-2xl font-bold text-blue-600">%30</span>
            </div>
            <p className="text-gray-600">
              Diğer katılımcılar arasında çekilişle dağıtılır
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                <h4 className="text-lg font-semibold">Çekiliş Sahibi</h4>
              </div>
              <span className="text-2xl font-bold text-red-600">%10</span>
            </div>
            <p className="text-gray-600">
              Çekilişi oluşturan kişi komisyon alır
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-6 rounded-xl">
          <Coins className="w-10 h-10 text-purple-600 mb-4" />
          <h4 className="text-xl font-semibold mb-2">Çoklu Kazanç Fırsatı</h4>
          <p className="text-gray-600">
            Birden fazla bilet alarak kazanma şansınızı artırabilirsiniz
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl">
          <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
          <h4 className="text-xl font-semibold mb-2">Değer Artışı</h4>
          <p className="text-gray-600">
            NFT çekilişlerinde kazandığınız varlıklar zamanla değer kazanabilir
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function UseCasesSection() {
  const cases = [
    {
      title: "NFT Koleksiyonu Dağıtımı",
      scenario: "Yeni NFT koleksiyonunuzu tanıtmak istiyorsunuz",
      solution: "Değerli NFT'lerinizi çekilişle dağıtarak hem gelir elde edin hem de koleksiyonunuzu tanıtın",
      example: "Değeri yüksek bir NFT için düşük fiyatlı biletler satarak geniş kitlelere ulaşın",
      icon: Star,
      color: "purple"
    },
    {
      title: "Token Lansmanı",
      scenario: "Yeni token'ınızı dağıtmak istiyorsunuz",
      solution: "Token'larınızı çekilişle dağıtarak adil bir başlangıç yapın",
      example: "Topluluk üyelerine token kazanma şansı vererek bağlılık oluşturun",
      icon: Coins,
      color: "yellow"
    },
    {
      title: "Topluluk Ödüllendirme",
      scenario: "Sadık takipçilerinizi ödüllendirmek istiyorsunuz",
      solution: "Özel çekilişler düzenleyerek topluluğunuzu motive edin",
      example: "Discord üyelerine özel NFT çekilişleri düzenleyin",
      icon: Heart,
      color: "red"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kullanım Senaryoları</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gridotto'yu nasıl kullanabilirsiniz? İşte ilham verici örnekler!
        </p>
      </div>

      <div className="space-y-6">
        {cases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r from-${useCase.color}-50 to-${useCase.color}-100/50 p-8 rounded-2xl`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 bg-${useCase.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-8 h-8 text-${useCase.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Senaryo:</span>
                      <p className="text-gray-600 mt-1">{useCase.scenario}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Çözüm:</span>
                      <p className="text-gray-600 mt-1">{useCase.solution}</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg">
                      <span className="font-semibold text-gray-700">Örnek:</span>
                      <p className="text-gray-600 mt-1">{useCase.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4">Gerçek Hayat Örneği</h3>
        <div className="bg-white/70 p-6 rounded-xl">
          <h4 className="text-xl font-semibold mb-3">Sanatçı NFT Lansmanı</h4>
          <p className="text-gray-700 mb-4">
            Bir dijital sanatçı, yeni NFT koleksiyonunu tanıtmak istiyor. 
            Koleksiyondaki en değerli parçayı Gridotto'da çekilişe koyuyor.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>NFT değeri: Yüksek</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Bilet fiyatı: Düşük</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Katılımcı sayısı: Çok yüksek</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sonuç: Herkes mutlu, koleksiyon tanındı!</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      title: "Çekiliş Sahipleri İçin",
      items: [
        "Varlıklarınızı değerinde satın",
        "Geniş kitlelere ulaşın",
        "Komisyon kazanın",
        "Topluluğunuzu büyütün"
      ],
      icon: Gift,
      color: "blue"
    },
    {
      title: "Katılımcılar İçin",
      items: [
        "Düşük maliyetle yüksek değer",
        "Adil kazanma şansı",
        "Çoklu ödül fırsatı",
        "Güvenli işlemler"
      ],
      icon: Users,
      color: "green"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Avantajlar</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gridotto hem çekiliş sahiplerine hem de katılımcılara benzersiz avantajlar sunar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br from-${benefit.color}-50 to-${benefit.color}-100 p-8 rounded-2xl`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-${benefit.color}-200 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 text-${benefit.color}-700`} />
                </div>
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
              </div>
              <ul className="space-y-3">
                {benefit.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-primary-100 to-purple-100 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4">Neden Herkes Kazanır?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-10 h-10 text-primary-600" />
            </div>
            <h4 className="font-semibold mb-2">Ana Kazanan</h4>
            <p className="text-sm text-gray-600">Büyük ödülü kazanır</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Diğer Katılımcılar</h4>
            <p className="text-sm text-gray-600">Havuzdan pay alırlar</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-10 h-10 text-red-600" />
            </div>
            <h4 className="font-semibold mb-2">Çekiliş Sahibi</h4>
            <p className="text-sm text-gray-600">Komisyon kazanır</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const features = [
    {
      title: "Akıllı Kontrat Güvenliği",
      description: "Tüm işlemler denetlenmiş akıllı kontratlar üzerinden gerçekleşir",
      icon: Shield
    },
    {
      title: "Şeffaf İşlemler",
      description: "Her işlem blokzincirde kayıtlıdır ve herkes tarafından doğrulanabilir",
      icon: Target
    },
    {
      title: "Otomatik Dağıtım",
      description: "Ödüller insan müdahalesi olmadan otomatik dağıtılır",
      icon: Zap
    },
    {
      title: "LUKSO Güvencesi",
      description: "LUKSO blokzincirinin güvenlik standartlarıyla korunur",
      icon: Star
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Güvenlik</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gridotto'da güvenliğiniz bizim önceliğimiz
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-6 rounded-xl border border-gray-200"
            >
              <Icon className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Güvenlik İpucu</h4>
            <p className="text-red-700">
              Asla özel anahtarlarınızı kimseyle paylaşmayın. Gridotto hiçbir zaman sizden özel anahtar istemez.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors"
        >
          Hemen Başla
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}