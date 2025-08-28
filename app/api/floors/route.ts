import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("Floors API called");
    const connection = await connectDB();
    console.log("Database connected, executing query...");
    
    const [rows] = await connection.execute(
      `SELECT id, name, level, floor_model_path, plan_model_path
       FROM floors
       ORDER BY level ASC`
    );
    
    console.log("Floors query completed, rows found:", Array.isArray(rows) ? rows.length : 0);
    if (Array.isArray(rows) && rows.length > 0) {
      console.log("Sample floor data:", rows[0]);
    }
    await connection.release();
    
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("Floors API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
