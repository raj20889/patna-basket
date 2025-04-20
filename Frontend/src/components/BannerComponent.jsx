import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const BannerComponent = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  const slides = [
   
   
    {
      image: "https://mcprod.sparindia.com/media/catalog/category/web-header.png",
      path: "seasonal-sale"
    },
    { 
      image: "https://cdn.zeptonow.com/production/tr:w-1280,ar-3840-705,pr-true,f-auto,q-80/inventory/banner/4ea3de05-f469-4df2-9548-db9c9863dfdf.png",
      path: "paan-corner"
    },
    {
      image: "https://media.starquik.com/bannerslider/n/p/npobe_cadbury_cadbury_1400x400.jpg",
      path: "special-offers"
    },
    { 
      image: "https://media.starquik.com/bannerslider/s/t/startquik_mango_25_post_1400x400.jpg",
      path: "fruits"
    },
    { 
      image: "https://cdn.zeptonow.com/production/tr:w-1280,ar-3840-705,pr-true,f-auto,q-80/inventory/banner/4ea3de05-f469-4df2-9548-db9c9863dfdf.png",
      path: "paan-corner"
    },
   
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        nextSlide();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleBannerClick = () => {
    const path = slides[currentSlide].path;
    if (isCustomer) {
      navigate(`/c/${path}`);
    } else {
      navigate(`/${path}`);
    }
  };

  return (
    <div className="mx-10 my-3">
      <div className="relative w-full h-[200px] md:h-[250px] lg:h-[200px] overflow-hidden rounded-xl shadow-lg">
        <div
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative w-full h-full flex-shrink-0 cursor-pointer"
              onClick={handleBannerClick}
            >
              <img
                src={slide.image}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover brightness-110 saturate-125"
              />
            </div>
          ))}
        </div>

        {/* Arrows - Disabled when at boundaries */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30 hover:bg-black/50 ${
            currentSlide === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30 hover:bg-black/50 ${
            currentSlide === slides.length - 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerComponent;