import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - can be extended with database checks etc.
    return NextResponse.json(
      { 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "unknown"
      }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}