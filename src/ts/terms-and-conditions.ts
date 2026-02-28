import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation } from "./shared";

// Keep TOC simple (no persistent active highlight), but use smooth scrolling.
setupPageTransitionNavigation();
setupBackLinkNavigation();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
