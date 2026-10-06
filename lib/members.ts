// Trust member contact + booking configuration.
// bookingUrl is empty until each member supplies a Calendly (or similar) link;
// once filled, notification emails automatically include a booking CTA.
export type TrustMember = {
  email: string;
  bookingUrl: string;
};

export const TRUST_MEMBERS: Record<string, TrustMember> = {
  "Jackson Edens":   { email: "jackson@essaiconsulting.com", bookingUrl: "" },
  "Sage Faraday":    { email: "sagesingularity@gmail.com", bookingUrl: "" },
  "Daniel Marama":   { email: "daniel@maramamarketing.com", bookingUrl: "" },
  "Waziri Garuba":   { email: "waziri@harlemlabs.com", bookingUrl: "" },
};
