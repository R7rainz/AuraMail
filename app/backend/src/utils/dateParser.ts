import * as chrono from "chrono-node";
export function parseDate(
  dateString: string,
  referenceDate?: Date
): Date | null {
  if (!dateString || typeof dateString !== "string") return null;

  const cleaned = dateString.trim();
  if (!cleaned) return null;

  const invalidPattersn = [
    "null",
    "n/a",
    "none",
    "no deadline",
    "not mentioned",
    "unknown",
  ];

  try {
    const parsedResults = chrono.parse(cleaned, referenceDate || new Date(), {
      forwardDate: true,
    });

    if (parsedResults && parsedResults.length > 0) {
      const date = parsedResults[0].start.date();

      //validate the date is reasonable (not too far in past/future)
      const now = new Date();
      const twoYearsAgo = new Date(
        now.getFullYear() - 2,
        now.getMonth(),
        now.getDate()
      );
      const TwoYearsFromNow = new Date(
        now.getFullYear() + 2,
        now.getMonth(),
        now.getDate()
      );

      if (date >= twoYearsAgo && date <= TwoYearsFromNow) {
        return date;
      }
    }
  } catch (error) {
    console.warn(
      `Failed to parse date "${dateString}" with chrono-node : `,
      error
    );
  }

  try {
    const nativeDate = new Date(cleaned);
    if (!isNaN(nativeDate.getTime())) {
      const now = new Date();
      const twoYearsAgo = new Date(
        now.getFullYear() - 2,
        now.getMonth(),
        now.getDate()
      );
      const TwoYearsFromNow = new Date(
        now.getFullYear() + 2,
        now.getMonth(),
        now.getDate()
      );

      if (nativeDate >= twoYearsAgo && nativeDate <= TwoYearsFromNow) {
        return nativeDate;
      }
    }
  } catch (error) {}

  return null;
}

//parse multiple date formats and return the most likely deadline date
export function extractDeadlineDate(text: string): Date | null {
  if (!text) return null;

  // Common deadline patterns
  const patterns = [
    /deadline[:\s]+([^.]+)/i,
    /apply\s+by[:\s]+([^.]+)/i,
    /last\s+date[:\s]+([^.]+)/i,
    /due\s+on[:\s]+([^.]+)/i,
    /registration\s+closes\s+on[:\s]+([^.]+)/i,
    /submit\s+before[:\s]+([^.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const parsed = parseDate(match[1]);
      if (parsed) {
        return parsed;
      }
    }
  }

  // Try parsing the entire text if no pattern matched
  return parseDate(text);
}

//format date for consistent storage (YYYY-MM-DD)
export function formatDateForStorage(date: Date | null): string | null {
  if (!date || isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
