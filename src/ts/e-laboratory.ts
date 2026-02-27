import { COMPLETE_PRICE_LIST_ROWS, HOME_SERVICE_ROWS, type ServiceRow } from "./e-laboratory-data";
import { setupPageTransitionNavigation } from "./shared";

const ROW_CLASS = "hover:bg-medi-green-50 transition-colors";
const SERVICE_CELL_CLASS = "px-6 %PADDING% text-gray-700";
const PRICE_CELL_CLASS = "px-6 %PADDING% text-right font-medium text-gray-900";

type PricedServiceRow = ServiceRow & {
  index: number;
  serviceLower: string;
  priceValue: number;
};

function parsePrice(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function createTableRow(item: ServiceRow, paddingClass: "py-3" | "py-4"): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.className = ROW_CLASS;

  const serviceCell = document.createElement("td");
  serviceCell.className = SERVICE_CELL_CLASS.replace("%PADDING%", paddingClass);
  serviceCell.textContent = item.service;

  const priceCell = document.createElement("td");
  priceCell.className = PRICE_CELL_CLASS.replace("%PADDING%", paddingClass);
  priceCell.textContent = `${String.fromCharCode(8369)}${item.price}`;

  row.append(serviceCell, priceCell);
  return row;
}

function renderRows(
  tbody: HTMLElement,
  items: readonly ServiceRow[],
  paddingClass: "py-3" | "py-4",
): void {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    fragment.appendChild(createTableRow(item, paddingClass));
  });
  tbody.replaceChildren(fragment);
}

function setupHomeServicesTable(): void {
  const tbody = document.getElementById("home-services-body");
  if (!tbody) {
    return;
  }

  renderRows(tbody, HOME_SERVICE_ROWS, "py-4");
}

function setupPricelistFilters(): void {
  const tbody = document.getElementById("complete-pricelist-body");
  const searchInput = document.getElementById("pricelist-search") as HTMLInputElement | null;
  const rangeSelect = document.getElementById("pricelist-range") as HTMLSelectElement | null;
  const countLabel = document.getElementById("complete-pricelist-count");

  if (!tbody || !searchInput || !rangeSelect) {
    return;
  }

  const items: PricedServiceRow[] = COMPLETE_PRICE_LIST_ROWS.map((item, index) => ({
    ...item,
    index,
    serviceLower: item.service.toLowerCase(),
    priceValue: parsePrice(item.price),
  }));

  const emptyRow = document.createElement("tr");
  const emptyCell = document.createElement("td");
  emptyCell.colSpan = 2;
  emptyCell.className = "px-6 py-8 text-center text-gray-500";
  emptyCell.textContent = "No matching services found.";
  emptyRow.appendChild(emptyCell);

  const applyFilters = (): void => {
    const query = searchInput.value.trim().toLowerCase();
    const range = rangeSelect.value || "all";

    const filtered = items.filter((item) => {
      const matchesQuery = !query || item.serviceLower.includes(query);
      let matchesRange = true;

      if (range === "0-999") {
        matchesRange = item.priceValue <= 999;
      } else if (range === "1000-2999") {
        matchesRange = item.priceValue >= 1000 && item.priceValue <= 2999;
      } else if (range === "3000+") {
        matchesRange = item.priceValue >= 3000;
      }

      return matchesQuery && matchesRange;
    });

    if (!filtered.length) {
      tbody.replaceChildren(emptyRow);
    } else {
      const ordered = filtered.sort((a, b) => a.index - b.index);
      renderRows(tbody, ordered, "py-3");
    }

    if (countLabel) {
      if (!query && range === "all") {
        countLabel.textContent = `Showing all ${items.length} services`;
      } else {
        countLabel.textContent = `Showing ${filtered.length} of ${items.length} services`;
      }
    }
  };

  searchInput.addEventListener("input", applyFilters);
  rangeSelect.addEventListener("change", applyFilters);
  applyFilters();
}

setupHomeServicesTable();
setupPricelistFilters();
setupPageTransitionNavigation();
