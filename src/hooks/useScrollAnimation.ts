import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Red de seguridad contra contenido que no se revela nunca.
 *
 * Un `threshold` del 10-30 % es IMPOSIBLE de cumplir cuando el elemento
 * observado es más alto que el viewport dividido por ese umbral (un contenedor
 * de 4000 px con threshold 0,3 necesitaría 1200 px visibles). En esos casos el
 * IntersectionObserver no dispara jamás y la sección se queda en opacity 0.
 * Si el elemento ya está en pantalla y seguimos ocultos, revelamos.
 */
const RESCATE_MS = 1200;

function estaEnPantalla(el: Element) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    const rescate = setTimeout(() => {
      if (estaEnPantalla(element)) setIsVisible(true);
    }, RESCATE_MS);

    return () => {
      clearTimeout(rescate);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export function useStaggerAnimation(itemCount: number, baseDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lanzado = false;

    const revelar = () => {
      if (lanzado) return;
      lanzado = true;
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems((prev) => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, i * baseDelay);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revelar();
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0: basta con que asome un píxel. Este contenedor envuelve
      // secciones enteras, y con 0,1 podía no cumplirse nunca.
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(container);

    const rescate = setTimeout(() => {
      if (estaEnPantalla(container)) revelar();
    }, RESCATE_MS);

    return () => {
      clearTimeout(rescate);
      observer.disconnect();
    };
  }, [itemCount, baseDelay]);

  return { containerRef, visibleItems };
}
