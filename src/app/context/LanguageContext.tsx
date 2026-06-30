import { createContext, ReactNode, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const zh: Record<string, string> = {
  'coach.title': 'AI 教练',
  'coach.subtitle': '私人腕力训练顾问',
  'coach.q1': '我应该练高位还是勾手？',
  'coach.q2': '手腕疼痛时怎么调整训练？',
  'coach.q3': '如何提升起手控制？',
  'coach.q4': '比赛前一周怎么安排？',
  'coach.q5': '外侧力弱应该练什么？',
  'coach.q6': '帮我分析当前训练计划',
  'pricing.loading': '跳转支付中',
  'pricing.buy': '购买',
  'pricing.recommend': '推荐',
  'pricing.subtitle.bundle': '个人专属计划定制 + 私人专属 AI 教练',
  'home.plan.label': '个人专属计划定制',
  'home.ai.label': '私人专属 AI 教练',
  'home.bundle.label': '完整 AQUARION 体验',
};

const en: Record<string, string> = {
  'coach.title': 'AI Coach',
  'coach.subtitle': 'Private Arm Wrestling Advisor',
  'coach.q1': 'Should I train toproll or hook?',
  'coach.q2': 'How should I adjust if my wrist hurts?',
  'coach.q3': 'How can I improve table control?',
  'coach.q4': 'How should I train one week before a match?',
  'coach.q5': 'What should I train if my outside force is weak?',
  'coach.q6': 'Analyze my current training plan',
  'pricing.loading': 'Loading checkout',
  'pricing.buy': 'Buy',
  'pricing.recommend': 'Recommended',
  'pricing.subtitle.bundle': 'Training Plan + Private AI Coach',
  'home.plan.label': 'Personal Training Plan',
  'home.ai.label': 'Private AI Coach',
  'home.bundle.label': 'Full AQUARION Experience',
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: (key) => zh[key] || key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('zh');
  const dictionary = lang === 'en' ? en : zh;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: (key) => dictionary[key] || zh[key] || key }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
