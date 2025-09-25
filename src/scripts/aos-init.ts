import AOS from "aos";

const defaultOptions: Parameters<typeof AOS.init>[0] = {
  duration: 800,
  once: true,
  easing: "ease-out-cubic",
};

const run = () => {
  AOS.init(defaultOptions);
};

const init = () => {
  if (typeof window === "undefined") return;

  const globalWithFlag = window as typeof window & {
    __copycodeAosInitialized?: boolean;
  };

  if (globalWithFlag.__copycodeAosInitialized) {
    return;
  }

  globalWithFlag.__copycodeAosInitialized = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  document.addEventListener("astro:page-load", run);
};

export default init;
