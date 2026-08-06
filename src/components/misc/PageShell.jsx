import Container from "../layout/Container";

export default function PageShell({ title, subtitle, children }) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl text-brand-green sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-brand-muted">{subtitle}</p> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}
