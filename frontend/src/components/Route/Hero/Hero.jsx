import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import gamingBanner from "../../../Assests/images/gaming-banner.png";
import kitchenBanner from "../../../Assests/images/kitchen-banner.png";
import techBanner from "../../../Assests/images/tech-banner.jpg";

const slides = [
  {
    category: "Gaming Gear",
    image: gamingBanner,
    eyebrow: "Built for your next win",
    title: "Level Up Your Setup",
    description: "Find the gear that keeps every game feeling extraordinary.",
  },
  {
    category: "Kitchen",
    image: kitchenBanner,
    eyebrow: "Good things start here",
    title: "Make Room for Better Meals",
    description: "Discover kitchen essentials made for everyday moments.",
  },
  {
    category: "Electronics",
    image: techBanner,
    eyebrow: "Meet your next favorite tech",
    title: "Technology for What's Next",
    description: "Explore smart devices and electronics for the way you live.",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(slideTimer);
  }, []);

  const showSlide = (index) => {
    setCurrentSlide((index + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section
      aria-label="Featured categories"
      aria-roledescription="carousel"
      className="relative h-[390px] w-full overflow-hidden bg-slate-900 sm:h-[460px] lg:h-[540px]"
    >
      {slides.map((item, index) => (
        <img
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          key={item.category}
          src={item.image}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />

      <div className="relative mx-auto flex h-full w-11/12 max-w-[1800px] items-center">
        <div className="max-w-[620px] text-white" key={slide.category}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-base">
            {slide.eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-[520px] text-base text-white/90 sm:text-lg">
            {slide.description}
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#3957db] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#2f49b7]"
            to={`/products?category=${encodeURIComponent(slide.category)}`}
          >
            Shop Now <IoIosArrowForward />
          </Link>
        </div>
      </div>

      <button
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/60 sm:left-8"
        onClick={() => showSlide(currentSlide - 1)}
        type="button"
      >
        <IoIosArrowBack className="text-xl" />
      </button>
      <button
        aria-label="Next slide"
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/60 sm:right-8"
        onClick={() => showSlide(currentSlide + 1)}
        type="button"
      >
        <IoIosArrowForward className="text-xl" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((item, index) => (
          <button
            aria-current={index === currentSlide ? "true" : undefined}
            aria-label={`Show ${item.category} slide`}
            className={`h-2.5 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/60"
            }`}
            key={item.category}
            onClick={() => showSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
