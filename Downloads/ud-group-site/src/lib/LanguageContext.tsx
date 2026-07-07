import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "EN" | "MM" | "ZH";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    "nav.company": "COMPANY",
    "nav.business": "BUSINESS",
    "nav.strengths": "STRENGTHS",
    "nav.recruitment": "RECRUITMENT",
    "nav.news": "NEWS",
    "nav.contact": "CONTACT",
    "hero.tagline": "INDUSTRIAL SOLUTIONS",
    "hero.marquee": "AMARA GARDEN CITY",
    "hero.scroll": "SCROLL MORE",
    "team.title": "OUR HEADS",
  },
  MM: {
    "nav.company": "ကုမ္ပဏီ",
    "nav.business": "စီးပွားရေး",
    "nav.strengths": "အားသာချက်များ",
    "nav.recruitment": "အလုပ်အကိုင်",
    "nav.news": "သတင်းများ",
    "nav.contact": "ဆက်သွယ်ရန်",
    "hero.tagline": "စက်မှုလုပ်ငန်းဆိုင်ရာ ဖြေရှင်းချက်များ",
    "hero.marquee": "အမရ ဥယျာဉ်မြို့တော်",
    "hero.scroll": "ဆက်လက်ဖတ်ရှုရန်",
    "team.title": "ကျွန်ုပ်တို့၏ ခေါင်းဆောင်များ",
  },
  ZH: {
    "nav.company": "公司",
    "nav.business": "业务",
    "nav.strengths": "优势",
    "nav.recruitment": "招聘",
    "nav.news": "新闻",
    "nav.contact": "联系",
    "hero.tagline": "工业解决方案",
    "hero.marquee": "阿玛拉花园城市",
    "hero.scroll": "向下滚动",
    "team.title": "我们的领导",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("EN");

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
