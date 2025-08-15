import React, { useMemo, useState } from "react";
import { TopViewLayout } from "@/components/layout/TopViewLayout";

type TierKey = "small"|"small_plus"|"medium"|"large"|"giant"|"arena";
type Units = { [k: string]: number };

const TIERS: Record<TierKey, {
  label: string;
  dims: { w: number; h: number }; // feet
  gross: number;
  preview: Units[];
}> = {
  small: {
    label: "Small (2,000–5,000 sq ft)",
    dims: { w: 50, h: 50 },
    gross: 2500,
    preview: [
      { baseball_tunnels: 2 },            // cages-first
      { volleyball_courts: 1 }            // or 1 VB court
    ]
  },
  small_plus: {
    label: "Small+ (5,000–8,000 sq ft)",
    dims: { w: 100, h: 60 },
    gross: 6000,
    preview: [
      { basketball_courts_full: 1, baseball_tunnels: 1 },
      { volleyball_courts: 2, baseball_tunnels: 2 }
    ]
  },
  medium: {
    label: "Medium (8,000–15,000 sq ft)",
    dims: { w: 100, h: 100 },
    gross: 10000,
    preview: [
      { basketball_courts_full: 1, baseball_tunnels: 2 },
      { volleyball_courts: 3 } // alternative
    ]
  },
  large: {
    label: "Large (15,000–30,000 sq ft)",
    dims: { w: 150, h: 120 },
    gross: 18000,
    preview: [
      { basketball_courts_full: 2, baseball_tunnels: 4 },
      { volleyball_courts: 4, baseball_tunnels: 2 }
    ]
  },
  giant: {
    label: "Giant (30,000–50,000 sq ft)",
    dims: { w: 200, h: 150 },
    gross: 30000,
    preview: [
      { basketball_courts_full: 3, volleyball_courts: 4, baseball_tunnels: 6 }
    ]
  },
  arena: {
    label: "Arena (50,000+ sq ft)",
    dims: { w: 250, h: 200 },
    gross: 50000,
    preview: [
      { basketball_courts_full: 4, volleyball_courts: 8, baseball_tunnels: 8, pickleball_courts: 4 }
    ]
  }
};

// Map to TopViewLayout unit names
function toUnitRequests(counts: Units) {
  return [
    counts.basketball_courts_full ? { kind: "basketball_court_full", count: counts.basketball_courts_full } : null,
    counts.volleyball_courts ? { kind: "volleyball_court", count: counts.volleyball_courts } : null,
    counts.pickleball_courts ? { kind: "pickleball_court", count: counts.pickleball_courts } : null,
    counts.baseball_tunnels ? { kind: "baseball_tunnel", count: counts.baseball_tunnels } : null
  ].filter(Boolean) as any[];
}

export default function FacilitySizeStep({
  getProject, setProject, onNext
}: {
  getProject: () => any;
  setProject: (p:any) => void;
  onNext: () => void;
}) {
  const [chosen, setChosen] = useState<TierKey | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);

  function applyTier(key: TierKey) {
    const t = TIERS[key];
    const counts = t.preview[Math.min(variantIdx, t.preview.length-1)];
    const proj = getProject() || {};
    proj.facility_plan = {
      ...(proj.facility_plan || {}),
      total_sqft: t.gross,
      shell_dims_ft: t.dims,
      court_or_cage_counts: { ...(proj.facility_plan?.court_or_cage_counts || {}), ...counts }
    };
    setProject(proj);
  }

  return (
    <div className="panel">
      <h2>What size facility are you considering?</h2>
      <p className="lead">This helps determine court/field capacity and equipment quantities.</p>

      <div className="grid">
        {(Object.keys(TIERS) as TierKey[]).map((k) => {
          const t = TIERS[k];
          const counts = t.preview[0];
          return (
            <button key={k} className={`card ${chosen===k?"on":""}`} onClick={() => { setChosen(k); setVariantIdx(0); applyTier(k); }}>
              <div className="label">{t.label}</div>
              <div className="thumb">
                <TopViewLayout
                  title=""
                  grossSf={t.gross}
                  aspectRatio={t.dims.w / t.dims.h}
                  units={toUnitRequests(counts)}
                  perimeterFt={6}
                  gapFt={6}
                  viewWidthPx={320}
                  showLegend={false}
                  buildingLabel={`${t.dims.w}' × ${t.dims.h}'`}
                />
              </div>
              <div className="meta">{Object.entries(counts).map(([k,v])=>`${k.replace(/_/g," ")}: ${v}`).join(" · ")}</div>
            </button>
          );
        })}
      </div>

      <div className="note">
        <p>These are example layouts for this footprint. You can rotate/swap items later.</p>
      </div>

      <div className="actions">
        <button className="btn" onClick={onNext} disabled={!chosen}>Continue</button>
      </div>

      <style>{`
        .panel{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px}
        .lead{color:#6B7280;margin:2px 0 12px}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}
        .card{border:1px solid #E5E7EB;border-radius:12px;background:#fff;padding:10px;text-align:left;cursor:pointer}
        .card.on{outline:3px solid #0B63E5;border-color:#0B63E5}
        .label{font-weight:700;margin-bottom:6px}
        .thumb{border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;background:#fff}
        .meta{font-size:12px;color:#6B7280;margin-top:6px}
        .note{text-align:center;color:#6B7280;font-size:14px;margin:16px 0 8px}
        .actions{display:flex;justify-content:flex-end;margin-top:10px}
        .btn{background:#0B63E5;color:#fff;border:none;padding:10px 14px;border-radius:8px;font-weight:700}
        .btn:disabled{background:#9CA3AF;cursor:not-allowed}
      `}</style>
    </div>
  );
}