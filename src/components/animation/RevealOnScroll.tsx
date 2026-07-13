/**
 * RevealOnScroll — wrapper client component untuk GSAP ScrollTrigger
 *
 * Mendaftarkan semua elemen dengan class .reveal untuk fade+slide
 * saat masuk viewport. Subtle & elegant (8-15px slide, 600-800ms).
 */

"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
  useEffect(() => {
    let mounted = true;

    const initAnimations = async () => {
      // Lazy import GSAP untuk performa initial load
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (!mounted) return;

      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      // Reveal on scroll
      const reveals = gsap.utils.toArray<HTMLElement>(".reveal");
      reveals.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Soft parallax on elements with [data-parallax]
      const parallaxEls = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.15");
        gsap.to(el, {
          y: () => -window.innerHeight * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    };

    initAnimations();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
