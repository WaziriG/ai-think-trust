// Single source of truth for the AI Think Trust session schedule.
//
// Confirmed Aug 24 2026 against the calendar invites: Sept 9 is Patty's,
// Oct 14 / Nov 18 / Dec 9 are Jasmine's. All run 11:00a-12:00p CT.
//
// WEBINAR is derived, not typed in. It always resolves to the next upcoming
// session, so the site cannot go stale the way the hardcoded July 8 entry did.
// To add a session, append to SESSIONS and keep the list in date order.

export type Session = {
  /** ISO start, with the correct UTC offset for that date (CDT -05:00, CST -06:00). */
  iso: string;
  dateLabel: string;
  time: string;
  title: string;
  /** Public registration page. Never point this at an internal Meet invite. */
  registrationUrl: string;
};

export const SESSIONS: Session[] = [
  {
    iso: "2026-09-09T11:00:00-05:00",
    dateLabel: "September 9",
    time: "11:00 AM CT",
    title: "September Session",
    // Announced on LinkedIn until a registration page exists.
    registrationUrl: "https://www.linkedin.com/company/ai-think-trust/",
  },
  {
    iso: "2026-10-14T11:00:00-05:00",
    dateLabel: "October 14",
    time: "11:00 AM CT",
    title: "October Session",
    registrationUrl: "",
  },
  {
    iso: "2026-11-18T11:00:00-06:00",
    dateLabel: "November 18",
    time: "11:00 AM CT",
    title: "November Session",
    registrationUrl: "",
  },
  {
    iso: "2026-12-09T11:00:00-06:00",
    dateLabel: "December 9",
    time: "11:00 AM CT",
    title: "December Session",
    registrationUrl: "",
  },
];

export function nextSession(now: Date = new Date()): Session {
  return (
    SESSIONS.find((s) => new Date(s.iso).getTime() > now.getTime()) ??
    SESSIONS[SESSIONS.length - 1]
  );
}

/** The next upcoming session. Read by the home page and the quiz result page. */
export const WEBINAR = nextSession();
