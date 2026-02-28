import { applySiteContactInfo, setupInPageSmoothScroll, setupStandardPageNavigation } from "./shared";

// Keep TOC simple (no persistent active highlight), but use smooth scrolling.
setupStandardPageNavigation();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
