"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Headphones, X, RotateCcw, Home, ArrowRight, Users, Bed, Bath, Smartphone } from "lucide-react"
import { APARTMENT_TYPES, APARTMENT_PANORAMAS } from "../app/apartment-types"

// Custom hook to detect mobile devices
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any
      "a-sky": any
      "a-camera": any
      "a-cursor": any
      "a-sphere": any
      "a-text": any
      "a-box": any
      "a-entity": any
      "a-assets": any
      "a-image": any
      "a-ring": any
      "a-plane": any
      "a-light": any
    }
  }
}

declare global {
  interface Window {
    AFRAME: any
    navigateToRoom?: (roomId: string) => void
    backToSelection?: () => void
  }
}

type ViewMode = "selection" | "tour"

// Environment configurations for different apartment types
const getEnvironmentConfig = (apartmentId: string | null) => {
  if (apartmentId === "BuildingExterior") {
    // Building exterior - large outdoor environment
    return {
      environmentOffset: 0,
      skyRadius: 30, // Very large radius for outdoor feeling
      cameraHeight: -10, // Normal human height
      hotspotRadius: 0.5, // Visible hotspots for outdoor scale
      hotspotScale: "0 0 0", // Normal text scale
      textWidth: "15", // Wider text for readability
      fov: "40", // Wide field of view for outdoor
      rotationLimits: {
        minPitch: -40, // Can look down more for ground view
        maxPitch: 40, // Can look up more for sky/building tops
        minYaw: 80, // Can look left (increased from -20)
        maxYaw: 100, // Can look right (increased from 20)
      },
      initialRotation: "0 90 0", // Start looking at the building (180° turn)
      backgroundColor: "#87CEEB", // Sky blue background
      ambientIntensity: 0.6, // Brighter ambient for outdoor
      directionalIntensity: 0.8, // Strong directional light like sun
      hotspotYOffset: 2.0, // Higher label offset for larger scale
      controllerRange: 50, // Longer controller range for outdoor
    }
  } else {
    // Indoor apartments - smaller, more intimate environment
    return {
      environmentOffset: -100,
      skyRadius: -50, // Increased from 3 to 10 for better hotspot positioning
      cameraHeight: 1.6, // Normal human height
      hotspotRadius: 0.5, // Increased from 0.15 to 0.25 for better visibility
      hotspotScale: "1.5 1.5 1.5", // Slightly larger text scale
      textWidth: "5", // Slightly wider text for better readability
      fov: "80", // Narrower FOV for indoor spaces
      rotationLimits: {
        // minPitch: -60, // Limited vertical look for indoor
        // maxPitch: 30,
        // minYaw: -360, // Can look left
        // maxYaw: 360, // Can look right
      },
      backgroundColor: "#000000", // Black background
      ambientIntensity: 0.4, // Softer ambient for indoor
      directionalIntensity: 0.5, // Softer directional light
      hotspotYOffset: 0.4, // Slightly higher label offset
      controllerRange: 15, // Shorter controller range for indoor
    }
  }
}

