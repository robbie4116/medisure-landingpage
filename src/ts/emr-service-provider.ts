import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation, setupScrollReveal } from "./shared";

setupPageTransitionNavigation();
setupBackLinkNavigation();
applySiteContactInfo();
setupInPageSmoothScroll({ topOffsetPx: 10 });
setupScrollReveal();
