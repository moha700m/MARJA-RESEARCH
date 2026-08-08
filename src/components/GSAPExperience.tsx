import { useEffect } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export default function GSAPExperience() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Flip, Observer, SplitText);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const splitInstances: SplitText[] = [];
    const cleanupCallbacks: Array<() => void> = [];

    const context = gsap.context(() => {
      const heroHeading = document.querySelector<HTMLElement>('.hero h1');
      if (heroHeading) {
        const split = new SplitText(heroHeading, { type: 'words', wordsClass: 'gsap-word' });
        splitInstances.push(split);
        gsap.from(split.words, {
          yPercent: 34,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.72,
          stagger: 0.055,
          ease: 'power3.out',
          delay: 0.08,
          clearProps: 'filter',
        });
      }

      const heroCard = document.querySelector<HTMLElement>('.hero-card');
      if (heroCard) {
        gsap.to(heroCard, {
          y: -28,
          rotate: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
      }

      const marquee = document.querySelector<HTMLElement>('.marquee-row');
      if (marquee) {
        gsap.to(marquee, {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>('.section-head, .case-study, .price-layout, .order-layout, .track').forEach((element) => {
        gsap.fromTo(element,
          { y: 22, opacity: 0.72 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        );
      });
    });

    const tabs = Array.from(document.querySelectorAll<HTMLElement>('.portfolio-tabs button'));
    let flipState: ReturnType<typeof Flip.getState> | null = null;
    const captureState = () => {
      const cards = document.querySelectorAll<HTMLElement>('.showcase-card');
      if (cards.length) flipState = Flip.getState(cards);
    };
    const playFlip = () => {
      window.requestAnimationFrame(() => {
        if (!flipState) return;
        Flip.from(flipState, {
          duration: 0.48,
          ease: 'power3.inOut',
          absolute: true,
          stagger: 0.025,
          onComplete: () => ScrollTrigger.refresh(),
        });
        flipState = null;
      });
    };
    tabs.forEach((tab) => {
      tab.addEventListener('pointerdown', captureState);
      tab.addEventListener('click', playFlip);
    });
    cleanupCallbacks.push(() => tabs.forEach((tab) => {
      tab.removeEventListener('pointerdown', captureState);
      tab.removeEventListener('click', playFlip);
    }));

    const observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      tolerance: 12,
      onChangeY: (self) => {
        document.documentElement.dataset.scrollDirection = self.deltaY > 0 ? 'down' : 'up';
      },
    });

    const refreshObserver = new MutationObserver(() => ScrollTrigger.refresh());
    const work = document.getElementById('work');
    if (work) refreshObserver.observe(work, { childList: true, subtree: true });

    return () => {
      cleanupCallbacks.forEach((cleanup) => cleanup());
      observer.kill();
      refreshObserver.disconnect();
      splitInstances.forEach((split) => split.revert());
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
