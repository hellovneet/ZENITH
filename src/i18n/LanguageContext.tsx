import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isHindi: boolean;
  localizeModuleTitle: (id: string, defaultTitle: string) => string;
  localizeTopicTitle: (id: string, defaultTitle: string) => string;
  localizeTopicContent: (id: string, defaultContent: string) => string;
  localizeQuizTitle: (id: string, defaultTitle: string) => string;
}

const MODULE_TITLES_HI: Record<string, string> = {
  'mod-foundations': '1. क्वांटम यांत्रिकी के मूल आधार',
  'mod-concepts': '2. प्रमुख क्वांटम सिद्धांत एवं अवधारणाएं',
  'mod-gates': '3. क्वांटम गेट्स और सर्किट संरचना',
  'mod-math': '4. क्वांटम का गणितीय ढांचा (हिल्बर्ट स्पेस)',
  'mod-algorithms': '5. क्वांटम एल्गोरिदम और प्रोटोकॉल',
};

const TOPIC_TITLES_HI: Record<string, string> = {
  'classical-vs-quantum': 'पारंपरिक बनाम क्वांटम कंप्यूटिंग',
  'bits-vs-qubits': 'बिट्स बनाम क्यूबिट्स (द टू-लेवल क्वांटम सिस्टम)',
  'bra-ket-notation': 'ब्रा-केट (डिराक) संकेतन',
  'superposition': 'क्वांटम सुपरपोज़िशन (अध्यारोपण)',
  'measurement-collapse': 'क्वांटम मापन और तरंग फलन पतन',
  'entanglement-bell': 'क्वांटम उलझाव और बेल अवस्थाएं (Entanglement)',
  'single-qubit-gates': 'एकल-क्यूबिट क्वांटम गेट्स (Pauli, H, Phase)',
  'cnot-multi-qubit': 'बहु-क्यूबिट नियंत्रित गेट्स (CNOT & Phase Kickback)',
  'hilbert-spaces': 'हिल्बर्ट स्पेस और रैखिक बीजगणित',
  'complex-numbers': 'जटिल संख्याएं और क्वांटम आयाम',
  'deutsch-jozsa': 'डॉयच-जोज़ा एल्गोरिदम',
  'grover-search': 'ग्रोवर का खोज एल्गोरिदम',
  'quantum-fourier-transform': 'क्वांटम फूरियर रूपांतरण (QFT)',
  'shor-factoring': 'शोर का अभाज्य गुणनखंड एल्गोरिदम',
  'vqe-qaoa': 'वेरिएशनल क्वांटम एल्गोरिदम (VQE & QAOA)',
  'sub-classical-quantum': 'पारंपरिक बिट्स बनाम क्वांटम क्यूबिट्स',
  'sub-classical-vs-quantum': 'पारंपरिक बिट्स बनाम क्वांटम क्यूबिट्स',
  'sub-bra-ket': 'डिराक ब्रा-केट संकेतन एवं हिल्बर्ट स्पेस',
  'sub-superposition': 'क्वांटम सुपरपोज़िशन एवं तरंग व्यतिकरण',
  'sub-entanglement': 'क्वांटम उलझाव एवं बेल अवस्थाएं',
  'sub-single-gates': 'एकल-क्यूबिट यूनिटरी घूर्णन (Pauli, Hadamard, Phase)',
  'sub-cnot-controlled': 'बहु-क्यूबिट नियंत्रित गेट्स एवं फेज़ किकबक',
  'sub-complex-argand': 'आर्गंड तल पर सम्मिश्र आयाम (Complex Amplitudes)',
  'sub-matrices-tensor': 'यूनिटरी मैट्रिक्स एवं क्रोनेकर टेन्सर उत्पाद',
  'sub-deutsch': 'डॉयच-जोज़ा एकल-क्वेरी ओरेकल एल्गोरिदम',
  'sub-grover': 'ग्रोवर का डेटाबेस खोज एल्गोरिदम',
  'sub-shor': 'शोर का गुणनखंड एल्गोरिदम एवं QFT',
};

