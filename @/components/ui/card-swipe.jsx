"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import { SparklesIcon } from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import { Badge } from "../../../@/components/ui/badge";

export const CardSwipe = ({
  images = null,
  autoplayDelay = 1500,
  slideShadows = false,
  children,
  showHeader = true,
  title = "Card Swipe",
  subtitle = "Seamless Images carousel animation.",
}) => {
  useEffect(() => {
    // Debug logging
    console.log("CardSwipe mounted with:", {
      images: images?.length || 0,
      children: React.Children.count(children),
      showHeader,
      autoplayDelay,
    });
  }, [images, children, showHeader, autoplayDelay]);

  const css = `
  .swiper {
    width: 100%;
    padding: 20px 0 50px 0;
    overflow: hidden;
  }
  
  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    height: auto;
    min-height: 300px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .swiper-slide .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .testimonials-swiper {
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
    overflow: hidden;
  }

  .testimonials-swiper .swiper-wrapper {
    align-items: center;
  }

  .testimonials-swiper .swiper-slide {
    background: transparent;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    transform-style: preserve-3d;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .testimonials-swiper .swiper-slide .card-content {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    transform: translateZ(0);
  }

  .testimonials-swiper .swiper-slide-active {
    transform: scale(1.05) translateZ(0);
    z-index: 10;
    opacity: 1;
  }

  .testimonials-swiper .swiper-slide-prev,
  .testimonials-swiper .swiper-slide-next {
    transform: scale(0.95) translateZ(0);
    opacity: 0.7;
  }

  .testimonials-swiper .swiper-slide-prev-prev,
  .testimonials-swiper .swiper-slide-next-next {
    transform: scale(0.85) translateZ(0);
    opacity: 0.4;
  }
  
  `;

  return (
    <section className="w-full">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-4xl rounded-[24px] border border-black/5 p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5 bg-neutral-800/5 p-2 shadow-sm md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-2">
          {showHeader && (
            <>
              <Badge
                variant="outline"
                className="absolute left-4 top-6 rounded-[14px] border border-black/10 text-base md:left-6"
              >
                <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800" />{" "}
                Latest component
              </Badge>
              <div className="flex flex-col justify-center pb-2 pl-4 pt-14 md:items-center">
                <div className="flex gap-2">
                  <div>
                    <h3 className="text-4xl opacity-85 font-bold tracking-tight">
                      {title}
                    </h3>
                    <p className="flex items-center gap-1">{subtitle}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex w-full items-center justify-center gap-4">
            <div className="w-full max-w-2xl mx-auto">
              <Swiper
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }}
                effect={"cards"}
                grabCursor={true}
                loop={true}
                slidesPerView={1}
                centeredSlides={true}
                rewind={true}
                cardsEffect={{
                  slideShadows: slideShadows,
                  perSlideOffset: 8,
                  perSlideRotate: 2,
                  rotate: true,
                }}
                modules={[EffectCards, Autoplay, Pagination, Navigation]}
                className="testimonials-swiper"
                onSwiper={(swiper) => {
                  console.log("Swiper initialized:", swiper);
                }}
                onSlideChange={(swiper) => {
                  console.log("Slide changed to:", swiper.activeIndex);
                }}
              >
                {Array.isArray(images) && images.length > 0
                  ? images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="size-full rounded-3xl">
                          <Image
                            src={image.src}
                            width={500}
                            height={500}
                            className="size-full rounded-xl"
                            alt={image.alt}
                          />
                        </div>
                      </SwiperSlide>
                    ))
                  : React.Children.toArray(children).map((child, index) => (
                      <SwiperSlide key={index}>
                        <div className="card-content">{child}</div>
                      </SwiperSlide>
                    ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
