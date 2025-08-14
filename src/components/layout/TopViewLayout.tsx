import React, { useMemo, useRef } from "react";

/** ====== Nominal top-view dimensions (feet) incl. runouts ======
 * Match the SF you already use:
 * - Volleyball: 72' x 36' = 2,592 sf
 * - Pickleball: 60' x 30' = 1,800 sf
 * - Basketball (full, with runouts): 112' x 56' ≈ 6,272 sf (close to 6,240 preset)
 * - Basketball (half): 56' x 56' (visual convenience for half-area)
 * - Baseball tunnel: 70' x 15' (+ small runout represented via spacing, not geometry)
 * - Training turf zone: 120' x 60' = 7,200 sf
 * - Small-sided indoor soccer: 180' x 80' = 14,400 sf
 */
export type UnitKind =
  | "volleyball_court"
  | "pickleball_court"
  | "basketball_court_full"
  | "basketball_court_half"
  | "baseball_tunnel"
  | "training_turf_zone"
  | "soccer_field_small"
  | "football_field";

const UNIT_DIMS_FT: Record<UnitKind, { w: number; h: number; label: string }> = {
  volleyball_court:       { w: 72,  h: 36, label: "Volleyball" },
  pickleball_court:       { w: 60,  h: 30, label: "Pickleball" },
  basketball_court_full:  { w: 112, h: 56, label: "Basketball (Full)" },
  basketball_court_half:  { w: 56,  h: 56, label: "Basketball (Half)" },
  baseball_tunnel:        { w: 70,  h: 15, label: "Batting Tunnel" },
  training_turf_zone:     { w: 120, h: 60, label: "Training Turf" },
  soccer_field_small:     { w: 180, h: 80, label: "Small Soccer" },
  football_field:         { w: 240, h: 80, label: "Football Field" }
};

export type UnitRequest = {
  kind: UnitKind;
  count: number;
  rotate?: boolean; // rotate 90°
  color?: string;   // override fill color
};

export type AdminBlock = {
  label: string;
  w: number; // ft
  h: number; // ft
  anchor?: "front-left" | "front-right" | "back-left" | "back-right";
};

export type LayoutAlgo = "rows" | "columns" | "staggered";

export interface TopViewLayoutProps {
  /** Gross SF for the shell (we derive W/H by aspect ratio) */
  grossSf: number;
  /** Building aspect ratio (width / height), e.g., 2 for ~2:1 wide */
  aspectRatio?: number;
  /** Perimeter walkway/buffer (ft) inside the shell */
  perimeterFt?: number;
  /** Spacing between units (ft) */
  gapFt?: number;
  /** Units requested (with counts/orientation) */
  units: UnitRequest[];
  /** Optional admin/service blocks (lobby, storage, party room) */
  adminBlocks?: AdminBlock[];
  /** Algorithm for packing */
  algo?: LayoutAlgo;
  /** Width of SVG in pixels (height auto-scales) */
  viewWidthPx?: number;
  /** Title for accessibility / export */
  title?: string;
  /** Show legend & scale */
  showLegend?: boolean;
  /** Optional: draw building label (e.g., size) */
  buildingLabel?: string;
}

type Placed = {
  x: number; y: number; w: number; h: number; label: string; fill: string; stroke: string;
};

/** Compute building width/height in feet given area and aspect ratio */
function buildingDimsFromArea(areaSf: number, aspect: number) {
  const w = Math.sqrt(areaSf * aspect);
  const h = w / aspect;
  return { w, h };
}

/** Greedy row-based packing (simple, predictable, great for previews) */
function packGreedyRows(
  innerW: number,
  innerH: number,
  items: { w: number; h: number; label: string; fill: string; stroke: string }[],
  gap: number
): Placed[] {
  const placed: Placed[] = [];
  let cursorX = 0, cursorY = 0, rowH = 0;

  for (const it of items) {
    const w = it.w, h = it.h;

    // If too tall for the space at all, skip (but keep going so other items can place)
    if (h > innerH || w > innerW) { continue; }

    // New row if needed
    if (cursorX > 0 && cursorX + w > innerW) {
      cursorX = 0;
      cursorY += rowH + gap;
      rowH = 0;
    }

    // If this row would overflow the height, skip this item but don't stop the loop
    if (cursorY + h > innerH) { continue; }

    placed.push({ x: cursorX, y: cursorY, w, h, label: it.label, fill: it.fill, stroke: it.stroke });
    cursorX += w + gap;
    rowH = Math.max(rowH, h);
  }
  return placed;
}

