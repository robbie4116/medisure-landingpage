const LANDING_SCROLL_STORAGE_KEY = "landingScrollTarget";
const LANDING_HASH_PATTERN = /^\/(?:index\.html)?#([a-zA-Z0-9_-]+)$/;
const SCROLL_REVEAL_STYLE_ID = "medisure-scroll-reveal-style";
const BACK_LINK_STYLE_ID = "medisure-back-link-style";
const BACK_LINK_STYLESHEET_ID = "medisure-back-link-stylesheet";
const SERVICES_MENU_STYLE_ID = "medisure-services-menu-style";
const SERVICES_MENU_STYLESHEET_ID = "medisure-services-menu-stylesheet";
const BACK_LINK_STYLESHEET_HREF = "/styles/back-link.css";
const SERVICES_MENU_STYLESHEET_HREF = "/styles/services-menu.css";
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

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname === "/") {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

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

function ensureStylesheetLink(stylesheetId: string, href: string, legacyInlineStyleId?: string): void {
  if (document.getElementById(stylesheetId)) {
    return;
  }

  if (legacyInlineStyleId && document.getElementById(legacyInlineStyleId)) {
    return;
  }

  const link = document.createElement("link");
  link.id = stylesheetId;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export function setupServicesDropdown(): void {
  const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-services-menu]"));
  if (!menus.length) {
    return;
  }

  ensureStylesheetLink(SERVICES_MENU_STYLESHEET_ID, SERVICES_MENU_STYLESHEET_HREF, SERVICES_MENU_STYLE_ID);

  const CLOSE_ANIMATION_MS = 170;
  const MOBILE_MENU_BREAKPOINT_PX = 768;
  const closeTimers = new WeakMap<HTMLDetailsElement, number>();

  const getMenuPanel = (menu: HTMLDetailsElement): HTMLElement | null =>
    menu.querySelector<HTMLElement>(".services-menu-panel");

  const resetMenuPanelLayout = (menu: HTMLDetailsElement): void => {
    const panel = getMenuPanel(menu);
    if (panel) {
      panel.style.removeProperty("position");
      panel.style.removeProperty("top");
      panel.style.removeProperty("left");
      panel.style.removeProperty("width");
      panel.style.removeProperty("margin-top");
      panel.style.removeProperty("z-index");
    }

    const container = menu.parentElement as HTMLElement | null;
    if (container) {
      container.style.removeProperty("overflow");
    }
  };

  const positionMenuPanelForViewport = (menu: HTMLDetailsElement): void => {
    if (window.innerWidth >= MOBILE_MENU_BREAKPOINT_PX) {
      resetMenuPanelLayout(menu);
      return;
    }

    const container = menu.parentElement as HTMLElement | null;
    if (container) {
      // iOS Safari clips absolutely-positioned children when parent has overflow auto.
      // Force visible overflow while menu is open/closing.
      container.style.overflow = "visible";
    }
  };

  const clearCloseTimer = (menu: HTMLDetailsElement): void => {
    const timer = closeTimers.get(menu);
    if (typeof timer === "number") {
      window.clearTimeout(timer);
      closeTimers.delete(menu);
    }
  };

  const closeMenu = (menu: HTMLDetailsElement, animated = true): void => {
    clearCloseTimer(menu);

    if (!menu.open) {
      menu.classList.remove("services-menu-closing");
      resetMenuPanelLayout(menu);
      return;
    }

    if (!animated) {
      menu.classList.remove("services-menu-closing");
      menu.removeAttribute("open");
      resetMenuPanelLayout(menu);
      return;
    }

    menu.classList.add("services-menu-closing");
    const timer = window.setTimeout(() => {
      menu.classList.remove("services-menu-closing");
      menu.removeAttribute("open");
      resetMenuPanelLayout(menu);
      closeTimers.delete(menu);
    }, CLOSE_ANIMATION_MS);
    closeTimers.set(menu, timer);
  };

  const closeMenus = (except?: HTMLDetailsElement, animated = true): void => {
    menus.forEach((menu) => {
      if (menu !== except) {
        closeMenu(menu, animated);
      }
    });
  };

  const openMenu = (menu: HTMLDetailsElement): void => {
    clearCloseTimer(menu);
    menu.classList.remove("services-menu-closing");
    closeMenus(menu, false);
    positionMenuPanelForViewport(menu);
    menu.setAttribute("open", "");
  };

  menus.forEach((menu) => {
    const summary = menu.querySelector("summary");
    if (summary) {
      let suppressNextClick = false;
      const handleSummaryActivate = (event: Event): void => {
        event.preventDefault();

        if (menu.open && !menu.classList.contains("services-menu-closing")) {
          closeMenu(menu, true);
          return;
        }

        openMenu(menu);
      };

      summary.addEventListener("touchend", (event) => {
        suppressNextClick = true;
        handleSummaryActivate(event);
        window.setTimeout(() => {
          suppressNextClick = false;
        }, 320);
      });

      summary.addEventListener("click", (event) => {
        if (suppressNextClick) {
          suppressNextClick = false;
          event.preventDefault();
          return;
        }

        handleSummaryActivate(event);
      });
    }

    menu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu(menu, true);
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }
    const target = event.target;

    menus.forEach((menu) => {
      if (!menu.contains(target)) {
        closeMenu(menu, true);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeMenus(undefined, true);
  });

  window.addEventListener("resize", () => {
    menus.forEach((menu) => {
      if (menu.open || menu.classList.contains("services-menu-closing")) {
        positionMenuPanelForViewport(menu);
      } else {
        resetMenuPanelLayout(menu);
      }
    });
  });
}

export function setupStandardPageNavigation(delayMs = 220): void {
  setupPageTransitionNavigation(delayMs);
  setupBackLinkNavigation(delayMs);
  setupServicesDropdown();
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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

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

    let linkUrl: URL;
    try {
      linkUrl = new URL(link.href);
    } catch {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const isTopNavLink = Boolean(link.closest("nav"));
    const isSameOrigin = linkUrl.origin === currentUrl.origin;
    const isSameDocumentPath =
      isSameOrigin &&
      normalizePathname(linkUrl.pathname) === normalizePathname(currentUrl.pathname) &&
      linkUrl.search === currentUrl.search;
    if (isSameDocumentPath && !linkUrl.hash) {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior,
      });
      return;
    }

    const landingHashMatch = href.match(LANDING_HASH_PATTERN);
    if (landingHashMatch) {
      event.preventDefault();
      const target = landingHashMatch[1];
      const didStoreTarget = setPendingLandingScrollTarget(target);
      // Fallback preserves section target if sessionStorage is blocked.
      const destination = didStoreTarget ? "/" : `/#${target}`;
      if (isTopNavLink) {
        window.location.href = destination;
      } else {
        navigateWithTransition(destination);
      }
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

    if (isTopNavLink && isSameOrigin) {
      event.preventDefault();
      window.location.href = link.href;
      return;
    }

    event.preventDefault();
    navigateWithTransition(link.href);
  });
}

function ensureBackLinkStyles(): void {
  ensureStylesheetLink(BACK_LINK_STYLESHEET_ID, BACK_LINK_STYLESHEET_HREF, BACK_LINK_STYLE_ID);
}

export function setupBackLinkNavigation(delayMs = 220): void {
  ensureBackLinkStyles();
  const navigateWithTransition = createPageTransitionNavigator(delayMs);

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
    try {
      window.sessionStorage.removeItem(LANDING_SCROLL_STORAGE_KEY);
    } catch {
      // Ignore blocked storage access and continue to root navigation.
    }

    navigateWithTransition("/");
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
