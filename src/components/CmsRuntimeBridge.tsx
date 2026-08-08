import { useEffect } from 'react';
import { loadMarjaSettings, type MarjaSiteSettings } from '../lib/supabase';

const serviceKeys = ['proposal', 'sources', 'review', 'analysis', 'slides', 'full'] as const;

function setMeta(name: string, value: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement('meta');
    if (property) node.setAttribute('property', name);
    else node.setAttribute('name', name);
    document.head.appendChild(node);
  }
  node.content = value;
}

function setText(selector: string, value: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (node && value) node.textContent = value;
}

function applySeo(settings: MarjaSiteSettings) {
  document.title = settings.seoTitle || settings.heroTitle;
  setMeta('description', settings.seoDescription);
  setMeta('keywords', settings.seoKeywords.join(', '));
  setMeta('og:title', settings.seoTitle, true);
  setMeta('og:description', settings.seoDescription, true);
  setMeta('og:url', 'https://marja.info/', true);
  setMeta('twitter:title', settings.seoTitle);
  setMeta('twitter:description', settings.seoDescription);

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = 'https://marja.info/';

  const jsonLd = document.getElementById('marja-jsonld');
  if (jsonLd) {
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://marja.info/#organization',
          name: settings.brandName,
          url: 'https://marja.info/',
          identifier: settings.freelanceDocument || undefined,
        },
        {
          '@type': 'WebSite',
          '@id': 'https://marja.info/#website',
          url: 'https://marja.info/',
          name: settings.brandName,
          inLanguage: 'ar-SA',
          publisher: { '@id': 'https://marja.info/#organization' },
        },
        {
          '@type': 'Service',
          name: 'الدعم الأكاديمي والبحثي',
          provider: { '@id': 'https://marja.info/#organization' },
          areaServed: 'SA',
          description: settings.seoDescription,
        },
      ],
    });
  }
}

function applyAnnouncement(settings: MarjaSiteSettings) {
  let node = document.getElementById('cms-announcement');
  if (!settings.announcement.trim()) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement('div');
    node.id = 'cms-announcement';
    node.className = 'cms-announcement';
    const header = document.querySelector('.topbar');
    header?.insertAdjacentElement('beforebegin', node);
  }
  node.textContent = settings.announcement;
}

function applyWhatsApp(settings: MarjaSiteSettings) {
  let link = document.getElementById('cms-whatsapp-float') as HTMLAnchorElement | null;
  const digits = settings.whatsapp.replace(/\D/g, '');
  if (!digits) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('a');
    link.id = 'cms-whatsapp-float';
    link.className = 'cms-whatsapp-float';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = '<span>واتساب</span><b>تواصل سريع</b>';
    document.body.appendChild(link);
  }
  link.href = `https://wa.me/${digits}`;
}

function applyCredential(settings: MarjaSiteSettings) {
  let node = document.getElementById('cms-business-credential');
  if (!settings.features.showFreelanceDocument || !settings.freelanceDocument.trim()) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement('div');
    node.id = 'cms-business-credential';
    node.className = 'cms-business-credential';
    const proof = document.getElementById('enhanced-proof-host');
    proof?.insertAdjacentElement('afterend', node);
  }
  node.innerHTML = `<div class="wrap"><span class="credential-dot"></span><div><small>توثيق العمل</small><strong>وثيقة العمل الحر</strong></div><code>${settings.freelanceDocument}</code><span class="credential-copy">نشاط موثّق</span></div>`;
}

function recalculate(settings: MarjaSiteSettings) {
  const calculator = document.querySelector<HTMLElement>('.calculator');
  if (!calculator) return;
  const select = calculator.querySelector<HTMLSelectElement>('select');
  const pagesInput = calculator.querySelector<HTMLInputElement>('input[type="range"]');
  const estimate = calculator.querySelector<HTMLElement>('.estimate > strong');
  if (!select || !pagesInput || !estimate) return;

  const service = select.value as keyof MarjaSiteSettings['prices'];
  const base = Number(settings.prices[service] ?? 0);
  const pages = Number(pagesInput.value || 5);
  const buttons = Array.from(calculator.querySelectorAll<HTMLButtonElement>('.speed button'));
  const activeIndex = Math.max(0, buttons.findIndex((button) => button.classList.contains('active')));
  const multiplier = activeIndex === 2 ? 1.4 : activeIndex === 1 ? 1.2 : 1;
  const value = Math.round((base + Math.max(0, pages - 5) * 8) * multiplier);
  estimate.innerHTML = `${value}<em> ر.س</em>`;
}

function applySettings(settings: MarjaSiteSettings) {
  localStorage.setItem('marja_public_settings', JSON.stringify(settings));
  applySeo(settings);
  applyAnnouncement(settings);
  applyWhatsApp(settings);
  applyCredential(settings);

  setText('.logo', settings.brandName);
  const logo = document.querySelector<HTMLElement>('.logo');
  if (logo && !logo.querySelector('span')) logo.innerHTML = `<span>م</span> ${settings.brandName}`;
  setText('.hero .pill', settings.heroKicker);
  const pill = document.querySelector<HTMLElement>('.hero .pill');
  if (pill) pill.innerHTML = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 10-10-5L2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>${settings.heroKicker}`;
  setText('.hero h1 span', settings.heroTitle);
  setText('.hero h1 em', settings.heroAccent);
  setText('.hero-copy > p', settings.heroDescription);
  setText('.hero-actions .btn.accent', settings.primaryCta);
  setText('.hero-actions .btn.ghost', settings.secondaryCta);

  document.querySelectorAll<HTMLElement>('.service footer strong').forEach((node, index) => {
    const key = serviceKeys[index];
    if (key) node.textContent = `من ${settings.prices[key]} ر.س`;
  });

  const featureMap: Array<[string, boolean]> = [
    ['#work', settings.features.showPortfolio],
    ['#price', settings.features.showPricing],
    ['#track', settings.features.showTracking],
    ['#whatsapp-story-host', settings.features.showWhatsappStory],
  ];
  featureMap.forEach(([selector, visible]) => {
    const node = document.querySelector<HTMLElement>(selector);
    if (node) node.style.display = visible ? '' : 'none';
  });

  window.setTimeout(() => recalculate(settings), 0);
}

export default function CmsRuntimeBridge() {
  useEffect(() => {
    let settings: MarjaSiteSettings | null = null;
    let cancelled = false;

    loadMarjaSettings().then((loaded) => {
      if (cancelled) return;
      settings = loaded;
      applySettings(loaded);
    });

    const refreshCalculator = (event: Event) => {
      if (!settings) return;
      const target = event.target as Element | null;
      if (target?.closest('.calculator')) window.setTimeout(() => settings && recalculate(settings), 0);
    };
    document.addEventListener('input', refreshCalculator, true);
    document.addEventListener('change', refreshCalculator, true);
    document.addEventListener('click', refreshCalculator, true);

    return () => {
      cancelled = true;
      document.removeEventListener('input', refreshCalculator, true);
      document.removeEventListener('change', refreshCalculator, true);
      document.removeEventListener('click', refreshCalculator, true);
    };
  }, []);

  return null;
}