/** Columns packing (alternate) */
function packGreedyCols(
  innerW: number,
  innerH: number,
  items: { w: number; h: number; label: string; fill: string; stroke: string }[],
  gap: number
): Placed[] {
  const placed: Placed[] = [];
  let cursorX = 0, cursorY = 0, colW = 0;

  for (const it of items) {
    const w = it.w, h = it.h;

    if (h > innerH || w > innerW) { continue; }

    // New column if needed
    if (cursorY > 0 && cursorY + h > innerH) {
      cursorY = 0;
      cursorX += colW + gap;
      colW = 0;
    }

    if (cursorX + w > innerW) { continue; }

    placed.push({ x: cursorX, y: cursorY, w, h, label: it.label, fill: it.fill, stroke: it.stroke });
    cursorY += h + gap;
    colW = Math.max(colW, w);
  }
  return placed;
}

/** Staggered: same as rows but add offsets every other row */
function packStaggered(
  innerW: number,
  innerH: number,
  items: { w: number; h: number; label: string; fill: string; stroke: string }[],
  gap: number
): Placed[] {
  const base = packGreedyRows(innerW, innerH, items, gap);
  const rowMap = new Map<number, number>(); // y -> min y for that row
  for (const p of base) rowMap.set(p.y, (rowMap.get(p.y) ?? 0) + 1);
  // add offset to every other row
  const sortedRows = [...new Set(base.map(b => b.y))].sort((a,b)=>a-b);
  sortedRows.forEach((y, idx) => {
    if (idx % 2 === 1) {
      for (const p of base) if (p.y === y) p.x = Math.min(p.x + gap * 0.5, innerW - p.w); // small stagger
    }
  });
  return base;
}

