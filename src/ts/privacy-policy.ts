import { applySiteContactInfo, setupBackLinkNavigation, setupInPageSmoothScroll, setupPageTransitionNavigation } from "./shared";

setupPageTransitionNavigation();
setupBackLinkNavigation();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
