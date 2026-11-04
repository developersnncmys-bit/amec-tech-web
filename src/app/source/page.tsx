"use client";

// =============================================================================
// SOURCE page — implementation of the SOURCE Website Concept & Developer Brief.
// Nine-section visitor journey from cinematic opening to final CTA.
//
// Design direction:
//   • Matte black background, thin luminous cyan/emerald frames.
//   • Scroll-driven cinematic reveals — canvas + SVG + CSS, no WebGL.
//   • Warm, sentence-case voice (not shouty uppercase).
//
// Capability-claim rules (per brief):
//   • Feature cards should contain only validated information.
//   • Metrics marked as [ILLUSTRATIVE] must stay labelled as demo data.
//   • Flow animations should only run where direction is technically accurate.
//
// Markers in this file:
//   [VERIFY]       — needs product-team sign-off before shipping to prod
//   [ILLUSTRATIVE] — intentional demo data, keep labelled to users
//   TODO(assets)   — swap in rendered 3D frames / final imagery here
// =============================================================================

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { Footer } from "@/components/Footer";
import { HeroCTA } from "@/components/HeroCTA";
import { AnimateIn } from "@/components/AnimateIn";
import { ArrowRight } from "@/components/Icons";
import { QuoteFormModal } from "@/components/QuoteFormModal";

// -----------------------------------------------------------------------------
// Shared data (minimal, validated-only — add new entries after product sign-off)
// -----------------------------------------------------------------------------

const HERO_COPY = {
  eyebrow: "Source",
  headline: "Energy that moves with your life.",
  sub:
    "Meet SOURCE — an intelligent hybrid energy system designed to bring solar, storage and power management together.",
  primary: "Discover SOURCE",
  secondary: "Talk to our Team",
};

// Hotspots on the home image. x/y are percentages on the image container.
// TODO(assets): calibrate x/y to the final home exterior/cutaway render.
const HOME_HOTSPOTS = [
  {
    id: "rooftop",
    title: "Rooftop Solar",
    tagline: "Clean energy from the sun",
    body:
      "Rooftop panels capture sunlight through the day and feed clean energy into the SOURCE system. Any excess charges the battery or exports back to the grid.",
    x: 56,
    y: 22,
  },
  {
    id: "living",
    title: "Living Room",
    tagline: "Everyday comforts",
    body:
      "Entertainment, lighting, and connected devices draw continuously from the best energy source available — moment to moment, without you thinking about it.",
    x: 78,
    y: 62,
  },
  {
    id: "kitchen",
    title: "Kitchen",
    tagline: "The moments that matter",
    body:
      "High-draw appliances get priority power when they need it. SOURCE balances the load so your kettle, oven, and fridge run smoothly — even when the grid is down.",
    x: 26,
    y: 56,
  },
  {
    id: "source",
    title: "SOURCE",
    tagline: "The heart of your home's energy",
    body:
      "The intelligent hub that quietly orchestrates everything — solar generation, battery storage, grid interaction, and every connected load — in a single compact wall-mounted unit.",
    x: 50,
    y: 72,
  },
];

type EnergyComponentId = "solar" | "grid" | "battery" | "building";

type EnergyComponent = {
  id: EnergyComponentId;
  label: string;
  tag: string;
  body: string;
  dot: string;
  // Hero scene image for this component. Placeholder points at an existing
  // asset — swap to the final /images/wte-{id}.png renders when supplied.
  image: string;
};

const ENERGY_COMPONENTS: EnergyComponent[] = [
  {
    id: "solar",
    label: "Solar",
    tag: "Sunlight to clean energy",
    body:
      "Sunlight is captured through rooftop solar panels and converted into clean energy for your home.",
    dot: "#fcd34d",
    image: "/source/source-generation.mp4",
  },
  {
    id: "grid",
    label: "Grid",
    tag: "A reliable fallback",
    body:
      "SOURCE stays connected to the utility grid, drawing or exporting energy as needed to keep supply steady.",
    dot: "#7dd3fc",
    image: "/source/source-grid.mp4",
  },
  {
    id: "battery",
    label: "Battery",
    tag: "Stores for later",
    body:
      "Energy is stored in a long-life LiFePO₄ battery module so it is available after sundown or during outages.",
    dot: "#6ee7b7",
    image: "/source/source-battery.png",
  },
  {
    id: "building",
    label: "Building",
    tag: "Powers daily life",
    body:
      "Every connected load across the home draws from the best source available, moment to moment.",
    dot: "#f8fafc",
    image: "/source/solar-building.png",
  },
];

// [VERIFY] — specs below are from the previous page; confirm each row with
// the product team before shipping to production.
const SPECS = [
  {
    group: "Inverter Module",
    rows: [
      ["Continuous Power Output", "6 kW"],
      ["AC Output Voltage", "230 V AC ±5%, 50 Hz"],
      ["DC Input Range", "42 V – 60 V"],
      ["Surge Power Protection (10s)", "9 kW"],
      ["Transfer Switch Time", "< 20 ms"],
      ["Operating Modes", "On-Grid, Off-Grid, Hybrid, Backup"],
    ],
  },
  {
    group: "Battery Module",
    rows: [
      ["Battery Capacity", "6.5 kWh"],
      ["Nominal Voltage", "51 V"],
      ["Battery Chemistry", "LiFePO₄ (LFP)"],
      ["Operating Temperature", "-10 °C to 55 °C"],
      ["Warranty", "10 Years"],
    ],
  },
  {
    group: "General",
    rows: [
      ["Weight", "65 kg"],
      ["Housing Material", "Die-Cast Aluminum Alloy"],
      ["Mounting Options", "Wall Mount / Ground Mount"],
      ["Dimensions (L × W × D)", "930 × 485 × 200 mm"],
    ],
  },
];

const BIG_STATS = [
  { value: "6 kW", label: "Continuous output" },
  { value: "9 kW", label: "Surge power (10 seconds)" },
  { value: "6.5 kWh", label: "Battery capacity" },
  { value: "< 20 ms", label: "Grid to backup transfer" },
];


// App feature tabs — labels per brief Panel 05. Metrics in mockups are
// [ILLUSTRATIVE] demo data; the badge in the UI must stay visible.
// Per-feature data drives BOTH the phone mockup (via `image` + `chips`) and the
// desktop dashboard (via `dashboard` + `icon`). Metrics are [ILLUSTRATIVE] demo
// data — the Illustrative pill under the laptop must stay visible.
type DashboardKind = "area" | "bars" | "battery" | "grid" | "modes";
type SidebarIconKind = "home" | "sun" | "battery" | "bolt" | "sliders";
const APP_FEATURES: Array<{
  id: string;
  label: string;
  image: string;
  body: string;
  icon: SidebarIconKind;
  chips: Array<{ label: string; value: string; dot: string }>;
  dashboard: {
    stats: Array<{ label: string; value: string }>;
    kind: DashboardKind;
  };
}> = [
  {
    id: "overview", label: "Energy Overview", image: "/source/m1.png", icon: "home",
    body: "A single, calm view of what's coming in, what's going out, and what's stored.",
    chips: [
      { label: "Solar now", value: "4.2 kW", dot: "#fcd34d" },
      { label: "Battery", value: "72%", dot: "#6ee7b7" },
    ],
    dashboard: {
      stats: [
        { label: "Solar", value: "4.2 kW" },
        { label: "Battery", value: "72%" },
        { label: "Load", value: "1.9 kW" },
        { label: "Grid", value: "+0.3 kW" },
      ],
      kind: "area",
    },
  },
  {
    id: "solar", label: "Solar Generation", image: "/source/m2.png", icon: "sun",
    body: "See your rooftop's output across the day and track long-term generation.",
    chips: [
      { label: "Today", value: "18.6 kWh", dot: "#fcd34d" },
      { label: "Peak", value: "5.1 kW", dot: "#fcd34d" },
    ],
    dashboard: {
      stats: [
        { label: "Today", value: "18.6 kWh" },
        { label: "Peak", value: "5.1 kW" },
        { label: "This month", value: "412 kWh" },
        { label: "Year-to-date", value: "3.8 MWh" },
      ],
      kind: "bars",
    },
  },
  {
    id: "battery", label: "Battery Status", image: "/source/m3.png", icon: "battery",
    body: "Check state of charge, cycle health, and how long your reserve will last.",
    chips: [
      { label: "State of charge", value: "72%", dot: "#6ee7b7" },
      { label: "Reserve", value: "~9 hrs", dot: "#6ee7b7" },
    ],
    dashboard: {
      stats: [
        { label: "State of charge", value: "72%" },
        { label: "Reserve", value: "~9 hrs" },
        { label: "Cycle count", value: "214" },
        { label: "Temperature", value: "28°C" },
      ],
      kind: "battery",
    },
  },
  {
    id: "grid", label: "Grid Information", image: "/source/m4.png", icon: "bolt",
    body: "Watch import and export flows and understand how SOURCE interacts with the grid.",
    chips: [
      { label: "Exporting", value: "0.9 kW", dot: "#7dd3fc" },
      { label: "Today's export", value: "6.2 kWh", dot: "#7dd3fc" },
    ],
    dashboard: {
      stats: [
        { label: "Exporting", value: "0.9 kW" },
        { label: "Imported", value: "2.1 kWh" },
        { label: "Today's export", value: "6.2 kWh" },
        { label: "Net", value: "+4.1 kWh" },
      ],
      kind: "grid",
    },
  },
  {
    id: "modes", label: "System Modes", image: "/source/m5.png", icon: "sliders",
    body: "Switch between operating modes to match the day's priorities.",
    chips: [
      { label: "Mode", value: "Hybrid", dot: "#f8fafc" },
      { label: "Priority", value: "Self-use", dot: "#f8fafc" },
    ],
    dashboard: {
      stats: [
        { label: "Current mode", value: "Hybrid" },
        { label: "Priority", value: "Self-use" },
        { label: "Active since", value: "06:14" },
        { label: "Scheduled", value: "4" },
      ],
      kind: "modes",
    },
  },
];

type Scenario = {
  id: string;
  label: string;
  image: string;
  summary: string;
  // Flow paths on the house image — percentages in a 0–100 viewBox.
  paths: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }>;
};

// [VERIFY] — scenario behaviours; product-team to confirm each flow before
// animating lines in production. Lines render here as faint dashes until then.
const SCENARIOS: Scenario[] = [
  {
    id: "sunny",
    label: "A Sunny Day",
    image: "/source/sunny.png",
    summary:
      "Solar panels generate clean energy to power your home, while excess energy is stored in the battery.",
    paths: [
      { x1: 50, y1: 18, x2: 50, y2: 60, color: "#fcd34d" },
      { x1: 50, y1: 60, x2: 32, y2: 72, color: "#6ee7b7" },
    ],
  },
  {
    id: "evening",
    label: "Evening at Home",
    image: "/source/evening.png",
    summary:
      "As the sun sets, SOURCE draws from stored battery energy to keep the home running smoothly.",
    paths: [
      { x1: 32, y1: 72, x2: 60, y2: 60, color: "#6ee7b7" },
    ],
  },
  {
    id: "outage",
    label: "Grid Interruption",
    image: "/source/grid-inter.png",
    summary:
      "During an outage, SOURCE islands from the grid and critical loads keep running on stored energy.",
    paths: [
      { x1: 32, y1: 72, x2: 60, y2: 60, color: "#6ee7b7" },
    ],
  },
];

// [VERIFY] — CleanTech is treated as a dedicated chapter per brief Panel 07.
// Confirm which features exist and whether a motion animation can run (brief:
// "A short animation may show the device moving if its real operation is confirmed.").
const CLEANTECH_FEATURES = [
  { title: "Automatic cleaning", body: "Removes dust and dirt from panels." },
  { title: "Panel maintenance", body: "Helps maintain panel efficiency." },
  { title: "App connectivity", body: "Monitor and schedule cleaning." },
  { title: "Cleaning status", body: "View real-time cleaning progress." },
];

const APPLICATIONS = [
  { title: "Homes", body: "Reliable, efficient energy for everyday living.", image: "/source/home.png" },
  { title: "Commercial Buildings", body: "Smarter energy management for businesses.", image: "/source/commercial.png" },
  { title: "Remote Locations", body: "Power where the grid doesn't reach.", image: "/source/remote-location.png" },
  { title: "Small-Scale Industries", body: "Clean, dependable power to support operations.", image: "/source/small-scale.png" },
];

