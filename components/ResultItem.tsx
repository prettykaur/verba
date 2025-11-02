import { Card, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';

export function ResultItem(props: {
  clue: string;
  answer: string;
  source: string;
  date?: string;
  confidence?: number; // 0..1
}) {
  const { clue, answer, source, date, confidence } = props;
  const pct = confidence != null ? Math.round(confidence * 100) : undefined;

  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-4">
        <div>
          <div className="text-brand-ink">{clue}</div>
          <div className="text-brand-slate-600 mt-1 text-xs">
            {source} {date ? `· ${date}` : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="font-mono text-lg tracking-wide">{answer}</div>
          {pct != null && <Badge>{pct}%</Badge>}
        </div>
      </CardBody>
    </Card>
  );
}
