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

