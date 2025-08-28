// import { NextRequest, NextResponse } from "next/server"
// import { databaseService } from "@/lib/database-service"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const type = searchParams.get('type')
//     const id = searchParams.get('id')
//     const floor = searchParams.get('floor')

//     switch (type) {
//       case 'floors':
//         // Loads the Floor model via databaseService.getFloorById or getAllFloors
//         // Example: const floor = await databaseService.getFloorById(id)
//         if (id) {
//           const floor = await databaseService.getFloorById(id)
//           return NextResponse.json(floor)
//         } else {
//           const floors = await databaseService.getAllFloors()
//           return NextResponse.json(floors)
//         }

//       case 'rooms':
//         // Loads the Room model via databaseService.getRoomById, getRoomsByFloor, or getAllRooms
//         if (id) {
//           const room = await databaseService.getRoomById(id)
//           return NextResponse.json(room)
//         } else if (floor) {
//           const rooms = await databaseService.getRoomsByFloor(parseInt(floor))
//           return NextResponse.json(rooms)
//         } else {
//           const rooms = await databaseService.getAllRooms()
//           return NextResponse.json(rooms)
//         }

//       case 'apartment-types':
//         // Loads the ApartmentType model via databaseService.getApartmentTypeById or getAllApartmentTypes
//         if (id) {
//           const apartmentType = await databaseService.getApartmentTypeById(id)
//           return NextResponse.json(apartmentType)
//         } else {
//           const apartmentTypes = await databaseService.getAllApartmentTypes()
//           return NextResponse.json(apartmentTypes)
//         }

//       case 'panoramas':
//         // Loads the Panorama model via databaseService.getPanoramasByApartmentType
//         if (!id) {
//           return NextResponse.json({ error: "Apartment type ID required for panoramas" }, { status: 400 })
//         }
//         const panoramas = await databaseService.getPanoramasByApartmentType(id)
//         return NextResponse.json(panoramas)

//       case 'legacy':
//         // Loads legacy data via databaseService.getLegacyData
//         const legacyData = await databaseService.getLegacyData()
//         return NextResponse.json(legacyData)

//       default:
//         return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
//     }
//   } catch (error) {
//     console.error("Data API error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



