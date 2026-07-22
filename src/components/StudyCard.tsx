import type { Study } from '@/types';

interface StudyCardProps {
  study: Study;
}

export function StudyCard({ study }: StudyCardProps) {
  return (
    <article className="study-card">
      <h4>
        <a href={study.url} target="_blank" rel="noopener noreferrer">
          {study.title}
        </a>
      </h4>
      <p className="study-meta">
        {study.authors} · {study.year}
      </p>
      <p className="study-summary">{study.summary}</p>
      <p className="study-relevance">{study.relevance}</p>
    </article>
  );
}