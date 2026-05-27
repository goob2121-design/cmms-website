import { getTicketCheckoutNote } from "@/lib/tickets";

export function TicketCheckoutNote({ ticketUrl }: { ticketUrl?: string | null }) {
  return (
    <p className="mt-3 text-xs leading-5 text-[#bda987]">
      {getTicketCheckoutNote(ticketUrl)}
    </p>
  );
}
