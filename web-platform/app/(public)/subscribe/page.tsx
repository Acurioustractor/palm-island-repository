import { Mail, Check } from 'lucide-react';

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Subscribe to Updates
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Stay connected with Palm Island Community Company. Receive updates about community stories,
            PICC achievements, and our ongoing work.
          </p>
        </div>

        {/* Newsletter Form (Placeholder) */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I'm interested in: (Optional)
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="interest" value="stories" className="rounded text-blue-600" />
                  <span className="text-gray-700">Community Stories</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="interest" value="impact" className="rounded text-blue-600" />
                  <span className="text-gray-700">PICC Impact & Achievements</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="interest" value="innovation" className="rounded text-blue-600" />
                  <span className="text-gray-700">Innovation & Projects</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Mail className="w-5 h-5" />
              <span>Subscribe</span>
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>

        {/* What You'll Receive */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What You'll Receive
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Monthly Impact Updates</div>
                <p className="text-sm text-gray-600">
                  See the latest achievements, milestones, and community outcomes
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Featured Community Stories</div>
                <p className="text-sm text-gray-600">
                  Powerful stories from Palm Islanders sharing their experiences and wisdom
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Innovation Highlights</div>
                <p className="text-sm text-gray-600">
                  Learn about new projects and pioneering approaches from PICC
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Quarterly Impact Reports</div>
                <p className="text-sm text-gray-600">
                  Detailed insights into PICC's work and community outcomes
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8 italic">
          Note: Newsletter functionality will be fully activated in Phase 2. For now, this is a placeholder.
        </p>
      </div>
    </div>
  );
}
