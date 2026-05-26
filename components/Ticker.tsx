const tickerMessages = [
  "★ June 20th • Cumberland Gap Convention Center • Doors Open 6PM • Show Starts 7PM",
  "◆ Featuring Bryan Turner & The Cumberland Mountain Music Show Band",
  "★ Special Guest Kelly Caldwell • More Guests To Be Announced",
  "◆ Advance Tickets $8 Online • $10 At The Door",
  "★ Bluegrass • Gospel • Country • Traditional Mountain Music",
  "◆ Family Friendly Entertainment For All Ages",
  "★ The #1 Live Music Show in the Tri-State Area",
  "◆ Visit CumberlandMountainMusic.com For Tickets & Show Info",
];

function TickerSegmentGroup({ isHidden = false }: { isHidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={isHidden}>
      {tickerMessages.map((message) => (
        <span
          key={message}
          className="mx-2 inline-flex items-center rounded-full border border-[#d7a84f]/18 bg-black/18 px-4 py-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.18)] sm:mx-3 sm:px-5"
        >
          {message}
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div className="overflow-hidden border-y border-[#d7a84f]/30 bg-[#080604]/68 text-[#f4d28b] shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="flex w-max animate-[ticker_56s_linear_infinite] whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]">
        <TickerSegmentGroup />
        <TickerSegmentGroup isHidden />
        <TickerSegmentGroup isHidden />
      </div>
    </div>
  );
}
