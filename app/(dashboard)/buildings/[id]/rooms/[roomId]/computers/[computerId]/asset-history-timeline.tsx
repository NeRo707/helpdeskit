import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssetHistory } from '@/types/api';

interface AssetHistoryTimelineProps {
  history: AssetHistory[];
}

const actionColors: Record<string, string> = {
  CREATED: 'bg-green-100 text-green-800 border-green-200',
  UPDATED: 'bg-blue-100 text-blue-800 border-blue-200',
  DELETED: 'bg-red-100 text-red-800 border-red-200',
};

export function AssetHistoryTimeline({ history }: AssetHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          {history.map((entry) => (
            <div key={entry.id} className="relative flex gap-4 pl-10">
              <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={actionColors[entry.action] || ''}
                  >
                    {entry.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  Changed by{' '}
                  <span className="font-medium">{entry.changedBy.name}</span>
                  <span className="text-muted-foreground"> ({entry.changedBy.role})</span>
                </p>
                {entry.diff && Object.keys(entry.diff).length > 0 && (
                  <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(entry.diff, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
