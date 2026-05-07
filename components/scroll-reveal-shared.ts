/**
 * واحد ‎IntersectionObserver‎ لكل الصفحة — يقلل ضغط الـ main thread عند عشرات ‎ScrollReveal‎.
 */
const ROOT_MARGIN = "0px 0px -48px 0px";
const THRESHOLD: number[] = [0, 0.12, 0.25, 0.5, 1];

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();

function getSharedObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const cb = callbacks.get(e.target);
      if (!cb) continue;
      callbacks.delete(e.target);
      sharedObserver?.unobserve(e.target);
      cb();
    }
  }, {
    root: null,
    rootMargin: ROOT_MARGIN,
    threshold: THRESHOLD,
  });
  return sharedObserver;
}

export function subscribeScrollReveal(
  element: Element,
  onIntersect: () => void,
): () => void {
  const obs = getSharedObserver();
  callbacks.set(element, onIntersect);
  obs.observe(element);
  return () => {
    callbacks.delete(element);
    obs.unobserve(element);
  };
}
