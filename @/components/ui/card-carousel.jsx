"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { SparklesIcon } from "lucide-react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { motion } from "framer-motion";

import { Badge } from "../../../@/components/ui/badge";

export const CardCarousel = ({
  images,
  autoplayDelay = 2500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
    .carousel-container {
      perspective: 1200px;
    }
    
    .swiper {
      width: 100%;
      padding: 50px 0 80px 0;
      overflow: visible;
    }
    
    .swiper-slide {
      background-position: center;
      background-size: cover;
      width: 280px;
      height: 350px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    
    .swiper-slide-active {
      transform: scale(1.1) !important;
      z-index: 10;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }
    
    .swiper-slide img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 20px;
      transition: all 0.4s ease;
    }
    
    .swiper-slide:hover img {
      transform: scale(1.05);
    }
    
    .swiper-3d .swiper-slide-shadow-left,
    .swiper-3d .swiper-slide-shadow-right {
      background: linear-gradient(45deg, rgba(0, 0, 0, 0.2), transparent);
    }
    
    .swiper-pagination-bullet {
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 1;
      transition: all 0.3s ease;
    }
    
    .swiper-pagination-bullet-active {
      background: #ffffff;
      transform: scale(1.2);
    }
    
    .swiper-button-next,
    .swiper-button-prev {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      width: 50px !important;
      height: 50px !important;
      margin-top: -25px !important;
      transition: all 0.3s ease;
    }
    
    .swiper-button-next:hover,
    .swiper-button-prev:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    
    .swiper-button-next::after,
    .swiper-button-prev::after {
      font-size: 18px !important;
      font-weight: bold;
    }
    
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 20px;
    }
    
    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      padding: 20px;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }
    
    .swiper-slide:hover .image-overlay {
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .swiper-slide {
        width: 250px;
        height: 320px;
      }
      
      .swiper-button-next,
      .swiper-button-prev {
        display: none;
      }
    }
  `;

  return (
    <section className="w-full space-y-4">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-black/5 p-2 shadow-lg md:rounded-t-[44px] backdrop-blur-sm bg-white/80">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5 bg-gradient-to-br from-neutral-50/80 to-neutral-100/60 p-4 shadow-inner md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-6">
          <Badge
            variant="outline"
            className="absolute left-6 top-6 rounded-[14px] border border-black/10 text-base backdrop-blur-sm bg-white/80 hover:bg-white/90 transition-all duration-300 z-20"
          >
            <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800 mr-2" />
            features
          </Badge>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center pb-4 pl-6 pt-16 md:items-center w-full"
          >
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Everything you need to learn,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                faster
              </span>
            </h2>
            <p className=" md:items-center md:justify-center mx-auto mt-6 max-w-3xl text-xl font-medium text-gray-600">
              Three core flows power accelerated learning—AI course generation,
              YouTube enrichment, and measurable progress.
            </p>
          </motion.div>
          <div className="flex w-full items-center justify-center carousel-container">
            <div className="w-full">
              <Swiper
                spaceBetween={30}
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView="auto"
                speed={800}
                coverflowEffect={{
                  rotate: 15,
                  stretch: 0,
                  depth: 300,
                  modifier: 1.5,
                  slideShadows: true,
                }}
                pagination={
                  showPagination
                    ? {
                        clickable: true,
                        dynamicBullets: true,
                      }
                    : false
                }
                navigation={
                  showNavigation
                    ? {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }
                    : false
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
                className="mySwiper"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={`slide-${index}`}>
                    <div className="image-container">
                      <Image
                        src={image.src}
                        width={280}
                        height={350}
                        className="w-full h-full object-cover"
                        alt={image.alt || `Carousel image ${index + 1}`}
                        priority={index < 3}
                        sizes="(max-width: 768px) 250px, 280px"
                      />
                      {image.title && (
                        <div className="image-overlay">
                          <h4 className="text-white font-semibold text-lg">
                            {image.title}
                          </h4>
                          {image.description && (
                            <p className="text-white/80 text-sm mt-1">
                              {image.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
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