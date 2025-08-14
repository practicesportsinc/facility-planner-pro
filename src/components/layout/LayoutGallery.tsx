import React from "react";
import { TopViewLayout, UnitRequest, AdminBlock } from "./TopViewLayout";

export type GalleryChoice = {
  id: string;
  name: string;
  algo: "rows" | "columns" | "staggered";
  units: UnitRequest[];
  admin: AdminBlock[];
  aspectRatio: number;
  perimeterFt: number;
  gapFt: number;
};

export function LayoutGallery({
  grossSf,
  counts,
  onChoose,
  selectedId,           // NEW (optional)
  onSelect              // NEW (optional)
}: {
  grossSf: number;
  counts: Partial<Record<"volleyball_courts"|"pickleball_courts"|"basketball_courts_full"|"basketball_courts_half"|"baseball_tunnels"|"training_turf_zone"|"soccer_field_small"|"football_field", number>>;
  onChoose?: (choice: GalleryChoice) => void;
  selectedId?: string;
  onSelect?: (choice: GalleryChoice) => void;
}) {

  // Derive unit list from counts
  function unitsFromCounts(rotateMap?: Partial<Record<string, boolean>>): UnitRequest[] {
    const map: UnitRequest[] = [];
    const push = (kind: UnitRequest["kind"], count?: number, rotate?: boolean) => {
      if (!count || count <= 0) return;
      map.push({ kind, count, rotate });
    };
    push("volleyball_court", counts.volleyball_courts, rotateMap?.volleyball_courts);
    push("pickleball_court", counts.pickleball_courts, rotateMap?.pickleball_courts);
    push("basketball_court_full", counts.basketball_courts_full, rotateMap?.basketball_courts_full);
    push("basketball_court_half", counts.basketball_courts_half, rotateMap?.basketball_courts_half);
    push("baseball_tunnel", counts.baseball_tunnels, rotateMap?.baseball_tunnels ?? false); // default horizontal
    push("training_turf_zone", counts.training_turf_zone, rotateMap?.training_turf_zone);
    push("soccer_field_small", counts.soccer_field_small, rotateMap?.soccer_field_small);
    push("football_field", counts.football_field, rotateMap?.football_field);
    return map;
  }

  const basePerimeter = 6;
  const baseGap = 6;

  const choices: GalleryChoice[] = [
    {
      id: "rows-ns",
      name: "Parallel (North–South)",
      algo: "rows",
      units: unitsFromCounts({ volleyball_courts: false, basketball_courts_full: false }),
      admin: [
        { label: "Lobby", w: 40, h: 25, anchor: "front-left" },
        { label: "Storage", w: 30, h: 20, anchor: "back-right" }
      ],
      aspectRatio: 2.0,
      perimeterFt: basePerimeter,
      gapFt: baseGap
    },
    {
      id: "rows-ew",
      name: "Parallel (East–West)",
      algo: "rows",
      units: unitsFromCounts({ volleyball_courts: true, basketball_courts_full: true }),
      admin: [
        { label: "Lobby", w: 40, h: 25, anchor: "front-right" },
        { label: "Party Room", w: 30, h: 20, anchor: "back-left" }
      ],
      aspectRatio: 1.6, // slightly squarer
      perimeterFt: basePerimeter,
      gapFt: baseGap
    },
    {
      id: "staggered-mix",
      name: "Staggered + Mix",
      algo: "staggered",
      units: unitsFromCounts({ volleyball_courts: false, basketball_courts_full: true }),
      admin: [
        { label: "Lobby", w: 40, h: 25, anchor: "front-left" },
        { label: "Office", w: 20, h: 15, anchor: "front-right" }
      ],
      aspectRatio: 2.2, // slightly wider
      perimeterFt: basePerimeter,
      gapFt: baseGap
    }
  ];

  return (
    <div>
      <div className="hdr">
        <h3>Example top‑view layouts</h3>
        <p>Select a configuration; you can still edit everything later.</p>
      </div>
      <div className="grid">
        {choices.map(c => {
          const isSelected = selectedId === c.id;
          const isSelectionMode = !!onSelect; // when parent controls
          return (
            <div className="card" key={c.id} role="group" aria-label={`Layout option: ${c.name}`}>
              <TopViewLayout
                title={c.name}
                grossSf={grossSf}
                aspectRatio={c.aspectRatio}
                perimeterFt={c.perimeterFt}
                gapFt={c.gapFt}
                units={c.units}
                adminBlocks={c.admin}
                algo={c.algo}
                viewWidthPx={320}
                buildingLabel={`${Math.round(grossSf).toLocaleString()} sf`}
                showLegend={false}
              />
              <div className="row">
                <button
                  className={`use ${isSelected ? "selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelectionMode) onSelect!(c);
                    else onChoose?.(c);
                  }}
                >
                  {isSelected ? "Selected ✓" : "Use this layout"}
                </button>
                <div className="name">{c.name}</div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .hdr h3 { margin: 0 0 4px; }
        .hdr p  { margin: 0 0 8px; color: #6B7280; }
        .grid   { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
        .card   { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 8px; }
        .row    { display: flex; justify-content: space-between; align-items: center; padding: 6px 4px 2px; }
        .use    { background: #0B63E5; color: #fff; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .use:hover { background: #0951c4; }
        .use.selected { background: #00A66A; } /* brand green when selected */
        .name   { font-size: 12px; color: #6B7280; }
      `}</style>
    </div>
  );
}