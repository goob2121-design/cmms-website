export const sponsorLevels = [
  "Platinum",
  "Gold",
  "Silver",
  "Community Partner",
  "In-Kind Sponsor",
] as const;

export type SponsorLevel = (typeof sponsorLevels)[number];

const sponsorLevelOrder = new Map<string, number>(
  sponsorLevels.map((level, index) => [level, index]),
);

export function getSponsorLevelRank(level?: string | null) {
  return sponsorLevelOrder.get(level ?? "") ?? sponsorLevels.length;
}

export function getSponsorLevelBadgeClass(level?: string | null) {
  switch (level) {
    case "Platinum":
      return "border-white/45 bg-white/12 text-white";
    case "Gold":
      return "border-[#f1c86e]/65 bg-[#d7a84f]/18 text-[#f4d28b]";
    case "Silver":
      return "border-slate-200/35 bg-slate-200/12 text-slate-100";
    case "Community Partner":
      return "border-[#8fb0bd]/40 bg-[#8fb0bd]/12 text-[#d6e7ec]";
    case "In-Kind Sponsor":
      return "border-emerald-200/35 bg-emerald-700/14 text-emerald-100";
    default:
      return "border-[#d7a84f]/25 bg-black/25 text-[#f4d28b]";
  }
}

export function SponsorLevelBadge({ level }: { level?: string | null }) {
  if (!level) {
    return null;
  }

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${getSponsorLevelBadgeClass(
        level,
      )}`}
    >
      {level}
    </span>
  );
}
