import { useEffect } from 'react';

const DEFAULT_OPTIONS = { threshold: 0.12, rootMargin: '0px 0px -5% 0px' };

export function useScrollReveal(selector = '.reveal-on-scroll', options = DEFAULT_OPTIONS) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, options]);
}
