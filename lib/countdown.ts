const calendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function getNewYorkCalendarDate(date: Date) {
  const parts = calendarDateFormatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function parseCalendarDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);

  return { year, month, day };
}

function getCalendarDayNumber({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) {
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function getInclusiveCountdownLabel(
  showDate: string,
  now = new Date(),
) {
  const today = getNewYorkCalendarDate(now);
  const show = parseCalendarDate(showDate);
  const daysDiff =
    getCalendarDayNumber(show) - getCalendarDayNumber(today);

  if (daysDiff < 0) {
    return "Show Ended";
  }

  if (daysDiff === 0) {
    return "Today";
  }

  if (daysDiff === 1) {
    return "Tomorrow";
  }

  return `${daysDiff + 1} Days Away`;
}

export function formatNewYorkShowDate(showDate: string) {
  const { year, month, day } = parseCalendarDate(showDate);

  return displayDateFormatter.format(
    new Date(Date.UTC(year, month - 1, day, 12)),
  );
}
