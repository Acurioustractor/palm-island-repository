import { ComingSoon } from '@/components/picc/ComingSoon';
import { Edit } from 'lucide-react';

export default function DraftsPage() {
  return (
    <ComingSoon
      title="Draft Stories"
      description="Manage stories in progress"
      icon={Edit}
      features={[
        'View all draft stories',
        'Continue editing drafts',
        'Auto-save functionality',
        'Collaborate on drafts with team members',
        'Schedule publishing',
      ]}
    />
  );
}
