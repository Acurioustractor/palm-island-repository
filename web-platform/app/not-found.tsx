import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF3C7] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <img
            src="/logo/picc-logo-full.png"
            alt="PICC Logo"
            className="h-16 mx-auto mb-4"
          />
        </div>
        <p className="text-6xl font-bold text-[#0B4F6C] mb-2">404</p>
        <h1 className="text-2xl font-bold text-[#2D2319] mb-2">
          Page not found
        </h1>
        <p className="text-[#2D2319]/70 mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0B4F6C]/90 transition-colors font-medium"
        >
          Return to home page
        </Link>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Link href="/stories" className="text-[#0EA5E9] hover:underline">
            Stories
          </Link>
          <Link href="/services" className="text-[#0EA5E9] hover:underline">
            Services
          </Link>
          <Link href="/about" className="text-[#0EA5E9] hover:underline">
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
