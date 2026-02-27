import { applySiteContactInfo, setupBackLinkNavigation, setupPageTransitionNavigation } from "./shared";

// TOC behavior intentionally left to native anchor scrolling (no persistent active highlight).
setupPageTransitionNavigation();
setupBackLinkNavigation();
applySiteContactInfo();
