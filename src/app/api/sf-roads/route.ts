import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isRoads } from "@/components/sf/roads";

/**
 * Saves the SF diorama's hand-drawn roads back into the source tree
 * (src/components/sf/roads.json), so roads drawn in the lab page's road mode
 * ship with the next commit. The twin of the layout route.
 *
 * Development only. In production there's no writable source tree, and a
 * public endpoint that rewrites the site's roads would let any visitor do it.
 */
const ROADS_FILE = path.join(process.cwd(), "src/components/sf/roads.json");

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Road saving is only available in development." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!isRoads(body)) {
    return NextResponse.json({ error: "Roads must each join two squares on the block." }, { status: 400 });
  }

  // One road a line: readable, and a drawn road is a one-line diff.
  const text = "[\n" + body.map((r) => "  " + JSON.stringify(r)).join(",\n") + "\n]\n";
  await writeFile(ROADS_FILE, body.length ? text : "[]\n", "utf-8");
  return NextResponse.json({ ok: true, roads: body });
}