export function TopViewLayout({
  grossSf,
  aspectRatio = 2,
  perimeterFt = 6,
  gapFt = 6,
  units,
  adminBlocks = [],
  algo = "rows",
  viewWidthPx = 900,
  title = "Example Top‑View Layout",
  showLegend = true,
  buildingLabel
}: TopViewLayoutProps) {
  // 1) Compute building envelope in ft
  const { w: shellWft, h: shellHft } = useMemo(
    () => buildingDimsFromArea(grossSf, aspectRatio),
    [grossSf, aspectRatio]
  );
  const innerWft = Math.max(shellWft - 2 * perimeterFt, 10);
  const innerHft = Math.max(shellHft - 2 * perimeterFt, 10);

  // 2) Expand units into item rectangles (apply rotation)
  const items = useMemo(() => {
    const arr: { w: number; h: number; label: string; fill: string; stroke: string }[] = [];
    const brandBlue = "#0B63E5";
    const brandGreen = "#00A66A";
    const brandGray = "#C7D2FE";

    for (const u of units) {
      const dims = UNIT_DIMS_FT[u.kind];
      if (!dims || u.count <= 0) continue;
      const w = u.rotate ? dims.h : dims.w;
      const h = u.rotate ? dims.w : dims.h;
      const fill =
        u.color ||
        (u.kind.includes("basketball") ? brandBlue :
         u.kind.includes("baseball")   ? brandGreen :
         u.kind.includes("soccer")     ? "#65A30D" :
         u.kind.includes("football")   ? "#8B4513" :
         u.kind.includes("turf")       ? "#65A30D" : brandGray);
      const stroke = "#111111";
      for (let i = 0; i < u.count; i++) {
        arr.push({ w, h, label: dims.label, fill, stroke });
      }
    }
    // Sort larger footprints first to ensure big fields/courts get placed
    arr.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    return arr;
  }, [units]);

  // 3) Choose packer
  const placed = useMemo(() => {
    if (items.length === 0) return [];
    if (algo === "columns") return packGreedyCols(innerWft, innerHft, items, gapFt);
    if (algo === "staggered") return packStaggered(innerWft, innerHft, items, gapFt);
    return packGreedyRows(innerWft, innerHft, items, gapFt);
  }, [items, innerWft, innerHft, gapFt, algo]);

  // 4) Admin blocks: snap to corners inside perimeter
  const placedAdmin = useMemo(() => {
    const blocks: Placed[] = [];
    for (const b of adminBlocks) {
      let x = 0, y = 0;
      const pad = 0;
      switch (b.anchor ?? "front-left") {
        case "front-left":  x = 0 + pad;                   y = 0 + pad; break;
        case "front-right": x = innerWft - b.w - pad;      y = 0 + pad; break;
        case "back-left":   x = 0 + pad;                   y = innerHft - b.h - pad; break;
        case "back-right":  x = innerWft - b.w - pad;      y = innerHft - b.h - pad; break;
      }
      blocks.push({ x, y, w: b.w, h: b.h, label: b.label, fill: "#E5E7EB", stroke: "#111111" });
    }
    return blocks;
  }, [adminBlocks, innerWft, innerHft]);

  // 5) Scaling to pixels
  const pxPerFt = viewWidthPx / shellWft;
  const viewHeightPx = Math.round(shellHft * pxPerFt);

  // 6) Export helpers
  const svgRef = useRef<SVGSVGElement | null>(null);
  function downloadSVG(filename = "layout.svg") {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // 7) Legend items (simple)
  const legend = [
    { label: "Basketball", fill: "#0B63E5" },
    { label: "Volleyball", fill: "#C7D2FE" },
    { label: "Pickleball", fill: "#C7D2FE" },
    { label: "Batting Tunnel", fill: "#00A66A" },
    { label: "Turf/Soccer", fill: "#65A30D" },
    { label: "Admin/Support", fill: "#E5E7EB" }
  ];

  return (
    <div className="wrap" aria-label={title}>
      <div className="toolbar">
        <div className="label">{title}{buildingLabel ? ` — ${buildingLabel}` : ""}</div>
        <button onClick={() => downloadSVG()} aria-label="Download SVG of layout">Download SVG</button>
      </div>

      <svg
        ref={svgRef}
        width={viewWidthPx}
        height={viewHeightPx + (showLegend ? 60 : 0)}
        role="img"
        aria-label={`${title}. Building ${Math.round(shellWft)} by ${Math.round(shellHft)} feet.`}
      >
        {/* Building shell */}
        <rect
          x={0} y={0}
          width={shellWft * pxPerFt}
          height={shellHft * pxPerFt}
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth={2}
        />
        {/* Perimeter walkway (visualized as inner box) */}
        <rect
          x={perimeterFt * pxPerFt}
          y={perimeterFt * pxPerFt}
          width={innerWft * pxPerFt}
          height={innerHft * pxPerFt}
          fill="#F7F9FC"
          stroke="#D1D5DB"
        />

        {/* Admin blocks */}
        {placedAdmin.map((p, i) => (
          <g key={`admin-${i}`} transform={`translate(${(perimeterFt + p.x) * pxPerFt}, ${(perimeterFt + p.y) * pxPerFt})`}>
            <rect width={p.w * pxPerFt} height={p.h * pxPerFt} fill={p.fill} stroke={p.stroke} />
            <text x={(p.w*pxPerFt)/2} y={(p.h*pxPerFt)/2} textAnchor="middle" dominantBaseline="central" fontSize="12">{p.label}</text>
          </g>
        ))}

        {/* Sports units */}
        {placed.map((p, i) => (
          <g key={i} transform={`translate(${(perimeterFt + p.x) * pxPerFt}, ${(perimeterFt + p.y) * pxPerFt})`}>
            <rect width={p.w * pxPerFt} height={p.h * pxPerFt} fill={p.fill} stroke={p.stroke} />
            <text x={(p.w*pxPerFt)/2} y={(p.h*pxPerFt)/2} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#111">{p.label}</text>
          </g>
        ))}

        {/* Scale bar */}
        <g transform={`translate(${10}, ${viewHeightPx - 20})`}>
          <rect x={0} y={0} width={100} height={4} fill="#111" />
          <text x={0} y={-4} fontSize="10">~ {Math.round(100/pxPerFt)} ft</text>
        </g>

        {/* Legend */}
        {showLegend && (
          <g transform={`translate(${10}, ${viewHeightPx + 10})`}>
            {legend.map((l, i) => (
              <g key={i} transform={`translate(${i*140}, 0)`}>
                <rect x={0} y={0} width={16} height={16} fill={l.fill} stroke="#111" />
                <text x={22} y={12} fontSize="12">{l.label}</text>
              </g>
            ))}
          </g>
        )}
      </svg>

      <style>{`
        .wrap { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .toolbar .label { font-weight: 600; }
        .toolbar button { background: #0B63E5; color: #fff; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}