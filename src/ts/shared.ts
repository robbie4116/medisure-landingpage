const LANDING_SCROLL_STORAGE_KEY = "landingScrollTarget";
const LANDING_HASH_PATTERN = /^\/(?:index\.html)?#([a-zA-Z0-9_-]+)$/;
const SCROLL_REVEAL_STYLE_ID = "medisure-scroll-reveal-style";
const BACK_LINK_STYLE_ID = "medisure-back-link-style";
const DEFAULT_REVEAL_SELECTOR = "[data-reveal]";
const REVEAL_TRANSITION_MS = 620;
const SITE_CONTACT_EMAIL = "medisureteam@medisureonline.com";
const SITE_CONTACT_PHONE = "+639668769058";

type InPageSmoothScrollOptions = {
  anchorSelector?: string;
  stickyHeaderSelector?: string;
  topOffsetPx?: number;
  settleDelayMs?: number;
  settleMinDeltaPx?: number;
};

export function applySiteContactInfo(): void {
  document.querySelectorAll<HTMLElement>("[data-site-email]").forEach((element) => {
    element.textContent = SITE_CONTACT_EMAIL;
  });

  document.querySelectorAll<HTMLElement>("[data-site-phone]").forEach((element) => {
    element.textContent = SITE_CONTACT_PHONE;
  });

  document.querySelectorAll<HTMLAnchorElement>("[data-site-email-link]").forEach((link) => {
    link.href = `mailto:${SITE_CONTACT_EMAIL}`;
  });

  document.querySelectorAll<HTMLAnchorElement>("[data-site-phone-link]").forEach((link) => {
    link.href = `tel:${SITE_CONTACT_PHONE}`;
  });
}

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

    if (link.hasAttribute("data-back-link")) {
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

function canUseHistoryBack(): boolean {
  if (window.history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

function ensureBackLinkStyles(): void {
  if (document.getElementById(BACK_LINK_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = BACK_LINK_STYLE_ID;
  style.textContent = `
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.42rem;
      color: #2f5b1f;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.01em;
      text-decoration: none;
      transition:
        transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
        gap 240ms cubic-bezier(0.22, 1, 0.36, 1),
        color 220ms ease,
        text-shadow 220ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .back-link:hover,
    .back-link:focus-visible {
      color: #1f4d12;
      gap: 0.56rem;
      transform: translateX(1px);
      text-shadow: 0 0 14px rgba(74, 163, 56, 0.28);
      outline: none;
    }

    .back-link:active {
      transform: translateX(0);
      text-shadow: none;
    }

    .back-link-arrow {
      display: inline-block;
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .back-link:hover .back-link-arrow,
    .back-link:focus-visible .back-link-arrow {
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .back-link,
      .back-link-arrow {
        transition: none !important;
        transform: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

export function setupBackLinkNavigation(delayMs = 220): void {
  ensureBackLinkStyles();
  const navigateWithTransition = createPageTransitionNavigator(delayMs);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !(event instanceof MouseEvent)) {
      return;
    }

    const link = event.target.closest("a[data-back-link]");
    if (!(link instanceof HTMLAnchorElement)) {
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

    event.preventDefault();

    if (canUseHistoryBack()) {
      if (prefersReducedMotion) {
        window.history.back();
        return;
      }

      document.body.classList.add("page-leaving");
      setTimeout(() => {
        window.history.back();
      }, delayMs);
      return;
    }

    navigateWithTransition(link.href);
  });
}

function getElementFromHash(hash: string): HTMLElement | null {
  if (!hash || hash === "#") {
    return null;
  }

  const decodedId = decodeURIComponent(hash.slice(1));
  if (!decodedId) {
    return null;
  }

  const byId = document.getElementById(decodedId);
  if (byId) {
    return byId;
  }

  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null;
  }
}

function getStickyHeaderOffset(stickyHeaderSelector: string, topOffsetPx: number): number {
  const header = document.querySelector<HTMLElement>(stickyHeaderSelector);
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  return headerHeight + topOffsetPx;
}

function scrollToHashTarget(hash: string, behavior: ScrollBehavior, stickyHeaderSelector: string, topOffsetPx: number): boolean {
  const target = getElementFromHash(hash);
  if (!target) {
    return false;
  }

  const offset = getStickyHeaderOffset(stickyHeaderSelector, topOffsetPx);
  const targetTop = window.scrollY + target.getBoundingClientRect().top - offset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  });

  return true;
}

export function setupInPageSmoothScroll(options: InPageSmoothScrollOptions = {}): void {
  const {
    anchorSelector = 'a[href^="#"]',
    stickyHeaderSelector = "nav.sticky",
    topOffsetPx = 12,
    settleDelayMs = 0,
    settleMinDeltaPx = 14,
  } = options;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const initialBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !(event instanceof MouseEvent)) {
      return;
    }

    const link = event.target.closest(anchorSelector);
    if (!(link instanceof HTMLAnchorElement)) {
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
    if (!href || href === "#") {
      return;
    }

    event.preventDefault();
    const didScroll = scrollToHashTarget(href, initialBehavior, stickyHeaderSelector, topOffsetPx);
    if (!didScroll) {
      return;
    }

    if (settleDelayMs > 0) {
      // Optional second pass only when explicitly enabled and final position is materially off.
      window.setTimeout(() => {
        const target = getElementFromHash(href);
        if (!target) {
          return;
        }

        const offset = getStickyHeaderOffset(stickyHeaderSelector, topOffsetPx);
        const targetTop = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
        const delta = Math.abs(window.scrollY - targetTop);

        if (delta >= Math.max(1, settleMinDeltaPx)) {
          window.scrollTo({
            top: targetTop,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
      }, settleDelayMs);
    }
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

    .reveal-visible {
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
        const revealDelay = Number.parseInt(element.style.getPropertyValue("--reveal-delay") || "0", 10);
        const cleanupDelay = (Number.isFinite(revealDelay) ? Math.max(0, revealDelay) : 0) + REVEAL_TRANSITION_MS + 40;
        window.setTimeout(() => {
          element.classList.remove("reveal-on-scroll");
          element.style.removeProperty("--reveal-delay");
        }, cleanupDelay);
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
