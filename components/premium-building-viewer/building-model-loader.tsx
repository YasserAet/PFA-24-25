"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Enhanced debugging - set to true when you need to debug mesh names
const DEBUG = false; // Toggle this to control debug output
const MESH_DEBUG = false; // Special flag just for mesh name debugging

// Improved debug logging with optional object inspection
const debugLog = (...args: any[]) => DEBUG && console.log(...args);
const meshLog = (...args: any[]) => (DEBUG && MESH_DEBUG) && console.log('%c[MESH DEBUG]', 'color: #2ecc71; font-weight: bold', ...args);

interface BuildingModelLoaderProps {
  envModelPath?: string;
  currentFloor?: number;
  scale?: number;
  onFlatClick?: (flat: THREE.Object3D) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  modalOpen?: boolean;
  quality: string
}

export function BuildingModelLoader({
  envModelPath = "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/ENVFINAL2.glb",
  currentFloor = -1,
  scale = 1,
  onFlatClick,
  onLoadingChange,
  modalOpen = false, // New prop to disable interactions when modal is open
}: BuildingModelLoaderProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const currentFloorStructureRef = useRef(null)
  const currentFloorPlanRef = useRef(null)
  const [isPreloading, setIsPreloading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [clickableObjects, setClickableObjects] = useState<THREE.Object3D[]>([])
  const [hoveredFlat, setHoveredFlat] = useState<THREE.Object3D | null>(null)
  const originalMaterials = useRef<Record<string, THREE.Material>>({})
  const loadedModels = useRef<{
    environment: THREE.Group | null;
    structures: Record<number, THREE.Group>;
    plans: Record<number, THREE.Group>;
  }>({
    environment: null,
    structures: {},
    plans: {},
  })

  const floorMeshes = useRef<Record<number, THREE.Mesh[]>>({}); // Persistent cache

  const defaultMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#cccccc",
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: true, // ADDED: Ensure depth writing for transparency
        depthTest: true,  // ADDED: Ensure depth testing
      }),
    [],
  )

  // Update the hover material approach
  const hoverMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00ff00),
      transparent: false,
      opacity: 1.0, // Full opacity
      emissive: new THREE.Color(0x16a34a),
      emissiveIntensity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: true, // Already here, good!
      metalness: 0.1,
      roughness: 0.7
    })
  }, [])

  const { scene, camera, raycaster, pointer } = useThree()
  
  // Create loader with Draco compression support
  const gltfLoader = useMemo(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    // Verify decoder files exist and fallback if they don't
    const checkDecoderAvailable = async () => {
      try {
        const response = await fetch('/draco/draco_decoder.js');
        return response.ok;
      } catch (e) {
        return false;
      }
    };

    // Then configure loader accordingly
    const configureLoader = async () => {
      const available = await checkDecoderAvailable();
      if (available) {
        dracoLoader.setDecoderPath('/draco/');
      } else {
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      }
    };

    configureLoader();

    // Attach Draco loader to GLTF loader
    loader.setDRACOLoader(dracoLoader);
    
    return loader;
  }, []);

  const [labelPosition, setLabelPosition] = useState<{ x: number, y: number } | null>(null)
  const [labelContent, setLabelContent] = useState<{ type: string, area: string } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Add types for DB-backed data
  type DBFloor = {
    id: string;
    name: string;
    level: number;
    floor_model_path: string;
    plan_model_path: string;
  };

  type SpaceDataMap = Record<string, { type: string; area: string }>;

  // Add state for DB-backed data
  const [dbFloors, setDbFloors] = useState<DBFloor[]>([]);
  const [spaceData, setSpaceData] = useState<SpaceDataMap>({});

  // Fetch floors + space-data before preloading models
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch floors
        const floorsRes = await fetch("/api/floors");
        if (!floorsRes.ok) throw new Error("API /api/floors error");
        const floorsData = await floorsRes.json();
        if (mounted) setDbFloors(Array.isArray(floorsData) ? floorsData : []);

        // Fetch space data
        const spaceRes = await fetch("/api/space-data");
        if (!spaceRes.ok) throw new Error("API /api/space-data error");
        const spaceDataObj = await spaceRes.json();
        if (mounted) setSpaceData(spaceDataObj && typeof spaceDataObj === "object" ? spaceDataObj : {});

        console.log("BuildingModelLoader: Data received:", {
          floors: Array.isArray(floorsData) ? floorsData.length : 0,
          spaceData: spaceDataObj ? Object.keys(spaceDataObj).length : 0,
          sampleFloor: Array.isArray(floorsData) ? floorsData[0] : undefined
        });
      } catch (e) {
        console.error("Failed to load DB data", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Make your preloader wait for DB data
  useEffect(() => {
    console.log("BuildingModelLoader: Preloader effect triggered, dbFloors length:", dbFloors.length);
    if (!dbFloors.length) {
      console.log("BuildingModelLoader: Waiting for floors data...");
      return;      // wait until floors arrive
    }
    async function run() {
      try {
        console.log("BuildingModelLoader: Starting preloading process...");
        console.log("BuildingModelLoader: Floor data:", dbFloors);
        // debugLog("Starting preloading process...")

        const totalModels =
          1 +
          dbFloors.reduce((count, floor) => {
            return count + (floor.floor_model_path ? 1 : 0) + (floor.plan_model_path ? 1 : 0)
          }, 0)

        let loadedCount = 0

        const updateProgress = () => {
          loadedCount++
          const percentage = Math.round((loadedCount / totalModels) * 100)
          setLoadProgress(percentage)
          // debugLog(`Loading progress: ${percentage}%`)
        }

        // Shared materials for optimization - not used directly, but kept
        const sharedMaterials = {}

        const envPromise = new Promise((resolve, reject) => {
          gltfLoader.load(
            envModelPath,
            (gltf) => {
              const model = gltf.scene.clone()
              model.name = "ENVIRONMENT_MODEL"
              
              // Log environment model hierarchy
              if (MESH_DEBUG) {
                const logHierarchy = (object: THREE.Object3D, depth = 0) => {
                  const indent = '  '.repeat(depth);
                  const typeLabel = object instanceof THREE.Mesh ? 
                    '📦 Mesh' : object instanceof THREE.Group ? 
                    '📂 Group' : '🔹 Object';
                  
                  // meshLog(`${indent}${typeLabel}: "${object.name || 'unnamed'}" (${object.type})`);
                  
                  if (object instanceof THREE.Mesh) {
                    const materialType = Array.isArray(object.material) ? 
                      `MultiMaterial[${object.material.length}]` : 
                      object.material.type;
                    
                    // meshLog(`${indent}  - Material: ${materialType}`);
                    // meshLog(`${indent}  - Geometry: Vertices: ${object.geometry.attributes.position.count}`);
                  }
                  
                  object.children.forEach(child => logHierarchy(child, depth + 1));
                };
                
                logHierarchy(model);
              }

              // Simply set shadows, no material manipulation
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              })

              loadedModels.current.environment = model
              if (groupRef.current) groupRef.current.add(model)

              updateProgress()
              resolve(undefined)
            },
            undefined,
            (error) => {
              console.error("BuildingModelLoader: Error loading environment model:", error);
              console.log("BuildingModelLoader: Environment model path was:", envModelPath);
              updateProgress()
              resolve(undefined) // Still resolve to continue loading other models
            },
          )
        })

        await envPromise

        const loadFloor = async (floorLevel: number) => {
          // Loading code just for this floor
          const floor = dbFloors.find(f => f.level === floorLevel);
          if (!floor) {
            console.log(`BuildingModelLoader: No floor data found for level ${floorLevel}`);
            return;
          }
          console.log(`BuildingModelLoader: Loading floor ${floorLevel}:`, {
            name: floor.name,
            floor_model_path: floor.floor_model_path,
            plan_model_path: floor.plan_model_path
          });

          if (floor.floor_model_path) {
            console.log(`BuildingModelLoader: Loading structure model for floor ${floorLevel} from:`, floor.floor_model_path);
            const structPromise = new Promise((resolve) => {
              gltfLoader.load(
                floor.floor_model_path,
                (gltf) => {
                  console.log(`BuildingModelLoader: Structure model loaded successfully for floor ${floorLevel}`);
                  console.log(`BuildingModelLoader: Model scene children:`, gltf.scene.children.length);
                  const model = gltf.scene.clone()
                  model.name = `FLOOR_STRUCTURE_${floor.level}_MODEL`
                  model.visible = false
                  
                  // Log structure model hierarchy for this floor
                  if (MESH_DEBUG) {
                    let meshCount = 0;
                    model.traverse((child) => {
                      if (child instanceof THREE.Mesh) {
                        meshCount++;
                      }
                    });
                  }

                  model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                      child.castShadow = true
                      child.receiveShadow = true
                      child.userData.clickable = false // CHANGED: Not clickable
                      child.userData.type = 'structure' // NEW: Mark as structure
                      child.userData.floorLevel = floor.level
                      
                      // Still track in floorMeshes for visibility management
                      if (!floorMeshes.current[floor.level]) floorMeshes.current[floor.level] = [];
                      if (child instanceof THREE.Mesh) {
                        floorMeshes.current[floor.level].push(child);
                      }
                      
                      // If the mesh has a material and might be transparent, ensure depthWrite is true
                      if (child.material) {
                          const ensureDepthWrite = (mat: THREE.Material) => {
                              if (mat.transparent === true) { // Explicitly check for transparency
                                  mat.depthWrite = true; // IMPORTANT FIX
                                  mat.depthTest = true;  // Also good practice
                              }
                          };

                          if (Array.isArray(child.material)) {
                              child.material.forEach(ensureDepthWrite);
                          } else {
                              ensureDepthWrite(child.material);
                          }
                      }
                    }
                  });

                  loadedModels.current.structures[floor.level] = model
                  if (groupRef.current) {
                    groupRef.current.add(model)
                    console.log(`BuildingModelLoader: Structure model added to scene for floor ${floorLevel}`);
                  } else {
                    console.warn(`BuildingModelLoader: groupRef.current is null for floor ${floorLevel}`);
                  }

                  updateProgress()
                  resolve(undefined)
                },
                undefined,
                (error) => {
                  console.error(`BuildingModelLoader: Error loading structure for floor ${floor.level}:`, error)
                  console.error(`BuildingModelLoader: Path attempted:`, floor.floor_model_path)
                  updateProgress()
                  resolve(undefined)
                },
              )
            })
            await structPromise;
          }

          if (floor.plan_model_path) {
            console.log(`BuildingModelLoader: Loading plan model for floor ${floorLevel} from:`, floor.plan_model_path);
            const planPromise = new Promise((resolve) => {
              gltfLoader.load(
                floor.plan_model_path,
                (gltf) => {
                  console.log(`BuildingModelLoader: Plan model loaded successfully for floor ${floorLevel}`);
                  console.log(`BuildingModelLoader: Plan model scene children:`, gltf.scene.children.length);
                  const model = gltf.scene;
                  model.name = `FLOOR_PLAN_${floor.level}_MODEL`
                  model.visible = false
                  
                  // Log detailed floor plan model hierarchy
                  if (MESH_DEBUG) {
                    let hoverableMeshes = 0;
                    let nonHoverableMeshes = 0;
                    
                    const meshNamesList: string[] = [];
                    
                    model.traverse((child) => {
                      if (child instanceof THREE.Mesh) {
                        const meshName = child.name || 'unnamed';
                        meshNamesList.push(meshName);
                        
                        const isCommonArea = 
                          meshName.includes('HALL') || 
                          meshName.includes('LOBBY') || 
                          meshName.includes('ENTRANCE') || 
                          meshName.includes('ELECTRICAL') || 
                          meshName.includes('GUARD') || 
                          meshName.includes('GARBAGE') || 
                          meshName.includes('TELECOM') || 
                          meshName.includes('GROUND1') ||
                          meshName.includes('STAIR') ||
                          meshName.includes('CORRIDOR');
                          
                        if (isCommonArea) {
                          nonHoverableMeshes++;
                        } else {
                          hoverableMeshes++;
                        }
                      }
                    });
                  }

                  model.traverse((child) => {
                    // Set basic properties
                    child.userData.clickable = true;
                    child.userData.type = 'plan';
                    child.userData.floorLevel = floor.level;
                    
                    // Default: NOT hoverable
                    child.userData.hoverable = false;
                    
                    if (child instanceof THREE.Mesh) {
                      const meshName = child.name;
                      
                      const isCommonArea = 
                        meshName.includes('HALL') || 
                        meshName.includes('LOBBY') || 
                        meshName.includes('ENTRANCE') || 
                        meshName.includes('ELECTRICAL') || 
                        meshName.includes('GUARD') || 
                        meshName.includes('GARBAGE') || 
                        meshName.includes('TELECOM') || 
                        meshName.includes('GROUND1') ||
                        meshName.includes('STAIR') ||
                        meshName.includes('CORRIDOR');
                      
                      // Make EVERYTHING hoverable except common areas
                      child.userData.hoverable = !isCommonArea;
                      
                      // Print debug info for each floor object
                      if (MESH_DEBUG) {
                        // meshLog(`Floor ${floor.level} - Object "${meshName}" - Hoverable: ${child.userData.hoverable}`);
                      }
                      
                      // Add to floor meshes cache
                      if (!floorMeshes.current[floor.level]) floorMeshes.current[floor.level] = [];
                      floorMeshes.current[floor.level].push(child);

                      // If the mesh has a material and might be transparent, ensure depthWrite is true
                      if (child.material) {
                          const ensureDepthWrite = (mat: THREE.Material) => {
                              if (mat.transparent === true) { // Explicitly check for transparency
                                  mat.depthWrite = true; // IMPORTANT FIX
                                  mat.depthTest = true;  // Also good practice
                              }
                          };

                          if (Array.isArray(child.material)) {
                              child.material.forEach(ensureDepthWrite);
                          } else {
                              ensureDepthWrite(child.material);
                          }
                      }
                    }
                  });

                  loadedModels.current.plans[floor.level] = model
                  if (groupRef.current) {
                    groupRef.current.add(model)
                    console.log(`BuildingModelLoader: Plan model added to scene for floor ${floorLevel}`);
                  } else {
                    console.warn(`BuildingModelLoader: groupRef.current is null for floor ${floorLevel}`);
                  }

                  updateProgress()
                  resolve(undefined)
                },
                (progress) => {
                  if (progress.lengthComputable) {
                    const percentComplete = Math.round((progress.loaded / progress.total) * 100);
                    setLoadProgress(prev => Math.max(prev, percentComplete));
                  }
                },
                (error) => {
                   console.error(`BuildingModelLoader: Error loading floor plan ${floor.level}:`, error);
                   console.error(`BuildingModelLoader: Path attempted:`, floor.plan_model_path);
                   updateProgress();
                   resolve(undefined);
                 },
              )
            })
            await planPromise;
          }

          // debugLog(`Floor ${floorLevel} loaded`);
        };

        // Load all floors immediately
        await Promise.all(dbFloors.map(floor => loadFloor(floor.level)));
        // debugLog("All floors loaded immediately!");

        // Move only environment and structure models up on the Y-axis, NOT plans
        const envOffset = new THREE.Vector3(0, 1.2, 0) // Lower environment position

        // Apply offset to environment model only
        if (loadedModels.current.environment) {
          loadedModels.current.environment.position.add(envOffset)
        }

        const structureOffset = new THREE.Vector3(0, 1.0, 0) // Much higher than before

        // Apply offset to structure models
        dbFloors.forEach((floor) => {
          const structureModel = loadedModels.current.structures[floor.level]
          if (structureModel) {
            structureModel.position.add(structureOffset)
          }
        })

        // Apply custom Y-axis offset for each plan
        const planOffsets = {
          0: 1.0,  // Ground floor 
          1: 1.08, // First floor
          2: 2.36, // Second floor
          3: 3.63,  // Third floor
          4: 4.84,  // Fourth floor
          5: 6.1, // Fifth floor
          6: 7.3, // Penthouse
          7: 1.06, // Terrace
        } as const;

        dbFloors.forEach((floor) => {
          const planModel = loadedModels.current.plans[floor.level];
          if (planModel) {
            const customOffset = planOffsets[floor.level as keyof typeof planOffsets] || 0; // Default to 0 if no offset specified
            planModel.position.setY(customOffset);
            // debugLog(`Floor ${floor.level} plan positioned at Y: ${customOffset}`);
          }
        });

        // debugLog("Applied position offsets to structures and plans")

        // Reduce contrast of floor plans
        // console.log("Reducing contrast of floor plans for better visibility");
        dbFloors.forEach((floor) => {
          const planModel = loadedModels.current.plans[floor.level];
          if (planModel) {
            planModel.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                if (!child.material.userData?.contrastReduced) {
                  const processMaterial = (mat: THREE.Material) => {
                    const newMat = mat.clone();
                    
                    if (
                      (newMat as THREE.MeshStandardMaterial).color !== undefined
                    ) {
                      const matWithColor = newMat as THREE.MeshStandardMaterial;
                      const luminance = (matWithColor.color.r + matWithColor.color.g + matWithColor.color.b) / 3;
                      
                      if (luminance < 0.5) {
                        matWithColor.color.lerp(new THREE.Color(0x888888), 0.3);
                      } 
                      else {
                        matWithColor.color.lerp(new THREE.Color(0xcccccc), 0.2);
                      }
                    }
                    
                    if ((newMat as THREE.MeshStandardMaterial).roughness !== undefined) {
                      (newMat as THREE.MeshStandardMaterial).roughness = Math.min(1.0, (newMat as THREE.MeshStandardMaterial).roughness + 0.2);
                    }
                    
                    // Ensure depthWrite for contrast-reduced materials if transparent
                    if (newMat.transparent) {
                        newMat.depthWrite = true; // IMPORTANT FIX
                        newMat.depthTest = true;
                    }

                    newMat.userData = { ...newMat.userData, contrastReduced: true };
                    return newMat;
                  };

                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(processMaterial);
                  } else {
                    child.material = processMaterial(child.material);
                  }
                }
              }
            });
          }
        });

        // Make building materials brighter
        dbFloors.forEach((floor) => {
          const structureModel = loadedModels.current.structures[floor.level]
          if (structureModel) {
            structureModel.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                if (!child.material.userData?.isProcessed) {
                  const processMaterial = (mat: THREE.Material) => {
                    const newMat = mat.clone();
                    
                    if ((newMat as THREE.MeshStandardMaterial).color) {
                      (newMat as THREE.MeshStandardMaterial).color.multiplyScalar(1.8); 
                    }
                    
                    if ((newMat as THREE.MeshStandardMaterial).roughness !== undefined) {
                      (newMat as THREE.MeshStandardMaterial).roughness = Math.max(0.05, (newMat as THREE.MeshStandardMaterial).roughness * 0.5);
                    }
                    
                    if ((newMat as THREE.MeshStandardMaterial).metalness !== undefined) {
                      (newMat as THREE.MeshStandardMaterial).metalness = Math.min(0.8, (newMat as THREE.MeshStandardMaterial).metalness * 1.5);
                    }
                    
                    (newMat as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xffffff);
                    (newMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;

                    // Ensure depthWrite for structure materials if transparent
                    if (newMat.transparent) {
                        newMat.depthWrite = true; // IMPORTANT FIX
                        newMat.depthTest = true;
                    }
                    
                    newMat.userData = { isProcessed: true };
                    return newMat;
                  };

                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(processMaterial);
                  } else {
                    child.material = processMaterial(child.material);
                  }
                }
              }
            });
          }
        });

        // Also brighten the environment model
        if (loadedModels.current.environment) {
          loadedModels.current.environment.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (!child.material.userData?.isProcessed) {
                const processMaterial = (mat: THREE.Material) => {
                  const newMat = mat.clone();
                  if ((newMat as THREE.MeshStandardMaterial).color) {
                    (newMat as THREE.MeshStandardMaterial).color.multiplyScalar(1.6);
                  }
                  if ((newMat as THREE.MeshStandardMaterial).roughness !== undefined) {
                    (newMat as THREE.MeshStandardMaterial).roughness = Math.max(0.1, (newMat as THREE.MeshStandardMaterial).roughness * 0.6);
                  }
                  (newMat as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xffffff);
                  (newMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;

                  // Ensure depthWrite for environment materials if transparent
                  if (newMat.transparent) {
                      newMat.depthWrite = true; // IMPORTANT FIX
                      newMat.depthTest = true;
                  }
                  
                  newMat.userData = { isProcessed: true };
                  return newMat;
                };

                if (Array.isArray(child.material)) {
                  child.material = child.material.map(processMaterial);
                } else {
                  child.material = processMaterial(child.material);
                }
              }
            }
          });
        }

        console.log("BuildingModelLoader: All models loaded, updating floor visibility...");

        updateFloorVisibility(-1);

        console.log("BuildingModelLoader: Preloading completed, setting loading to false");
        setIsPreloading(false)
        onLoadingChange && onLoadingChange(false)
      } catch (err) {
        console.error("Error during preloading:", err)
        setError(err as any)
        setIsPreloading(false)
        onLoadingChange && onLoadingChange(false)
      }
    }

    run();
    
    return () => {
      Object.values(originalMaterials.current).forEach((mat) => mat?.dispose())
      defaultMaterial?.dispose()
      hoverMaterial?.dispose()
    }
  }, [dbFloors, envModelPath, gltfLoader, defaultMaterial, hoverMaterial, onLoadingChange])

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isPreloading)
    }
  }, [isPreloading, onLoadingChange])

  useEffect(() => {
    if (isPreloading || !groupRef.current || modalOpen) return

    // Create a DOM click handler that will raycast manually
    const handleClick = (event: MouseEvent) => {
      // Skip click handling if modal is open
      if (modalOpen) {
        return
      }

      event.preventDefault()

      // Calculate mouse position in normalized device coordinates
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Set up raycaster
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      // Find intersections with ALL objects in the scene
      const intersects = raycaster.intersectObjects(scene.children, true)

      // debugLog("Total clickable objects:", clickableObjects.length)
      // debugLog("Found intersections:", intersects.length)

      if (intersects.length > 0) {
        // Log the names of all objects that were hit
        // debugLog(
        //   "Hit objects:",
        //   intersects.map((i) => i.object.name || "unnamed"),
        // )

        // Check if the currently hovered object is in the intersection path
        if (hoveredFlat) {
          // debugLog("Currently hovered object:", hoveredFlat.name)
          onFlatClick && onFlatClick(hoveredFlat)
          return
        }

        // If no hovered object is active, try to find a clickable object in the intersection path
        for (const intersect of intersects) {
          let current = intersect.object
          let depth = 0

          while (current && current !== scene && depth < 10) {
            const floorLevel = current.userData.floorLevel;
            // Check BOTH clickable AND hoverable flags
            if (current.userData.clickable === true && 
                current.userData.type === 'plan' && 
                current.userData.hoverable === true &&
                floorLevel === currentFloor) {
              // debugLog("Found clickable plan object in hierarchy:", current.name);
              onFlatClick && onFlatClick(current);
              return;
            }
            if (!current.parent) break;
            current = current.parent;
            depth++;
          }
        }

        // debugLog("No clickable object found in the hierarchy or not on current floor")
      } else {
        // debugLog("No intersections found")
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [camera, clickableObjects, isPreloading, onFlatClick, scene, hoveredFlat, modalOpen, currentFloor])

  const updateFloorVisibility = useCallback((floor: number) => {
    if (!groupRef.current) {
      console.log("BuildingModelLoader: updateFloorVisibility - groupRef.current is null");
      return;
    }

    console.log(`BuildingModelLoader: updateFloorVisibility called for floor ${floor}`);
    const newClickableObjects: THREE.Object3D[] = [];

    dbFloors.forEach((floorData) => {
      const level = floorData.level
      const structureModel = loadedModels.current.structures[level]
      const planModel = loadedModels.current.plans[level]
      
      console.log(`BuildingModelLoader: Floor ${level} - Structure model:`, !!structureModel, 'Plan model:', !!planModel);

      if (floor === -1) {
        // Show all floors
        if (structureModel) {
          structureModel.visible = true
          console.log(`BuildingModelLoader: Made structure model visible for floor ${level}`);
        }
        if (planModel) {
          planModel.visible = true
          console.log(`BuildingModelLoader: Made plan model visible for floor ${level}`);
        }
        
        // Add only PLAN objects to clickable array
        if (floorMeshes.current[level]) {
          floorMeshes.current[level].forEach(mesh => {
            if (mesh.userData.type === 'plan') {
              newClickableObjects.push(mesh);
            }
          });
        }
      } else {
        // Only show structures up to current floor
        if (structureModel) structureModel.visible = level <= floor
        
        // Only show plan for current floor
        if (planModel) planModel.visible = level === floor
        
        // Only add current floor PLAN objects to clickable array
        if (level === floor && floorMeshes.current[level]) {
          floorMeshes.current[level].forEach(mesh => {
            if (mesh.userData.type === 'plan') {
              newClickableObjects.push(mesh);
            }
          });
        }
      }
    });

    // console.log(`Floor ${floor} visibility updated. Clickable objects: ${newClickableObjects.length}`);
    setClickableObjects(newClickableObjects);
  }, [dbFloors]) // Added dbFloors to dependencies

  useEffect(() => {
    if (!isPreloading) {
      updateFloorVisibility(currentFloor)
    }
  }, [currentFloor, isPreloading, updateFloorVisibility])

  // Fix 1: Modify the resetHoveredObject function to remove scale changes
  const resetHoveredObject = useCallback((obj: THREE.Object3D) => {
    if (!obj) return
    if (originalMaterials.current[obj.uuid] !== undefined) {
      if (obj instanceof THREE.Mesh) {
        obj.material = originalMaterials.current[obj.uuid]
      }
      delete originalMaterials.current[obj.uuid]
    }
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && originalMaterials.current[child.uuid] !== undefined) {
        child.material = originalMaterials.current[child.uuid]
        delete originalMaterials.current[child.uuid]
      }
    })
  }, [])

  // Alternative approach - modify useFrame to change how hover is applied
  useFrame(() => {
    // Skip hover effects if modal is open
    if (isPreloading || clickableObjects.length === 0 || !groupRef.current || modalOpen) {
      if (hoveredFlat) {
        resetHoveredObject(hoveredFlat)
        setHoveredFlat(null)
        setLabelPosition(null)
        setLabelContent(null)
      }
      return
    }

    try {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(clickableObjects, true)

      let newHoveredFlat = null
      if (intersects.length > 0) {
        for (const intersect of intersects) {
          const obj = intersect.object
          // Add hoverable check here
          if (obj.userData.floorLevel === currentFloor && 
              obj.userData.type === 'plan' &&
              obj.userData.hoverable === true) { // Only hover if marked as hoverable
            newHoveredFlat = obj
            
            // Get the center point of the object instead of the intersection point
            const center = new THREE.Vector3();
            // Use the object's bounding box to find its center
            const bbox = new THREE.Box3().setFromObject(obj);
            bbox.getCenter(center);
            
            // Project the center position to screen coordinates
            center.project(camera);
            
            // Convert to CSS coordinates
            const canvas = canvasRef.current || document.querySelector('canvas');
            if (canvas) {
              const x = (center.x * 0.5 + 0.5) * canvas.clientWidth;
              const y = (-(center.y * 0.5) + 0.5) * canvas.clientHeight;
              
              // Update label position based on the object's center
              setLabelPosition({ x, y });
            }
            
            // Get property data from SPACE_DATA or provide default
            const flatName = obj.name
            const flatData = spaceData[flatName as keyof typeof spaceData] || {}
            const flatType = flatData.type || 'N/A'
            const flatArea = flatData.area || 'N/A'
            
            // Set label content  
            setLabelContent({ 
              type: flatType, 
              area: flatArea 
            })
            
            break
          }
        }
      }

      if (hoveredFlat !== newHoveredFlat) {
        // Reset old hover
        if (hoveredFlat) resetHoveredObject(hoveredFlat)
        
        // Hide label if nothing hovered
        if (!newHoveredFlat) {
          setLabelPosition(null)
          setLabelContent(null)
        }
        
        // Apply new hover effect
        if (newHoveredFlat) {
          newHoveredFlat.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Store original material
              originalMaterials.current[child.uuid] = child.material
              
              // Clone original material to preserve properties
              const newMat = child.material.clone()
              
              // Modify just the color to green while keeping other properties
              newMat.color.set(0x208720)
              newMat.emissive = new THREE.Color(0x8cedaf)
              newMat.emissiveIntensity = 0.5
              
              // Keep original transparency settings
              newMat.transparent = child.material.transparent
              newMat.opacity = child.material.opacity
              
              // Apply the modified material
              child.material = newMat
            }
          })
        }
        
        setHoveredFlat(newHoveredFlat)
      }
    } catch (err) {
      // console.error("Error in interaction frame:", err)
    }
  })

  useEffect(() => {
    canvasRef.current = document.querySelector('canvas')
  }, [])

  useEffect(() => {
    if (!isPreloading && groupRef.current) {
      dbFloors.forEach(floor => {
        const struct = loadedModels.current.structures[floor.level];
        const plan = loadedModels.current.plans[floor.level];
        if (struct) console.log(`Structure ${floor.level} position:`, struct.position);
        if (plan) console.log(`Plan ${floor.level} position:`, plan.position);
      });
      console.log("Camera position:", camera.position);
    }
  }, [isPreloading, dbFloors, camera]);

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      {/* Hover label */}
      {labelPosition && labelContent && !modalOpen && (
        <Html
          calculatePosition={() => [
            labelPosition.x, // Horizontal position at the flat's center
            labelPosition.y - 120, // Increased from -65 to -90 for higher position
            0
          ]}
          zIndexRange={[200, 200]}
          occlude={false}
          distanceFactor={undefined}
          style={{
            transition: 'all 0.15s ease-out',
            pointerEvents: 'none',
            transform: 'translate(-50%, 0)', // Center horizontally above the target point
          }}
        >
          <div className="relative flex flex-col items-center">
            <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-xl border border-green-500/30 text-white text-xs whitespace-nowrap">
              <div className="font-medium">{labelContent.type}</div>
              <div className="text-green-400 mt-0.5 text-[10px]">Total Area: {labelContent.area}</div>
            </div>
            
            {/* Pointer triangle */}
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black/80 -mb-[5px] mt-[1px]"></div>
            
            {/* Longer vertical line - increased height from 30px to 55px */}
            <div className="w-[1px] h-[55px] bg-green-400/70"></div>
            
            {/* Larger pulsing dot for better visibility */}
            <div className="relative w-[7px] h-[7px]">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-green-400"></div>
            </div>
          </div>
        </Html>
      )}

      {isPreloading && (
        <Html fullscreen zIndexRange={[100, 100]}>
          <div className="fixed inset-0 bg-[#0b4d43]/80 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden z-[9999]">
            <div className="relative mb-12">
              <div className="animate-pulse">
                <img 
                  src="/images/logo.svg"
                  alt="Logo"
                  width={120} 
                  height={40}
                  className="brightness-0 invert opacity-90"
                />
              </div>
              <div className="absolute inset-0 filter blur-md opacity-40 animate-pulse" 
                   style={{animationDelay: "0.3s"}}>
                <img 
                  src="/images/logo.svg"
                  alt=""
                  width={120} 
                  height={40}
                  className="brightness-0 invert"
                />
              </div>
            </div>
            <div className="text-white/70 text-sm tracking-wider mb-16">
              LOADING ENVIRONMENT...
            </div>
            <div className="absolute bottom-12 w-48 h-[2px] bg-white/20 overflow-hidden rounded-full">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }} 
              />
            </div>
            <div className="absolute bottom-6 text-white/50 text-xs">
              {loadProgress}%
            </div>
          </div>
        </Html>
      )}

      {error && (
        <Html center>
          <div className="bg-red-700/90 text-white p-3 rounded-lg shadow-xl">
            <p className="font-medium">Error loading models</p>
            <p className="text-sm mt-1">Please refresh and try again</p>
          </div>
        </Html>
      )}
    </group>
  )
}