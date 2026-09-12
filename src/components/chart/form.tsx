import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChart } from "@/components/chart/context";

export function ChartFormFrame({ children }: { children: ReactNode }) {
  const {
    meta: { title },
  } = useChart();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Enter birth time and place. Calculations run on the server with
          Lahiri ayanamsa and Whole Sign houses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
    </Card>
  );
}

export function ChartDateField() {
  const {
    state: { birth },
    actions: { updateBirth },
  } = useChart();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="chart-date">Birth date</Label>
      <Input
        id="chart-date"
        type="date"
        value={birth.date}
        onChange={(event) => updateBirth({ date: event.target.value })}
      />
    </div>
  );
}

export function ChartTimeField() {
  const {
    state: { birth },
    actions: { updateBirth },
  } = useChart();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="chart-time">Birth time</Label>
      <Input
        id="chart-time"
        type="time"
        value={birth.time}
        onChange={(event) => updateBirth({ time: event.target.value })}
      />
    </div>
  );
}

function parseCoordinate(value: string): number {
  const trimmed = value.trim();
  return trimmed === "" ? Number.NaN : Number(trimmed);
}

function offsetLabel(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = absolute % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function ChartOffsetField() {
  const {
    state: { birth },
    actions: { updateBirth },
  } = useChart();
  const options: number[] = [];
  for (let minutes = -720; minutes <= 840; minutes += 30) {
    options.push(minutes);
  }
  if (!options.includes(345)) {
    options.push(345);
  }
  options.sort((a, b) => a - b);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="chart-offset">Timezone offset</Label>
      <Select
        value={String(birth.utcOffsetMinutes)}
        onValueChange={(value) =>
          updateBirth({ utcOffsetMinutes: Number(value) })
        }
      >
        <SelectTrigger id="chart-offset">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((minutes) => (
            <SelectItem key={minutes} value={String(minutes)}>
              {offsetLabel(minutes)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ChartSexField() {
  const {
    state: { birth },
    actions: { updateBirth },
  } = useChart();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="chart-sex">Sex (optional)</Label>
      <Select
        value={birth.sex ?? "unspecified"}
        onValueChange={(value) =>
          updateBirth({
            sex:
              value === "unspecified"
                ? undefined
                : (value as "Male" | "Female"),
          })
        }
      >
        <SelectTrigger id="chart-sex">
          <SelectValue placeholder="Not specified" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unspecified">Not specified</SelectItem>
          <SelectItem value="Male">Male</SelectItem>
          <SelectItem value="Female">Female</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ChartPlaceField() {
  const {
    state: { birth, placeOptions, searching, searchError },
    actions: { updateBirth, searchPlace, selectPlace },
  } = useChart();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="chart-place">Birth place</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="chart-place"
            type="text"
            placeholder="City, Country"
            value={birth.place}
            onChange={(event) => updateBirth({ place: event.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={searching}
            onClick={searchPlace}
            className="shrink-0"
          >
            {searching ? "Searching" : "Search place"}
          </Button>
        </div>
      </div>
      {searchError !== "" ? (
        <Alert variant="destructive">
          <AlertTitle>Place search</AlertTitle>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      ) : null}
      {placeOptions.length > 0 ? (
        <Select
          onValueChange={(value) => {
            if (typeof value === "string" && value !== "") {
              selectPlace(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a matching place" />
          </SelectTrigger>
          <SelectContent>
            {placeOptions.map((option) => (
              <SelectItem
                key={option.displayName}
                value={option.displayName}
              >
                {option.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chart-latitude">Latitude</Label>
          <Input
            id="chart-latitude"
            type="number"
            step="any"
            value={Number.isFinite(birth.latitude) ? birth.latitude : ""}
            onChange={(event) =>
              updateBirth({ latitude: parseCoordinate(event.target.value) })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chart-longitude">Longitude</Label>
          <Input
            id="chart-longitude"
            type="number"
            step="any"
            value={Number.isFinite(birth.longitude) ? birth.longitude : ""}
            onChange={(event) =>
              updateBirth({ longitude: parseCoordinate(event.target.value) })
            }
          />
        </div>
      </div>
    </div>
  );
}

export function ChartCalculateButton() {
  const {
    state: { status },
    actions: { calculate },
  } = useChart();
  return (
    <Button
      type="button"
      disabled={status === "calculating"}
      onClick={calculate}
    >
      {status === "calculating" ? "Calculating" : "Calculate chart"}
    </Button>
  );
}
