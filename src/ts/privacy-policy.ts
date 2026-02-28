import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation, setupServicesDropdown } from "./shared";

setupPageTransitionNavigation();
setupBackLinkNavigation();
setupServicesDropdown();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
