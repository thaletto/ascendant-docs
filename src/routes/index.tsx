import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import solarSystem from '../../assets/solar-system.png';
import wordmark from '../../assets/wordmark.png';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const INSTALL_CMD = 'bun add astro-ascendant effect@rc';

function LandingPage() {
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setIsCopied(true);
      setCopyFailed(false);
      setTimeout(() => setIsCopied(false), 1600);
    } catch {
      setIsCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <main className="min-h-screen bg-landing-paper text-landing-ink antialiased">
      {/* ── Hero ── */}
      <div className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={solarSystem}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-landing-paper via-transparent to-landing-paper" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <a href="/" className="flex items-center gap-3" aria-label="Ascendant home">
            <img src={wordmark} alt="Ascendant" className="h-14 w-auto sm:h-16" />
          </a>
          <div className="flex items-center gap-6">
            <Link
              to="/docs/$"
              params={{ _splat: '' }}
              className="rounded-full bg-landing-ink px-5 py-2.5 text-[13px] font-semibold tracking-[0.12em] text-landing-paper uppercase transition-transform active:scale-[0.96]"
            >
              Get started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pt-10 text-center sm:px-10 sm:pt-16">
          <h1
            className="text-balance text-5xl leading-[0.95] tracking-tight sm:text-7xl"
          >
            Understand your
            <br />
            birth chart.
          </h1>
        </div>

        <div id="install" className="relative z-10 scroll-mt-24 mb-24 px-6 pb-6 sm:px-10">
          <p className="mx-auto mb-4 max-w-lg text-center text-base leading-relaxed text-pretty text-landing-ink/75">
            Unlike the broad and vague magazine horoscopes that only use your
            sun sign, we use a complete picture of the sky when and where you
            were born to generate your full birth chart.
          </p>
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-landing-ink/15 bg-landing-cream/90 px-5 py-3.5 backdrop-blur">
            <code
              title={INSTALL_CMD}
              className="truncate font-mono text-[13px] text-landing-ink sm:text-sm"
            >
              <span className="mr-2 text-landing-ink/40">$</span>
              {INSTALL_CMD}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={isCopied ? 'Copied' : 'Copy install command'}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-landing-ink/15 text-landing-ink/70 transition-[color,background-color,scale] hover:bg-landing-ink/8 hover:text-landing-ink active:scale-[0.96]"
            >
              <div className="relative">
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity',
                    isCopied
                      ? 'scale-100 opacity-100 blur-0'
                      : 'blur-xs scale-[0.25] opacity-0',
                  )}
                >
                  <RiCheckLine size={18} />
                </div>
                <div
                  className={cn(
                    'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity',
                    isCopied
                      ? 'blur-xs scale-[0.25] opacity-0'
                      : 'scale-100 opacity-100 blur-0',
                  )}
                >
                  <RiFileCopyLine size={18} />
                </div>
              </div>
            </button>
            <span role="status" className="sr-only">
              {copyFailed
                ? 'Copy failed. Select the command text manually.'
                : isCopied
                  ? 'Install command copied.'
                  : ''}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