const FAQ_ITEMS = [
  { q: "How does SOURCE decide whether to use solar, battery, or grid power?",
    a: "SOURCE continuously monitors solar generation, battery status, grid availability, and demand. It prioritises solar first, then battery, and finally the utility grid when required." },
  { q: "What happens during a power outage?",
    a: "SOURCE automatically islands from the grid and continues supplying critical loads from stored battery energy." },
  { q: "Can SOURCE operate without a utility grid?",
    a: "Yes. In off-grid mode SOURCE runs the site entirely from solar and battery, with intelligent load management." },
  { q: "How can I monitor and control my SOURCE system?",
    a: "The SOURCE app provides real-time energy views, remote control, and analytics." },
  { q: "What type of battery does SOURCE use, and how long does it last?",
    a: "SOURCE uses LiFePO₄ (LFP) battery modules for thermal stability and long cycle life, backed by a 10-year warranty." },
];

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function SourcePage() {
  return (
    <>
      <Hero />
      <DiscoverTheHome />
      <WhereTheEnergyBegins />
      <MeetSOURCE />
      <ConnectedBridge />
      <EnergyMeetsIntelligence />
      <TakeACloserLook />
      <OneHomeMultipleScenarios />
      <CleanTechChapter />
      <Applications />
      <FAQ />
      <GetTheApp />
      <FinalCTA />
      <Footer />
    </>
  );
}

// -----------------------------------------------------------------------------
// Shell + shared bits
// -----------------------------------------------------------------------------

