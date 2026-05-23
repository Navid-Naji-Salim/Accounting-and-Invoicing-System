import { PageTitle } from "../components/PageTitle";

export const ReportsPage = () => (
  <>
    <PageTitle
      eyebrow="Reports"
      title="Reports will come after transactions."
      description="This page is a placeholder until invoices, bills, payments, and expenses exist."
    />
    <div className="empty-state">No reports yet.</div>
  </>
);
