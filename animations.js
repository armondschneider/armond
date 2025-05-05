import { animate } from "https://cdn.skypack.dev/motion";

document.querySelectorAll("div.prose").forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(10px)";
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(
          el,
          { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] },
          { duration: 0.6, easing: "ease-out" }
        );
        io.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  io.observe(el);
});