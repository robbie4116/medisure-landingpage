import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation, setupScrollReveal, setupServicesDropdown } from "./shared";

setupPageTransitionNavigation();
setupBackLinkNavigation();
setupServicesDropdown();
applySiteContactInfo();
setupInPageSmoothScroll({ topOffsetPx: 10 });
setupScrollReveal();
