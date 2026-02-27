const LANDING_SCROLL_STORAGE_KEY = "landingScrollTarget";
const LANDING_HASH_PATTERN = /^\/(?:index\.html)?#([a-zA-Z0-9_-]+)$/;
const SCROLL_REVEAL_STYLE_ID = "medisure-scroll-reveal-style";
const DEFAULT_REVEAL_SELECTOR = "[data-reveal]";

export function createPageTransitionNavigator(delayMs = 220): (url: string) => void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (url: string): void => {
    if (!url) {
      return;
    }

    if (prefersReducedMotion) {
      window.location.href = url;
      return;
    }

    document.body.classList.add("page-leaving");
    setTimeout(() => {
      window.location.href = url;
    }, delayMs);
  };
}

function setPendingLandingScrollTarget(target: string): boolean {
  try {
    window.sessionStorage.setItem(LANDING_SCROLL_STORAGE_KEY, target);
    return true;
  } catch {
    return false;
  }
}

export function setupPageTransitionNavigation(delayMs = 220): void {
  const navigateWithTransition = createPageTransitionNavigator(delayMs);

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !(event instanceof MouseEvent)) {
      return;
    }

    const link = event.target.closest("a");
    if (!link) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || href === "#" || href.startsWith("#")) {
      return;
    }

    const landingHashMatch = href.match(LANDING_HASH_PATTERN);
    if (landingHashMatch) {
      event.preventDefault();
      const target = landingHashMatch[1];
      const didStoreTarget = setPendingLandingScrollTarget(target);
      // Fallback preserves section target if sessionStorage is blocked.
      navigateWithTransition(didStoreTarget ? "/" : `/#${target}`);
      return;
    }

    if (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:") ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    event.preventDefault();
    navigateWithTransition(link.href);
  });
}

function ensureScrollRevealStyles(): void {
  if (document.getElementById(SCROLL_REVEAL_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = SCROLL_REVEAL_STYLE_ID;
  style.textContent = `
    .reveal-on-scroll {
      opacity: 0;
      transform: translate3d(0, 24px, 0) scale(0.995);
      filter: blur(2px);
      transition:
        opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 620ms cubic-bezier(0.22, 1, 0.36, 1),
        filter 620ms ease;
      transition-delay: var(--reveal-delay, 0ms);
      will-change: opacity, transform, filter;
    }

    .reveal-on-scroll.reveal-visible {
      opacity: 1;
      transform: none;
      filter: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-on-scroll {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function resolveRevealElements(selectors: readonly string[]): HTMLElement[] {
  const uniqueElements = new Set<HTMLElement>();

  selectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      uniqueElements.add(element);
    });
  });

  return [...uniqueElements];
}

export function setupScrollReveal(
  selectors: readonly string[] = [DEFAULT_REVEAL_SELECTOR],
  threshold = 0.1,
  rootMargin = "0px 0px 6% 0px",
): void {
  ensureScrollRevealStyles();

  const elements = resolveRevealElements(selectors);
  if (!elements.length) {
    return;
  }

  elements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    const configuredDelay = Number.parseInt(element.dataset.revealDelay ?? "", 10);
    const fallbackDelay = Math.min(index, 3) * 50;
    const revealDelay = Number.isFinite(configuredDelay) ? Math.max(0, configuredDelay) : fallbackDelay;
    element.style.setProperty("--reveal-delay", `${revealDelay}ms`);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add("reveal-visible");
    });
    return;
  }

  const rootContainer = document.getElementById("app-container");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target as HTMLElement;
        element.classList.add("reveal-visible");
        observer.unobserve(element);
      });
    },
    {
      root: rootContainer,
      rootMargin,
      threshold,
    },
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}
