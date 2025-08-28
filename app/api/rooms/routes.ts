// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const floorId = searchParams.get("floorId");
//   if (!floorId) return NextResponse.json({ error: "floorId required" }, { status: 400 });
//   const pool = await connectDB();
//   const [rows] = await pool.query(
//     `SELECT id, floor_id, type, area, status, object_name
//      FROM rooms WHERE floor_id = ?`,
//     [floorId]
//   );
//   return NextResponse.json(rows);
// }