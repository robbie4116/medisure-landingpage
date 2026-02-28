import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation, setupServicesDropdown } from "./shared";

// Keep TOC simple (no persistent active highlight), but use smooth scrolling.
setupPageTransitionNavigation();
setupBackLinkNavigation();
setupServicesDropdown();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
