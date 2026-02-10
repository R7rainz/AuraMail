import OpenAi from "openai";

// Initialize OpenAI client only if API key is available
let openai: OpenAi | null = null;

function getOpenAIClient(): OpenAi | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAi({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 2,
      baseURL: "https://api.openai.com/v1",
    });
  }
  return openai;
}

const aiCache = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;

setInterval(() => {
  if (aiCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(aiCache.entries());
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => aiCache.delete(key));
  }
}, 5 * 60 * 1000);

export async function analyzeEmail(email: {
  subject: string;
  snippet: string;
  body?: string;
  attachments?: Array<{ filename: string; mimeType: string; size: number }>;
}) {
  const cacheKey = `${email.subject}: ${email.snippet}`.substring(0, 100);

  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    aiCache.delete(cacheKey);
  }

  const truncatedBody = email.body
    ? email.body.length > 5000
      ? email.body.substr(0, 5000) + "..."
      : email.body
    : "No body text provided";

  const attachmentInfo =
    email.attachments && email.attachments.length > 0
      ? `\n\nATTACHMENTS (${email.attachments.length}):\n` +
        email.attachments
          .map(
            (a) =>
              `-${a.filename} (${a.mimeType}, ${(a.size / 1024).toFixed(1)} KB)`
          )
          .join("\n")
      : "";

  const prompt = [
    "You are a highly specialized AI assistant for academic, placement, and recruitment analysis. Your single task is to extract all requested information from the provided email and return **ONLY a single, valid JSON object** with the specified keys and formatting. You must prioritize **accuracy, completeness, and adherence to the specified format**.",
    "",
    "EMAIL CONTENT:",
    `Subject: ${email.subject}`,
    `Preview: ${email.snippet}`,
    `Body: ${truncatedBody}${attachmentInfo}`,
    "",
    "TASK: Extract the following information and return ONLY a JSON object (no markdown, no explanation, no conversational text, no pre-amble).",
    "",
    "{",
    '  "summary": "Comprehensive 3-5 sentence summary with ALL key information: What is this about? Who is it for? Key dates/deadlines? Important requirements? Any action needed? Format according to the detailed rules below.",',
    '  "category": "EXACTLY one of: internship, job offer, exam, reminder, announcement, misc",',
    '  "company": "Official Company/organization name for job/internship emails ONLY, otherwise null. Use the full, formal name.",',
    '  "role": "Specific, formal job title/position(s) for job/internship emails ONLY, otherwise null. List multiple roles if present.",',
    '  "deadline": "The primary application or submission deadline. Use **YYYY-MM-DD** format (e.g., 2025-11-24) or **null**.",',
    '  "applyLink": "The single, PRIMARY application/registration URL. Must start with http/https or be **null**.",',
    '  "otherLinks": ["Array of ALL other unique and important URLs found in email (brochures, info pages, documents, forms, portals, drive links, video links, meeting links). Return an empty array **[]** if none are found."],',
    '  "eligibility": "Detailed eligibility criteria formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no specific criteria are mentioned.",',
    '  "timings": "Complete schedule details formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no specific timings are mentioned.",',
    '  "salary": "Complete compensation breakdown (Stipend/CTC, duration, benefits) formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no salary or compensation is mentioned.",',
    '  "location": "Full location information (Venue, Address, Mode, Platform) formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no location is mentioned.",',
    '  "eventDetails": "Practical logistics (What to Bring, Reporting Location, Dress Code, Format, Duration, Special Instructions, Documents) formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no practical details are mentioned.",',
    '  "requirements": "Technical/Professional requirements (Programming, Frameworks, Experience, Soft Skills, Certifications, Portfolio) formatted as a single string with **Markdown bullet points (\\n• Item)** for readability. Return \'null\' if no specific requirements are mentioned.",',
    '  "description": "Detailed description covering nature of work, key responsibilities, learning outcomes, project details, and involved technologies. Provide a coherent paragraph or two of text. Return \'null\' if a meaningful description is absent.",',
    '  "attachmentSummary": "Brief, single-sentence description of what attachments contain (Job Description PDF, Application Form, Brochure, etc.). Return **null** if no attachments are present or their content is unclear."',
    "}",
    "",
    "---",
    "## 🎯 CATEGORIZATION RULES (Choose the MOST SPECIFIC category)",
    ' - **"internship"**: ANY internship opportunity (summer, winter, industrial training, apprenticeship, co-op). Keywords: intern, internship, training, apprentice, project',
    ' - **"job offer"**: Full-time jobs, campus placement drives, lateral hiring, job fairs, recruitment drives. Keywords: job, placement, hiring, recruitment, full-time, careers, FTE (Full-Time Equivalent)',
    ' - **"exam"**: Academic exams, assessments, tests, quizzes, online exams, mid-terms, finals, certification tests. Keywords: exam, test, assessment, quiz, evaluation, certification',
    ' - **"reminder"**: Deadline reminders, submission reminders, follow-ups, last date alerts, pending actions. Keywords: reminder, last date, deadline approaching, action required, pending',
    ' - **"announcement"**: Events, workshops, webinars, competitions, hackathons, seminars, conferences, guest lectures, cultural events. Keywords: event, workshop, webinar, competition, hackathon, seminar, conference, fest, notice',
    ' - **"misc"**: Administrative notices, general information, newsletters, fee reminders, official policy changes, or anything that doesn\'t fit above.',
    " - **PRIORITY**: If an email mentions BOTH internship AND job, categorize by what is PRIMARY in the Subject line or the initial context of the Body.",
    "",
    "---",
    "## 🔍 DETAILED EXTRACTION AND FORMATTING RULES",
    "",
    "### 1. SUMMARY (MAX 5 Sentences, Comprehensive)",
    ' - **For JOBS/INTERNSHIPS**: "**[Company]** is hiring for **[role(s)]**. Eligibility includes **[CGPA/branches/year]**. **Stipend/CTC:** [amount if mentioned]. **Deadline:** [date]. **Location:** [place/remote]. Apply via [method]. **Highlights:** [unique benefits/learning]."',
    ' - **For EXAMS**: "**[Exam name]** is scheduled on **[date]** at **[time]** in **[venue/platform]**. **Duration:** [time]. **Reporting time:** [time]. **Topics:** [if mentioned]. **What to bring:** [ID, documents, etc.]. **Format:** [online/offline/open-book]."',
    ' - **For EVENTS**: "**[Event name]** by **[organizer]** on **[date]** at **[time]**. **Venue/Mode:** [location/online]. **Focus:** [topics/themes]. **Registration:** [how to register and deadline]. **Benefits:** [certificates, prizes, learning]. **Eligibility:** [if any]."',
    " - **CORE ELEMENTS (ALWAYS Include)**: WHO (target audience/organizer), WHAT (main point), WHEN (dates/deadlines), WHERE (location/mode), WHY (benefits/importance/action needed).",
    "",
    "### 2. ELIGIBILITY",
    " - Format as a single string using **\\n•** for bullet points.",
    ' - Extract all criteria: CGPA/Percentage (e.g., "7.0 or above"), ALL Allowed Branches (e.g., CSE, IT, ECE), Year of Study (e.g., Final Year, 2024 Graduates), Required Skills (e.g., Java, Python), Backlog Policy (e.g., "No active backlogs allowed"), and Age/Graduation Year.',
    "",
    "### 3. TIMINGS",
    " - Format as a single string using **\\n•** for bullet points.",
    ' - **Dates**: Convert ALL dates to **YYYY-MM-DD** or a range (e.g., "2024-03-15 to 2024-03-17"). List all dates clearly for multi-day events.',
    ' - **Times**: Include AM/PM (e.g., "9:00 AM to 5:00 PM").',
    ' - **Reporting Time**: If different from start time (e.g., "Report by 8:45 AM, starts 9:00 AM").',
    " - **Time Zone**: Always specify if mentioned (IST, EST, etc.).",
    "",
    "### 4. LINKS (CRITICAL ACCURACY)",
    " - **applyLink**: Prioritize the application/registration URL. If multiple are present, determine the most direct one for the primary action. Must be a single URL.",
    " - **otherLinks**: This array must contain **EVERY OTHER UNIQUE URL** found in the email, including all hyperlinked text URLs.",
    "   * *Types to include*: Brochures, Job Descriptions, Documents, FAQ Pages, Company Portals, Google Drive, Dropbox, Event Detail Pages, YouTube/Video links, Zoom/Meet links, Social Media, and Payment Portals.",
    "   * *Constraint*: Ensure no duplicates, and the `applyLink` is **not** included here.",
    "",
    "### 5. SALARY",
    " - Format as a single string using **\\n•** for bullet points.",
    ' - Extract: Stipend/CTC amount (e.g., "₹50,000/month" or "15 LPA"), Duration (e.g., "6 months", "Full-time"), Benefits (e.g., "Health Insurance", "Relocation"), and Additional Incentives (e.g., "Performance Bonus").',
    "",
    "### 6. LOCATION",
    " - Format as a single string using **\\n•** for bullet points.",
    " - Extract: Venue (Building/Room), Complete Address, Mode (Online/Offline/Hybrid), and Platform (Zoom, MS Teams, Google Meet, etc., if online).",
    "",
    "### 7. DESCRIPTION",
    " - Must be a coherent, well-written paragraph (or two) of text. Do not use bullet points here.",
    " - Cover: Nature of the work/opportunity, Key Responsibilities, Learning Outcomes, Project/Team details, and Technologies/Domains involved.",
    "",
    "---",
    "## 🛑 CRITICAL INSTRUCTIONS (MUST BE FOLLOWED)",
    "",
    "1.  **NEVER Hallucinate Data**: If information for any field is *not explicitly and clearly* stated in the email, the value for that field **must be null** (or **[]** for `otherLinks`).",
    "2.  **MANDATORY Fields**: For `job offer` or `internship` categories, the `company` and `role` fields **must** be extracted (even if implied from the subject) or the data will be considered incomplete.",
    "3.  **Strict Format**: All structured fields (`eligibility`, `timings`, `salary`, `location`, `eventDetails`, `requirements`) **must** be formatted as a single string containing **Markdown bullet points (`\\n• Item`)**.",
    "4.  **No Exceptions for Output**: The only output is the valid, single JSON object. Do not include any text before or after the JSON.",
    "5.  **Date Standard**: All dates must adhere to the **YYYY-MM-DD** standard.",
    '6.  **Unstop/HackerRank**: Contests and challenges on platforms like Unstop, Dare2Compete, or HackerRank must be categorized as **"announcement"** unless they are explicitly an exam for a placement process.',
  ].join("\n");

  const client = getOpenAIClient();
  if (!client) {
    console.warn("OpenAI API key not configured. Skipping AI analysis.");
    // Return fallback immediately if OpenAI is not configured
    const fallback = {
      summary:
        email.subject.length > 30
          ? email.subject.substring(0, 27) + "..."
          : email.subject || "Unknown email",
      category: "misc",
      deadline: null,
    };
    aiCache.set(cacheKey, {
      data: fallback,
      timestamp: Date.now(),
    });
    return fallback;
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing student emails and extracting structured information. Always return valid JSON only, no markdown, no explanation. Be thorough and detailed",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1200,
      temperature: 0.05,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content?.trim();
    const parsed = JSON.parse(result || "{}");

    Object.keys(parsed).forEach((key) => {
      if (
        parsed[key] === "" ||
        parsed[key] === "null" ||
        parsed[key] === "N/A" ||
        parsed[key] === "not mentioned" ||
        parsed[key] === "None"
      ) {
        parsed[key] = null;
      }
    });

    if (parsed.otherLinks && !Array.isArray(parsed.otherLinks)) {
      parsed.otherLinks = [parsed.otherLinks];
    }

    aiCache.set(cacheKey, {
      data: parsed,
      timestamp: Date.now(),
    });

    return parsed;
  } catch (err) {
    console.error("Error analyzing email:", err);

    // Return a more robust fallback
    const fallback = {
      summary:
        email.subject.length > 30
          ? email.subject.substring(0, 27) + "..."
          : email.subject || "Unknown email",
      category: "misc",
      deadline: "No deadline",
    };

    // Cache fallback too to prevent repeated failures
    aiCache.set(cacheKey, {
      data: fallback,
      timestamp: Date.now(),
    });

    return fallback;
  }
}