function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1600px] px-6 md:px-14 ${className}`}>{children}</div>;
}

// Thin dotted grid overlay — adds subtle depth to dark sections without noise.
function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.18]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(94,234,212,0.35) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage:
          "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 85%)",
      }}
    />
  );
}

// =============================================================================
// 01. Hero — From Clouds to Home (brief Panel 01)
// =============================================================================
// Pinned opening. Scroll scrubs a frame sequence of the SOURCE unit while a
// procedural cloud wash drifts above a dark gradient. Headline sits bottom-left
// with primary + secondary CTAs. On scroll-end, a soft teal underline forms —
// a visual promise of the home revealed in §2.
//
// Frames live at /public/source-hero/frame_##.webp (sourced from source-hero.zip,
// resized to 1920w and converted to WebP q=72 — ~1.3 MB total for the sequence).
// =============================================================================

const SOURCE_FRAME_COUNT = 12;
const SOURCE_FRAME_SRC = (i: number) =>
  `/source-hero/frame_${String(i + 1).padStart(2, "0")}.webp`;

function Hero() {
  const pinRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  // Parallax frame-sequence hero is temporarily disabled — using a looping
  // video (/source/hero.mp4) as the backdrop instead. Re-enable this effect
  // (and swap the <video> back to <canvas>) to restore the scroll-scrubbed
  // clouds-to-home cinematic.
  /*
  useIsomorphicLayoutEffect(() => {
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    if (!pin || !canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const images: HTMLImageElement[] = [];
    const frame = { index: 0 };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      const img = images[frame.index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(vw / iw, vh / ih);
      const w = iw * scale;
      const h = ih * scale;
      const x = (vw - w) / 2;
      const y = (vh - h) / 2;
      ctx2d.clearRect(0, 0, vw, vh);
      ctx2d.drawImage(img, x, y, w, h);
    };

    sizeCanvas();

    for (let i = 0; i < SOURCE_FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = SOURCE_FRAME_SRC(i);
      img.decoding = "async";
      if (i === 0) img.onload = render;
      images.push(img);
    }

    const onResize = () => {
      sizeCanvas();
      render();
    };
    window.addEventListener("resize", onResize);

    const gsapCtx = gsap.context(() => {
      gsap.to(frame, {
        index: SOURCE_FRAME_COUNT - 1,
        snap: "index",
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=200%",
          scrub: 0.5,
          pin: pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: render,
        },
      });

      // Clouds drift slowly across the hero as the user scrolls through.
      gsap.to("[data-hero-clouds]", {
        xPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=200%",
          scrub: 0.6,
        },
      });

      // Underline bar forms at the end of the pin as a teal visual hook that
      // bridges into §2 Discover the Home.
      gsap.fromTo(
        "[data-hero-underline]",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          ease: "power2.out",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: "+=200%",
            scrub: 0.8,
          },
        }
      );
    }, pin);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener("resize", onResize);
      gsapCtx.revert();
    };
  }, []);
  */

  return (
    <section
      ref={pinRef}
      className="relative isolate w-full overflow-hidden bg-[#0A0A0A]"
    >
      <div className="relative h-screen w-full">
        {/* Looping hero video — temporarily replacing the scroll-scrubbed frame
            sequence while the parallax effect above is commented out. */}
        <video
          src="/source/hero.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        {/* Soft bottom-up gradient so the headline + CTAs stay legible over the video */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />

        {/* Cloud wash — layered translucent blobs that drift sideways on scroll.
            Procedural stand-in for a real cloud render. */}
        <div
          data-hero-clouds
          aria-hidden
          className="absolute -inset-x-[20%] inset-y-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 40% at 20% 30%, rgba(226,232,240,0.12) 0%, transparent 60%)," +
              "radial-gradient(50% 35% at 70% 20%, rgba(226,232,240,0.08) 0%, transparent 65%)," +
              "radial-gradient(45% 30% at 40% 70%, rgba(94,234,212,0.08) 0%, transparent 60%)",
            filter: "blur(20px)",
          }}
        />

      </div>

      {/* Top-centre eyebrow + headline */}
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-28 text-center md:pt-32">
        <AnimateIn>
          <p className="eyebrow !text-xs !tracking-[0.22em] !text-white/80 md:!text-sm">
            {HERO_COPY.eyebrow}
          </p>
        </AnimateIn>
      </div>

      {/* Bottom-left headline + sub + CTAs — composition per brief Panel 01 */}
      <div className="absolute inset-x-0 bottom-0 flex px-6 pb-14 md:px-14 md:pb-20">
        <AnimateIn className="max-w-2xl">
          <h1 className="font-display text-[36px] font-semibold leading-[1.08] text-white md:text-[64px] md:leading-[1.06]">
            {HERO_COPY.headline}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 md:mt-7 md:text-[17px]">
            {HERO_COPY.sub}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 md:mt-9">
            <HeroCTA
              onClick={() => setQuoteOpen(true)}
              label={HERO_COPY.primary}
              variant="primary"
              arrow={false}
            />
            <HeroCTA href="/contact" label={HERO_COPY.secondary} arrow={false} />
          </div>
          {/* Teal underline — static here while the pin-driven scaleX reveal is disabled */}
          <div
            data-hero-underline
            aria-hidden
            className="mt-10 h-px w-[180px] origin-left bg-gradient-to-r from-cyan-300 via-emerald-300 to-transparent"
          />
        </AnimateIn>
      </div>

      {/* Scroll cue — bottom right */}
      <ScrollCue className="absolute bottom-10 right-6 md:bottom-14 md:right-14" />

      <QuoteFormModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        defaultInquiryType="Sales/Partnership"
      />
    </section>
  );
}

function ScrollCue({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 text-white/60 ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Scroll</span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/15">
        <span className="absolute inset-x-0 top-0 h-4 animate-[scrollCue_1.6s_ease-in-out_infinite] bg-gradient-to-b from-cyan-300 to-transparent" />
      </span>
      <style jsx>{`
        @keyframes scrollCue {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(220%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// 02. Discover the Home (brief Panel 02)
// =============================================================================
// Interactive home scene with hotspots. Clicking a hotspot opens a short info
// card near it (desktop) or as a bottom sheet (mobile).
//
// TODO(assets): swap the placeholder image for a true 3D cutaway or exterior
// render of the home with SOURCE visible, then recalibrate HOME_HOTSPOTS x/y.
// =============================================================================

function DiscoverTheHome() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // Description — simple fade-up on first entry.
      gsap.from("[data-dth-description]", {
        autoAlpha: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      });

      // Heading — word-by-word reveal scrubbed to scroll. Each word runs
      // through dim → white → cyan flash → white as it enters the view.
      const words = gsap.utils.toArray<HTMLElement>("[data-dth-word]");
      if (words.length) {
        gsap.set(words, { color: "rgba(255,255,255,0.2)" });
        gsap.to(words, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 1.5 },
          scrollTrigger: {
            trigger: "[data-dth-heading]",
            start: "top 85%",
            end: "+=90%",
            scrub: 0.6,
          },
        });
      }

      // Image stage + numbered hotspots fade/scale in after the heading settles.
      gsap.from("[data-dth-stage]", {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-dth-stage]", start: "top 80%" },
      });
      gsap.from("[data-dth-hotspot]", {
        autoAlpha: 0,
        scale: 0.4,
        duration: 0.55,
        stagger: 0.14,
        ease: "back.out(2)",
        delay: 0.35,
        scrollTrigger: { trigger: "[data-dth-stage]", start: "top 70%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A] py-20 md:py-28">
      <GridBackdrop />
      <Shell className="relative">
        {/* Heading */}
        <div className="text-center">
          <h2
            data-dth-heading
            className="font-display font-semibold leading-[1.06] text-white text-[42px] md:leading-[1.05]"
          >
            {"Where energy meets home".split(" ").map((w, i, arr) => (
              <Fragment key={i}>
                <span data-dth-word className="inline-block">{w}</span>
                {i < arr.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h2>
          <p
            data-dth-description
            className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/60"
          >
            From rooftop solar to every room — see how SOURCE connects the pieces.
          </p>
        </div>
      </Shell>

      {/* Home image stage — breaks out of Shell to span the full viewport width.
          Corner brackets + 4 numbered hotspots overlaid. Clicking a marker
          toggles the anchored details card next to it. */}
      <div
        data-dth-stage
        className="relative mt-12 w-full overflow-hidden border-y border-white/10 md:mt-16"
      >
          <div className="relative h-screen w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/source/discoverhome.png"
              alt="SOURCE home overview with energy touchpoints"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Soft inner vignette lifts the numbered hotspots */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent_0%,rgba(0,0,0,0.25)_100%)]"
            />

            <CornerBracket pos="top-left" />
            <CornerBracket pos="top-right" />
            <CornerBracket pos="bottom-left" />
            <CornerBracket pos="bottom-right" />

            {HOME_HOTSPOTS.map((h, i) => (
              <HotspotMarker
                key={h.id}
                index={i}
                hotspot={h}
                active={activeHotspot === i}
                onClick={() =>
                  setActiveHotspot((prev) => (prev === i ? null : i))
                }
              />
            ))}

            {/* Active hotspot card — anchored next to its marker inside the
                stage. Opens to the right when the marker is in the left half,
                and to the left otherwise, so the card never clips off-image.
                Vertically centred on the marker. */}
            {activeHotspot !== null && (() => {
              const h = HOME_HOTSPOTS[activeHotspot];
              const openLeft = h.x >= 50;
              return (
                <div
                  className="absolute z-20 w-[240px] rounded-xl border border-white/10 bg-black/80 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md md:w-[300px] md:p-5"
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    transform: openLeft
                      ? "translate(calc(-100% - 28px), -50%)"
                      : "translate(28px, -50%)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(null)}
                    aria-label="Close"
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                  <p className="pr-8 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                    {h.tagline}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-semibold leading-tight text-white md:text-xl">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/75 md:text-sm">
                    {h.body}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Hotspot pieces — numbered marker, side-anchored card, corner bracket
// -----------------------------------------------------------------------------

function HotspotMarker({
  index,
  hotspot,
  active,
  onClick,
}: {
  index: number;
  hotspot: (typeof HOME_HOTSPOTS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-label={`${hotspot.title} — ${hotspot.body}`}
      data-dth-hotspot
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      {/* Static halo ring behind the badge */}
      {!active && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30"
        />
      )}
      {/* Expanding pulse ring on idle */}
      {!active && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-cyan-300/60"
        />
      )}

      {/* Numbered badge */}
      <span
        className={`relative grid h-9 w-9 place-items-center rounded-full border-2 font-display text-[11px] font-semibold tabular-nums transition-all duration-300 md:h-10 md:w-10 md:text-xs ${
          active
            ? "scale-110 border-cyan-300 bg-cyan-300 text-black shadow-[0_0_30px_rgba(103,232,249,0.8)]"
            : "border-cyan-300/70 bg-black/60 text-white backdrop-blur-md group-hover:scale-110 group-hover:border-cyan-300 group-hover:bg-cyan-300/15"
        }`}
      >
        {num}
      </span>

      {/* Hover title chip (desktop only) */}
      {!active && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/85 px-2.5 py-1 font-display text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity duration-200 md:block md:group-hover:opacity-100">
          {hotspot.title}
        </span>
      )}
    </button>
  );
}

function CornerBracket({
  pos,
}: {
  pos: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const classMap = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3 scale-x-[-1]",
    "bottom-left": "bottom-3 left-3 scale-y-[-1]",
    "bottom-right": "bottom-3 right-3 scale-x-[-1] scale-y-[-1]",
  };
  return (
    <svg
      aria-hidden
      data-dth-corner
      className={`pointer-events-none absolute h-6 w-6 ${classMap[pos]}`}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transformOrigin: "center center" }}
    >
      <path
        d="M2 8 V2 H8"
        stroke="#67E8F9"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// =============================================================================
// 03. Where the Energy Begins (brief Panel 03)
// =============================================================================
// Component selector (Solar / Grid / Battery / Building). Centre: a 4-node
// flow diagram around the SOURCE hub. Selecting a component highlights its
// path and reveals a short explanation.
//
// Per brief: "Animated lines or pulses indicate flow only where the direction
// is technically accurate." Lines render as faint dashes by default; the
// active component's line animates with a dash march. Confirm each flow
// direction with the product team before shipping to prod.
// =============================================================================

// Pin runs through 5 snap states:
//   p=0  Initial 3-card view + heading & description visible
//   p=1  Solar grown to fit section height; sides faded; heading faded; carousel ready
//   p=2  Grid centred (Solar left peek, Battery right peek) — horizontal carousel
//   p=3  Battery centred (Grid left peek, Building right peek)
//   p=4  Building centred (Battery left peek)
// Base card is 50vw × 70vh. At carousel scale 1.0 → 50vw × 70vh; horizontal
// positions ±50vw give a clean 25vw-peek / 50vw-centre / 25vw-peek layout.
// posY shifts the card's vertical centre (in vh). At p=0 cards sit 12vh
// below viewport centre so they don't overlap the heading at top; by p=0.5
// they're centred and heading has faded out.
type WteState = { pos: number; posY: number; scale: number; textOp: number };

// Base card: 50vw × 80vh. Carousel scale 1.25 → 62.5vw × 100vh (fills full
// viewport height). SLIDE_DIST = 68vw between adjacent cards → ~5vw gap +
// ~13vw peek on each side.
const WTE_KEYFRAMES: Record<number, Array<{ p: number } & WteState>> = {
  // Carousel centre at pos -12 (tight ~4vw left margin). SLIDE_DIST = 68 for
  // very tight ~0.5vw gap between cards.
  0: [
    { p: 0, pos: 0, posY: 15, scale: 0.7, textOp: 0 },      // 3-card centre
    { p: 1, pos: -12, posY: 0, scale: 1.35, textOp: 1 },    // CAROUSEL start: centred + TEXT
    { p: 1.3, pos: -32, posY: 0, scale: 1.35, textOp: 0 },
    { p: 2, pos: -80, posY: 0, scale: 1.35, textOp: 0 },    // left peek
    { p: 3, pos: -148, posY: 0, scale: 1.35, textOp: 0 },
    { p: 4, pos: -192, posY: 0, scale: 1.35, textOp: 0 },
  ],
  1: [
    { p: 0, pos: 32, posY: 15, scale: 0.45, textOp: 0 },
    { p: 1, pos: 56, posY: 0, scale: 1.35, textOp: 0 },     // right peek
    { p: 1.8, pos: 2, posY: 0, scale: 1.35, textOp: 0 },
    { p: 2, pos: -12, posY: 0, scale: 1.35, textOp: 1 },    // centred + TEXT
    { p: 2.3, pos: -32, posY: 0, scale: 1.35, textOp: 0 },
    { p: 3, pos: -80, posY: 0, scale: 1.35, textOp: 0 },    // left peek
    { p: 4, pos: -124, posY: 0, scale: 1.35, textOp: 0 },
  ],
  2: [
    { p: 0, pos: 124, posY: 0, scale: 0, textOp: 0 },
    { p: 1, pos: 124, posY: 0, scale: 1.35, textOp: 0 },
    { p: 2, pos: 56, posY: 0, scale: 1.35, textOp: 0 },     // right peek
    { p: 2.8, pos: 2, posY: 0, scale: 1.35, textOp: 0 },
    { p: 3, pos: -12, posY: 0, scale: 1.35, textOp: 1 },    // centred + TEXT
    { p: 3.3, pos: -25, posY: 0, scale: 1.35, textOp: 0 }, // text-fade only; linear slide path to p=4
    { p: 4, pos: -56, posY: 0, scale: 1.35, textOp: 0 },    // left peek, matches Building's slide rate
  ],
  3: [
    { p: 0, pos: -32, posY: 15, scale: 0.45, textOp: 0 },
    { p: 0.3, pos: -32, posY: 0, scale: 0, textOp: 0 },
    { p: 0.8, pos: 192, posY: 0, scale: 0, textOp: 0 },
    { p: 1, pos: 192, posY: 0, scale: 1.35, textOp: 0 },
    { p: 2, pos: 124, posY: 0, scale: 1.35, textOp: 0 },
    { p: 3, pos: 56, posY: 0, scale: 1.35, textOp: 0 },     // right peek
    { p: 3.8, pos: 21, posY: 0, scale: 1.35, textOp: 0 },   // on linear path to p=4 (56 → 12)
    { p: 4, pos: 12, posY: 0, scale: 1.35, textOp: 1 },     // centred-right (final) + TEXT
  ],
};

const WTE_PROGRESS_MAX = 4;

const interpWteCard = (cardIndex: number, p: number): WteState => {
  const kf = WTE_KEYFRAMES[cardIndex];
  if (!kf || kf.length === 0) return { pos: 0, posY: 0, scale: 1, textOp: 0 };
  if (p <= kf[0].p)
    return { pos: kf[0].pos, posY: kf[0].posY, scale: kf[0].scale, textOp: kf[0].textOp };
  const last = kf[kf.length - 1];
  if (p >= last.p)
    return { pos: last.pos, posY: last.posY, scale: last.scale, textOp: last.textOp };
  for (let j = 0; j < kf.length - 1; j++) {
    const a = kf[j];
    const b = kf[j + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      return {
        pos: a.pos + (b.pos - a.pos) * t,
        posY: a.posY + (b.posY - a.posY) * t,
        scale: a.scale + (b.scale - a.scale) * t,
        textOp: a.textOp + (b.textOp - a.textOp) * t,
      };
    }
  }
  return { pos: 0, posY: 0, scale: 1, textOp: 0 };
};

function WhereTheEnergyBegins() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const total = ENERGY_COMPONENTS.length;

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const cards = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-wte-card]")
    );
    const texts = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-wte-card-text]")
    );

    const PROGRESS_MAX = WTE_PROGRESS_MAX;
    const progress = { value: 0 };

    const update = () => {
      const overlays = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-wte-card-overlay]")
      );
      cards.forEach((card, pinIdx) => {
        const i = Number(card.dataset.cardIndex ?? pinIdx);
        const { pos, posY, scale, textOp } = interpWteCard(i, progress.value);
        const opacity = scale <= 0.15 ? scale / 0.15 : 1;
        card.style.transform = `translate3d(calc(${pos.toFixed(
          2
        )}vw - 50%), calc(-50% + ${posY.toFixed(2)}vh), 0) scale(${scale.toFixed(3)})`;
        card.style.opacity = `${opacity.toFixed(3)}`;
        card.style.zIndex = `${Math.round(scale * 100)}`;
        const text = texts[pinIdx];
        if (text) text.style.opacity = `${textOp.toFixed(3)}`;
        const overlay = overlays[pinIdx];
        if (overlay) overlay.style.opacity = `${textOp.toFixed(3)}`;
      });
      // Pin heading + description — visible at p=0, fades out by p=0.5 as the
      // cards finish centring and Solar grows to fit the section.
      const pinHead = stage.querySelector<HTMLElement>("[data-wte-pin-head]");
      if (pinHead) {
        const op = Math.max(0, 1 - progress.value / 0.5);
        pinHead.style.opacity = `${op.toFixed(3)}`;
      }
    };

    const onResize = () => update();
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      // Pin + scrub through 5 snap states. 100% viewport per progress unit
      // (p 0→4) = 400% total scroll so each flick lands cleanly on the next
      // snap stop.
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: `+=${PROGRESS_MAX * 100}%`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (value) => {
            const stops = PROGRESS_MAX;
            return Math.round(value * stops) / stops;
          },
          duration: 0.4,
          delay: 0.4,
          ease: "power2.out",
        },
        onUpdate: (self) => {
          progress.value = self.progress * PROGRESS_MAX;
          update();
        },
      });

      const words = gsap.utils.toArray<HTMLElement>("[data-wte-word]");
      if (words.length) {
        gsap.set(words, { color: "rgba(255,255,255,0.2)" });
        gsap.to(words, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 2.4 },
          scrollTrigger: {
            trigger: "[data-wte-heading]",
            start: "top 85%",
            end: "+=120%",
            scrub: 0.6,
          },
        });
      }
    }, section);

    update();
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [total]);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A]">
      <GridBackdrop />

      {/* Single pinned stage. p=0 shows heading + 3-card view; p=1 Solar fits
          section height; p=2-4 horizontal carousel through all four cards. */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Heading + description — visible at p=0, fades out as cards grow */}
        <div
          data-wte-pin-head
          className="absolute inset-x-0 top-0 z-20 px-6 pt-14 text-center md:pt-16"
        >
          <p data-wte-eyebrow className="eyebrow !text-xs !tracking-[0.22em] !text-white/50">
            Where the energy begins
          </p>
          <h2
            data-wte-heading
            className="mx-auto mt-3 max-w-4xl font-display font-semibold leading-[1.06] text-white text-[42px] md:mt-4 md:leading-[1.05]"
          >
            {"Solar, grid and battery working together.".split(" ").map((w, i, arr) => (
              <Fragment key={i}>
                <span data-wte-word className="inline-block">{w}</span>
                {i < arr.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/60">
            Choose a component to see how energy moves through your SOURCE system.
          </p>
        </div>

        {/* Four cards — Solar, Grid, Battery, Building */}
        {ENERGY_COMPONENTS.map((c, i) => (
          <div
            key={c.id}
            data-wte-card
            data-card-index={i}
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-white/[0.06] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            style={{
              width: "50vw",
              height: "65vh",
              transform: "translate3d(calc(0vw - 50%), -50%, 0) scale(1)",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            {c.image.endsWith(".mp4") ? (
              <video
                src={c.image}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={c.label}
                className="h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={c.image}
                alt={c.label}
                className="h-full w-full object-cover"
              />
            )}
            {c.id === "solar" && !c.image.endsWith(".mp4") && (
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1718 861"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <filter id="wtePipeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.2" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Pipe traces over the diagram's conduits. Each pipe = faint solid
                    base stroke (always visible) + a short bright dash that travels
                    along the path to suggest current flow. Coordinates are in the
                    image's 1718×861 space; nudge endpoints to align with artwork. */}
                <g
                  fill="none"
                  stroke="#67E8F9"
                  strokeLinecap="round"
                  filter="url(#wtePipeGlow)"
                >
                  {/* Solar panel → vertical drop to horizontal bus */}
                  <path d="M865,360 L865,540" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M865,360 L865,540"
                    strokeWidth="3"
                    strokeDasharray="28 220"
                    className="animate-[wtePipeFlow_2s_linear_infinite]"
                  />
                  {/* Horizontal bus across the house */}
                  <path d="M595,540 L1150,540" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M595,540 L1150,540"
                    strokeWidth="3"
                    strokeDasharray="28 240"
                    className="animate-[wtePipeFlow_2.2s_linear_infinite]"
                  />
                  {/* Drop to left wall-mount unit */}
                  <path d="M595,540 L595,620" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M595,540 L595,620"
                    strokeWidth="3"
                    strokeDasharray="20 120"
                    className="animate-[wtePipeFlow_1.6s_linear_infinite]"
                  />
                  {/* Drop to mid wall-mount unit */}
                  <path d="M750,540 L750,620" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M750,540 L750,620"
                    strokeWidth="3"
                    strokeDasharray="20 120"
                    className="animate-[wtePipeFlow_1.6s_linear_infinite]"
                  />
                  {/* Drop into SOURCE unit */}
                  <path d="M870,540 L870,640" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M870,540 L870,640"
                    strokeWidth="3"
                    strokeDasharray="22 140"
                    className="animate-[wtePipeFlow_1.8s_linear_infinite]"
                  />
                  {/* Out to the living-area load on the right */}
                  <path d="M1150,540 L1150,620" strokeWidth="2.5" opacity="0.35" />
                  <path
                    d="M1150,540 L1150,620"
                    strokeWidth="3"
                    strokeDasharray="20 120"
                    className="animate-[wtePipeFlow_1.6s_linear_infinite]"
                  />
                </g>
              </svg>
            )}
            {/* Dark gradient overlay behind the text block — fades in on the
                same opacity curve as the text (bound via [data-wte-card-overlay]
                in the update loop). Keeps labels readable over bright scenes. */}
            <div
              data-wte-card-overlay
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/65 via-black/25 to-transparent"
              style={{ opacity: 0 }}
            />
            <div
              data-wte-card-text
              className="absolute inset-x-0 bottom-0 p-6 md:p-8"
              style={{ opacity: 0 }}
            >
              <div>
                <p
                  className="font-display font-medium uppercase text-white/80"
                  style={{
                    textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                    fontSize: "10px",
                    letterSpacing: "0.22em",
                  }}
                >
                  {c.tag}
                </p>
                <h3
                  className="mt-2 font-display font-semibold leading-tight text-white"
                  style={{
                    textShadow: "0 2px 14px rgba(0,0,0,0.6)",
                    fontSize: "clamp(20px, 2.6vw, 32px)",
                  }}
                >
                  {c.label}
                </h3>
                <p
                  className="mt-2 font-medium leading-tight text-white md:mt-3"
                  style={{
                    textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                    fontSize: "clamp(10px, 0.85vw, 13px)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes wteSolarCurrent {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes wtePipeFlow {
          to { stroke-dashoffset: -36; }
        }
      `}</style>
    </section>
  );
}

// =============================================================================
// 04. Meet SOURCE (brief Panel 04)
// =============================================================================
// Product render + four verified headline specs + full spec accordion + model
// dimensions. The accordion data lives in SPECS above and is [VERIFY] until
// product-team sign-off.
// =============================================================================

function MeetSOURCE() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-meet-stat], [data-meet-head]", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-meet-pin]", start: "top 75%" },
      });

      // Word-by-word scrub reveal on the heading — mirrors §2 / §3 / §8.
      const words = gsap.utils.toArray<HTMLElement>("[data-meet-word]");
      if (words.length) {
        gsap.set(words, { color: "rgba(255,255,255,0.2)" });
        gsap.to(words, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 1.5 },
          scrollTrigger: {
            trigger: "[data-meet-heading]",
            start: "top 85%",
            end: "+=90%",
            scrub: 0.6,
          },
        });
      }

      // Pin the hero area so the user dwells on the SOURCE reveal.
      ScrollTrigger.create({
        trigger: "[data-meet-pin]",
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // Stroke-draw reveal — cyan paths trace the SOURCE device, then the
      // panel + branding fade in. Plays on a continuous loop; each iteration
      // snaps state back to "undrawn + fills hidden" via onRepeat so the full
      // draw-in sequence plays every cycle.
      const resetMeet = () => {
        gsap.set("[data-meet-stroke]", { strokeDashoffset: 1000, autoAlpha: 1 });
        gsap.set("[data-meet-fill], [data-meet-stroke-text]", { autoAlpha: 0 });
      };
      resetMeet();

      const drawTl = gsap.timeline({
        repeat: -1,
        onRepeat: resetMeet,
      });

      // Breathing cyan glow — slow sine pulse on the SVG filter.
      gsap.to("[data-meet-visual] svg", {
        filter:
          "drop-shadow(0 0 20px rgba(103, 232, 249, 0.85)) drop-shadow(0 0 50px rgba(103, 232, 249, 0.5))",
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      drawTl
        .to('[data-meet-stroke][data-order="1"]', {
          strokeDashoffset: 0,
          duration: 5,
          ease: "power2.inOut",
        })
        .to('[data-meet-stroke][data-order="2"]', {
          strokeDashoffset: 0,
          duration: 4,
          ease: "power2.inOut",
        }, "-=1.5")
        .to('[data-meet-stroke][data-order="3"]', {
          strokeDashoffset: 0,
          duration: 3,
          ease: "power2.inOut",
        }, "-=1.5")
        .to("[data-meet-fill], [data-meet-stroke-text]", {
          autoAlpha: 1,
          duration: 2.5,
          ease: "power2.out",
        }, "-=1")
        // Hold the finished composition, then fade everything out before the
        // next iteration snaps strokes back to undrawn via onRepeat.
        .to({}, { duration: 2.5 })
        .to("[data-meet-stroke], [data-meet-fill], [data-meet-stroke-text]", {
          autoAlpha: 0,
          duration: 1.8,
          ease: "power2.in",
        });

    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A]">
      {/* Pinned hero — heading above, SVG centered, stats below */}
      <div data-meet-pin className="relative min-h-screen w-full">
        <Shell className="relative flex min-h-screen flex-col items-center justify-center py-16 text-center">
          <p data-meet-head className="eyebrow !text-xs !tracking-[0.22em] !text-white/50">
            Meet SOURCE
          </p>
          <h2
            data-meet-head
            data-meet-heading
            className="mt-3 max-w-4xl font-display text-[42px] font-semibold leading-tight text-white"
          >
            {"A smart solar hybrid energy system designed for modern homes.".split(" ").map((w, i, arr) => (
              <Fragment key={i}>
                <span data-meet-word className="inline-block">{w}</span>
                {i < arr.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h2>

          {/* Orbit layout — 2 stats to the left of the product, 2 to the right.
              Mobile falls back to product centered + 2x2 stats below. */}
          <div className="mt-6 w-full md:mt-10 md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-8 lg:gap-16">
            {/* Left-side stats — right-aligned, top & bottom */}
            <div className="hidden md:flex md:flex-col md:items-end md:justify-between md:py-10 md:text-right">
              <div data-meet-stat>
                <div className="h-px w-10 bg-cyan-300/50 ml-auto mb-3" aria-hidden />
                <p className="font-display text-lg font-semibold text-cyan-300 lg:text-2xl">
                  {BIG_STATS[0].value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50 lg:text-sm">
                  {BIG_STATS[0].label}
                </p>
              </div>
              <div data-meet-stat>
                <div className="h-px w-10 bg-cyan-300/50 ml-auto mb-3" aria-hidden />
                <p className="font-display text-lg font-semibold text-cyan-300 lg:text-2xl">
                  {BIG_STATS[2].value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50 lg:text-sm">
                  {BIG_STATS[2].label}
                </p>
              </div>
            </div>

            {/* Stroke-draw product reveal — centered focal point, with subtle dark ambient well behind */}
            <div data-meet-visual className="relative mx-auto flex items-center justify-center">
              {/* Soft dark glow behind the product — deep radial well that makes the cyan outline pop */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 scale-[1.9] bg-[radial-gradient(45%_55%_at_50%_50%,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.4)_45%,transparent_80%)] blur-2xl"
              />
            <div
              className="relative"
              style={{
                width: "min(45vw, 240px)",
                aspectRatio: "1041 / 1510",
              }}
            >
              {/* Product photo behind the wireframe — the SVG traces the
                  same outline on top in an endless loop. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/source/product.png"
                alt="SOURCE device"
                className="absolute inset-0 h-full w-full object-contain"
              />

              {/* SOURCE device neon-glow wireframe — paths render inside a layered
                  Gaussian-blur filter so the strokes read as soft cyan light rather
                  than sharp lines. (viewBox 1041×1510). */}
              <svg
                viewBox="0 0 1041 1510"
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                aria-hidden
                style={{
                  filter:
                    "drop-shadow(0 0 22px rgba(103, 232, 249, 0.8)) drop-shadow(0 0 60px rgba(103, 232, 249, 0.45))",
                }}
              >
                <defs>
                  {/* Three-layer neon glow — tight core blur, mid bloom, far halo.
                      Merged with the sharp source on top so the outline stays
                      readable while the glow radiates outward. */}
                  <filter
                    id="meetGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    filterUnits="objectBoundingBox"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="g1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="g2" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="g3" />
                    <feMerge>
                      <feMergeNode in="g3" />
                      <feMergeNode in="g2" />
                      <feMergeNode in="g2" />
                      <feMergeNode in="g1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g filter="url(#meetGlow)">
                  {/* Outer frame — full device silhouette with bottom notch */}
                  <path
                    data-meet-stroke
                    data-order="1"
                    d="M158 80 H870 Q900 80 900 112 V1300 Q900 1335 865 1335 H710 Q680 1335 680 1360 Q680 1390 650 1390 H390 Q360 1390 360 1360 Q360 1335 330 1335 H155 Q120 1335 120 1300 V112 Q120 80 158 80 Z"
                    fill="none"
                    stroke="#67E8F9"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    pathLength={1000}
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />

                  {/* Left diagonal — top corner to panel apex */}
                  <path
                    data-meet-stroke
                    data-order="2"
                    d="M130 105 L405 775"
                    fill="none"
                    stroke="#67E8F9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    pathLength={1000}
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />

                  {/* Right diagonal — top corner to panel apex */}
                  <path
                    data-meet-stroke
                    data-order="2"
                    d="M890 105 L615 775"
                    fill="none"
                    stroke="#67E8F9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    pathLength={1000}
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />

                  {/* SOURCE badge pill outline */}
                  <rect
                    data-meet-stroke
                    data-order="2"
                    x="285"
                    y="245"
                    width="455"
                    height="76"
                    rx="38"
                    fill="none"
                    stroke="#67E8F9"
                    strokeWidth="3"
                    pathLength={1000}
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />

                  {/* Bottom panel outline */}
                  <path
                    data-meet-stroke
                    data-order="3"
                    d="M405 775 L615 775 L870 1325 H710 Q680 1325 680 1360 Q680 1385 650 1385 H390 Q360 1385 360 1360 Q360 1325 330 1325 H145 Z"
                    fill="none"
                    stroke="#67E8F9"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    pathLength={1000}
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />
                </g>
              </svg>
            </div>
            </div>

            {/* Right-side stats — left-aligned, top & bottom */}
            <div className="hidden md:flex md:flex-col md:items-start md:justify-between md:py-10 md:text-left">
              <div data-meet-stat>
                <div className="h-px w-10 bg-cyan-300/50 mb-3" aria-hidden />
                <p className="font-display text-lg font-semibold text-cyan-300 lg:text-2xl">
                  {BIG_STATS[1].value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50 lg:text-sm">
                  {BIG_STATS[1].label}
                </p>
              </div>
              <div data-meet-stat>
                <div className="h-px w-10 bg-cyan-300/50 mb-3" aria-hidden />
                <p className="font-display text-lg font-semibold text-cyan-300 lg:text-2xl">
                  {BIG_STATS[3].value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50 lg:text-sm">
                  {BIG_STATS[3].label}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-only 2x2 stats grid below the product */}
          <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-6 md:hidden">
            {BIG_STATS.map((s) => (
              <div key={s.label} data-meet-stat className="text-center">
                <div className="h-px w-8 bg-cyan-300/50 mx-auto mb-2" aria-hidden />
                <p className="font-display text-xl font-semibold text-cyan-300">
                  {s.value}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Shell>
      </div>

    </section>
  );
}

// =============================================================================
// Take a closer look — spec accordion + product render, pinned with image crossfade
// =============================================================================

function TakeACloserLook() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // Word-by-word scrub reveal on the heading — faded → white → cyan → white.
      const techWords = gsap.utils.toArray<HTMLElement>("[data-tech-word]");
      if (techWords.length) {
        gsap.set(techWords, { color: "rgba(255,255,255,0.2)" });
        gsap.to(techWords, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 1.5 },
          scrollTrigger: {
            trigger: "[data-tech-heading]",
            start: "top 85%",
            end: "+=90%",
            scrub: 0.6,
          },
        });
      }

      // Pin the block for 3 viewport-heights; three product images crossfade through the pin.
      gsap.set('[data-tech-image="1"], [data-tech-image="2"]', { autoAlpha: 0 });

      const techTl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-tech-pin]",
          start: "top top",
          end: "+=300%",
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      techTl
        .to('[data-tech-image="0"]', { autoAlpha: 0, duration: 0.15, ease: "none" }, 0.9)
        .to('[data-tech-image="1"]', { autoAlpha: 1, duration: 0.15, ease: "none" }, 1.05)
        .to('[data-tech-image="1"]', { autoAlpha: 0, duration: 0.15, ease: "none" }, 1.9)
        .to('[data-tech-image="2"]', { autoAlpha: 1, duration: 0.15, ease: "none" }, 2.05)
        .to({}, { duration: 0.7 });

      // 3D cyan glow backdrop — two layered radial halos breathing at different cadences.
      gsap.to("[data-tech-glow-outer]", {
        scale: 1.12,
        opacity: 0.9,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-tech-glow-inner]", {
        scale: 1.18,
        opacity: 1,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      <div
        data-tech-pin
        className="relative flex min-h-[720px] w-full flex-col bg-[#1A1A1A] text-white md:h-screen md:min-h-[760px]"
      >
        <Shell className="relative flex h-full flex-col justify-center pb-10 pt-24 md:pb-14 md:pt-28">
          {/* Heading indented to the pill column's left edge; description top-
              aligns with the heading's first line on the right. */}
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr] md:items-start md:gap-14 lg:gap-20">
            <h2
              data-tech-heading
              className="text-left font-display text-[42px] font-semibold leading-[1.05] tracking-tight text-white md:pl-16"
            >
              {"Take a closer look.".split(" ").map((w, i, arr) => (
                <Fragment key={i}>
                  <span data-tech-word className="inline-block">
                    {w}
                  </span>
                  {i < arr.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </h2>
            <p className="max-w-md text-left text-[16px] leading-relaxed text-white/60 md:ml-auto">
              Every SOURCE unit is engineered to IEC standards and shipped with a full datasheet — inverter, battery, and system specs, one document.
            </p>
          </div>

          <div className="mt-6 grid flex-1 gap-6 md:mt-8 md:grid-cols-2 md:items-center md:gap-14">
            {/* Left — nav arrows + expandable feature pills + CTA */}
            <div className="relative order-2 md:order-1">
              {/* Vertical nav arrows — cycle through features */}
              <div className="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                <button
                  type="button"
                  aria-label="Previous feature"
                  onClick={() =>
                    setOpenIndex((prev) => {
                      const n = SPECS.length + 2;
                      const base = prev ?? 0;
                      return (base - 1 + n) % n;
                    })
                  }
                  className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next feature"
                  onClick={() =>
                    setOpenIndex((prev) => {
                      const n = SPECS.length + 2;
                      const base = prev ?? 0;
                      return (base + 1) % n;
                    })
                  }
                  className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Spec group list — dark rounded cards; +/- button on the LEFT
                  of the title controls open/close. Scroll does NOT affect the
                  accordion state, only the right-hand image. */}
              <div className="space-y-3 md:pl-16">
                {SPECS.map((group, i) => {
                  const isOpen = openIndex === i;
                  if (isOpen) {
                    return (
                      <div
                        key={group.group}
                        className="rounded-xl border border-white/10 bg-white/[0.035] p-5 md:p-6"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenIndex(null)}
                          aria-expanded={true}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                              <path d="M5 12h14" />
                            </svg>
                          </span>
                          <span className="font-display text-base font-semibold text-white md:text-lg">
                            {group.group}
                          </span>
                        </button>
                        <dl className="mt-4 divide-y divide-white/10">
                          {group.rows.map(([k, v]) => (
                            <div
                              key={k}
                              className="grid grid-cols-1 gap-1 py-2.5 md:grid-cols-[1fr_1fr] md:gap-6"
                            >
                              <dt className="text-sm text-white/60">{k}</dt>
                              <dd className="text-sm font-medium text-white">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={group.group}
                      type="button"
                      onClick={() => setOpenIndex(i)}
                      aria-expanded={false}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.06] md:py-4"
                    >
                      <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                      </span>
                      <span className="font-display text-sm font-semibold text-white md:text-base">
                        {group.group}
                      </span>
                    </button>
                  );
                })}

                {/* Model dimensions — fourth pill (index === SPECS.length) */}
                {openIndex === SPECS.length ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(null)}
                      aria-expanded={true}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <path d="M5 12h14" />
                        </svg>
                      </span>
                      <span className="font-display text-base font-semibold text-white md:text-lg">
                        Model dimensions
                      </span>
                    </button>
                    <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-[15px]">
                      Compact enough for any wall, engineered to fit in tight installations.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(SPECS.length)}
                    aria-expanded={false}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.06] md:py-4"
                  >
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                    <span className="font-display text-sm font-semibold text-white md:text-base">
                      Model dimensions
                    </span>
                  </button>
                )}

                {/* Resources — fifth pill (index === SPECS.length + 1). Expanded
                    body offers the downloadable spec sheet and a Request a Quote
                    CTA that routes to the contact form. */}
                {openIndex === SPECS.length + 1 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(null)}
                      aria-expanded={true}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <path d="M5 12h14" />
                        </svg>
                      </span>
                      <span className="font-display text-base font-semibold text-white md:text-lg">
                        Resources
                      </span>
                    </button>
                    <div className="mt-4 space-y-3">
                      <a
                        href="/Source 6.5 kWh Data Sheet.pdf"
                        download
                        className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                      >
                        <span className="font-display text-sm font-medium text-white md:text-[15px]">
                          Specification Sheet
                        </span>
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-white/80 transition group-hover:border-white group-hover:text-white">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 4v12" />
                            <path d="M6 12l6 6 6-6" />
                            <path d="M5 20h14" />
                          </svg>
                        </span>
                      </a>
                      <a
                        href="/contact"
                        className="group relative inline-flex items-center gap-3 rounded-md border border-white/20 py-2 pl-2 pr-2 font-display text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
                      >
                        {/* Left arrow slot — visible by default, fades + slides up on hover */}
                        <span
                          aria-hidden
                          className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-black opacity-100 transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:opacity-0"
                        >
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-out group-hover:-translate-y-6" />
                        </span>
                        <span>Request a Quote</span>
                        {/* Right arrow slot — hidden by default, fades + slides up into view on hover */}
                        <span
                          aria-hidden
                          className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:opacity-100"
                        >
                          <ArrowRight className="h-3 w-3 translate-y-6 transition-transform duration-300 ease-out group-hover:translate-y-0" />
                        </span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(SPECS.length + 1)}
                    aria-expanded={false}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.06] md:py-4"
                  >
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40 text-white md:h-8 md:w-8">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                    <span className="font-display text-sm font-semibold text-white md:text-base">
                      Resources
                    </span>
                  </button>
                )}
              </div>

            </div>

            {/* Right — product render. Three stacked images (s1 / s2 / s3)
                crossfade through the pin, one per viewport-height of scroll.
                A layered cyan 3D glow sits behind the image and breathes via
                GSAP (see data-tech-glow-* tweens) for a sense of depth. */}
            <div className="order-1 flex items-center justify-center md:order-2 md:h-full">
              <div className="relative mx-auto w-full max-w-[420px] aspect-[4/5] md:aspect-auto md:h-[62vh] md:max-h-[540px]">
                {/* 3D cyan glow backdrop — two radial layers at different
                    sizes/intensities, each on its own breathing cadence. */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
                  <div
                    data-tech-glow-outer
                    className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(103, 232, 249, 0.45) 0%, rgba(103, 232, 249, 0.18) 42%, rgba(103, 232, 249, 0) 72%)",
                      filter: "blur(70px)",
                    }}
                  />
                  <div
                    data-tech-glow-inner
                    className="absolute left-1/2 top-1/2 h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(103, 232, 249, 0.55) 0%, rgba(103, 232, 249, 0.0) 70%)",
                      filter: "blur(45px)",
                    }}
                  />
                </div>
                {["/source/s1.png", "/source/s2.png", "/source/s3.png"].map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    data-tech-image={i}
                    src={src}
                    alt={`SOURCE — view ${i + 1}`}
                    className="absolute inset-0 z-10 h-full w-full object-contain"
                    style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Shell>
      </div>
    </section>
  );
}


// =============================================================================
// Connected Bridge — visual connector between MeetSOURCE (hardware) and
// EnergyMeetsIntelligence (app/software). Vertical cyan line entering from
// above, glowing icon badge in the middle, line continuing down, then the
// bridging headline + sub-copy. Sigenergy-style.
// =============================================================================

function ConnectedBridge() {
  return (
    <section
      aria-hidden
      className="relative -mt-4 -mb-6 w-full overflow-hidden bg-[#0A0A0A] md:-mt-8 md:-mb-10"
    >
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center px-6 md:px-14">
        {/* Top frame — a rounded-rectangle outline that visually bridges the
            section above. Below it, a short line drops down to the icon badge.
            A bright cyan pulse travels clockwise along the perimeter and
            continues down the drop line. */}
        <div className="pointer-events-none relative -mb-2 w-full max-w-[640px]">
          <svg
            viewBox="0 0 640 180"
            className="h-auto w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="bridgeFrame" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
              </linearGradient>
            </defs>
            {/* Open-top dim-white frame — sides emerge from the section above
                (top fades to transparent) and close with a rounded bottom. */}
            <path
              d="M 20 0 L 20 111 Q 20 131, 40 131 L 600 131 Q 620 131, 620 111 L 620 0"
              fill="none"
              stroke="url(#bridgeFrame)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Dim-white drop line from frame bottom to icon badge */}
            <line
              x1="320" y1="131"
              x2="320" y2="180"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />

            {/* LEFT cyan beam — enters at the top-left tip, flows down the
                left side, across the bottom toward the center, then down the
                drop line into the icon badge. */}
            <path
              d="M 20 0 L 20 111 Q 20 131, 40 131 L 320 131 L 320 180"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="16 84"
              style={{
                filter:
                  "drop-shadow(0 0 4px rgba(103,232,249,0.95)) drop-shadow(0 0 8px rgba(103,232,249,0.5))",
              }}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </path>

            {/* RIGHT cyan beam — mirror of the left, enters at the top-right
                tip, flows down, across the bottom toward the center, and down
                the drop line. Runs in sync so both converge on the icon. */}
            <path
              d="M 620 0 L 620 111 Q 620 131, 600 131 L 320 131 L 320 180"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="16 84"
              style={{
                filter:
                  "drop-shadow(0 0 4px rgba(103,232,249,0.95)) drop-shadow(0 0 8px rgba(103,232,249,0.5))",
              }}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Glowing icon badge */}
        <div className="relative my-1">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(103,232,249,0.4) 0%, rgba(14,165,233,0.15) 40%, transparent 72%)",
              filter: "blur(28px)",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-300/30 animate-[bridgePulse_3.2s_ease-out_infinite]" />

          <div
            className="relative grid h-16 w-16 place-items-center rounded-2xl md:h-20 md:w-20"
            style={{
              background:
                "linear-gradient(145deg, rgba(103,232,249,0.3) 0%, rgba(14,165,233,0.18) 40%, rgba(10,10,10,0.9) 100%)",
              boxShadow:
                "0 0 40px rgba(103,232,249,0.35), inset 0 0 0 1px rgba(103,232,249,0.4), inset 0 0 30px rgba(103,232,249,0.15)",
            }}
          >
            <svg
              viewBox="0 0 48 48"
              className="h-7 w-7 text-cyan-300 md:h-9 md:w-9"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(103,232,249,0.9))" }}
            >
              <rect x="6" y="6" width="36" height="36" rx="10" strokeWidth="1.5" opacity="0.5" />
              <path
                d="M27 12 L17 26 L23 26 L21 36 L31 22 L25 22 Z"
                strokeWidth="2"
                fill="rgba(103,232,249,0.25)"
              />
            </svg>
          </div>
        </div>

        {/* Bottom connector — dim-white base + cyan flowing pulse */}
        <div className="pointer-events-none relative h-20 w-px overflow-hidden md:h-28">
          <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/30" />
          <span
            className="absolute left-0 h-8 w-full bg-gradient-to-b from-transparent via-cyan-200 to-transparent"
            style={{
              animation: "bridgeFlowDown 2.2s linear infinite",
              boxShadow:
                "0 0 10px rgba(103,232,249,0.9), 0 0 20px rgba(103,232,249,0.5)",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes bridgePulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        @keyframes bridgeFlowDown {
          0% { top: -32px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// =============================================================================
// 05. Energy Meets Intelligence (brief Panel 05)
// =============================================================================
// Monitor, manage and control from anywhere. Tab list + phone mockup + download
// row. All on-screen metrics are [ILLUSTRATIVE] demo data — the badge in the
// mockup caption must stay visible to the user.
// =============================================================================

function EnergyMeetsIntelligence() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const AUTO_MS = 4500;

  // Auto-cycle through feature tabs — pauses on hover / after manual select
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % APP_FEATURES.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const selectTab = (i: number) => {
    setActive(i);
    setPaused(true);
    window.setTimeout(() => setPaused(false), AUTO_MS * 2);
  };

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-emi-head], [data-emi-showcase], [data-emi-tabs]", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%" },
      });

      const words = gsap.utils.toArray<HTMLElement>("[data-emi-word]");
      if (words.length) {
        gsap.set(words, { color: "rgba(255,255,255,0.2)" });
        gsap.to(words, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 1.5 },
          scrollTrigger: {
            trigger: "[data-emi-heading]",
            start: "top 90%",
            end: "+=70%",
            scrub: 0.6,
          },
        });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  const activeFeature = APP_FEATURES[active];
  const headingLine1 = "Monitor, manage and understand".split(" ");
  const headingLine2 = "from your phone or desktop.".split(" ");

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A] py-16 md:py-24">
      <div className="relative w-full">
        <Shell className="relative">
        <div data-emi-head className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
            Energy meets intelligence
          </p>
          <h2
            data-emi-heading
            className="mx-auto mt-3 max-w-4xl font-display text-[42px] font-semibold leading-[1.08] text-white md:mt-4"
          >
            <span className="block">
              {headingLine1.map((w, i, arr) => (
                <Fragment key={`l1-${i}`}>
                  <span data-emi-word className="inline-block">{w}</span>
                  {i < arr.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </span>
            <span className="block">
              {headingLine2.map((w, i, arr) => (
                <Fragment key={`l2-${i}`}>
                  <span data-emi-word className="inline-block">{w}</span>
                  {i < arr.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/60 md:mt-5">
            Energy status, usage, insights and controls — in a single, calm view.
          </p>
        </div>

        {/* Showcase — two-panel composition (phone left, laptop right) */}
        <div
          data-emi-showcase
          className="relative mt-8 md:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 85%)",
            }}
          />

          <div className="relative grid gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
            {/* LEFT PANEL — Phone / On your phone */}
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-white/[0.015] px-4 pb-10 pt-10 text-center shadow-[inset_0_0_60px_rgba(103,232,249,0.1),0_0_30px_rgba(103,232,249,0.08)] md:min-h-[720px] md:px-10 md:pb-16 md:pt-16">
              {/* Animated cyan beam chasing the border clockwise */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  padding: "1.5px",
                  background:
                    "conic-gradient(from var(--emi-angle), rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 68%, rgba(103,232,249,1) 82%, rgba(255,255,255,0.15) 95%)",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  animation: "emiBorderSpin 5s linear infinite",
                }}
              />

              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                On your phone
              </p>
              <h3 className="mt-2 max-w-sm font-display text-xl font-semibold leading-tight text-white md:mt-3 md:text-2xl lg:text-[28px]">
                Live energy status,<br />in your pocket.
              </h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/60 md:mt-3 md:text-sm">
                The SOURCE app gives homeowners a calm, real-time view of generation, storage and usage.
              </p>

              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[68%] -z-10 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgba(103,232,249,0.5) 0%, rgba(14,165,233,0.2) 40%, transparent 75%)",
                  filter: "blur(32px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[68%] -z-10 aspect-square h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 animate-[emiPulse_3.6s_ease-out_infinite]"
              />

              {/* Phone mockup */}
              <div className="group relative mt-10 h-[48vh] max-h-[520px] min-h-[380px] md:mt-14 md:h-[56vh]">
                <div className="relative aspect-[1/2] h-full">
                  {APP_FEATURES.map((f, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={f.id}
                      src={f.image}
                      alt={f.label}
                      aria-hidden={i !== active}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                        i === active ? "opacity-100" : "pointer-events-none opacity-0"
                      }`}
                    />
                  ))}
                </div>

                {/* Stats card — overlaid at the bottom of the phone on hover */}
                <div
                  key={`stats-${activeFeature.id}`}
                  className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto flex w-[88%] translate-y-3 items-stretch justify-between gap-2 rounded-xl border border-white/10 bg-[#0e1013]/85 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:bottom-6 md:gap-3 md:p-3"
                >
                  {activeFeature.chips.map((c, i) => (
                    <Fragment key={c.label}>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          aria-hidden
                          className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md md:h-8 md:w-8"
                          style={{
                            background: `linear-gradient(135deg, ${c.dot} 0%, ${c.dot}66 60%, rgba(14,16,19,0.6) 100%)`,
                            boxShadow: `0 0 16px ${c.dot}55, inset 0 0 0 1px rgba(255,255,255,0.08)`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                        </span>
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-[8px] font-medium uppercase tracking-[0.12em] text-white/50 md:text-[9px]">
                            {c.label}
                          </span>
                          <span className="truncate font-display text-xs font-semibold text-white md:text-sm">
                            {c.value}
                          </span>
                        </span>
                      </div>
                      {i < activeFeature.chips.length - 1 && (
                        <span aria-hidden className="w-px shrink-0 bg-white/10" />
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Laptop / On your desktop */}
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-white/[0.015] px-4 pb-10 pt-10 text-center shadow-[inset_0_0_60px_rgba(103,232,249,0.1),0_0_30px_rgba(103,232,249,0.08)] md:min-h-[720px] md:px-10 md:pb-16 md:pt-16">
              {/* Animated cyan beam chasing the border clockwise */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  padding: "1.5px",
                  background:
                    "conic-gradient(from var(--emi-angle), rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 68%, rgba(103,232,249,1) 82%, rgba(255,255,255,0.15) 95%)",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  animation: "emiBorderSpin 5s linear infinite",
                }}
              />

              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                On your desktop
              </p>
              <h3 className="mt-2 max-w-sm font-display text-xl font-semibold leading-tight text-white md:mt-3 md:text-2xl lg:text-[28px]">
                Full fleet view,<br />in any browser.
              </h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/60 md:mt-3 md:text-sm">
                The SOURCE web console turns every installation into a single, calm management surface.
              </p>

              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[70%] -z-10 h-[65%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(55% 55% at 50% 50%, rgba(103,232,249,0.55) 0%, rgba(14,165,233,0.22) 40%, transparent 75%)",
                  filter: "blur(36px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[70%] -z-10 h-[40%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 animate-[emiPulse_3.6s_ease-out_1.2s_infinite]"
              />

              <div className="relative mt-10 w-[min(520px,88%)] md:mt-14">
                <LaptopMockup>
                  <DashboardScreen active={active} onSelect={selectTab} />
                </LaptopMockup>
              </div>

              <span className="pointer-events-none mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0e1013]/90 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-white/70 shadow-[0_6px_18px_rgba(0,0,0,0.5)] backdrop-blur md:mt-10 md:text-[10px]">
                <span aria-hidden className="h-1 w-1 rounded-full bg-cyan-300" />
                Illustrative demo data
              </span>
            </div>
          </div>

          <style jsx>{`
            @keyframes emiPulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
              100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Pill tab tray */}
        <div
          data-emi-tabs
          className="mx-auto mt-4 flex w-full max-w-4xl items-stretch justify-between gap-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5 backdrop-blur-sm md:mt-6 md:gap-2 md:p-2"
        >
          {APP_FEATURES.map((f, i) => {
            const isActive = i === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectTab(i)}
                aria-pressed={isActive}
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-1.5 overflow-hidden rounded-xl px-2 py-2 text-center transition-colors md:gap-2 md:py-2.5 ${
                  isActive ? "bg-cyan-300/10" : "hover:bg-white/[0.03]"
                }`}
              >
                <span
                  aria-hidden
                  className={`relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg transition-transform md:h-10 md:w-10 ${
                    isActive ? "scale-105" : ""
                  }`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(103,232,249,0.6) 0%, rgba(103,232,249,0.25) 60%, rgba(14,16,19,0.7) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(14,16,19,0.6) 100%)",
                    boxShadow: isActive
                      ? "0 0 18px rgba(103,232,249,0.45), inset 0 0 0 1px rgba(255,255,255,0.1)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                >
                  <span className={isActive ? "text-white" : "text-white/70"}>
                    <SidebarIcon kind={f.icon} />
                  </span>
                </span>
                <span
                  className={`truncate font-display text-[10px] font-medium leading-tight transition-colors md:text-[11px] ${
                    isActive ? "text-white" : "text-white/55"
                  }`}
                >
                  {f.label}
                </span>
                <span
                  aria-hidden
                  className={`absolute inset-x-2 bottom-0 h-px overflow-hidden transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {isActive && !paused && (
                    <span
                      className="absolute inset-y-0 left-0 right-0 bg-cyan-300"
                      style={{ animation: `emiProgress ${AUTO_MS}ms linear forwards` }}
                    />
                  )}
                </span>
              </button>
            );
          })}
          <style jsx>{`
            @keyframes emiProgress {
              from { transform: translateX(-100%); }
              to { transform: translateX(0%); }
            }
          `}</style>
        </div>

        {/* LEGACY_START */}
        <div className="hidden" aria-hidden>
          <div className="flex flex-col">
            {APP_FEATURES.map((f, i) => {
              const isActive = i === active;
              return (
                <div key={f.id} className="border-b border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => selectTab(i)}
                    aria-pressed={isActive}
                    className="flex w-full items-center justify-between gap-4 py-2.5 text-left md:py-3"
                  >
                    <span className="flex items-center gap-5">
                      <span className={`font-display text-xs font-semibold tabular-nums tracking-wider transition-colors ${
                        isActive ? "text-cyan-300" : "text-white/30"
                      }`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`font-display text-sm font-medium transition-colors md:text-base lg:text-lg ${
                        isActive ? "text-white" : "text-white/50"
                      }`}>
                        {f.label}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`relative h-px overflow-hidden transition-all duration-500 ${
                        isActive ? "w-16 bg-white/15" : "w-0 bg-transparent"
                      }`}
                    >
                      {isActive && !paused && (
                        <span
                          className="absolute inset-y-0 left-0 right-0 bg-cyan-300"
                          style={{
                            animation: `emiProgress ${AUTO_MS}ms linear forwards`,
                          }}
                        />
                      )}
                    </span>
                  </button>
                  <div
                    className="grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out"
                    style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0">
                      <p className="pb-3 pl-11 pr-4 text-[11px] leading-snug text-white/65 md:text-xs">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <style jsx>{`
              @keyframes emiProgress {
                from { transform: translateX(-100%); }
                to { transform: translateX(0%); }
              }
            `}</style>
          </div>

          {/* App screen showcase — plain image on an animated 3D cyan backdrop */}
          <div
            data-emi-phone
            className="relative mx-auto flex items-center justify-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* 3D cyan backdrop — rotating conic disc + concentric pulse rings
                + base radial glow, layered for a depth-of-field effect. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              {/* Rotating conic gradient disc — gives a slow orbital feel */}
              <div
                className="absolute aspect-square h-[110%] animate-[emi3dSpin_18s_linear_infinite] rounded-full opacity-70"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(103,232,249,0.35) 90deg, transparent 180deg, rgba(103,232,249,0.22) 270deg, transparent 360deg)",
                  filter: "blur(42px)",
                }}
              />
              {/* Counter-rotating inner disc */}
              <div
                className="absolute aspect-square h-[85%] animate-[emi3dSpinReverse_24s_linear_infinite] rounded-full opacity-60"
                style={{
                  background:
                    "conic-gradient(from 180deg, transparent 0deg, rgba(14,165,233,0.28) 120deg, transparent 240deg, rgba(103,232,249,0.2) 360deg)",
                  filter: "blur(30px)",
                }}
              />
              {/* Expanding concentric rings — depth cue */}
              <div className="absolute aspect-square h-[65%] animate-[emi3dPulse_3.6s_ease-out_infinite] rounded-full border border-cyan-300/35" />
              <div className="absolute aspect-square h-[65%] animate-[emi3dPulse_3.6s_ease-out_1.2s_infinite] rounded-full border border-cyan-300/25" />
              <div className="absolute aspect-square h-[65%] animate-[emi3dPulse_3.6s_ease-out_2.4s_infinite] rounded-full border border-cyan-300/15" />
              {/* Static base glow */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(42% 55% at 50% 50%, rgba(103,232,249,0.3) 0%, transparent 70%)",
                  filter: "blur(14px)",
                }}
              />
            </div>

            {/* Image stack — the PNGs embed the phone mockup at different scales
                within different-aspect canvases. object-cover with a phone-shaped
                container crops the transparent padding so every mockup fills the
                frame at the same display size. */}
            <div className="group relative h-[58vh] w-fit max-h-[580px] min-h-[380px] shrink-0 md:h-[66vh]">
              <div className="relative aspect-[1/2] h-full">
                {APP_FEATURES.map((f, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={f.id}
                    src={f.image}
                    alt={f.label}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                      i === active ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* Stats card — Sigenergy-style: single horizontal card overlaid
                  across the bottom of the image on hover. Both stats sit inside
                  side-by-side, each as [icon tile] + value/label pair. */}
              <div
                key={`stats-${activeFeature.id}`}
                className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-[88%] translate-y-3 items-stretch justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e1013]/85 p-3 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:bottom-8 md:gap-4 md:p-4"
              >
                {activeFeature.chips.map((c, i) => (
                  <Fragment key={c.label}>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        aria-hidden
                        className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl md:h-11 md:w-11"
                        style={{
                          background: `linear-gradient(135deg, ${c.dot} 0%, ${c.dot}66 60%, rgba(14,16,19,0.6) 100%)`,
                          boxShadow: `0 0 20px ${c.dot}55, inset 0 0 0 1px rgba(255,255,255,0.08)`,
                        }}
                      >
                        <span className="h-2 w-2 rounded-full bg-white/90" />
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 md:text-[11px]">
                          {c.label}
                        </span>
                        <span className="truncate font-display text-base font-semibold text-white md:text-lg">
                          {c.value}
                        </span>
                      </span>
                    </div>
                    {i < activeFeature.chips.length - 1 && (
                      <span aria-hidden className="w-px shrink-0 bg-white/10" />
                    )}
                  </Fragment>
                ))}
              </div>

              <style jsx>{`
                @keyframes emi3dSpin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes emi3dSpinReverse {
                  from { transform: rotate(360deg); }
                  to { transform: rotate(0deg); }
                }
                @keyframes emi3dPulse {
                  0% { transform: scale(0.7); opacity: 0.9; }
                  100% { transform: scale(1.3); opacity: 0; }
                }
              `}</style>
            </div>
          </div>
        </div>
        </Shell>
      </div>

    </section>
  );
}

// -----------------------------------------------------------------------------
// Laptop mockup + Dashboard — used inside EnergyMeetsIntelligence
// -----------------------------------------------------------------------------

function LaptopMockup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{ perspective: "1400px", perspectiveOrigin: "50% 40%" }}
    >
      <div
        className="relative"
        style={{ transform: "rotateX(6deg) rotateY(-4deg)", transformStyle: "preserve-3d" }}
      >
        <div className="relative rounded-t-lg border border-white/60 bg-[#0b0d10] p-1.5 shadow-[0_28px_60px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] md:rounded-t-xl md:p-2">
          <span aria-hidden className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-white/50" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-t-lg md:rounded-t-xl"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15), 0 0 30px rgba(103,232,249,0.12)" }}
          />
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-[#07090c] md:rounded-md">
            {children}
          </div>
        </div>
        <div className="relative mx-auto h-2.5 w-[106%] -translate-x-[3%] rounded-b-md border border-t-0 border-white/40 bg-gradient-to-b from-[#2a2d32] via-[#15181c] to-[#0a0b0d] md:h-3">
          <span aria-hidden className="absolute left-1/2 top-0 h-[3px] w-12 -translate-x-1/2 rounded-b-md bg-[#3a3d42]" />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute -bottom-6 left-1/2 h-6 w-[85%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-xl" />
    </div>
  );
}

function DashboardScreen({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const feature = APP_FEATURES[active];
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-[#0e1218] via-[#0a0d12] to-[#070a0e] text-white">
      <div className="flex items-center justify-between border-b border-white/5 px-2 py-1 md:px-3 md:py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="grid h-3 w-3 place-items-center rounded-sm bg-cyan-300/90 md:h-3.5 md:w-3.5">
            <span className="h-1 w-1 rounded-[1px] bg-[#0a0d12]" />
          </span>
          <span className="font-display text-[8px] font-semibold tracking-wider text-white/90 md:text-[9px]">SOURCE WEB</span>
          <span className="ml-2 hidden text-[7px] text-white/40 md:inline">home@amec.co</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
          <span className="hidden text-[7px] text-white/50 md:inline">Live</span>
          <span className="ml-1 h-3 w-3 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-6 flex-col items-center gap-1.5 border-r border-white/5 py-1.5 md:w-7 md:gap-2 md:py-2">
          {APP_FEATURES.map((f, i) => {
            const isActive = i === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={f.label}
                aria-pressed={isActive}
                className={`grid h-4 w-4 place-items-center rounded-sm transition-colors md:h-5 md:w-5 ${
                  isActive ? "bg-cyan-300/15 text-cyan-300" : "text-white/40 hover:text-white/70"
                }`}
              >
                <SidebarIcon kind={f.icon} />
              </button>
            );
          })}
        </nav>

        <div key={feature.id} className="flex min-w-0 flex-1 animate-[emiFadeIn_400ms_ease-out] flex-col gap-1.5 p-2 md:gap-2 md:p-3">
          <div className="flex items-end justify-between">
            <div className="min-w-0">
              <p className="text-[7px] uppercase tracking-[0.12em] text-white/40 md:text-[8px]">Dashboard</p>
              <h3 className="truncate font-display text-[10px] font-semibold text-white md:text-[12px]">{feature.label}</h3>
            </div>
            <div className="hidden items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[7px] text-white/50 md:flex">
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
              Today
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 md:gap-1.5">
            {feature.dashboard.stats.map((s) => (
              <div key={s.label} className="rounded border border-white/5 bg-white/[0.02] p-1 md:p-1.5">
                <p className="truncate text-[6px] uppercase tracking-wider text-white/40 md:text-[7px]">{s.label}</p>
                <p className="mt-0.5 truncate font-display text-[10px] font-semibold text-white md:text-[12px]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 rounded border border-white/5 bg-white/[0.02] p-1.5 md:p-2">
            {feature.dashboard.kind === "battery" ? (
              <DashboardBatteryView />
            ) : feature.dashboard.kind === "modes" ? (
              <DashboardModesList />
            ) : feature.dashboard.kind === "grid" ? (
              <DashboardGridFlow />
            ) : (
              <DashboardChart variant={feature.dashboard.kind === "bars" ? "bars" : "area"} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes emiFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function SidebarIcon({ kind }: { kind: SidebarIconKind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const cls = "h-2.5 w-2.5 md:h-3 md:w-3";
  switch (kind) {
    case "home":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path {...common} d="M2 7.5 8 3l6 4.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <circle {...common} cx="8" cy="8" r="3" />
          <path {...common} d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
        </svg>
      );
    case "battery":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <rect {...common} x="2" y="5" width="11" height="6" rx="1" />
          <path {...common} d="M14 7v2" />
          <rect x="3.5" y="6.5" width="5" height="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path {...common} d="M9 2 4 9h4l-1 5 5-7H8l1-5z" />
        </svg>
      );
    case "sliders":
    default:
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path {...common} d="M2 4h8M12 4h2M2 12h2M6 12h8" />
          <circle {...common} cx="11" cy="4" r="1.2" />
          <circle {...common} cx="4.5" cy="12" r="1.2" />
        </svg>
      );
  }
}

function DashboardChart({ variant }: { variant: "area" | "bars" }) {
  if (variant === "bars") {
    const bars = [38, 52, 44, 67, 58, 72, 61, 80, 55, 69, 74, 48];
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-end justify-between gap-1">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end">
              <span className="w-full rounded-t-[1px] bg-gradient-to-t from-cyan-400/30 to-cyan-300" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[6px] text-white/30 md:text-[7px]">
          <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
        </div>
      </div>
    );
  }
  return (
    <svg viewBox="0 0 400 140" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="emiArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 60, 90, 120].map((y) => (
        <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
      ))}
      <path d="M0,100 C40,80 70,60 110,70 C150,80 180,40 220,55 C260,70 290,30 330,45 C360,55 380,35 400,40 L400,140 L0,140 Z" fill="url(#emiArea)" />
      <path d="M0,100 C40,80 70,60 110,70 C150,80 180,40 220,55 C260,70 290,30 330,45 C360,55 380,35 400,40" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
    </svg>
  );
}

function DashboardBatteryView() {
  return (
    <div className="flex h-full items-stretch gap-2 md:gap-3">
      <div className="flex w-16 flex-col justify-end md:w-20">
        <div className="relative h-full w-full overflow-hidden rounded border border-white/10 bg-white/[0.02]">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-400 to-emerald-200" style={{ height: "72%" }} />
          <span className="absolute inset-0 grid place-items-center font-display text-[11px] font-semibold text-white md:text-[14px]">72%</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1">
        <div className="flex justify-between text-[7px] text-white/40 md:text-[8px]">
          <span>Charge over 24h</span>
          <span className="text-emerald-300">+3%/hr</span>
        </div>
        <svg viewBox="0 0 400 80" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="emiBat" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,60 C40,55 70,50 110,45 C150,40 180,38 220,30 C260,25 290,20 330,18 C360,15 380,12 400,10 L400,80 L0,80 Z" fill="url(#emiBat)" />
          <path d="M0,60 C40,55 70,50 110,45 C150,40 180,38 220,30 C260,25 290,20 330,18 C360,15 380,12 400,10" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

function DashboardModesList() {
  const rows = [
    { name: "Hybrid", desc: "Self-use with grid support", active: true },
    { name: "Backup", desc: "Reserve battery for outages", active: false },
    { name: "Off-grid", desc: "Island operation only", active: false },
    { name: "Eco", desc: "Minimise grid import", active: false },
  ];
  return (
    <div className="flex h-full flex-col gap-1">
      {rows.map((r) => (
        <div key={r.name} className={`flex items-center gap-2 rounded border px-1.5 py-1 md:px-2 md:py-1.5 ${r.active ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/5 bg-white/[0.02]"}`}>
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.active ? "bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]" : "bg-white/20"}`} />
          <span className={`w-14 shrink-0 truncate text-[8px] font-semibold md:w-16 md:text-[9px] ${r.active ? "text-cyan-300" : "text-white/70"}`}>{r.name}</span>
          <span className="truncate text-[7px] text-white/40 md:text-[8px]">{r.desc}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardGridFlow() {
  const flows = [
    { label: "Solar → Load", value: "1.3 kW", pct: 60, color: "#fcd34d" },
    { label: "Solar → Battery", value: "2.0 kW", pct: 80, color: "#6ee7b7" },
    { label: "Solar → Grid", value: "0.9 kW", pct: 35, color: "#7dd3fc" },
    { label: "Grid → Load", value: "0.0 kW", pct: 0, color: "#94a3b8" },
  ];
  return (
    <div className="flex h-full flex-col justify-around gap-1">
      {flows.map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-[7px] text-white/50 md:w-24 md:text-[8px]">{f.label}</span>
          <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/5">
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${f.pct}%`, background: f.color, boxShadow: `0 0 6px ${f.color}` }} />
          </span>
          <span className="w-10 shrink-0 text-right font-display text-[8px] font-semibold md:text-[9px]" style={{ color: f.color }}>{f.value}</span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Get the SOURCE app — extracted from Energy meets intelligence so it can be
// placed after the FAQ in the page flow.
// =============================================================================

function GetTheApp() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0A]">
      <Shell className="relative py-20 md:py-28">
        {/* Phones image — large, centered at top */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/platsore-appstore.png"
            alt="SOURCE app on iPhone"
            className="max-h-[520px] w-auto object-contain md:max-h-[640px]"
          />
        </div>

        {/* Heading + copy — two-column layout below the phones */}
        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-20">
          <div>
            <h2 className="font-display text-[44px] font-semibold uppercase leading-[1.02] text-white md:text-[64px]">
              Monitoring, Control
              <br />
              &amp; Applications
            </h2>
          </div>
          <div>
            <p className="text-[16px] leading-relaxed text-white/75 md:text-[18px]">
              Monitor, control, and optimize your energy ecosystem from anywhere with the SOURCE app. Gain real-time visibility into system performance, switch between Eco, Backup, and Performance modes, receive instant alerts and diagnostics, track grid behavior, and measure energy savings, cost reductions, and sustainability impact.
            </p>
            <p className="mt-6 text-[16px] leading-relaxed text-white/75 md:text-[18px]">
              Designed for homes, commercial facilities, small industries, and remote sites, SOURCE delivers intelligent energy management, reliable backup power, and operational efficiency across a wide range of applications.
            </p>
          </div>
        </div>

        {/* App Store / Google Play / QR row — bottom-left */}
        <div className="mt-12 flex items-stretch gap-4 md:mt-16">
          <div className="flex flex-col gap-3">
            <a href="#" className="inline-flex h-[56px] items-center gap-3 rounded-lg border border-white/15 bg-black px-5 text-white transition hover:border-white/30">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] text-white/70">Download on the</span>
                <span className="text-base font-semibold">App Store</span>
              </span>
            </a>
            <a href="#" className="inline-flex h-[56px] items-center gap-3 rounded-lg border border-white/15 bg-black px-5 text-white transition hover:border-white/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon/playstore.png" alt="" className="h-6 w-6 object-contain" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] text-white/70">GET IT ON</span>
                <span className="text-base font-semibold">Google Play</span>
              </span>
            </a>
          </div>
          <div className="flex h-[124px] w-[124px] shrink-0 flex-col items-center justify-center rounded-lg border border-white/15 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/QRcode.png" alt="Scan QR code to download" className="h-[80px] w-[80px] object-contain" />
            <p className="mt-1 text-center text-[9px] font-medium leading-tight text-black/70">
              Scan QR to download
            </p>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// =============================================================================
// 06. One Home, Multiple Scenarios (brief Panel 06)
// =============================================================================
// Scenario selector — Sunny Day / Evening at Home / Grid Interruption. The
// house image and energy-path overlay swap per scenario. Flow lines only
// animate directions confirmed valid by the product team. [VERIFY]
// =============================================================================

function OneHomeMultipleScenarios() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId)!;
  const sectionRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-ohs-head], [data-ohs-pills], [data-ohs-stage], [data-ohs-body]", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%" },
      });

      // Pin the full-bleed scenarios section for one viewport-height so the
      // user can dwell on the stage and tap through the pill toggle.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-[#0A0A0A]"
    >
      {/* Full-bleed stage — scenario image fills the entire section height. */}
      {SCENARIOS.map((s) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={s.id}
          src={s.image}
          alt={s.label}
          aria-hidden={s.id !== activeId}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            s.id === activeId ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Soft bottom gradient — keeps overlaid heading / description / toggle
          legible without hiding too much of the scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
      />

      {/* Overlay stack — eyebrow + heading + description sit on the image
          directly above the segmented pill toggle, all centered. */}
      <div className="absolute inset-x-0 bottom-10 px-6 md:bottom-14 md:px-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          {/* Left — eyebrow + heading + description */}
          <div data-ohs-head className="max-w-2xl text-left">
            <p className="eyebrow !text-xs !tracking-[0.22em] !text-white/60">
              One home, multiple scenarios
            </p>
            <h2 className="mt-3 font-display text-[42px] font-semibold leading-tight text-white">
              See how SOURCE adapts to your life.
            </h2>
            <p
              data-ohs-body
              className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/85 md:mt-5"
            >
              {active.summary}
            </p>
          </div>

          {/* Right — segmented pill toggle, active pill white-filled */}
          <div
            data-ohs-pills
            role="tablist"
            aria-label="Scenario"
            className="inline-flex shrink-0 items-center rounded-md border border-white/10 bg-black/60 p-1 backdrop-blur-xl md:self-end"
          >
            {SCENARIOS.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(s.id)}
                  className={`inline-flex items-center rounded-sm px-5 py-2.5 font-display text-xs font-semibold transition-colors md:px-7 md:py-3 md:text-sm ${
                    isActive
                      ? "bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 07. CleanTech — Solar-Panel Cleaning Device (brief Panel 07)
// =============================================================================
// Dedicated chapter for the cleaning device. Features list is [VERIFY] — the
// brief states "Feature cards should contain only validated information" and
// "A short animation may show the device moving if its real operation is
// confirmed." No motion rendered here until confirmation.
// =============================================================================

function CleanTechChapter() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-ct-image], [data-ct-head], [data-ct-feature], [data-ct-cta]", {
        autoAlpha: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A] py-20 md:py-28">
      <Shell className="relative">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-20">
          <div data-ct-image className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Source-Solar-panel-cleaning-machine.png"
              alt="SOURCE CleanTech device on solar panels"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div>
            <p data-ct-head className="eyebrow !text-xs !tracking-[0.22em] !text-white/50">
              CleanTech
            </p>
            <h2 data-ct-head className="mt-3 font-display text-[42px] font-semibold text-white">
              Keep panels clean for consistent performance.
            </h2>
            <p data-ct-head className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              Our solar-panel cleaning device is a separate chapter in the wider CleanTech ecosystem, built to keep your rooftop generating at its best.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {CLEANTECH_FEATURES.map((f) => (
                <li
                  key={f.title}
                  data-ct-feature
                  className="rounded-xl border border-white/[0.08] bg-bg-card p-5"
                >
                  <p className="font-display text-sm font-semibold text-white md:text-base">
                    {f.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/60 md:text-[13px]">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>

            <div data-ct-cta className="mt-10">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full border border-white/20 py-2.5 pl-5 pr-2.5 font-display text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Explore CleanTech device
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black transition group-hover:bg-black group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// =============================================================================
// 08. Applications (brief Panel 08)
// =============================================================================
// Four cards: Homes / Commercial Buildings / Remote Locations / Small-Scale
// Industries. No dedicated detail pages exist yet — cards link to /contact
// (TODO: swap to real detail page routes when they exist).
// =============================================================================

function Applications() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-app-card]");
    const step = firstCard
      ? firstCard.getBoundingClientRect().width + 24
      : el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // Word-by-word scrub reveal — matches §2 / §3 headings.
      const words = gsap.utils.toArray<HTMLElement>("[data-app-word]");
      if (words.length) {
        gsap.set(words, { color: "rgba(255,255,255,0.2)" });
        gsap.to(words, {
          keyframes: [
            { color: "#FFFFFF", duration: 0.35 },
            { color: "#67E8F9", duration: 0.3 },
            { color: "#FFFFFF", duration: 0.35 },
          ],
          ease: "none",
          stagger: { amount: 1.5 },
          scrollTrigger: {
            trigger: "[data-app-heading]",
            start: "top 85%",
            end: "+=90%",
            scrub: 0.6,
          },
        });
      }

      gsap.from("[data-app-sub], [data-app-card]", {
        autoAlpha: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0A0A0A] py-14 md:py-20">
      <Shell className="relative">
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-14 lg:gap-20">
          <div>
            <p data-app-sub className="eyebrow !text-xs !tracking-[0.22em] !text-white/50">
              Applications
            </p>
            <h2
              data-app-heading
              className="mt-3 font-display text-[42px] font-semibold leading-[1.05] text-white"
            >
              {"SOURCE for different needs.".split(" ").map((w, i, arr) => (
                <Fragment key={i}>
                  <span data-app-word className="inline-block">{w}</span>
                  {i < arr.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </h2>
          </div>
          <p data-app-sub className="max-w-sm text-[16px] leading-relaxed text-white/60 md:ml-auto md:pb-3">
            From homes to industry, SOURCE delivers intelligent power management wherever it's needed.
          </p>
        </div>
      </Shell>

      {/* Horizontal carousel — scroll-snap row with prev/next arrows.
          Wrapper matches Shell's max-w-[1600px] mx-auto so the first card's
          left padding (pl-6 / md:pl-14) aligns with the heading's left edge
          above instead of hugging the raw viewport. */}
      <div className="relative mx-auto mt-8 w-full max-w-[1600px] md:mt-10">
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pl-6 pr-6 py-5 md:gap-6 md:pl-14 md:pr-14 md:py-7 [overflow-y:clip] [overscroll-behavior-x:contain] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {APPLICATIONS.map((a) => (
            <Link
              key={a.title}
              href="/contact"
              data-app-card
              className="group relative block shrink-0 overflow-hidden rounded-[22px] transition-transform duration-500 w-[70vw] md:w-[34vw] lg:w-[24vw] max-w-[380px]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image}
                  alt={a.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Full-height scrim — many stops so the curve eases smoothly
                    into the sky at the top of the card instead of leaving a
                    visible seam where a short gradient would end. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 10%, rgba(0,0,0,0.42) 24%, rgba(0,0,0,0.24) 42%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0.04) 78%, rgba(0,0,0,0) 100%)",
                  }}
                />
                {/* Centered title + description — rely on text-shadow for crispness */}
                <div className="absolute inset-x-6 bottom-7 text-center md:inset-x-8 md:bottom-9">
                  <p className="font-display text-xl font-semibold leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.6)] md:text-2xl">
                    {a.title}
                  </p>
                  <p className="mx-auto mt-2 max-w-[22ch] text-[12px] leading-snug text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.55)] md:mt-2.5 md:text-[13px]">
                    {a.body}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Prev / Next controls — overlay on the scroller */}
        <button
          type="button"
          onClick={() => scrollByCard("prev")}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-black/75 md:left-6 md:h-12 md:w-12 lg:left-10"
        >
          <ArrowRight className="h-4 w-4 rotate-180 md:h-5 md:w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("next")}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-black/75 md:right-6 md:h-12 md:w-12"
        >
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </section>
  );
}

// =============================================================================
// FAQ (kept per earlier agreement — brief doesn't call for it but it reduces
// sales friction and doesn't contradict the brief).
// =============================================================================

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleToggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
    window.setTimeout(() => ScrollTrigger.refresh(), 550);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0A] py-16 md:py-24">
      <Shell>
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr_0.8fr] md:gap-14 tablet:grid-cols-1 tablet:gap-8">
          <div className="md:sticky md:top-28 md:self-start tablet:static tablet:top-auto">
            <p className="eyebrow !text-xs !tracking-[0.22em] !text-white/50">
              Frequently asked questions
            </p>
            <h2 className="mt-3 font-display text-[42px] font-semibold text-white">
              Straightforward answers.
            </h2>
            <p className="mt-5 max-w-xs text-[16px] leading-relaxed text-white/60">
              So you can move forward with confidence.
            </p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openIndex === i;
              const num = String(i + 1).padStart(2, "0");
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => handleToggle(i)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-6 py-6 text-left"
                  >
                    <span className={`text-[10px] tracking-[0.2em] md:text-xs ${isOpen ? "text-white" : "text-white/40"}`}>
                      {num}
                    </span>
                    <span className={`font-display text-sm font-semibold md:text-base ${isOpen ? "text-white" : "text-white/85"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
                        isOpen ? "border-cyan-300 bg-cyan-300 text-black" : "border-white/25 text-white/70"
                      }`}
                      aria-hidden
                    >
                      <span className="relative block h-3 w-3">
                        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-full -translate-x-1/2 -translate-y-1/2 bg-current" />
                        <span
                          className={`absolute left-1/2 top-1/2 h-full w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${
                            isOpen ? "scale-y-0" : "scale-y-100"
                          }`}
                        />
                      </span>
                    </span>
                  </button>

                  <div
                    ref={(el) => {
                      panelRefs.current[i] = el;
                    }}
                    className="overflow-hidden transition-[max-height] duration-500 ease-out"
                    style={{
                      maxHeight: isOpen ? `${panelRefs.current[i]?.scrollHeight ?? 0}px` : "0px",
                    }}
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] gap-6 pb-6">
                      <span aria-hidden />
                      <p className="text-xs leading-relaxed text-white/70 md:text-sm">{item.a}</p>
                      <span aria-hidden />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="md:sticky md:top-28 md:self-start tablet:static tablet:top-auto">
            <p className="text-[16px] leading-relaxed text-white/70">
              Still have questions? Our team is here to help.
            </p>
            <Link
              href="mailto:contact@amectechnology.com"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Email us
            </Link>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// =============================================================================
// 09. Final CTA (brief Panel 09)
// =============================================================================
// Closing visual + concise headline + primary + secondary CTA.
// =============================================================================

function FinalCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-fin-head], [data-fin-sub], [data-fin-cta]", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80vh] w-full items-end overflow-hidden bg-black md:min-h-screen"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%), url('/images/Card.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#0f0f0f",
        }}
      />

      <div className="relative w-full px-6 pb-14 md:px-14 md:pb-20">
        <div className="mx-auto max-w-[1400px]">
          <h2 data-fin-head className="max-w-2xl font-display text-[42px] font-semibold leading-[1.1] text-white">
            A smarter way to power tomorrow.
          </h2>
          <p data-fin-sub className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/80 md:mt-6">
            SOURCE brings solar, storage and intelligent energy management together — so you can enjoy a brighter, more sustainable tomorrow.
          </p>
          <div data-fin-cta className="mt-8 flex flex-wrap gap-3 md:mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-display text-sm font-medium text-black transition hover:bg-white/90 md:text-base"
            >
              Explore SOURCE
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-white/30 bg-transparent px-6 py-3 font-display text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black md:text-base"
            >
              Talk to our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
