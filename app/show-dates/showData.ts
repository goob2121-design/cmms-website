export const venue = {
  name: "Cumberland Gap Convention Center",
  address: "601 Colwyn Avenue",
  cityStateZip: "Cumberland Gap, TN 37724",
};

export const shows = [
  {
    date: "Saturday, June 20, 2026",
    shortDate: "June 20, 2026",
    dateValue: "2026-06-20T00:00:00",
    time: "7:00 PM - 9:00 PM",
    title: "Cumberland Mountain Music Show",
    ticketUrl:
      "https://pinnaclestudiotn.com/event/6394938/748518290/cumberland-mountain-music-show",
    detailsUrl: "/show-dates/june-20-2026",
    promoImage: "/june-20-promo.png",
  },
  {
    date: "Saturday, August 15, 2026",
    shortDate: "August 15, 2026",
    dateValue: "2026-08-15T00:00:00",
    time: "7:00 PM - 9:00 PM",
    title: "Cumberland Mountain Music Show",
    ticketUrl:
      "https://pinnaclestudiotn.com/event/6394941/748518295/cumberland-mountain-music-show",
  },
  {
    date: "Saturday, October 3, 2026",
    shortDate: "October 3, 2026",
    dateValue: "2026-10-03T00:00:00",
    time: "7:00 PM - 9:00 PM",
    title: "Cumberland Mountain Music Show",
    ticketUrl:
      "https://pinnaclestudiotn.com/event/6394948/748518307/cumberland-mountain-music-show",
  },
  {
    date: "Saturday, December 12, 2026",
    shortDate: "December 12, 2026 - Christmas Show",
    dateValue: "2026-12-12T00:00:00",
    time: "7:00 PM - 9:00 PM",
    title: "Cumberland Mountain Music Christmas Show",
    ticketUrl:
      "https://pinnaclestudiotn.com/event/6394950/748518309/cumberland-mountain-music-christmas-show",
  },
];

export function getNextShow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return shows.find((show) => new Date(show.dateValue) >= today);
}
