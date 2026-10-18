import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { LAYOUT_IDS, roundLayout, type Layout } from "@/components/sf/layout";

/**
 * Saves the SF diorama's landmark layout back into the source tree
 * (src/components/sf/layout.json), so an arrangement made in the lab page's
 * edit mode ships with the next commit.
 *
 * Development only. In production there's no writable source tree, and a
 * public endpoint that rewrites the site's layout would let any visitor do it.
 */
const LAYOUT_FILE = path.join(process.cwd(), "src/components/sf/layout.json");

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Layout saving is only available in development." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  // Exactly the known landmarks, each with finite coordinates inside a
  // generous box around the block — never trust a file write to the client.
  const layout = body as Layout;
  const keys = body && typeof body === "object" ? Object.keys(body) : [];
  const valid =
    keys.length === LAYOUT_IDS.length &&
    LAYOUT_IDS.every((id) => {
      const at = layout[id];
      return (
        at &&
        typeof at === "object" &&
        Number.isFinite(at.u) &&
        Number.isFinite(at.v) &&
        Math.abs(at.u) < 10 &&
        Math.abs(at.v) < 10
      );
    });
  if (!valid) {
    return NextResponse.json({ error: "Layout must place exactly the known landmarks." }, { status: 400 });
  }

  const clean = roundLayout(
    Object.fromEntries(LAYOUT_IDS.map((id) => [id, { u: layout[id].u, v: layout[id].v }])),
  );
  await writeFile(LAYOUT_FILE, JSON.stringify(clean, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true, layout: clean });
}
