import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { calculateChart, CalculateChartError } from "@/server/calculate-chart";

export const Route = createFileRoute("/api/chart")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Request body must be JSON." }, { status: 400 });
        }
        const input =
          typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
        const utcIso = typeof input.utcIso === "string" ? input.utcIso : "";
        const latitude = input.latitude;
        const longitude = input.longitude;
        const place = typeof input.place === "string" ? input.place : "";
        const name = typeof input.name === "string" ? input.name : "";
        const sex = input.sex === "Male" || input.sex === "Female" ? input.sex : undefined;
        if (utcIso === "" || Number.isNaN(Date.parse(utcIso))) {
          return Response.json({ error: "utcIso must be an ISO date string." }, { status: 400 });
        }
        if (
          typeof latitude !== "number" ||
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90
        ) {
          return Response.json({ error: "latitude must be between -90 and 90." }, { status: 400 });
        }
        if (
          typeof longitude !== "number" ||
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          return Response.json(
            { error: "longitude must be between -180 and 180." },
            { status: 400 },
          );
        }

        try {
          // Calculation engine: astro-ascendant (Effect-first TypeScript,
          // Swiss Ephemeris via SwissephLayer). The Effect program lives in
          // src/server/calculate-chart.ts with static typed imports; the
          // client only sees the JSON contract in src/lib/chart.ts.
          const result = await Effect.runPromise(
            calculateChart({ utcIso, latitude, longitude, place, name, sex }),
          );
          return Response.json(result);
        } catch (error) {
          const message =
            error instanceof CalculateChartError ? error.message : "Calculation failed.";
          return Response.json({ error: message }, { status: 422 });
        }
      },
    },
  },
});
