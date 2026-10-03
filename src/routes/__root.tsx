import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "@/styles/app.css?url";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { Banner } from "fumadocs-ui/components/banner";
import favicon from "../../assets/favicon.svg";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Ascendant",
      },
      {
        name: "description",
        content:
          "Guided astrology workflows for AI agents, backed by local typed Python calculations and inspectable evidence.",
      },
      {
        property: "og:title",
        content: "Ascendant - AI Skills and SDK for Astrology",
      },
      {
        property: "og:description",
        content:
          "Guided astrology workflows for AI agents, backed by local typed Python calculations and inspectable evidence.",
      },
      {
        property: "og:image",
        content: "https://ascendant-docs.vercel.app/solar-system.png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:image",
        content: "https://ascendant-docs.vercel.app/solar-system.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: favicon },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Banner
            id="astro-ascendant-v4-rainbow"
            variant="rainbow"
            rainbowColors={[
              "rgba(76,0,255,0.55)",
              "rgba(180,60,255,0.6)",
              "rgba(0,200,255,0.55)",
              "rgba(90,80,255,0.5)",
            ]}
          >
            astro-ascendant v4.0.1 is available — sidereal charts, dashas, and transits on
            Effect.{" "}
            <a href="/docs" className="underline underline-offset-4">
              Install v4.0.1
            </a>
          </Banner>
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
