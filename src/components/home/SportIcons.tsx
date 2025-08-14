import React from "react";

export type SportKey =
  | "baseball_softball"
  | "basketball"
  | "volleyball"
  | "pickleball"
  | "soccer_indoor_small_sided"
  | "football"
  | "multi_sport";

export const SPORT_LABELS: Record<SportKey, string> = {
  baseball_softball: "Baseball / Softball",
  basketball: "Basketball",
  volleyball: "Volleyball",
  pickleball: "Pickleball",
  soccer_indoor_small_sided: "Indoor Soccer",
  football: "Football",
  multi_sport: "Multi‑sport"
};

export function SportIcon({ kind, size = 64 }: { kind: SportKey; size?: number }) {
  const stroke = "#111111";
  const primary = "#0B63E5";
  const accent = "#00A66A";
  const gray = "#C7D2FE";
  
  switch (kind) {
    case "baseball_softball":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="26" fill="#fff" stroke={stroke} />
          <path d="M18 22c6 6 6 14 0 20M46 22c-6 6-6 14 0 20" fill="none" stroke={primary} strokeWidth="2" />
        </svg>
      );
    case "basketball":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="26" fill={primary} stroke={stroke} />
          <path d="M6 32h52M32 6v52M14 14c16 10 20 26 20 40M50 14C34 24 30 40 30 54" fill="none" stroke="#fff" />
        </svg>
      );
    case "volleyball":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="26" fill={gray} stroke={stroke} />
          <path d="M12 30c10-10 30-10 40 0M20 44c8-14 28-18 38-8M10 38c12 2 26 14 30 22" fill="none" stroke={stroke}/>
        </svg>
      );
    case "pickleball":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <rect x="10" y="18" width="44" height="28" rx="3" fill={gray} stroke={stroke} />
          <line x1="32" y1="18" x2="32" y2="46" stroke={stroke}/>
          <circle cx="22" cy="32" r="2" fill={stroke}/><circle cx="42" cy="32" r="2" fill={stroke}/>
        </svg>
      );
    case "soccer_indoor_small_sided":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <rect x="8" y="12" width="48" height="40" rx="3" fill={accent} stroke={stroke} />
          <circle cx="32" cy="32" r="6" fill="none" stroke="#fff" />
          <line x1="32" y1="12" x2="32" y2="52" stroke="#fff" />
        </svg>
      );
    case "football":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <ellipse cx="32" cy="32" rx="16" ry="12" fill="#8B4513" stroke={stroke} />
          <path d="M20 32l24 0M22 28l20 0M22 36l20 0" stroke="#fff" strokeWidth="1" />
          <circle cx="32" cy="32" r="2" fill="#fff" />
        </svg>
      );
    case "multi_sport":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <rect x="6" y="10" width="24" height="18" fill={gray} stroke={stroke}/>
          <rect x="34" y="10" width="24" height="18" fill={primary} stroke={stroke}/>
          <rect x="6" y="34" width="24" height="20" fill={accent} stroke={stroke}/>
          <rect x="34" y="34" width="24" height="20" fill="#65A30D" stroke={stroke}/>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
          <rect x="6" y="10" width="52" height="44" fill={gray} stroke={stroke}/>
        </svg>
      );
  }
}