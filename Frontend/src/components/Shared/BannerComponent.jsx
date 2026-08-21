import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CACHE_TIME = 5 * 60 * 1000;
let bannerCache = { data: null, fetchedAt: 0 };

const BannerComponent = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasCache = bannerCache.data !== null;
  const [slides, setSlides] = useState(() => bannerCache.data || []);
  const [loading, setLoading] = useState(!hasCache);
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (slides.length === 0) return 0;
      return (prev + 1) % slides.length;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (slides.length === 0) return 0;
      return (prev - 1 + slides.length) % slides.length;
    });
  };

  useEffect(() => {
    const fetchBanners = async () => {
      const isFresh = Date.now() - bannerCache.fetchedAt < CACHE_TIME;
      if (bannerCache.data !== null && isFresh) return;

      try {
        const res = await axios.get(`${API_URL}/banners`);
        const activeSorted = (res.data || [])
          .filter((b) => b.isActive !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        bannerCache = { data: activeSorted, fetchedAt: Date.now() };
        setSlides(activeSorted);
      } catch (err) {
        console.error('Banner fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [API_URL]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (slides.length === 0 ? 0 : (prev + 1) % slides.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleBannerClick = () => {
    if (!slides.length) return;
    const path = slides[currentSlide].path;
    navigate(isCustomer ? `/c/${path}` : `/${path}`);
  };

  if (loading) {
    return (
      <div className="mx-4 sm:mx-8 my-3">
        <div className="w-full h-[70px] md:h-[250px] lg:h-[200px] animate-pulse bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!slides.length) return null;

  return (
    <div className="mx-4 sm:mx-8 my-3">
      <div className="relative w-full h-[70px] md:h-[250px] lg:h-[200px] overflow-hidden rounded-xl shadow-lg">
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
                className="w-full h-full lg:object-cover object-cover brightness-110 saturate-125"
              />
            </div>
          ))}
        </div>

        {/* Mobile Navigation (smaller and less prominent) */}
        <button
          onClick={prevSlide}
          disabled={slides.length <= 1}
          className={`absolute left-1 top-1/2 -translate-y-1/2 bg-black/20 text-white p-1 rounded-full z-30 hover:bg-black/30 sm:left-4 sm:p-2 ${
            slides.length <= 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiChevronLeft className="text-sm sm:text-base" size={20} />
        </button>
        <button
          onClick={nextSlide}
          disabled={slides.length <= 1}
          className={`absolute right-1 top-1/2 -translate-y-1/2 bg-black/20 text-white p-1 rounded-full z-30 hover:bg-black/30 sm:right-4 sm:p-2 ${
            slides.length <= 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiChevronRight className="text-sm sm:text-base" size={20} />
        </button>

        {/* Dots - Smaller on mobile */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-1 sm:space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white sm:w-6 w-4"
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