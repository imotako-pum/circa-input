import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  alt?: boolean;
}

export function Section({
  id,
  title,
  description,
  children,
  alt,
}: SectionProps) {
  return (
    <section id={id} className={`section${alt ? " section-alt" : ""}`}>
      <div className="container">
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
        {children}
      </div>
    </section>
  );
}
