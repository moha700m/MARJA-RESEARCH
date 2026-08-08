import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://gbvopmtmzosqknntaafl.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JrKtx_1NWA9-vgeRE-9TcQ_QQ5XJ-LM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type MarjaPrices = {
  proposal: number;
  sources: number;
  review: number;
  analysis: number;
  slides: number;
  full: number;
};

export type MarjaSiteSettings = {
  brandName: string;
  heroKicker: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  whatsapp: string;
  announcement: string;
  freelanceDocument: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  prices: MarjaPrices;
  features: {
    showWhatsappStory: boolean;
    showPortfolio: boolean;
    showPricing: boolean;
    showTracking: boolean;
    showFreelanceDocument: boolean;
  };
};

export const fallbackSettings: MarjaSiteSettings = {
  brandName: 'مَرجِع',
  heroKicker: 'دعم أكاديمي مرتب للطالب الجامعي',
  heroTitle: 'متورط في بحثك؟',
  heroAccent: 'خلّ البداية علينا.',
  heroDescription: 'أرسل متطلبات الدكتور وموعد التسليم. نرتّب لك الخطة والمصادر والتحليل والمراجعة في مسار واضح بدل ما تضيع بين عشر مهام.',
  primaryCta: 'أرسل المطلوب',
  secondaryCta: 'شوف نماذجنا',
  whatsapp: '',
  announcement: '',
  freelanceDocument: 'FL-289426120',
  seoTitle: 'مَرجِع | دعم الأبحاث الجامعية',
  seoDescription: 'مَرجِع منصة عربية للدعم الأكاديمي: خطط بحث، مصادر ومراجع، تحليل بيانات، مراجعة وتنسيق وعروض جامعية.',
  seoKeywords: ['بحوث جامعية', 'خطة بحث', 'تحليل بيانات', 'مراجع أكاديمية', 'APA'],
  prices: { proposal: 89, sources: 109, review: 129, analysis: 189, slides: 139, full: 329 },
  features: { showWhatsappStory: true, showPortfolio: true, showPricing: true, showTracking: true, showFreelanceDocument: true },
};

export async function loadMarjaSettings(): Promise<MarjaSiteSettings> {
  const { data, error } = await supabase.from('marja_site_settings').select('content').eq('id', 'main').single();
  if (error || !data?.content) return fallbackSettings;
  return {
    ...fallbackSettings,
    ...(data.content as Partial<MarjaSiteSettings>),
    prices: { ...fallbackSettings.prices, ...((data.content as Partial<MarjaSiteSettings>).prices ?? {}) },
    features: { ...fallbackSettings.features, ...((data.content as Partial<MarjaSiteSettings>).features ?? {}) },
  };
}
