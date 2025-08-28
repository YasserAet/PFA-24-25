"use client";

import { useState, useEffect } from "react"; // Add useEffect
import Image from "next/image";
import { ArrowLeft, ArrowRight, X, Grid, Rows, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserControls } from "@/components/user-controls"
import { useRouter } from "next/navigation";

interface ApartmentUser {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  telephone?: string
}

const mainImages = [
  // Building/ outer images
    { id: "b1", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/B(1).png", alt: "Building image 1" },
    { id: "b2", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/B(2).png", alt: "Building image 2" },
    { id: "b3", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/B(3).png", alt: "Building image 3" },
    { id: "b4", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/B(4).png", alt: "Building image 4" },
    
    //LIYMLIGHT images
    { id: "l1", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(1).jpg", alt: "Liymlight image 1" },
    { id: "l2", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(2).jpg", alt: "Liymlight image 2" },
    { id: "l3", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(3).jpg", alt: "Liymlight image 3" },
    { id: "l5", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(5).jpg", alt: "Liymlight image 5" },
    { id: "l6", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(6).jpg", alt: "Liymlight image 6" },
    { id: "l7", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(7).jpg", alt: "Liymlight image 7" },
    { id: "l8", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(8).jpg", alt: "Liymlight image 8" },
    { id: "l9", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(9).jpg", alt: "Liymlight image 9" },
    
    //TERRACOTTA images
    { id: "t2", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(2).jpg", alt: "Terracotta image 2" },
    { id: "t3", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(3).jpg", alt: "Terracotta image 3" },
    { id: "t4", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(4).jpg", alt: "Terracotta image 4" },
    { id: "t5", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(5).jpg", alt: "Terracotta image 5" },
    { id: "t6", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(6).jpg", alt: "Terracotta image 6" },
    { id: "t7", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(7).jpg", alt: "Terracotta image 7" },
    { id: "t8", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(8).jpg", alt: "Terracotta image 8" },
    { id: "t9", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(9).jpg", alt: "Terracotta image 9" },

    //LAVENDER images
    { id: "la1", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(1).jpg", alt: "Lavander image 1" },
    { id: "la2", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(2).jpg", alt: "Lavander image 2" },
    { id: "la3", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(3).jpg", alt: "Lavander image 3" },
    { id: "la4", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(4).jpg", alt: "Lavander image 4" },
    { id: "la5", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(5).jpg", alt: "Lavander image 5" },
    { id: "la6", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(6).jpg", alt: "Lavander image 6" },
    { id: "la7", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(7).jpg", alt: "Lavander image 7" },
    { id: "la8", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(8).jpg", alt: "Lavander image 8" },
    { id: "la9", url: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(9).jpg", alt: "Lavander image 9" },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("terracotta");
  const [viewMode, setViewMode] = useState<"grid" | "rows">("grid");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [fade, setFade] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<ApartmentUser | null>(null);
  const router = useRouter();

  // Add background fix just like in the location page
  useEffect(() => {
    // Apply background fix on mount
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #__next, #__next > div, main, [data-nextjs-scroll-focus-boundary] {
        background-color: #f3f4f6 !important;
      }
      
      /* Hide scrollbars but keep scrolling functionality */
      html, body {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }
      
      html::-webkit-scrollbar, body::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      
      /* Hide all scrollbars in the document */
      *::-webkit-scrollbar {
        width: 0px;
        height: 0px;
        background: transparent;
      }
    `;
    document.head.appendChild(style);
    
    document.documentElement.style.cssText = "background-color: #f3f4f6 !important";
    document.body.style.cssText = "background-color: #f3f4f6 !important";
    
    return () => {
      document.head.removeChild(style);
      document.documentElement.style.cssText = "";
      document.body.style.cssText = "";
    };
  }, []);

  // Add/remove a class to the body when lightbox is open
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.classList.add('lightbox-active');
      
      // Hide the header/menu
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('lightbox-active');
      
      // Show the header/menu again
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('lightbox-active');
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  // Function to handle next/prev image in lightbox with fade animation
  const navigateImage = (direction: 'next' | 'prev') => {
    if (selectedImage === null || filteredImages.length === 0) return;

    setFade(false);
    setTimeout(() => {
      const newIndex = direction === 'next'
        ? (selectedImage + 1) % filteredImages.length
        : (selectedImage - 1 + filteredImages.length) % filteredImages.length;
      setSelectedImage(newIndex);
      setFade(true);
    }, 200);
  };

  // Handle image load error
  const handleImageError = (url: string) => {
    setImgError(prev => ({ ...prev, [url]: true }));
  };

  // Filtered images for current tab
  const filteredImages = mainImages.filter(img => {
    if (activeTab === 'terracotta') return img.url.includes("/T(");
    if (activeTab === 'key1') return img.url.includes("/B(");
    if (activeTab === 'liymlight') return img.url.includes("/L(");
    if (activeTab === 'lavender') return img.url.includes("/La(");
    return true;
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/verify")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/login")
          return
        }
      } catch (error) {
        router.push("/login")
        return
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#2DD4BF]/50 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">Loading...</h2>
          <p className="text-[#2DD4BF]/80 font-montserrat">Authenticating user...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Background overlay to ensure no blue shows through */}
      <div className="fixed inset-0 bg-gray-100 -z-10"></div>
      
      <div className="p-3 sm:p-6 pt-10 sm:pt-[110px] max-w-7xl mx-auto bg-gray-100 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6 text-[#0b4d43]">Project Gallery</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-6 sm:mb-10">
          {/* Header area - stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <Tabs defaultValue="terracotta" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="terracotta" className="text-xs sm:text-sm py-1 px-1 sm:px-3">TERRACOTTA</TabsTrigger>
                <TabsTrigger value="key1" className="text-xs sm:text-sm py-1 px-1 sm:px-3">KEY1</TabsTrigger>
                <TabsTrigger value="liymlight" className="text-xs sm:text-sm py-1 px-1 sm:px-3">LIYMLIGHT</TabsTrigger>
                <TabsTrigger value="lavender" className="text-xs sm:text-sm py-1 px-1 sm:px-3">LAVENDER</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center self-end sm:self-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 ${viewMode === 'rows' ? 'bg-gray-100' : ''}`}
                onClick={() => setViewMode("rows")}
              >
                <Rows className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Image Grid - 2 columns by default, 3 on medium, 4 on large screens */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4' 
              : 'flex flex-col space-y-2 sm:space-y-4'}
          `}>
            {filteredImages.map((image, index) => (
              <div 
                key={image.id} // Use id instead of url
                className={`
                  cursor-pointer overflow-hidden rounded-lg border border-gray-200
                  ${viewMode === 'grid' 
                    ? 'aspect-square' 
                    : 'w-full aspect-video'}
                `}
                onClick={() => !imgError[image.url] && setSelectedImage(index)}
              >
                <div className="relative w-full h-full group">
                  {!imgError[image.url] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(image.url)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-xs sm:text-sm">
                          View
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2 sm:p-4 text-center">
                      <ImageOff className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-1 sm:mb-2" />
                      <p className="text-gray-500 text-xs sm:text-sm">Image not available</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Lightbox with improved styling */}
        {selectedImage !== null && filteredImages.length > 0 && selectedImage < filteredImages.length && (
          <div 
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-[90%] max-h-[90%] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent clicks on container from closing
            >
              {/* Close button - repositioned for better visibility */}
              <Button 
                variant="outline" 
                size="icon"
                className="absolute -top-12 right-0 z-[60] bg-white/10 text-white border-none hover:bg-white/20 h-10 w-10 rounded-full transition-all duration-200"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Centered image with enhanced styling */}
              <div className="group relative">
                <img 
                  src={filteredImages[selectedImage]?.url || ''}
                  alt={filteredImages[selectedImage]?.alt || ''}
                  className={`object-contain max-w-full max-h-[80vh] rounded-lg shadow-2xl transition-all duration-300 
                    ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                  onError={() => {
                    handleImageError(filteredImages[selectedImage]?.url || '');
                    setSelectedImage(null);
                  }}
                  onLoad={() => setFade(true)}
                />
                
                {/* Caption overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
                  <p className="text-white text-sm">{filteredImages[selectedImage]?.alt || ''}</p>
                </div>
              </div>
              
              {/* Lightbox Navigation Buttons - Updated to hide on mobile */}
              {/* Desktop navigation buttons - HIDDEN ON MOBILE */}
              <Button 
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[120%] bg-white/10 text-white border-none hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hidden sm:block"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[120%] bg-white/10 text-white border-none hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hidden sm:block"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
              
              {/* Mobile navigation (visible only on small screens) */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 sm:hidden">
                <Button 
                  variant="outline"
                  size="icon"
                  className="bg-black/50 text-white border-none hover:bg-black/80 h-12 w-12 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="bg-black/50 text-white border-none hover:bg-black/80 h-12 w-12 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Controls - Modified to remove gradient */}
      
    </>
  );
}