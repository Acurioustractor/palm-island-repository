import { ComingSoon } from '@/components/picc/ComingSoon';
import { Archive } from 'lucide-react';

export default function ArchivedPage() {
  return (
    <ComingSoon
      title="Archived Stories"
      description="Access archived and unpublished content"
      icon={Archive}
      features={[
        'View archived stories',
        'Restore stories to published status',
        'Permanent deletion with confirmation',
        'Archive history and timestamps',
        'Export archived content',
      ]}
    />
  );
}
