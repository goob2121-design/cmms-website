const tickerText =
  "NEXT SHOW \u2022 SATURDAY JUNE 20 2026 \u2022 CUMBERLAND GAP CONVENTION CENTER \u2022 DOORS 6PM \u2022 SHOW 7PM \u2022 ADVANCE TICKETS $8 \u2022";

export function Ticker() {
  return (
    <div className="overflow-hidden border-y border-[#d7a84f]/30 bg-[#080604]/62 text-[#f4d28b] shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="flex w-max animate-[ticker_32s_linear_infinite] whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
        <span className="px-6">{tickerText}</span>
        <span className="px-6" aria-hidden="true">
          {tickerText}
        </span>
        <span className="px-6" aria-hidden="true">
          {tickerText}
        </span>
      </div>
    </div>
  );
}
