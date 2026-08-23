import { PageHeader } from '@/components/page-header';
import { BuildingsTable } from './buildings-table';

export default function BuildingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Buildings" description="Manage campus buildings and rooms" />
      <BuildingsTable />
    </div>
  );
}
