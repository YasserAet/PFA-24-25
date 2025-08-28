import mysql from "mysql2/promise"
import { connectDB } from "./db"

export interface Floor {
  id: string
  name: string
  level: number
  modelId: number
  floorModelPath: string
  planModelPath: string
}

export interface Room {
  id: string
  floor: number
  type: string
  area: string
  status: string
  objectName: string
  floorPlanImage: string
  roomImages: string[]
  panoramas: string[]
  masterRoomArea?: string
  masterBathroomArea?: string
  lobbyArea?: string
  kitchenArea?: string
  balconyArea?: string
  livingArea?: string
  storeArea?: string
  livingBathArea?: string
  laundryArea?: string
  render3D?: string
}

export interface ApartmentType {
  id: string
  name: string
  description: string
  thumbnail: string
  color: string
}

export interface Panorama {
  id: string
  title: string
  url: string
  hotspots: Hotspot[]
}

export interface Hotspot {
  roomId: string
  label: string
  position: string
  rotation: string
}

export class DatabaseService {
  private static instance: DatabaseService
  private connection: mysql.Connection | null = null

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await connectDB()
    }
    return this.connection
  }

  // Floors
  async getAllFloors(): Promise<Floor[]> {
    const connection = await this.getConnection()
    console.log("DatabaseService: Executing getAllFloors query...")
    const [rows] = await connection.execute("SELECT * FROM floors ORDER BY level")
    const rawRows = rows as any[]
    console.log("DatabaseService: Raw rows from database:", rawRows.length)
    if (rawRows.length > 0) {
      console.log("DatabaseService: Sample raw row:", rawRows[0])
    }
    
    // Map database columns (snake_case) to interface properties (camelCase)
    const mappedFloors = rawRows.map(row => ({
      id: row.id,
      name: row.name,
      level: row.level,
      modelId: row.model_id,
      floorModelPath: row.floor_model_path,
      planModelPath: row.plan_model_path,
    }))
    console.log("DatabaseService: Mapped floors:", mappedFloors.length)
    if (mappedFloors.length > 0) {
      console.log("DatabaseService: Sample mapped floor:", mappedFloors[0])
    }
    return mappedFloors
  }

  async getFloorById(id: string): Promise<Floor | null> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute("SELECT * FROM floors WHERE id = ?", [id])
    const rawRows = rows as any[]
    if (rawRows.length === 0) return null
    
    const row = rawRows[0]
    // Map database columns (snake_case) to interface properties (camelCase)
    return {
      id: row.id,
      name: row.name,
      level: row.level,
      modelId: row.model_id,
      floorModelPath: row.floor_model_path,
      planModelPath: row.plan_model_path,
    }
  }

  // Rooms
  async getAllRooms(): Promise<Room[]> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute(`
      SELECT r.*, f.level as floor_level 
      FROM rooms r 
      JOIN floors f ON r.floor_id = f.id 
      ORDER BY f.level, r.id
    `)
    
    const rooms = rows as any[]
    const roomsWithArrays: Room[] = []

    for (const room of rooms) {
      // Get room images
      const [imageRows] = await connection.execute(
        "SELECT image_url FROM room_images WHERE room_id = ? ORDER BY image_order",
        [room.id]
      )
      const roomImages = (imageRows as any[]).map(row => row.image_url)

      // Get room panoramas
      const [panoramaRows] = await connection.execute(
        "SELECT panorama_url FROM room_panoramas WHERE room_id = ? ORDER BY panorama_order",
        [room.id]
      )
      const panoramas = (panoramaRows as any[]).map(row => row.panorama_url)

      roomsWithArrays.push({
        id: room.id,
        floor: room.floor_level,
        type: room.type,
        area: room.area,
        status: room.status,
        objectName: room.object_name,
        floorPlanImage: room.floor_plan_image,
        roomImages,
        panoramas,
        masterRoomArea: room.master_room_area,
        masterBathroomArea: room.master_bathroom_area,
        lobbyArea: room.lobby_area,
        kitchenArea: room.kitchen_area,
        balconyArea: room.balcony_area,
        livingArea: room.living_area,
        storeArea: room.store_area,
        livingBathArea: room.living_bath_area,
        laundryArea: room.laundry_area,
        render3D: room.render_3d
      })
    }

    return roomsWithArrays
  }

  async getRoomsByFloor(floorLevel: number): Promise<Room[]> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute(`
      SELECT r.*, f.level as floor_level 
      FROM rooms r 
      JOIN floors f ON r.floor_id = f.id 
      WHERE f.level = ?
      ORDER BY r.id
    `, [floorLevel])
    
    const rooms = rows as any[]
    const roomsWithArrays: Room[] = []

    for (const room of rooms) {
      // Get room images
      const [imageRows] = await connection.execute(
        "SELECT image_url FROM room_images WHERE room_id = ? ORDER BY image_order",
        [room.id]
      )
      const roomImages = (imageRows as any[]).map(row => row.image_url)

      // Get room panoramas
      const [panoramaRows] = await connection.execute(
        "SELECT panorama_url FROM room_panoramas WHERE room_id = ? ORDER BY panorama_order",
        [room.id]
      )
      const panoramas = (panoramaRows as any[]).map(row => row.panorama_url)

      roomsWithArrays.push({
        id: room.id,
        floor: room.floor_level,
        type: room.type,
        area: room.area,
        status: room.status,
        objectName: room.object_name,
        floorPlanImage: room.floor_plan_image,
        roomImages,
        panoramas,
        masterRoomArea: room.master_room_area,
        masterBathroomArea: room.master_bathroom_area,
        lobbyArea: room.lobby_area,
        kitchenArea: room.kitchen_area,
        balconyArea: room.balcony_area,
        livingArea: room.living_area,
        storeArea: room.store_area,
        livingBathArea: room.living_bath_area,
        laundryArea: room.laundry_area,
        render3D: room.render_3d
      })
    }

    return roomsWithArrays
  }

  async getRoomById(id: string): Promise<Room | null> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute(`
      SELECT r.*, f.level as floor_level 
      FROM rooms r 
      JOIN floors f ON r.floor_id = f.id 
      WHERE r.id = ?
    `, [id])
    
    const rooms = rows as any[]
    if (rooms.length === 0) return null

    const room = rooms[0]

    // Get room images
    const [imageRows] = await connection.execute(
      "SELECT image_url FROM room_images WHERE room_id = ? ORDER BY image_order",
      [id]
    )
    const roomImages = (imageRows as any[]).map(row => row.image_url)

    // Get room panoramas
    const [panoramaRows] = await connection.execute(
      "SELECT panorama_url FROM room_panoramas WHERE room_id = ? ORDER BY panorama_order",
      [id]
    )
    const panoramas = (panoramaRows as any[]).map(row => row.panorama_url)

    return {
      id: room.id,
      floor: room.floor_level,
      type: room.type,
      area: room.area,
      status: room.status,
      objectName: room.object_name,
      floorPlanImage: room.floor_plan_image,
      roomImages,
      panoramas,
      masterRoomArea: room.master_room_area,
      masterBathroomArea: room.master_bathroom_area,
      lobbyArea: room.lobby_area,
      kitchenArea: room.kitchen_area,
      balconyArea: room.balcony_area,
      livingArea: room.living_area,
      storeArea: room.store_area,
      livingBathArea: room.living_bath_area,
      laundryArea: room.laundry_area,
      render3D: room.render_3d
    }
  }

  // Apartment Types
  async getAllApartmentTypes(): Promise<ApartmentType[]> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute("SELECT * FROM apartment_types ORDER BY id")
    return rows as ApartmentType[]
  }

  async getApartmentTypeById(id: string): Promise<ApartmentType | null> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute("SELECT * FROM apartment_types WHERE id = ?", [id])
    const types = rows as ApartmentType[]
    return types.length > 0 ? types[0] : null
  }

  // Panoramas
  async getPanoramasByApartmentType(apartmentTypeId: string): Promise<Panorama[]> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute(`
      SELECT * FROM panoramas 
      WHERE apartment_type_id = ? 
      ORDER BY panorama_order
    `, [apartmentTypeId])
    
    const panoramas = rows as any[]
    const panoramasWithHotspots: Panorama[] = []

    for (const panorama of panoramas) {
      // Get hotspots
      const [hotspotRows] = await connection.execute(`
        SELECT * FROM hotspots 
        WHERE panorama_id = ? 
        ORDER BY id
      `, [panorama.id])
      
      const hotspots = (hotspotRows as any[]).map(row => ({
        roomId: row.room_id,
        label: row.label,
        position: row.position,
        rotation: row.rotation
      }))

      panoramasWithHotspots.push({
        id: panorama.id,
        title: panorama.title,
        url: panorama.url,
        hotspots
      })
    }

    return panoramasWithHotspots
  }

  // Legacy data format for backward compatibility
  async getLegacyData() {
    console.log("DatabaseService: getLegacyData called")
    const floors = await this.getAllFloors()
    const rooms = await this.getAllRooms()
    const apartmentTypes = await this.getAllApartmentTypes()
    console.log("DatabaseService: Data retrieved - floors:", floors.length, "rooms:", rooms.length, "apartmentTypes:", apartmentTypes.length)
    
    // Convert to legacy format - use snake_case to match BuildingModelLoader expectations
    const FLOORS = floors.map(floor => ({
      id: floor.id,
      name: floor.name,
      level: floor.level,
      modelId: floor.modelId,
      floor_model_path: floor.floorModelPath,  // Convert camelCase to snake_case
      plan_model_path: floor.planModelPath,    // Convert camelCase to snake_case
    }))

    const SPACE_DATA: Record<string, any> = {}
    for (const room of rooms) {
      SPACE_DATA[room.id] = {
        id: room.objectName,
        floor: room.floor,
        type: room.type,
        area: room.area,
        masterRoomArea: room.masterRoomArea,
        masterBathroomArea: room.masterBathroomArea,
        lobbyArea: room.lobbyArea,
        kitchenArea: room.kitchenArea,
        balconyArea: room.balconyArea,
        livingArea: room.livingArea,
        storeArea: room.storeArea,
        livingBathArea: room.livingBathArea,
        laundryArea: room.laundryArea,
        render3D: room.render3D,
        roomImages: room.roomImages,
        panoramas: room.panoramas,
        floorPlanImage: room.floorPlanImage
      }
    }

    const APARTMENT_TYPES = apartmentTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      thumbnail: type.thumbnail,
      color: type.color,
    }))

    const APARTMENT_PANORAMAS: Record<string, any[]> = {}
    for (const apartmentType of apartmentTypes) {
      const panoramas = await this.getPanoramasByApartmentType(apartmentType.id)
      APARTMENT_PANORAMAS[apartmentType.id] = panoramas.map(p => ({
        id: p.id.split('-')[1], // Remove apartment type prefix
        title: p.title,
        url: p.url,
        hotspots: p.hotspots
      }))
    }

    const result = {
      FLOORS,
      SPACE_DATA,
      APARTMENT_TYPES,
      APARTMENT_PANORAMAS
    }
    console.log("DatabaseService: Returning legacy data with floors:", result.FLOORS.length)
    if (result.FLOORS.length > 0) {
      console.log("DatabaseService: Sample floor in result:", result.FLOORS[0])
    }
    return result
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
    }
  }
}

export const databaseService = DatabaseService.getInstance()



