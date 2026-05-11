import { NextResponse } from "next/server";
import { fetchLocationTree } from "@/lib/estate-os";

export const revalidate = 300;

export async function GET() {
  try {
    const tree = await fetchLocationTree();
    return NextResponse.json(tree);
  } catch (err) {
    console.error("estate-os locations error:", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
