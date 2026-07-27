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

export function getNewYorkCalendarDate(date: Date) {
  const parts = calendarDateFormatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function getNewYorkDateValue(date = new Date()) {
  const { year, month, day } = getNewYorkCalendarDate(date);

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseCalendarDate(dateValue: string) {
  const [datePart] = dateValue.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

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

export function getCalendarDaysUntil(showDate: string, now = new Date()) {
  const today = getNewYorkCalendarDate(now);
  const show = parseCalendarDate(showDate);

  return getCalendarDayNumber(show) - getCalendarDayNumber(today);
}

export function isCalendarDateOnOrAfterToday(
  dateValue: string,
  now = new Date(),
) {
  return getCalendarDaysUntil(dateValue, now) >= 0;
}

export function getInclusiveCountdownLabel(
  showDate: string,
  now = new Date(),
) {
  const daysDiff = getCalendarDaysUntil(showDate, now);

  if (daysDiff < 0) {
    return "Show Ended";
  }

  if (daysDiff === 0) {
    return "Today";
  }

  if (daysDiff === 1) {
    return "Tomorrow";
  }

  return `${daysDiff} Days Away`;
}

export function formatNewYorkShowDate(showDate: string) {
  const { year, month, day } = parseCalendarDate(showDate);

  return displayDateFormatter.format(
    new Date(Date.UTC(year, month - 1, day, 12)),
  );
}
