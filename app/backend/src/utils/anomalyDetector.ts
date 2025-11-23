//anomaly detection rules for email categorization
//flags emails that need human review based on inconsistencies

export interface AnomalyResult {
  hasAnomaly: boolean;
  anomalies: string[];
  severity: "low" | "medium" | "high";
  requiresReview: boolean;
}

export interface EmailData {
  category?: string | null;
  company?: string | null;
  role?: string | null;
  deadline?: Date | string | null;
  applyLink?: string | null;
  salary?: string | null;
  eligibility?: string | null;
  subject?: string;
  body?: string;
}

//detect anomalies in parsed email data
export function detectAnomalies(data: EmailData): AnomalyResult {
  const anomalies: string[] = [];
  let severity: "low" | "medium" | "high" = "low";

  // Rule 1: Job offer or internship should have company name
  if (
    (data.category === "job offer" || data.category === "internship") &&
    !data.company
  ) {
    anomalies.push("Missing company name for job/internship opportunity");
    severity = "high";
  }

  // Rule 2: Job offer or internship should have role
  if (
    (data.category === "job offer" || data.category === "internship") &&
    !data.role
  ) {
    anomalies.push("Missing role/position for job/internship opportunity");
    severity = severity === "high" ? "high" : "medium";
  }

  // Rule 3: Job offer or internship should have apply link
  if (
    (data.category === "job offer" || data.category === "internship") &&
    !data.applyLink
  ) {
    anomalies.push("Missing application link for job/internship");
    severity = severity === "high" ? "high" : "medium";
  }

  // Rule 4: Job offer with "intern" keyword might be miscategorized
  if (data.category === "job offer" && data.subject) {
    const subjectLower = data.subject.toLowerCase();
    if (
      subjectLower.includes("intern") &&
      !subjectLower.includes("international")
    ) {
      anomalies.push('Subject mentions "intern" but categorized as job offer');
      severity = "medium";
    }
  }

  // Rule 5: Internship with full-time keywords might be miscategorized
  if (data.category === "internship" && data.subject) {
    const subjectLower = data.subject.toLowerCase();
    const fullTimeKeywords = [
      "full-time",
      "full time",
      "placement",
      "permanent",
    ];
    if (fullTimeKeywords.some((kw) => subjectLower.includes(kw))) {
      anomalies.push(
        "Subject mentions full-time/placement but categorized as internship"
      );
      severity = "medium";
    }
  }

  // Rule 6: Exam category should not have company/role
  if (data.category === "exam" && (data.company || data.role)) {
    anomalies.push("Exam categorized email has company/role fields filled");
    severity = "medium";
  }

  // Rule 7: Check for deadline inconsistency
  if (data.deadline) {
    const deadlineDate =
      data.deadline instanceof Date ? data.deadline : new Date(data.deadline);
    const now = new Date();

    // Deadline in the past (more than 30 days ago)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (deadlineDate < thirtyDaysAgo) {
      anomalies.push("Deadline is more than 30 days in the past");
      severity = "low";
    }

    // Deadline very far in future (more than 1 year)
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (deadlineDate > oneYearFromNow) {
      anomalies.push("Deadline is more than 1 year in the future");
      severity = "low";
    }
  }

  // Rule 8: Salary without company is suspicious
  if (data.salary && !data.company) {
    anomalies.push("Salary mentioned but no company identified");
    severity = "medium";
  }

  // Rule 9: Apply link without company/role
  if (data.applyLink && !data.company && !data.role) {
    anomalies.push(
      "Application link present but no company or role identified"
    );
    severity = "medium";
  }

  // Rule 10: Check for "misc" category with structured data
  if (
    data.category === "misc" &&
    (data.company || data.role || data.applyLink || data.salary)
  ) {
    anomalies.push(
      "Categorized as misc but has structured job/internship data"
    );
    severity = "high";
  }

  // Rule 11: No category assigned
  if (!data.category) {
    anomalies.push("No category assigned to email");
    severity = "medium";
  }

  // Rule 12: Check for invalid URLs
  if (data.applyLink && !isValidUrl(data.applyLink)) {
    anomalies.push("Apply link appears to be invalid URL");
    severity = "medium";
  }

  // Determine if requires human review
  const requiresReview = severity === "high" || anomalies.length >= 3;

  return {
    hasAnomaly: anomalies.length > 0,
    anomalies,
    severity,
    requiresReview,
  };
}

//Validate URL format
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.startsWith("www.") ? `https://${url}` : url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Get human-readable anomaly report
export function formatAnomalyReport(result: AnomalyResult): string {
  if (!result.hasAnomaly) {
    return "No anomalies detected";
  }

  const header = `[${result.severity.toUpperCase()}] ${
    result.anomalies.length
  } anomaly(ies) detected`;
  const issues = result.anomalies.map((a, i) => `  ${i + 1}. ${a}`).join("\n");
  const footer = result.requiresReview ? "\n⚠️  REQUIRES HUMAN REVIEW" : "";

  return `${header}\n${issues}${footer}`;
}
