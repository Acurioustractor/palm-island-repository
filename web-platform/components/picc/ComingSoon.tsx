import { LucideIcon } from 'lucide-react';
import { Lightbulb } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export function ComingSoon({ title, description, icon: Icon = Lightbulb, features }: ComingSoonProps) {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Coming in Phase 2</h2>
          <p className="text-blue-100 mb-6">
            This feature is part of our Phase 2 development plan.
          </p>

          {features && features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Planned Features:</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            In the meantime, you can use existing tools like All Stories, Dashboard, and Analytics
            to manage your content.
          </p>
        </div>
      </div>
    </div>
  );
}
