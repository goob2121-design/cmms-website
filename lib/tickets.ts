const squareHostPattern = /(^|\.)square\.(link|site|up\.com)$/i;

export function isTicketsAvailable(ticketsAvailable?: boolean | null) {
  return ticketsAvailable !== false;
}

export function getSoldOutMessage(message?: string | null) {
  return message?.trim() || "Sold Out";
}

export function isSquareTicketUrl(ticketUrl?: string | null) {
  if (!ticketUrl) return false;

  try {
    const url = new URL(ticketUrl);
    return squareHostPattern.test(url.hostname);
  } catch {
    return false;
  }
}

export function getTicketCheckoutNote(ticketUrl?: string | null) {
  return isSquareTicketUrl(ticketUrl)
    ? "Secure checkout powered by Square."
    : "Ticket checkout is securely handled through our ticketing partner.";
}
