import { databaseService } from "./database-service"

// Configuration to switch between local files and database
const USE_DATABASE = process.env.USE_DATABASE === 'true' || false

// Fallback to local data if database is not available
const getLocalData = async () => {
  try {
    const { FLOORS, SPACE_DATA } = await import("../components/premium-building-viewer/data")
    const { APARTMENT_TYPES, APARTMENT_PANORAMAS } = await import("../app/apartment-types")
    return { FLOORS, SPACE_DATA, APARTMENT_TYPES, APARTMENT_PANORAMAS }
  } catch (error) {
    console.error("Failed to load local data:", error)
    throw error
  }
}

// Get data from database
const getDatabaseData = async () => {
  try {
    return await databaseService.getLegacyData()
  } catch (error) {
    console.error("Failed to load database data:", error)
    // Fallback to local data if database fails
    console.log("Falling back to local data...")
    return await getLocalData()
  }
}

// Main data provider function
export const getData = async () => {
  if (USE_DATABASE) {
    return await getDatabaseData()
  } else {
    return await getLocalData()
  }
}

// Individual data getters
export const getFloors = async () => {
  if (USE_DATABASE) {
    return await databaseService.getAllFloors()
  } else {
    const { FLOORS } = await getLocalData()
    return FLOORS
  }
}

export const getRooms = async () => {
  if (USE_DATABASE) {
    return await databaseService.getAllRooms()
  } else {
    const { SPACE_DATA } = await getLocalData()
    // Convert SPACE_DATA to array format
    return Object.entries(SPACE_DATA).map(([id, room]) => ({
      id,
      floor: room.floor,
      type: room.type,
      area: room.area,
      // status: room.status || 'available',
      objectName: room.id,
      floorPlanImage: room.floorPlanImage,
      roomImages: room.roomImages || [],
      // panoramas: room.panoramas || [],
      masterRoomArea: room.masterRoomArea,
      masterBathroomArea: room.masterBathroomArea,
      lobbyArea: room.lobbyArea,
      kitchenArea: room.kitchenArea,
      balconyArea: room.balconyArea,
      livingArea: room.livingArea,
      storeArea: room.storeArea,
      livingBathArea: room.livingBathArea,
      // laundryArea: room.laundryArea,
      render3D: room.render3D
    }))
  }
}

export const getApartmentTypes = async () => {
  if (USE_DATABASE) {
    return await databaseService.getAllApartmentTypes()
  } else {
    const { APARTMENT_TYPES } = await getLocalData()
    return APARTMENT_TYPES
  }
}

export const getPanoramas = async (apartmentTypeId: string) => {
  if (USE_DATABASE) {
    return await databaseService.getPanoramasByApartmentType(apartmentTypeId)
  } else {
    const { APARTMENT_PANORAMAS } = await getLocalData()
    return (APARTMENT_PANORAMAS as Record<string, unknown[]>)[apartmentTypeId] || []
  }
}

// Legacy format getters for backward compatibility
export const getLegacyData = async () => {
  if (USE_DATABASE) {
    return await databaseService.getLegacyData()
  } else {
    return await getLocalData()
  }
}

// Utility function to check if database is available
export const isDatabaseAvailable = () => {
  return USE_DATABASE
}

// Utility function to switch data source
export const setDataSource = (useDatabase: boolean) => {
  process.env.USE_DATABASE = useDatabase.toString()
}


