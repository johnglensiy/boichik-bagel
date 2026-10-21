import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isGrass, sortCells } from "@/components/sf/grass";

/**
 * Saves the SF diorama's painted lawns back into the source tree
 * (src/components/sf/grass.json), so grass painted in the lab page's grass
 * mode ships with the next commit. The twin of the roads route.
 *
 * Development only. In production there's no writable source tree, and a
 * public endpoint that rewrites the site's lawns would let any visitor do it.
 */
const GRASS_FILE = path.join(process.cwd(), "src/components/sf/grass.json");

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Grass saving is only available in development." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!isGrass(body)) {
    return NextResponse.json({ error: "Grass must be a list of distinct squares on the block." }, { status: 400 });
  }

  // Ten squares a line keeps a big lawn readable without a line per square.
  const cells = sortCells(body);
  const lines: string[] = [];
  for (let k = 0; k < cells.length; k += 10) {
    lines.push("  " + cells.slice(k, k + 10).map((c) => JSON.stringify(c)).join(", "));
  }
  await writeFile(GRASS_FILE, cells.length ? "[\n" + lines.join(",\n") + "\n]\n" : "[]\n", "utf-8");
  return NextResponse.json({ ok: true, grass: cells });
}
