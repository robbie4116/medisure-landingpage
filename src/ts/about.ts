import { applySiteContactInfo, setupInPageSmoothScroll, setupScrollReveal, setupStandardPageNavigation } from "./shared";

function setupStoryNavVisibility(): void {
  const storyNav = document.getElementById("story-nav");
  const storyTitle = document.getElementById("story-title");
  if (!storyNav || !storyTitle) {
    return;
  }

  const updateStoryNavVisibility = (): void => {
    const titleTop = storyTitle.getBoundingClientRect().top;
    const navHeight = storyNav.offsetHeight || storyNav.getBoundingClientRect().height;
    const hideAt = navHeight + 4;
    const showAt = navHeight + 28;
    const isHidden = storyNav.classList.contains("story-nav-hidden");

    if (!isHidden && titleTop <= hideAt) {
      storyNav.classList.add("story-nav-hidden");
    } else if (isHidden && titleTop > showAt) {
      storyNav.classList.remove("story-nav-hidden");
    }
  };

  let isTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (isTicking) {
        return;
      }

      isTicking = true;
      requestAnimationFrame(() => {
        updateStoryNavVisibility();
        isTicking = false;
      });
    },
    { passive: true },
  );

  window.addEventListener("resize", updateStoryNavVisibility);
  requestAnimationFrame(updateStoryNavVisibility);
}

setupStandardPageNavigation();
setupInPageSmoothScroll({ topOffsetPx: 10 });
applySiteContactInfo();
setupStoryNavVisibility();
setupScrollReveal(["[data-reveal]:not([data-reveal-late])"], 0.18, "0px 0px -4% 0px");
setupScrollReveal(["[data-reveal-late]"], 0.24, "0px 0px -10% 0px");
