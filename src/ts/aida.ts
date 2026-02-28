import {
  applySiteContactInfo,
  setupInPageSmoothScroll,
  setupScrollReveal,
  setupStandardPageNavigation,
} from "./shared";

setupStandardPageNavigation();
applySiteContactInfo();
setupInPageSmoothScroll({ topOffsetPx: 10 });
setupScrollReveal();
