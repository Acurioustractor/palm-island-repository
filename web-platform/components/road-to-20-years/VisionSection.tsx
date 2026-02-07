import { Rocket, Laptop, Users, Heart } from 'lucide-react';

interface VisionGoal {
  title: string;
  description: string;
  icon: 'expansion' | 'technology' | 'community' | 'wellbeing';
}

const ICON_MAP = {
  expansion: Rocket,
  technology: Laptop,
  community: Users,
  wellbeing: Heart,
};

const COLOR_MAP = {
  expansion: 'bg-blue-100 text-blue-600',
  technology: 'bg-purple-100 text-purple-600',
  community: 'bg-emerald-100 text-emerald-600',
  wellbeing: 'bg-rose-100 text-rose-600',
};

export default function VisionSection({ goals }: { goals: VisionGoal[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal, idx) => {
        const Icon = ICON_MAP[goal.icon];
        const color = COLOR_MAP[goal.icon];

        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{goal.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{goal.description}</p>
          </div>
        );
      })}
    </div>
  );
}
