/**
 * Minimal site footer with project credits.
 */

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-green-900 text-green-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center text-sm">
          <p className="font-heading font-semibold tracking-wide">
            EleFind &mdash; AI-Powered Elephant Detection for Conservation
          </p>
          <p className="text-green-300">
            University of Bedfordshire &middot; BSc Computer Science Dissertation
          </p>
          <p className="text-green-300/70 text-xs mt-1">
            &copy; {new Date().getFullYear()} EleFind. Built with YOLOv11, SAHI &amp; Next.js.
          </p>
        </div>
      </div>
    </footer>
  );
}
