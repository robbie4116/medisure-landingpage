import { applySiteContactInfo, setupInPageSmoothScroll, setupPageTransitionNavigation, setupScrollReveal } from "./shared";

setupPageTransitionNavigation();
applySiteContactInfo();
setupInPageSmoothScroll({ topOffsetPx: 10 });
setupScrollReveal();
