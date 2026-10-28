import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Scale className="h-6 w-6 text-gold" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by <span className="font-semibold text-dark-blue dark:text-gold">Neethivaan AI</span>.
            The source code is available on{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
