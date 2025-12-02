import { ComingSoon } from '@/components/picc/ComingSoon';
import { Clock } from 'lucide-react';

export default function SubmissionsPage() {
  return (
    <ComingSoon
      title="Story Submissions"
      description="Review and approve community story submissions"
      icon={Clock}
      features={[
        'View all pending submissions in one place',
        'Approve, reject, or request changes to stories',
        'Preview stories before publishing',
        'Cultural protocol checklist',
        'Bulk actions for multiple submissions',
        'Email notifications to submitters',
      ]}
    />
  );
}
