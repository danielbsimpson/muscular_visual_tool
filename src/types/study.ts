/** A curated scientific reference supporting a training claim. */
export interface Study {
  id: string;
  title: string;
  authors: string;
  year: number;
  url: string;
  /** The finding of the study. */
  summary: string;
  /** Why the finding matters for the linked structure or exercise. */
  relevance: string;
}
