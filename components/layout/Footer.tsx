import { Github, Linkedin } from "lucide-react";

/**
 * Site footer with project info and author links.
 */

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-green-900 text-green-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-heading font-semibold tracking-wide">
            EleFind &mdash; AI-Powered Elephant Detection for Conservation
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/iamhelitha"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-300 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              iamhelitha
            </a>
            <span className="text-green-700">·</span>
            <a
              href="https://linkedin.com/in/iamhelitha"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-300 hover:text-white transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              iamhelitha
            </a>
          </div>

          <p className="text-green-300/60 text-xs">
            &copy; {new Date().getFullYear()} EleFind &middot; BSc Computer Science Dissertation &middot; University of Bedfordshire
          </p>
        </div>
      </div>
    </footer>
  );
}
