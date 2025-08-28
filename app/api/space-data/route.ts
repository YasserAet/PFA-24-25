import { NextResponse ,NextRequest } from "next/server";
import { databaseService } from "@/lib/database-service";

export async function GET(req: NextRequest) {
  try {
    console.log("Space-data API called");
    const legacyData = await databaseService.getLegacyData();
    console.log("Legacy data retrieved successfully");
    console.log("SPACE_DATA keys:", Object.keys(legacyData.SPACE_DATA).length);
    console.log("FLOORS data:", legacyData.FLOORS.length);
    if (legacyData.FLOORS.length > 0) {
      console.log("Sample floor from legacy data:", legacyData.FLOORS[0]);
    }
    return NextResponse.json(legacyData.SPACE_DATA);
  } catch (e: any) {
    console.error("Space-data API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}