const TOPIC_CONTENT_HI: Record<string, string> = {
  'sub-classical-quantum': 'पारंपरिक कंप्यूटिंग नियतात्मक डिजिटल बिट्स पर निर्भर करती है जो केवल 0 या 1 अवस्था में रहते हैं। इसके विपरीत, क्वांटम कंप्यूटिंग द्वि-स्तरीय क्वांटम प्रणालियों (स्पिन-1/2 कण, फोटॉन ध्रुवीकरण, सुपरकंडक्टिंग ट्रांसमॉन) की भौतिकी का उपयोग करती है। एक क्यूबिट दो-आयामी सम्मिश्र हिल्बर्ट स्पेस ℂ² में सुपरपोज़िशन अवस्थाओं के सतत स्पेक्ट्रम में उपस्थित रहता है।',
  'sub-bra-ket': 'पॉल डिराक द्वारा प्रतिपादित ब्रा-केट संकेतन क्वांटम रैखिक बीजगणित को मानकीकृत करता है। केट |ψ⟩ हिल्बर्ट स्पेस में एक अवस्था सदिश (state vector) का प्रतिनिधित्व करता है। ब्रा ⟨ψ| द्वैत रैखिक फलन (कंजुगेट ट्रांसपोज़) है। आंतरिक गुणन ⟨φ|ψ⟩ ओवरलैप संभावना आयाम दर्शाते हैं, जबकि बाह्य गुणन |ψ⟩⟨φ| प्रक्षेपण एवं रूपांतरण ऑपरेटर का निर्माण करते हैं।',
  'sub-superposition': 'सुपरपोज़िशन एक क्वांटम सिस्टम को एक साथ कई संगणना पथों का अन्वेषण करने की अनुमति देता है। पारंपरिक सांख्यिकीय मिश्रणों के विपरीत, क्वांटम सुपरपोज़िशन चरण-निर्भर व्यतिकरण (phase-dependent interference) प्रदर्शित करता है: आयाम विनाशी रूप से रद्द हो सकते हैं (शून्य संभावना) या रचनात्मक रूप से सुदृढ़ हो सकते हैं।',
  'sub-entanglement': 'उलझाव (Entanglement) क्वांटम सहसंबंध का वह रूप है जिसे अलग-अलग क्यूबिट्स की उत्पाद अवस्थाओं (product states) में विभाजित नहीं किया जा सकता। बेल अवस्थाएं 2-क्यूबिट के अधिकतम उलझाव का प्रतिनिधित्व करती हैं। एक क्यूबिट को मापने से दूसरे क्यूबिट की अवस्था तुरंत निर्धारित हो जाती है, जो स्थानीय यथार्थवाद (local realism) का उल्लंघन करती है।',
  'sub-single-gates': 'सभी प्रतिवर्ती क्वांटम संक्रियाएं यूनिटरी रूपांतरण होती हैं जो U†U = I को संतुष्ट करती हैं। एकल-क्यूबिट गेट्स ब्लॉक स्फीयर की सतह पर अवस्था सदिश के दृढ़ 3D घूर्णन (rotations) के अनुरूप होते हैं।',
  'sub-cnot-controlled': 'नियंत्रित-नॉट (CNOT) गेट बुनियादी 2-क्यूबिट उलझाव गेट है। कम्प्यूटेशनल आधार में, यह केवल तभी लक्ष्य (target) क्यूबिट को फ्लिप करता है जब नियंत्रण (control) क्यूबिट |1⟩ अवस्था में हो।',
  'sub-complex-argand': 'प्रत्येक संभावना आयाम z = a + bi को जटिल आर्गंड तल (Argand plane) में त्रिज्या r = |z| और चरण कोण θ के साथ एक सदिश के रूप में देखा जा सकता है। बॉर्न का नियम यह निर्देशित करता है कि मापन की संभावना आयाम के वर्ग मॉड्यूलस |z|² = a² + b² के बराबर होती है।',
  'sub-matrices-tensor': 'स्वतंत्र क्वांटम उप-प्रणालियों को जोड़ते समय, समग्र अवस्था स्थान क्रोनेकर टेन्सर उत्पाद ℋ_A ⊗ ℋ_B होता है। एक n-क्यूबिट प्रणाली 2ⁿ-आयामी सम्मिश्र सदिश स्थान पर कब्जा करती है।',
  'sub-deutsch': 'डॉयच-जोज़ा एल्गोरिदम एकल क्वांटम क्वेरी के साथ फलन f(x) के वैश्विक गुण (संतुलित या स्थिर) का मूल्यांकन करके पारंपरिक एल्गोरिदम पर नियतात्मक घातीय गति (deterministic exponential speedup) प्रदर्शित करता है।',
  'sub-grover': 'ग्रोवर एल्गोरिदम O(√N) पुनरावृत्तियों में N अवयवों के अनसॉर्टेड डेटाबेस को खोजने के लिए द्विघातीय गति (quadratic speedup) प्रदान करता है, जो वैकल्पिक ओरेकल परावर्तन और औसत के चारों ओर विसरण उलटाव का उपयोग करता है।',
  'sub-shor': 'शोर का एल्गोरिदम बड़े पूर्णांकों को बहुपद समय O((log N)³) में अभाज्य गुणनखंडित करता है, जिससे वर्तमान RSA और डिफी-हेलमैन क्रिप्टोग्राफी को क्वांटम कंप्यूटरों पर अमान्य किया जा सकता है।',
};

const QUIZ_TITLES_HI: Record<string, string> = {
  'foundations': 'क्वांटम आधार मॉक टेस्ट',
  'concepts': 'सुपरपोज़िशन एवं उलझाव मॉक टेस्ट',
  'gates': 'क्वांटम गेट्स एवं सर्किट मॉक टेस्ट',
  'math': 'क्वांटम गणितीय आधार मॉक टेस्ट',
  'algorithms': 'क्वांटम एल्गोरिदम मॉक टेस्ट',
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.sessionStorage.getItem('qubitlab-language') || window.localStorage.getItem('qubitlab-language');
        if (stored === 'hi' || stored === 'en') return stored;
      } catch {
        // storage fallback
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('qubitlab-language', lang);
        window.localStorage.setItem('qubitlab-language', lang);
        document.documentElement.lang = lang;
      } catch {
        // storage fallback
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[language] as TranslationKeys;
  const isHindi = language === 'hi';

  const localizeModuleTitle = (id: string, defaultTitle: string): string => {
    if (isHindi && MODULE_TITLES_HI[id]) return MODULE_TITLES_HI[id];
    return defaultTitle;
  };

  const localizeTopicTitle = (id: string, defaultTitle: string): string => {
    if (isHindi && TOPIC_TITLES_HI[id]) return TOPIC_TITLES_HI[id];
    return defaultTitle;
  };

  const localizeTopicContent = (id: string, defaultContent: string): string => {
    if (isHindi && TOPIC_CONTENT_HI[id]) return TOPIC_CONTENT_HI[id];
    return defaultContent;
  };

  const localizeQuizTitle = (id: string, defaultTitle: string): string => {
    if (isHindi && QUIZ_TITLES_HI[id]) return QUIZ_TITLES_HI[id];
    return defaultTitle;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isHindi,
        localizeModuleTitle,
        localizeTopicTitle,
        localizeTopicContent,
        localizeQuizTitle,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
