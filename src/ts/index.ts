import { applySiteContactInfo, createPageTransitionNavigator, setupScrollReveal } from "./shared";

const AUTH_REDIRECT_URL = "https://myhealth.medisureonline.com/";
const SIGN_IN_REDIRECT_URL = "https://myhealth.medisureonline.com/SignIn";
const LANDING_SCROLL_STORAGE_KEY = "landingScrollTarget";
const HEADER_OFFSET_PX = 80;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navigateWithTransition = createPageTransitionNavigator();

function canonicalizeLandingPath(): void {
  if (window.location.pathname !== "/index.html") {
    return;
  }

  const canonical = `/${window.location.search}${window.location.hash}`;
  history.replaceState(null, "", canonical);
}

function getAppContainer(): HTMLElement | null {
  return document.getElementById("app-container");
}

function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion ? "auto" : "smooth";
}

function scrollToTopFromLogo(): void {
  const appContainer = getAppContainer();
  if (!appContainer) {
    return;
  }

  appContainer.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });
}

function getTargetByHash(hash: string): HTMLElement | null {
  if (!hash || hash === "#") {
    return null;
  }

  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null;
  }
}

function scrollToAppSection(hash: string, behavior: ScrollBehavior = getScrollBehavior()): void {
  const target = getTargetByHash(hash);
  const appContainer = getAppContainer();
  if (!target || !appContainer) {
    return;
  }

  const containerRect = appContainer.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const targetPosition = appContainer.scrollTop + (targetRect.top - containerRect.top) - HEADER_OFFSET_PX;

  appContainer.scrollTo({
    top: Math.max(0, targetPosition),
    behavior,
  });
}

function scrollToAppSectionWithSettle(hash: string): void {
  scrollToAppSection(hash, getScrollBehavior());
}

function normalizeLandingHashHref(href: string): string {
  if (href.startsWith("/index.html#")) {
    return href.slice("/index.html".length);
  }

  if (href.startsWith("/#")) {
    return href.slice(1);
  }

  return href;
}

function getPendingLandingScroll(): string | null {
  try {
    const stored = window.sessionStorage.getItem(LANDING_SCROLL_STORAGE_KEY);
    if (stored) {
      window.sessionStorage.removeItem(LANDING_SCROLL_STORAGE_KEY);
    }
    return stored;
  } catch {
    return null;
  }
}

function shouldIgnoreAnchorForTransition(event: MouseEvent, link: HTMLAnchorElement, href: string): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return true;
  }

  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:") ||
    link.target === "_blank" ||
    link.hasAttribute("download")
  ) {
    return true;
  }

  return false;
}

function setupButtonHandlers(): void {
  const signInButton = document.getElementById("sign-in-button");
  signInButton?.addEventListener("click", () => {
    navigateWithTransition(SIGN_IN_REDIRECT_URL);
  });

  const heroStartButton = document.getElementById("hero-start-button");
  heroStartButton?.addEventListener("click", () => {
    navigateWithTransition(AUTH_REDIRECT_URL);
  });

  const logoHomeLink = document.getElementById("logo-home-link");
  logoHomeLink?.addEventListener("click", scrollToTopFromLogo);
}

function setupAnchorNavigation(): void {
  document.addEventListener("click", (event) => {
    if (!(event instanceof MouseEvent) || !(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest("a");
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || href === "#") {
      return;
    }

    if (shouldIgnoreAnchorForTransition(event, link, href)) {
      return;
    }

    if (href.startsWith("#") || href.startsWith("/#") || href.startsWith("/index.html#")) {
      const normalizedHash = normalizeLandingHashHref(href);
      if (normalizedHash !== "#") {
        event.preventDefault();
        scrollToAppSectionWithSettle(normalizedHash);
      }
      return;
    }

    if (href.startsWith("/?scroll=") || href.startsWith("/index.html?scroll=")) {
      event.preventDefault();
      const scrollTarget = new URL(link.href).searchParams.get("scroll");
      if (scrollTarget) {
        requestAnimationFrame(() => scrollToAppSectionWithSettle(`#${scrollTarget}`));
        history.replaceState(null, "", "/");
      }
      return;
    }

    event.preventDefault();
    navigateWithTransition(link.href);
  });
}

function setupInitialScroll(): void {
  const pendingLandingScroll = getPendingLandingScroll();
  const params = new URLSearchParams(window.location.search);
  const initialScroll = params.get("scroll");

  if (pendingLandingScroll) {
    requestAnimationFrame(() => scrollToAppSectionWithSettle(`#${pendingLandingScroll}`));
    history.replaceState(null, "", "/");
    return;
  }

  if (initialScroll) {
    requestAnimationFrame(() => scrollToAppSectionWithSettle(`#${initialScroll}`));
    history.replaceState(null, "", "/");
    return;
  }

  if (window.location.hash) {
    requestAnimationFrame(() => scrollToAppSectionWithSettle(window.location.hash));
    history.replaceState(null, "", "/");
  }
}

function setupHashScrollHandler(): void {
  window.addEventListener("hashchange", () => {
    const nextHash = window.location.hash;
    if (!nextHash) {
      return;
    }

    requestAnimationFrame(() => scrollToAppSectionWithSettle(nextHash));
    history.replaceState(null, "", "/");
  });
}

canonicalizeLandingPath();
applySiteContactInfo();
setupButtonHandlers();
setupAnchorNavigation();
setupInitialScroll();
setupHashScrollHandler();
setupScrollReveal();
