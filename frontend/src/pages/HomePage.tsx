import { PageTitle } from "../components/PageTitle";

export const HomePage = () => (
  <>
    <PageTitle
      eyebrow="Home"
      title="A quiet home base for now."
      description="This area will stay intentionally empty until the app has real money-in and money-out workflows to visualize."
    />
    <div className="empty-state">Home analytics will appear here later.</div>
  </>
);
