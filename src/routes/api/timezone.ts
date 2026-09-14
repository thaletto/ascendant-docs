import { createFileRoute } from "@tanstack/react-router";
import { findTimeZone } from "@/server/resolve-timezone";

export const Route = createFileRoute("/api/timezone")({
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
        const { latitude, longitude } = input;
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
        return Response.json({ timeZone: findTimeZone(latitude, longitude) });
      },
    },
  },
});