export default function Component() {
  const isMobile = useMobileDetection()
  const [viewMode, setViewMode] = useState<ViewMode>("selection")
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [isVRMode, setIsVRMode] = useState(false)
  const [aframeLoaded, setAframeLoaded] = useState(false)
  const [vrSupported, setVrSupported] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0, z: 0, theta: 0, phi: 0 })
  const sceneRef = useRef<any>(null)
  const skyRef = useRef<any>(null)

  // Calculate derived state early
  const currentApartment = selectedApartment ? APARTMENT_TYPES.find((apt) => apt.id === selectedApartment) : null
  const currentRooms = selectedApartment
    ? APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS]
    : []
  const currentRoom = currentRooms[currentRoomIndex]

  const currentConfig = getEnvironmentConfig(selectedApartment)

  useEffect(() => {
    // Load A-Frame dynamically
    if (typeof window !== "undefined" && !window.AFRAME) {
      const script = document.createElement("script")
      script.src = "https://aframe.io/releases/1.4.0/aframe.min.js"
      script.onload = () => {
        setAframeLoaded(true)
        checkVRSupport()
        setupAFrameComponents()
      }
      document.head.appendChild(script)
    } else if (window.AFRAME) {
      setAframeLoaded(true)
      checkVRSupport()
      setupAFrameComponents()
    }
  }, [])

  // Global navigation functions
  useEffect(() => {
    window.navigateToRoom = (roomId: string) => {
      console.log("Navigating to room:", roomId)
      if (!selectedApartment) return
      const rooms = APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS]
      const newRoomIndex = rooms.findIndex((room) => room.id === roomId)
      console.log("Found room index:", newRoomIndex, "for room:", roomId)
      if (newRoomIndex !== -1) {
        setCurrentRoomIndex(newRoomIndex)
      }
    }

    window.backToSelection = () => {
      setViewMode("selection")
      setSelectedApartment(null)
      setCurrentRoomIndex(0)
    }

    return () => {
      delete window.navigateToRoom
      delete window.backToSelection
    }
  }, [selectedApartment])

  // Update sky texture when room changes
  useEffect(() => {
    if (viewMode === "tour" && selectedApartment && skyRef.current) {
      const currentRoom = APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS][currentRoomIndex]

      // Force texture update by directly setting the src attribute
      if (currentRoom) {
        console.log("Updating sky texture to:", currentRoom.id)

        // Create a new image element to ensure proper loading
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          if (skyRef.current) {
            // Set the src directly to the URL instead of using the asset reference
            skyRef.current.setAttribute("src", currentRoom.url)
            console.log("Sky texture updated successfully")
          }
        }
        img.onerror = (err) => {
          console.error("Failed to load panorama image:", err)
        }
        img.src = currentRoom.url
      }
    }
  }, [viewMode, selectedApartment, currentRoomIndex])

  const backToSelection = () => {
    setViewMode("selection")
    setSelectedApartment(null)
    setCurrentRoomIndex(0)
  }

  const selectApartment = (apartmentId: string) => {
    setSelectedApartment(apartmentId)
    setCurrentRoomIndex(0)
    setViewMode("tour")
  }

  // Reset view when room changes
  useEffect(() => {
    if (viewMode === "tour" && aframeLoaded) {
      // Longer delay to ensure A-Frame scene is fully ready
      const timer = setTimeout(() => {
        resetView()
        setInitialCameraRotation()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currentRoomIndex, selectedApartment, viewMode, aframeLoaded])

  // Set initial camera rotation
  const setInitialCameraRotation = () => {
    if (sceneRef.current && currentConfig.initialRotation) {
      const camera = sceneRef.current.querySelector("[camera]")
      if (camera) {
        // Set initial rotation by modifying the look-controls component
        const lookControls = camera.components['look-controls']
        if (lookControls && lookControls.pitchObject && lookControls.yawObject) {
          const [pitch, yaw, roll] = currentConfig.initialRotation.split(' ').map(Number)
          
          // Convert degrees to radians
          const pitchRad = window.AFRAME.THREE.MathUtils.degToRad(pitch)
          const yawRad = window.AFRAME.THREE.MathUtils.degToRad(yaw)
          
          // Set the rotation on the pitch and yaw objects
          lookControls.pitchObject.rotation.x = pitchRad
          lookControls.yawObject.rotation.y = yawRad
          
          console.log("Initial camera rotation set:", currentConfig.initialRotation)
        }
      }
    }
  }

  // Debug logging
  useEffect(() => {
    console.log("Current room changed:", currentRoom?.id, "Index:", currentRoomIndex)
    console.log(
      "Available rooms:",
      currentRooms.map((r) => r.id),
    )
  }, [currentRoomIndex, currentRoom, currentRooms])

  const checkVRSupport = async () => {
    if (navigator.xr) {
      try {
        const isSupported = await navigator.xr.isSessionSupported("immersive-vr")
        setVrSupported(isSupported)
      } catch (error) {
        console.log("VR not supported:", error)
        setVrSupported(false)
      }
    } else {
      setVrSupported(false)
    }
  }

  const setupAFrameComponents = () => {
    if (!window.AFRAME) return

    // Register navigate-to-room component FIRST
    if (!window.AFRAME.components["navigate-to-room"]) {
      window.AFRAME.registerComponent("navigate-to-room", {
        schema: {
          roomId: { type: "string" },
        },
        init: function () {
          this.el.addEventListener("click", () => {
            console.log("Hotspot clicked:", this.data.roomId)
            if (window.navigateToRoom) {
              window.navigateToRoom(this.data.roomId)
            }
          })
        },
      })
    }

    // Register cursor coordinate tracking component
    if (!window.AFRAME.components["cursor-tracker"]) {
      window.AFRAME.registerComponent("cursor-tracker", {
        init: function () {
          this.raycaster = this.el.components.raycaster;
          
          // Track mouse movement
          this.onMouseMove = (evt: MouseEvent) => {
            if (!this.raycaster) return;
            
            // Get the canvas element
            const canvas = this.el.sceneEl.canvas;
            if (!canvas) return;
            
            // Calculate normalized coordinates
            const rect = canvas.getBoundingClientRect();
            const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update raycaster direction
            const camera = this.el;
            const raycaster = this.raycaster.raycaster;
            
            if (raycaster && camera.object3D) {
              // Set raycaster from camera position and mouse coordinates
              raycaster.setFromCamera({ x, y }, camera.object3D.children.find((child: any) => child.type === 'PerspectiveCamera') || camera.object3D);
              

              // Find intersection with sky
              const sky = this.el.sceneEl.querySelector('a-sky');
              if (sky && sky.object3D) {
                const intersects = raycaster.intersectObject(sky.object3D, true);
                
                if (intersects.length > 0) {
                  const point = intersects[0].point;
                  const distance = intersects[0].distance;
                  
                  // Convert to spherical coordinates
                  const theta = Math.atan2(point.x, point.z) * (180 / Math.PI);
                  const phi = Math.acos(point.y / distance) * (180 / Math.PI);
                  
                  setCursorCoords({
                    x: parseFloat(point.x.toFixed(3)),
                    y: parseFloat(point.y.toFixed(3)),
                    z: parseFloat(point.z.toFixed(3)),
                    theta: parseFloat(theta.toFixed(1)),
                    phi: parseFloat(phi.toFixed(1))
                  });
                }
              }
            }
          };
          
          // Add mouse move listener to canvas
          const canvas = this.el.sceneEl.canvas;
          if (canvas) {
            canvas.addEventListener('mousemove', this.onMouseMove);
          }
        },
        
        remove: function () {
          // Clean up event listener
          const canvas = this.el.sceneEl.canvas;
          if (canvas && this.onMouseMove) {
            canvas.removeEventListener('mousemove', this.onMouseMove);
          }
        }
      })
    }

    // Alternative simpler approach using tick component
    if (!window.AFRAME.components["real-time-cursor-tracker"]) {
      window.AFRAME.registerComponent("real-time-cursor-tracker", {
        init: function () {
          this.raycaster = new window.AFRAME.THREE.Raycaster();
          this.mouse = new window.AFRAME.THREE.Vector2();
          this.camera = null;
          this.sky = null;
        },
        
        tick: function () {
          // Get references if not available
          if (!this.camera) {
            this.camera = this.el.sceneEl.camera;
          }
          if (!this.sky) {
            this.sky = this.el.sceneEl.querySelector('a-sky');
          }
          
          if (!this.camera || !this.sky) return;
          
          // Get canvas and mouse position
          const canvas = this.el.sceneEl.canvas;
          if (!canvas) return;
          
          // Use cursor component's position if available
          const cursor = this.el.querySelector('a-cursor');
          if (cursor && cursor.object3D) {
            // Get world position of cursor
            const worldPos = new window.AFRAME.THREE.Vector3();
            cursor.object3D.getWorldPosition(worldPos);
            
            // Project ray from camera through cursor position
            const cameraPos = new window.AFRAME.THREE.Vector3();
            this.camera.getWorldPosition(cameraPos);
            
            const direction = worldPos.sub(cameraPos).normalize();
            this.raycaster.set(cameraPos, direction);
            
            // Check intersection with sky
            const intersects = this.raycaster.intersectObject(this.sky.object3D, true);
            
            if (intersects.length > 0) {
              const point = intersects[0].point;
              
              // A-Frame's sky has radius 500 by default
              // Your hotspots work with small values because they're positioned 
              // as if on a much smaller sphere (radius ~5)
              const skyRadius = 2;
              const hotspotRadius = 5; // The effective radius for hotspot positioning
              
              // Scale down from sky intersection to hotspot positioning scale
              const scaledPoint = {
                x: (point.x / skyRadius) * hotspotRadius,
                y: (point.y / skyRadius) * hotspotRadius,
                z: (point.z / skyRadius) * hotspotRadius
              };
              
              // Convert to spherical coordinates (in degrees)
              const theta = Math.atan2(scaledPoint.x, scaledPoint.z) * (180 / Math.PI);
              const phi = Math.acos(Math.abs(scaledPoint.y) / hotspotRadius) * (180 / Math.PI);
              
              setCursorCoords({
                x: parseFloat(scaledPoint.x.toFixed(1)),
                y: parseFloat(scaledPoint.y.toFixed(1)),
                z: parseFloat(scaledPoint.z.toFixed(1)),
                theta: parseFloat(theta.toFixed(1)),
                phi: parseFloat(phi.toFixed(1))
              });
            }
          }
        }
      });
    }

    // Register back to selection component
    if (!window.AFRAME.components["back-to-selection"]) {
      window.AFRAME.registerComponent("back-to-selection", {
        init: function () {
          this.el.addEventListener("click", () => {
            if (window.backToSelection) {
              window.backToSelection()
            }
          })
        },
      })
    }

    // Register hover effects
    if (!window.AFRAME.components["cursor-listener"]) {
      window.AFRAME.registerComponent("cursor-listener", {
        init: function () {
          this.el.addEventListener("mouseenter", function (this: any) {
            this.setAttribute("animation__hoverscale", "property: scale; to: 1.1 1.1 1.1; dur: 200; easing: easeOutBack")
            this.setAttribute(
              "animation__hoveremissive",
              "property: material.emissiveIntensity; to: 1.5; dur: 200; easing: easeOutQuart",
            )
          })

          this.el.addEventListener("mouseleave", function (this: any) {
            this.setAttribute("animation__hoverscale", "property: scale; to: 1 1 1; dur: 150; easing: easeInBack")
            this.setAttribute(
              "animation__hoveremissive",
              "property: material.emissiveIntensity; to: 0.8; dur: 150; easing: easeInQuart",
            )
          })
        },
      })
    }

    // VR mode detection
    if (!window.AFRAME.components["vr-mode-listener"]) {
      window.AFRAME.registerComponent("vr-mode-listener", {
        init: function () {
          this.el.addEventListener("enter-vr", () => {
            setIsVRMode(true)
          })
          this.el.addEventListener("exit-vr", () => {
            setIsVRMode(false)
          })
        },
      })
    }

    // Register asset-loaded component
    if (!window.AFRAME.components["asset-loaded"]) {
      window.AFRAME.registerComponent("asset-loaded", {
        init: function () {
          this.el.addEventListener("loaded", () => {
            console.log("All assets loaded successfully")
            setAssetsLoaded(true)
          })
        },
      })
    }

    // Register exit-vr-button component
    if (!window.AFRAME.components["exit-vr-button"]) {
      window.AFRAME.registerComponent("exit-vr-button", {
        init: function () {
          this.el.addEventListener("click", () => {
            if (sceneRef.current && sceneRef.current.exitVR) {
              sceneRef.current.exitVR()
            }
          })
        },
      })
    }

    // Register limit-vertical-rotation component
    if (!window.AFRAME.components["limit-vertical-rotation"]) {
      window.AFRAME.registerComponent("limit-vertical-rotation", {
        schema: {
          minPitch: { type: "number", default: -180 },
          maxPitch: { type: "number", default: 180 },
          minYaw: { type: "number", default: -180 },
          maxYaw: { type: "number", default: 180 }
        },
        tick: function () {
          const cameraEl = this.el;
          const object3D = cameraEl.object3D;
          if (!object3D) return;

          // Get current rotation in Euler angles (in radians)
          const rotation = object3D.rotation;
          
          // Clamp pitch (x axis) in radians
          const minPitch = window.AFRAME.THREE.MathUtils.degToRad(this.data.minPitch);
          const maxPitch = window.AFRAME.THREE.MathUtils.degToRad(this.data.maxPitch);
          if (rotation.x < minPitch) rotation.x = minPitch;
          if (rotation.x > maxPitch) rotation.x = maxPitch;
          
          // Clamp yaw (y axis) in radians
          const minYaw = window.AFRAME.THREE.MathUtils.degToRad(this.data.minYaw);
          const maxYaw = window.AFRAME.THREE.MathUtils.degToRad(this.data.maxYaw);
          if (rotation.y < minYaw) rotation.y = minYaw;
          if (rotation.y > maxYaw) rotation.y = maxYaw;
        }
      });
    }

    // Register billboard component for text labels
    if (!window.AFRAME.components["billboard"]) {
      window.AFRAME.registerComponent("billboard", {
        tick: function () {
          const camera = this.el.sceneEl.camera;
          if (camera) {
            // Make the text always face the camera
            this.el.object3D.lookAt(camera.position);
          }
        }
      });
    }
  }

  const enterVR = async () => {
    if (!sceneRef.current) return

    try {
      if (sceneRef.current.enterVR) {
        await sceneRef.current.enterVR()
      } else {
        alert("VR not available. Please connect a VR headset and try again.")
      }
    } catch (error) {
      console.error("Failed to enter VR:", error)
      alert("Failed to enter VR mode. Make sure your VR headset is connected and WebXR is enabled.")
    }
  }

  const exitVR = () => {
    if (sceneRef.current && sceneRef.current.exitVR) {
      sceneRef.current.exitVR()
    }
  }

  const resetView = () => {
    if (sceneRef.current) {
      const camera = sceneRef.current.querySelector("[camera]")
      if (camera) {
        // Reset both position and rotation using config values
        camera.setAttribute("position", `0 ${currentConfig.cameraHeight} 0`)
        camera.setAttribute("rotation", currentConfig.initialRotation || "0 0 0")
        
        console.log("Camera view reset successfully with config:", currentConfig)
      } else {
        console.log("Camera element not found")
      }
    } else {
      console.log("Scene reference not available")
    }
  }

  // Preload all panorama images
  const preloadImages = () => {
    return (
      <>
        {Object.entries(APARTMENT_PANORAMAS).map(([aptType, rooms]) =>
          rooms.map((room) => (
            <img
              key={`preload-${aptType}-${room.id}`}
              src={room.url || "/placeholder.svg"}
              style={{ display: "none" }}
              alt=""
              onLoad={() => console.log(`Preloaded: ${room.id}`)}
              onError={() => console.error(`Failed to preload: ${room.id}`)}
            />
          ))
        )}
      </>
    )
  }

  // Show mobile unsupported message
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] via-[#0F5D52] to-[#134E44] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <Smartphone className="w-16 h-16 text-[#2DD4BF] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4 font-montserrat">Mobile Not Supported</h1>
            </div>
            
            <div className="space-y-4 text-[#2DD4BF]/90 font-montserrat">
              <p className="text-lg">
                This VR Panorama Tour requires a desktop or laptop computer for the best experience.
              </p>
              
              <div className="bg-[#0B4D43]/30 rounded-xl p-4 text-sm">
                <h3 className="font-semibold text-white mb-2">Why desktop only?</h3>
                <ul className="text-left space-y-1">
                  <li>• VR headset compatibility</li>
                  <li>• Better performance for 3D rendering</li>
                  <li>• Full keyboard and mouse controls</li>
                  <li>• Larger screen for immersive experience</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#2DD4BF]/70">
                Please visit this page on a desktop computer to experience the full virtual tour.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] via-[#0F5D52] to-[#134E44] relative overflow-hidden">
      {/* Preload images */}
      {preloadImages()}

      {/* Load Montserrat font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* UI Selection Mode */}
      {viewMode === "selection" && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="relative z-10 p-8 pt-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 font-montserrat">Virtual Tours</h1>
                <p className="text-xl text-[#2DD4BF]/80 font-montserrat">Experience immersive 360° tours with VR support

</p>
              </div>
            </div>
          </div>

          {/* Apartment Selection Cards */}
          <div className="flex-1 px-8 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {APARTMENT_TYPES.map((apartment, index) => (
                  <Card
                    key={apartment.id}
                    className="group cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl overflow-hidden hover:border-[#2DD4BF]/60 hover:bg-[#0B4D43]/30 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => selectApartment(apartment.id)}
                  >
                    <div className="relative">
                      {/* Thumbnail Image */}
                      <div className="aspect-video overflow-hidden rounded-xl">
                        <img
                          src={apartment.thumbnail || "/placeholder.svg?height=300&width=400"}
                          alt={apartment.name}
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                        />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl transition-opacity duration-300 group-hover:opacity-80" />

                      {/* Apartment Type Badge */}
                      {/* <div className="absolute top-4 left-4">
                        <span className="bg-[#2DD4BF] text-[#0B4D43] px-3 py-1 rounded-full text-sm font-semibold font-montserrat transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                          Premium
                        </span>
                      </div> */}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2 font-montserrat transition-all duration-300 group-hover:text-[#2DD4BF]">{apartment.name}</h3>
                          <p className="text-[#2DD4BF]/80 font-montserrat transition-all duration-300 group-hover:text-[#2DD4BF]">{apartment.description}</p>
                        </div>
                      </div>

                      {/* Features */}
                      {/* <div className="flex items-center gap-4 mb-6 text-[#2DD4BF]/80">
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Bed className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Lavender" ? "1 Bed" : apartment.id === "Terracotta" ? "1 Bed" : "2 Bed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Bath className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Limelight" ? "2 Bath" : "1 Bath"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Users className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Limelight" ? "4 People" : "2 People"}
                          </span>
                        </div>
                      </div> */}

                      {/* Action Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] border-0 rounded-xl py-3 font-semibold font-montserrat transition-all duration-500 ease-out group-hover:shadow-lg group-hover:scale-105 transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          selectApartment(apartment.id)
                        }}
                      >
                        <span className="transition-all duration-300 group-hover:translate-x-1">Start Virtual Tour</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <div className="p-8 text-center">
            <p className="text-[#2DD4BF]/60 font-montserrat">Experience immersive 360° tours with VR support</p>
          </div> */}
        </div>
      )}

      {/* VR Tour Mode */}
      {viewMode === "tour" && (
        <>
          {/* Debug Coordinates Label */}
          {/* <div className="absolute top-4 left-4 z-30">
            <div className="bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg font-mono text-xs text-white">
              <div className="font-semibold text-yellow-400 mb-2">Debug Cursor Coordinates</div>
              <div className="space-y-1">
                <div>X: <span className="text-green-400">{cursorCoords.x}</span></div>
                <div>Y: <span className="text-green-400">{cursorCoords.y}</span></div>
                <div>Z: <span className="text-green-400">{cursorCoords.z}</span></div>
                <div>θ: <span className="text-blue-400">{cursorCoords.theta}°</span></div>
                <div>φ: <span className="text-blue-400">{cursorCoords.phi}°</span></div>
              </div>
            </div>
          </div> */}

          {/* Modern Header */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-60 pl-10 pr-10">
            <div className="flex justify-between items-start">
              {/* Current Info */}
              <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:bg-[#0B4D43]/30 hover:border-[#2DD4BF]/50 hover:shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-1 font-montserrat transition-all duration-300 hover:text-[#2DD4BF]">{currentApartment?.name}</h1>
                <p className="text-[#2DD4BF]/80 text-sm mb-2 font-montserrat transition-all duration-300 hover:text-[#2DD4BF]">{currentRoom?.title}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse transition-all duration-300 hover:scale-125"></div>
                  <span className="text-white/70 text-xs font-medium font-montserrat transition-all duration-300 hover:text-white">
                    Room {currentRoomIndex + 1} of {currentRooms.length}
                  </span>
                </div>
              </div>

              {/* VR Button */}
              {/* <Button
                onClick={enterVR}
                disabled={!aframeLoaded || !vrSupported}
                className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] border-0 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-montserrat font-semibold transform"
              >
                <Headphones className="w-5 h-5 mr-2 transition-all duration-300 group-hover:rotate-12" />
                {vrSupported ? "Enter VR" : "VR Unavailable"}
              </Button> */}
            </div>
          </div>

          {/* Modern Control Panel - Always visible */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:bg-[#0B4D43]/30 hover:border-[#2DD4BF]/50 hover:shadow-2xl">
              <div className="flex items-center justify-between">
                {/* Navigation Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={backToSelection}
                    className="text-white hover:bg-[#2DD4BF]/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:text-[#2DD4BF] transform"
                  >
                    <Home className="w-5 h-5 transition-all duration-300 group-hover:rotate-12" />
                  </Button>

                  <div className="flex items-center gap-2 px-4">
                    {currentRooms.map((room, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentRoomIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ease-out transform hover:scale-125 ${
                          index === currentRoomIndex 
                            ? "bg-[#2DD4BF] w-6 shadow-lg shadow-[#2DD4BF]/50" 
                            : "bg-white/40 hover:bg-[#2DD4BF]/80 hover:shadow-md"
                        }`}
                        title={room.title}
                      />
                    ))}
                  </div>
                </div>

                {/* Utility Controls */}
                {/* <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetView}
                    className="text-white hover:bg-[#2DD4BF]/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:text-[#2DD4BF] transform"
                  >
                    <RotateCcw className="w-4 h-4 transition-all duration-300 hover:rotate-180" />
                  </Button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Exit VR Button */}
          {isVRMode && (
            <div className="absolute top-6 right-6 z-30">
              <Button
                onClick={exitVR}
                className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white border-0 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-3xl font-montserrat font-semibold transform group"
                size="lg"
              >
                <X className="w-6 h-6 mr-2 transition-all duration-300 group-hover:rotate-90" />
                Exit VR
              </Button>
            </div>
          )}

          {/* A-Frame Scene */}
          {aframeLoaded && (
            <div className="absolute inset-0">
              <a-scene
                ref={sceneRef}
                vr-mode-ui="enabled: true"
                embedded
                style={{ height: "100vh", width: "100vw" }}
                background="color: #000"
                vr-mode-listener
                asset-loaded
              >
                <a-assets>
                  {currentRoom && (
                    <a-image
                      key={`asset-${currentRoom.id}`}
                      id={`panorama-${currentRoom.id}`}
                      src={currentRoom.url || "/placeholder.svg"}
                      crossorigin="anonymous"
                    />
                  )}
                </a-assets>

                <a-sky
                  radius="800"
                  ref={skyRef}
                  src={currentRoom?.url || "/placeholder.svg"}
                  rotation="0 0 0"
                  position={`0 ${currentConfig.environmentOffset} 0`}
                />

                <a-camera
                  look-controls="enabled: true; pointerLockEnabled: false"
                  wasd-controls="enabled: false"
                  position={`0 ${currentConfig.environmentOffset} 0`}
                  rotation={currentConfig.initialRotation}
                  fov={currentConfig.fov}
                  cursor="fuse: false; rayOrigin: mouse"
                  debug-cursor-tracker
                  raycaster="objects: .clickable, [navigate-to-room], [back-to-selection]; far: 50"
                  limit-vertical-rotation={`minPitch: ${currentConfig.rotationLimits.minPitch}; maxPitch: ${currentConfig.rotationLimits.maxPitch}; minYaw: ${currentConfig.rotationLimits.minYaw}; maxYaw: ${currentConfig.rotationLimits.maxYaw}`}
                >
                  <a-cursor
                    geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
                    material="color: #2DD4BF; shader: flat; opacity: 0.9"
                    animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
                    animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
                    raycaster="objects: .clickable, [navigate-to-room], [back-to-selection]; far: 50"
                    cursor="fuse: true; fuseTimeout: 1500"
                  />
                </a-camera>

                {/* VR Scene Controls */}
                <a-entity position={`0 ${currentConfig.cameraHeight} 0`}>
                  {/* Home Button - Professional React-style button */}
                  <a-entity position="0 2 -3">
                    {/* Main button body */}
                    <a-box
                      position="0 0.05 -0.05"
                      width="0.4"
                      height="0.2"
                      depth="0.02"
                      color="#2DD4BF"
                      material="emissive: #2DD4BF; emissiveIntensity: 0.2; transparent: false; opacity: 1.0; metalness: 0.1; roughness: 0.9; borderRadius: 0.8"
                      animation="property: material.emissiveIntensity; to: 0.6; dir: alternate; dur: 1500; loop: true; easing: easeInOutSine"
                      cursor-listener
                      class="clickable"
                      back-to-selection
                    />
                    
                    {/* Button shadow for depth */}
                    {/* <a-box
                      position="0 -0.02 -0.01"
                      width="0.4"
                      height="0.2"
                      depth="0.08"
                      color="#0B4D43"
                      material="transparent: false; opacity: 0.4"
                    /> */}
                    
                    {/* Button text floating above */}
                    <a-text
                      position="0 0 0.05"
                      value="🏠 Home"
                      align="center"
                      color="#ffffff"
                      font="kelsonsans"
                      width="6"
                      weight="600"
                      scale="0.4 0.4 0.4"
                      billboard
                    />
                  </a-entity>

                  {/* Exit VR Button - Professional error button */}
                  {isVRMode && (
                    <a-entity position="0 1.7 -3">
                      {/* Main button body */}
                      <a-box
                        position="0 0 0"
                        width="0.4"
                        height="0.2"
                        depth="0.02"
                        color="#EF4444"
                        material="emissive: #EF4444; emissiveIntensity: 0.2; transparent: false; opacity: 1.0; metalness: 0.1; roughness: 0.9; borderRadius: 0.8"
                        animation="property: material.emissiveIntensity; to: 0.6; dir: alternate; dur: 1500; loop: true; easing: easeInOutSine"
                        cursor-listener
                        class="clickable"
                        exit-vr-button
                      />
                      
                      {/* Button shadow for depth */}
                      {/* <a-box
                        position="0.02 -0.02 -0.04"
                        width="2.4"
                        height="0.6"
                        depth="0.08"
                        color="#7F1D1D"
                        material="transparent: false; opacity: 0.4"
                      /> */}
                      
                      {/* Button text floating above */}
                      <a-text
                        position="0 0 0.05"
                        value="❌ Exit VR"
                        align="center"
                        color="#ffffff"
                        font="kelsonsans"
                        width="6"
                        weight="600"
                        scale="0.4 0.4 0.4"
                        billboard
                      />
                    </a-entity>
                  )}
                </a-entity>

                {/* VR Controllers */}
                {isVRMode && (
                  <>
                    <a-entity
                      id="leftController"
                      laser-controls="hand: left"
                      raycaster="objects: .clickable; far: 20"
                      line="color: #2DD4BF; opacity: 0.8"
                    />
                    <a-entity
                      id="rightController"
                      laser-controls="hand: right"
                      raycaster="objects: .clickable; far: 20"
                      line="color: #2DD4BF; opacity: 0.8"
                    />
                  </>
                )}

                {/* Enhanced Lighting */}
                <a-light type="ambient" color="#0B4D43" intensity="0.3" />
                <a-light type="directional" position="0 2 1" color="#2DD4BF" intensity="0.4" />

                {/* Room Navigation Hotspots */}
                <a-entity position={`0 ${currentConfig.cameraHeight} 0`}>
                  {currentRoom?.hotspots &&
                    currentRoom.hotspots.map((hotspot, index) => {
                      const coords = hotspot.position.split(" ").map(Number)
                      const textY = coords[1] + 0.8 // Fixed offset for text positioning
                      
                      return (
                        <a-entity key={`${hotspot.roomId}-${index}`}>
                          {/* Teal hotspot sphere */}
                          <a-sphere
                            position={hotspot.position}
                            radius="0.3"
                            color="#2DD4BF"
                            material="emissive: #2DD4BF; emissiveIntensity: 0.8; transparent: false; opacity: 1.0; metalness: 0.3; roughness: 0.3"
                            animation="property: material.emissiveIntensity; to: 1.5; dir: alternate; dur: 1500; loop: true; easing: easeInOutSine"
                            cursor-listener
                            class="clickable"
                            navigate-to-room={`roomId: ${hotspot.roomId}`}
                          />

                          {/* Permanent title above hotspot */}
                          <a-text
                            position={`${coords[0]} ${textY} ${coords[2]}`}
                            value={hotspot.label}
                            align="center"
                            color="#ffffff"
                            font="kelsonsans"
                            width="10"
                            weight="700"
                            background="color: rgba(11,77,67,0.95); padding: 0.4 0.8; borderRadius: 0.3"
                            material="transparent: true; opacity: 1.0"
                            scale="0.5 0.5 0.5"
                            billboard
                          />
                        </a-entity>
                      )
                    })}
                </a-entity>
              </a-scene>
            </div>
          )}
        </>
      )}

      {!aframeLoaded && viewMode === "tour" && (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#2DD4BF]/50 rounded-full animate-ping mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">Loading VR Experience</h2>
            <p className="text-[#2DD4BF]/80 font-montserrat">Preparing your virtual tour...</p>
          </div>
        </div>
      )}
    </div>
  )
}