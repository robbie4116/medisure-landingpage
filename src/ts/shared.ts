const LANDING_SCROLL_STORAGE_KEY = "landingScrollTarget";
const LANDING_HASH_PATTERN = /^\/(?:index\.html)?#([a-zA-Z0-9_-]+)$/;
const SCROLL_REVEAL_STYLE_ID = "medisure-scroll-reveal-style";
const BACK_LINK_STYLE_ID = "medisure-back-link-style";
const BACK_LINK_STYLESHEET_ID = "medisure-back-link-stylesheet";
const SERVICES_MENU_STYLE_ID = "medisure-services-menu-style";
const SERVICES_MENU_STYLESHEET_ID = "medisure-services-menu-stylesheet";
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

export function setupServicesDropdown(): void {
  const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-services-menu]"));
  if (!menus.length) {
    return;
  }

  if (!document.getElementById(SERVICES_MENU_STYLE_ID) && !document.getElementById(SERVICES_MENU_STYLESHEET_ID)) {
    const style = document.createElement("style");
    style.id = SERVICES_MENU_STYLE_ID;
    style.textContent = `
      details[data-services-menu] {
        position: relative;
      }

      details[data-services-menu] > :not(summary) {
        display: block;
      }

      details[data-services-menu] > summary {
        list-style: none;
        user-select: none;
        position: relative;
        padding: 0.35rem 0.58rem;
        border-radius: 0.66rem;
      }

      details[data-services-menu] > summary::-webkit-details-marker {
        display: none;
      }

      details[data-services-menu] > summary > span[aria-hidden="true"] {
        transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      details[data-services-menu][open] > summary > span[aria-hidden="true"] {
        transform: rotate(180deg);
      }

      details[data-services-menu][open] > summary {
        background: #ffffff;
        z-index: 3;
      }

      details[data-services-menu][open] > summary::before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid #e5e7eb;
        border-bottom-color: #ffffff;
        border-radius: 0.66rem 0.66rem 0 0;
        pointer-events: none;
      }

      .services-menu-panel {
        display: block;
        visibility: hidden;
        top: calc(100% - 1px) !important;
        margin-top: 0 !important;
        border-top-left-radius: 0.18rem;
        box-shadow: 0 20px 34px -26px rgba(17, 24, 39, 0.5);
        transform-origin: top left;
        overflow: hidden;
        opacity: 0;
        transform: scaleY(0.12);
        clip-path: inset(0 0 100% 0);
        pointer-events: none;
      }

      details[data-services-menu][open] > .services-menu-panel {
        visibility: visible;
        pointer-events: auto;
        animation: servicesMenuDrop 210ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      details[data-services-menu].services-menu-closing > .services-menu-panel {
        visibility: visible;
        pointer-events: none;
        animation: servicesMenuClose 170ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      @keyframes servicesMenuDrop {
        from {
          opacity: 0;
          transform: scaleY(0.12);
          clip-path: inset(0 0 100% 0);
        }
        to {
          opacity: 1;
          transform: scaleY(1);
          clip-path: inset(0 0 0 0);
        }
      }

      @keyframes servicesMenuClose {
        from {
          opacity: 1;
          transform: scaleY(1);
          clip-path: inset(0 0 0 0);
        }
        to {
          opacity: 0;
          transform: scaleY(0.12);
          clip-path: inset(0 0 100% 0);
        }
      }

      details[data-services-menu][open] > .services-menu-panel > p,
      details[data-services-menu][open] > .services-menu-panel > a {
        animation: servicesMenuItemDrop 170ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      details[data-services-menu][open] > .services-menu-panel > p {
        animation-delay: 22ms;
      }

      details[data-services-menu][open] > .services-menu-panel > a:nth-child(2) {
        animation-delay: 36ms;
      }

      details[data-services-menu][open] > .services-menu-panel > a:nth-child(3) {
        animation-delay: 52ms;
      }

      details[data-services-menu][open] > .services-menu-panel > a:nth-child(4) {
        animation-delay: 68ms;
      }

      details[data-services-menu][open] > .services-menu-panel > a:nth-child(5) {
        animation-delay: 84ms;
      }

      details[data-services-menu].services-menu-closing > .services-menu-panel > p,
      details[data-services-menu].services-menu-closing > .services-menu-panel > a {
        animation: none;
      }

      details[data-services-menu].services-menu-closing > summary > span[aria-hidden="true"] {
        transform: rotate(0deg);
      }

      @keyframes servicesMenuItemDrop {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        details[data-services-menu] > summary > span[aria-hidden="true"],
        .services-menu-panel {
          transition: none !important;
          animation: none !important;
          transform: none !important;
          clip-path: none !important;
          opacity: 1 !important;
        }

        .services-menu-panel > p,
        .services-menu-panel > a {
          transition: none !important;
          animation: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const CLOSE_ANIMATION_MS = 170;
  const MOBILE_MENU_BREAKPOINT_PX = 768;
  const MOBILE_MENU_MARGIN_PX = 8;
  const MOBILE_MENU_MAX_WIDTH_PX = 220;
  const closeTimers = new WeakMap<HTMLDetailsElement, number>();

  const getMenuPanel = (menu: HTMLDetailsElement): HTMLElement | null =>
    menu.querySelector<HTMLElement>(".services-menu-panel");

  const resetMenuPanelLayout = (menu: HTMLDetailsElement): void => {
    const panel = getMenuPanel(menu);
    if (!panel) {
      return;
    }

    panel.style.removeProperty("position");
    panel.style.removeProperty("top");
    panel.style.removeProperty("left");
    panel.style.removeProperty("width");
    panel.style.removeProperty("margin-top");
    panel.style.removeProperty("z-index");
  };

  const positionMenuPanelForViewport = (menu: HTMLDetailsElement): void => {
    const panel = getMenuPanel(menu);
    const summary = menu.querySelector<HTMLElement>("summary");
    if (!panel || !summary) {
      return;
    }

    if (window.innerWidth >= MOBILE_MENU_BREAKPOINT_PX) {
      resetMenuPanelLayout(menu);
      return;
    }

    const triggerRect = summary.getBoundingClientRect();
    const availableWidth = Math.max(168, window.innerWidth - MOBILE_MENU_MARGIN_PX * 2);
    const panelWidth = Math.min(MOBILE_MENU_MAX_WIDTH_PX, availableWidth);
    const maxLeft = Math.max(MOBILE_MENU_MARGIN_PX, window.innerWidth - panelWidth - MOBILE_MENU_MARGIN_PX);
    const left = Math.min(Math.max(MOBILE_MENU_MARGIN_PX, triggerRect.left), maxLeft);

    panel.style.position = "fixed";
    panel.style.top = `${Math.round(triggerRect.bottom - 1)}px`;
    panel.style.left = `${Math.round(left)}px`;
    panel.style.width = `${Math.round(panelWidth)}px`;
    panel.style.marginTop = "0";
    panel.style.zIndex = "80";
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
      summary.addEventListener("click", (event) => {
        event.preventDefault();

        if (menu.open && !menu.classList.contains("services-menu-closing")) {
          closeMenu(menu, true);
          return;
        }

        openMenu(menu);
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

    menus.forEach((menu) => {
      if (!menu.contains(event.target)) {
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
  if (document.getElementById(BACK_LINK_STYLE_ID) || document.getElementById(BACK_LINK_STYLESHEET_ID)) {
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
      animation: backLinkEnter 360ms cubic-bezier(0.22, 1, 0.36, 1) 35ms both;
      -webkit-tap-highlight-color: transparent;
    }

    @keyframes backLinkEnter {
      from {
        opacity: 0;
        transform: translateX(-14px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
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
        animation: none !important;
        transition: none !important;
        transform: none !important;
        opacity: 1 !important;
      }
    }
  `;

  document.head.appendChild(style);
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
