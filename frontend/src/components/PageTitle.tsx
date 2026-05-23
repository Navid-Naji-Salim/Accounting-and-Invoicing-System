type PageTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export const PageTitle = ({ eyebrow, title, description }: PageTitleProps) => (
  <section className="page-title">
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p>{description}</p>
  </section>
);
