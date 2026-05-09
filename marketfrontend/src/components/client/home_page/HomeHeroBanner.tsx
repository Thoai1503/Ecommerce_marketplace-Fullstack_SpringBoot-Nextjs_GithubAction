"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import styles from "./HomeHeroBanner.module.css";

type BannerSlide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  badge: string;
  metric: string;
  from: string;
  to: string;
  accent: string;
};

const bannerSlides: BannerSlide[] = [
  {
    eyebrow: "NEXAMART",
    title: "Discover our outstanding offers",
    subtitle: "Selected products, convenient vouchers, and a streamlined shopping experience.",
    cta: "Explore now",
    href: "#suggested-products",
    image: "/image/ecommerce.jpg",
    badge: "Selected offers",
    metric: "Many options",
    from: "#1F5F9F",
    to: "#2b8cee",
    accent: "#fff7ed",
  },
  {
    eyebrow: "DELIVERY",
    title: "Shop with ease",
    subtitle: "Find the right shipping deals before completing your order.",
    cta: "View deals",
    href: "/voucher",
    image: "/image/freeship.jpg",
    badge: "Transportation support",
    metric: "Easy to use",
    from: "#0f766e",
    to: "#14b8a6",
    accent: "#ecfeff",
  },
  {
    eyebrow: "VOUCHER",
    title: "Save vouchers for your orders",
    subtitle: "Choose the right vouchers to optimize your shopping costs.",
    cta: "Save vouchers",
    href: "/voucher",
    image: "/image/voucher.png",
    badge: "Discount codes",
    metric: "Ready to use",
    from: "#be123c",
    to: "#fb7185",
    accent: "#fff1f2",
  },
];

const sidePromos = [
  {
    title: "Endow",
    subtitle: "Notable products",
    image: "/image/flashsale.png",
    href: "#suggested-products",
    icon: ShoppingBag,
  },
  {
    title: "Voucher",
    subtitle: "Utility discount code",
    image: "/image/voucher.png",
    href: "/voucher",
    icon: TicketPercent,
  },
];

const AUTO_PLAY_MS = 10000;

export default function HomeHeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide((index + bannerSlides.length) % bannerSlides.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveSlide((current) => (current - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  const goNext = useCallback(() => {
    setActiveSlide((current) => (current + 1) % bannerSlides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;

    const deltaX = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(deltaX) < 48) return;
    if (deltaX > 0) goPrev();
    else goNext();
  };

  return (
    <section
      className={styles.bannerShell}
      aria-label="Outstanding promotions"
    >
      <div
        className={styles.mainStage}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartX.current = null;
        }}
        onPointerLeave={() => {
          dragStartX.current = null;
        }}
      >
        <div
          className={styles.slideTrack}
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {bannerSlides.map((slide, index) => (
            <article
              key={slide.title}
              className={`${styles.slide} ${activeSlide === index ? styles.slideActive : ""}`}
              aria-hidden={activeSlide !== index}
              style={
                {
                  "--banner-from": slide.from,
                  "--banner-to": slide.to,
                  "--banner-accent": slide.accent,
                } as CSSProperties
              }
            >
              <div className={styles.copy}>
                <span className={styles.eyebrow}>{slide.eyebrow}</span>
                <h1 className={styles.title}>{slide.title}</h1>
                <p className={styles.subtitle}>{slide.subtitle}</p>
                <div className={styles.actions}>
                  <Link
                    className={styles.ctaButton}
                    href={slide.href}
                    tabIndex={activeSlide === index ? 0 : -1}
                  >
                    {slide.cta}
                  </Link>
                  <span className={styles.liveBadge}>{slide.metric}</span>
                </div>
              </div>

              <div className={styles.visualPanel}>
                <div className={styles.imageCard}>
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className={styles.bannerImage}
                    sizes="(max-width: 768px) 70vw, 360px"
                  />
                </div>
                <div className={styles.floatBadge}>{slide.badge}</div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={goPrev}
          aria-label="Front banner"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={goNext}
          aria-label="Next banner"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        <div className={styles.dots} aria-label="Select banner">
          {bannerSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`${styles.dot} ${activeSlide === index ? styles.dotActive : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`View banner ${index + 1}`}
              aria-current={activeSlide === index}
            />
          ))}
        </div>

        <div
          key={activeSlide}
          className={styles.progressBar}
          aria-hidden="true"
        />
      </div>

      <div className={styles.sidePromos}>
        {sidePromos.map((promo) => {
          const Icon = promo.icon;

          return (
            <Link key={promo.title} href={promo.href} className={styles.promoCard}>
              <div className={styles.promoText}>
                <span className={styles.promoIcon}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <strong>{promo.title}</strong>
                <span>{promo.subtitle}</span>
              </div>
              <div className={styles.promoImageWrap}>
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className={styles.promoImage}
                  sizes="120px"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
