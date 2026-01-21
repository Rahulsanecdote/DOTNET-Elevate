export type JobApplication = {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Offer" | "Rejected";
  dateApplied: string;
  contact?: string;
};
