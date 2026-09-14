import { createFileRoute, Link } from "@tanstack/react-router";
import solarSystem from "../../assets/solar-system.png";
import wordmark from "../../assets/wordmark.svg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="bg-landing flex min-h-screen flex-col p-6 text-landing-ink antialiased sm:p-10">
      <div className="mx-auto w-full max-w-md lg:max-w-6xl">
        <a href="/" aria-label="Ascendant home" className="inline-block">
          <img src={wordmark} alt="Ascendant" height={32} className="h-8 w-auto" />
        </a>
      </div>

      <section
        aria-label="Ascendant birth chart calculator"
        className="mx-auto flex w-full max-w-md flex-1 items-center lg:max-w-6xl"
      >
        <div className="mt-6 grid w-full items-center gap-6 lg:mt-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div className="order-first overflow-hidden rounded-2xl lg:order-last">
            <img src={solarSystem} alt="" aria-hidden="true" className="h-auto w-full" />
          </div>

          <div className="flex flex-col items-start gap-6">
            <h1 className="font-hand text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
              Understand your
              <br />
              birth chart.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-pretty text-landing-ink/80 sm:text-lg">
              Unlike the broad and vague magazine horoscopes that only use your sun sign, we use a
              complete picture of the sky when and where you were born to generate your full birth
              chart.
            </p>
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:justify-start">
              <Link
                to="/docs/$"
                params={{ _splat: "chart" }}
                className="w-fit min-w-44 -rotate-1 rounded-2xl border-[3px] border-landing-ink bg-landing-ink px-8 py-2.5 text-center font-hand text-2xl text-landing-cream transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Analyse
              </Link>
              <Link
                to="/docs/$"
                params={{ _splat: "" }}
                className="w-fit min-w-44 rotate-1 rounded-2xl border-[3px] border-landing-ink bg-transparent px-8 py-2.5 text-center font-hand text-2xl text-landing-ink transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
