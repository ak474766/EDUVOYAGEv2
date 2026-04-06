"use client";

import { useEffect } from "react";

export default function LandingScripts() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // Prevent double-init in React Strict Mode (dev) or on HMR
    if (document.body.dataset.evInit === "1") return;
    document.body.dataset.evInit = "1";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Track disposers and observers for full cleanup
    const cleanupFns = [];
    const observers = [];

    // Add external resources with preconnects and idempotency
    const addExternalResources = () => {
      // Preconnects for faster font CSS/font file fetch
      if (!document.querySelector("link[data-ev-preconnect-google]")) {
        const l = document.createElement("link");
        l.rel = "preconnect";
        l.href = "https://fonts.googleapis.com";
        l.setAttribute("data-ev-preconnect-google", "true");
        document.head.appendChild(l);
      }
      if (!document.querySelector("link[data-ev-preconnect-gstatic]")) {
        const l = document.createElement("link");
        l.rel = "preconnect";
        l.href = "https://fonts.gstatic.com";
        l.crossOrigin = "";
        l.setAttribute("data-ev-preconnect-gstatic", "true");
        document.head.appendChild(l);
      }

      // Google Fonts
      if (!document.querySelector("link[data-ev-fonts-inter]")) {
        const fontLink = document.createElement("link");
        fontLink.href =
          "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
        fontLink.rel = "stylesheet";
        fontLink.setAttribute("data-ev-fonts-inter", "true");
        document.head.appendChild(fontLink);
      }

      // Font Awesome
      if (!document.querySelector("link[data-ev-fontawesome]")) {
        const faLink = document.createElement("link");
        faLink.rel = "stylesheet";
        faLink.href =
          "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css";
        faLink.setAttribute("data-ev-fontawesome", "true");
        document.head.appendChild(faLink);
      }
    };

    const initializeScripts = () => {
      const navbar = document.querySelector(".navbar");
      const hamburger = document.querySelector(".hamburger");
      const navMenu = document.querySelector(".nav-menu");

      // Mobile Navigation Toggle + close on link click + outside click
      if (hamburger && navMenu) {
        const onHamburgerClick = () => {
          hamburger.classList.toggle("active");
          navMenu.classList.toggle("active");
        };
        hamburger.addEventListener("click", onHamburgerClick);
        cleanupFns.push(() =>
          hamburger.removeEventListener("click", onHamburgerClick)
        );

        // Close on menu item click
        const linkHandlers = [];
        navMenu.querySelectorAll("a").forEach((link) => {
          const h = () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
          };
          link.addEventListener("click", h);
          linkHandlers.push([link, h]);
        });
        cleanupFns.push(() =>
          linkHandlers.forEach(([el, h]) => el.removeEventListener("click", h))
        );

        // Close on outside click
        const onDocClick = (e) => {
          if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
          }
        };
        document.addEventListener("click", onDocClick);
        cleanupFns.push(() =>
          document.removeEventListener("click", onDocClick)
        );
      }

      // Smooth Scrolling for in-page anchors (accounts for navbar height)
      const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
      const anchorHandlers = [];
      const scrollToId = (hash) => {
        // Only process valid hash selectors
        if (!hash || typeof hash !== "string" || !hash.startsWith("#")) {
          return;
        }

        const target = document.querySelector(hash);
        if (!target) return;
        const headerHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          8; // small offset
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      };
      anchors.forEach((a) => {
        const h = (e) => {
          const href = a.getAttribute("href") || "";
          if (href === "#" || href.length < 2) return;
          e.preventDefault();
          scrollToId(href);
        };
        a.addEventListener("click", h);
        anchorHandlers.push([a, h]);
      });
      cleanupFns.push(() =>
        anchorHandlers.forEach(([el, h]) => el.removeEventListener("click", h))
      );

      // Navbar background/shadow on scroll (rAF-throttled, passive listener)
      let lastY = 0;
      let ticking = false;
      const onScroll = () => {
        lastY = window.scrollY || window.pageYOffset;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (navbar) {
              const scrolled = lastY > 50;
              navbar.style.background = scrolled
                ? "rgba(255, 255, 255, 0.98)"
                : "rgba(255, 255, 255, 0.95)";
              navbar.style.boxShadow = scrolled
                ? "0 2px 20px rgba(139, 92, 246, 0.1)"
                : "none";
            }
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

      // Intersection Observer: reveal-on-scroll
      if (!prefersReducedMotion && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const el = entry.target;
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
                io.unobserve(el);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
        );
        observers.push(io);

        document
          .querySelectorAll(
            ".feature-card, .step, .instructor-card, .testimonial-card"
          )
          .forEach((el) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            io.observe(el);
          });
      }

      // Button hover lift + ripple effect
      const buttons = Array.from(
        document.querySelectorAll(
          ".btn-primary, .btn-secondary, .cta-button, .learn-more-btn"
        )
      );
      const buttonHandlers = [];
      buttons.forEach((btn) => {
        const onEnter = () => {
          btn.style.transform = "translateY(-3px)";
        };
        const onLeave = () => {
          btn.style.transform = "translateY(0)";
        };
        const onClick = (e) => {
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const ripple = document.createElement("span");
          ripple.classList.add("ripple");
          ripple.style.width = ripple.style.height = size + "px";
          ripple.style.left = e.clientX - rect.left - size / 2 + "px";
          ripple.style.top = e.clientY - rect.top - size / 2 + "px";
          // Ensure containment without changing your HTML
          const computedPos = getComputedStyle(btn).position;
          const prevPos = btn.style.position;
          const prevOverflow = btn.style.overflow;
          if (computedPos === "static") btn.style.position = "relative";
          if (getComputedStyle(btn).overflow !== "hidden")
            btn.style.overflow = "hidden";
          btn.appendChild(ripple);
          setTimeout(() => {
            ripple.remove();
            btn.style.position = prevPos;
            btn.style.overflow = prevOverflow;
          }, 600);
        };
        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);
        btn.addEventListener("click", onClick);
        buttonHandlers.push([btn, onEnter, onLeave, onClick]);
      });
      cleanupFns.push(() =>
        buttonHandlers.forEach(([el, onEnter, onLeave, onClick]) => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
          el.removeEventListener("click", onClick);
        })
      );

      // Hero illustration tilt (skips when reduced motion is on)
      const illustration = document.querySelector(".illustration-placeholder");
      if (illustration) {
        let isHovering = false;
        const maxTilt = 10;
        const onEnter = () => {
          if (prefersReducedMotion) return;
          isHovering = true;
          illustration.style.transition =
            "transform 300ms cubic-bezier(.2,.8,.2,1)";
          illustration.style.willChange = "transform";
          illustration.style.transformStyle = "preserve-3d";
        };
        const onLeave = () => {
          isHovering = false;
          illustration.style.transform = "rotateX(0deg) rotateY(0deg)";
        };
        const onMove = (e) => {
          if (!isHovering || prefersReducedMotion) return;
          const rect = illustration.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const nx = (e.clientX - cx) / (rect.width / 2);
          const ny = (e.clientY - cy) / (rect.height / 2);
          const rx = Math.max(-maxTilt, Math.min(maxTilt, ny * -maxTilt));
          const ry = Math.max(-maxTilt, Math.min(maxTilt, nx * maxTilt));
          illustration.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        };
        illustration.addEventListener("mouseenter", onEnter);
        illustration.addEventListener("mouseleave", onLeave);
        illustration.addEventListener("mousemove", onMove);
        cleanupFns.push(() => {
          illustration.removeEventListener("mouseenter", onEnter);
          illustration.removeEventListener("mouseleave", onLeave);
          illustration.removeEventListener("mousemove", onMove);
        });
      }

      // Lightweight particle background (desktop only, honors reduced motion)
      let particlesContainer = null;
      const createParticles = () => {
        particlesContainer = document.createElement("div");
        particlesContainer.className = "particles-container";
        particlesContainer.setAttribute("aria-hidden", "true");
        particlesContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    `;
        document.body.appendChild(particlesContainer);
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement("div");
          particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(139, 92, 246, 0.3);
        border-radius: 50%;
        animation: float-particle ${Math.random() * 10 + 10}s linear infinite;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 10}s;
      `;
          particlesContainer.appendChild(particle);
        }
      };
      if (window.innerWidth > 768 && !prefersReducedMotion) {
        createParticles();
        cleanupFns.push(() => {
          if (particlesContainer) particlesContainer.remove();
        });
      }

      // Initial call to apply navbar state if not at top
      onScroll();

      // Log once
      // console.log('EduVoyage landing page initialized ✅');
    };

    // Kick off
    addExternalResources();
    const timer = window.setTimeout(initializeScripts, 0);
    cleanupFns.push(() => window.clearTimeout(timer));

    return () => {
      // Disconnect observers
      observers.forEach((o) => o.disconnect());
      // Run all listener cleanups
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch {
          /* no-op */
        }
      });
      // Allow re-init on remount
      delete document.body.dataset.evInit;
    };
  }, []);

  return null;
}
