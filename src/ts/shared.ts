export function initPage(activePage: string): void {
  const links = document.querySelectorAll<HTMLElement>("[data-page]");
  links.forEach((link) => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    }
  });

  const year = document.querySelector<HTMLElement>("[data-year]");
  if (year) {
    year.textContent = `${new Date().getFullYear()}`;
  }
}

export function setupPageTransitionNavigation(delayMs = 220): void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navigateWithTransition = (url: string): void => {
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
