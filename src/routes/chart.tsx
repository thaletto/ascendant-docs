import { createFileRoute } from "@tanstack/react-router";
import { createContext, use, useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  buildChartMarkdown,
  buildChatPromptUrl,
  toPlacementRows,
  toUtcIso,
  validateChartInput,
  type ChartBirthInput,
  type ChartPlacement,
  type ChartResult,
} from "@/lib/chart";

export const Route = createFileRoute("/chart")({
  component: ChartPage,
});

type ChartStatus = "empty" | "calculating" | "failure" | "success";

interface PlaceOption {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface ChartPageState {
  birth: ChartBirthInput;
  placeOptions: PlaceOption[];
  searching: boolean;
  searchError: string;
  status: ChartStatus;
  result: ChartResult | null;
  errors: string[];
}

interface ChartPageActions {
  updateBirth: (patch: Partial<ChartBirthInput>) => void;
  searchPlace: () => void;
  selectPlace: (displayName: string) => void;
  calculate: () => void;
  saveMarkdown: () => void;
  askChatGPT: () => void;
}

interface ChartPageMeta {
  title: string;
}

interface ChartContextValue {
  state: ChartPageState;
  actions: ChartPageActions;
  meta: ChartPageMeta;
}

const ChartContext = createContext<ChartContextValue | null>(null);

function useChart(): ChartContextValue {
  const value = use(ChartContext);
  if (!value) {
    throw new Error("Chart components must be used inside Chart.Provider.");
  }
  return value;
}

function defaultUtcOffset(): number {
  return -new Date().getTimezoneOffset();
}

function ChartProvider({ children }: { children: ReactNode }) {
  const [birth, setBirth] = useState<ChartBirthInput>({
    date: "",
    time: "",
    utcOffsetMinutes: defaultUtcOffset(),
    place: "",
    latitude: Number.NaN,
    longitude: Number.NaN,
  });
  const [placeOptions, setPlaceOptions] = useState<PlaceOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [status, setStatus] = useState<ChartStatus>("empty");
  const [result, setResult] = useState<ChartResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const updateBirth = (patch: Partial<ChartBirthInput>) => {
    setBirth((previous) => ({ ...previous, ...patch }));
  };

  const searchPlace = async () => {
    const query = birth.place.trim();
    if (query === "") {
      setSearchError("Enter a place name before searching.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      // V1 place search uses OpenStreetMap Nominatim (no API key); users can
      // always override with manual coordinates below.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) {
        throw new Error("Place search failed.");
      }
      const data = (await response.json()) as {
        display_name: string;
        lat: string;
        lon: string;
      }[];
      const options = data
        .map((entry) => ({
          displayName: entry.display_name,
          latitude: Number(entry.lat),
          longitude: Number(entry.lon),
        }))
        .filter(
          (entry) =>
            Number.isFinite(entry.latitude) && Number.isFinite(entry.longitude),
        );
      setPlaceOptions(options);
      if (options.length === 0) {
        setSearchError("No places found. Try a different spelling.");
      }
    } catch {
      setSearchError("Place search failed. Enter coordinates manually.");
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (displayName: string) => {
    const match = placeOptions.find(
      (option) => option.displayName === displayName,
    );
    if (match) {
      setBirth((previous) => ({
        ...previous,
        place: match.displayName,
        latitude: match.latitude,
        longitude: match.longitude,
      }));
    }
  };

  const calculate = async () => {
    const validation = validateChartInput(birth);
    if (!validation.ok) {
      setErrors(validation.errors);
      setStatus("failure");
      setResult(null);
      return;
    }
    setErrors([]);
    setStatus("calculating");
    try {
      const response = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utcIso: toUtcIso(birth),
          latitude: birth.latitude,
          longitude: birth.longitude,
          place: birth.place,
          ...(birth.sex ? { sex: birth.sex } : {}),
        }),
      });
      const payload = (await response.json()) as
        | ChartResult
        | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "Calculation failed.",
        );
      }
      setResult(payload);
      setStatus("success");
    } catch (error) {
      setResult(null);
      setStatus("failure");
      setErrors([
        error instanceof Error ? error.message : "Calculation failed.",
      ]);
    }
  };

  const saveMarkdown = () => {
    if (!result) {
      return;
    }
    const blob = new Blob([buildChartMarkdown(result)], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "birth-chart.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const askChatGPT = () => {
    if (!result) {
      return;
    }
    window.open(buildChatPromptUrl(result), "_blank", "noopener");
  };

  return (
    <ChartContext
      value={{
        state: {
          birth,
          placeOptions,
          searching,
          searchError,
          status,
          result,
          errors,
        },
        actions: {
          updateBirth,
          searchPlace,
          selectPlace,
          calculate,
          saveMarkdown,
          askChatGPT,
        },
        meta: { title: "Birth Chart Calculator" },
      }}
    >
      {children}
    </ChartContext>
  );
}

function ChartFormFrame({ children }: { children: ReactNode }) {
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

function ChartDateField() {
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

function ChartTimeField() {
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

function ChartOffsetField() {
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

function ChartSexField() {
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

function ChartPlaceField() {
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

function ChartCalculateButton() {
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

function ChartEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your chart appears here</CardTitle>
        <CardDescription>
          Fill in birth time and place, then calculate.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ChartCalculating() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculating</CardTitle>
        <CardDescription>
          Running divisional charts, dasha, Jaimini, and Ashtakavarga on the
          server.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </CardContent>
    </Card>
  );
}

function ChartFailure() {
  const {
    state: { errors },
  } = useChart();
  return (
    <Alert variant="destructive">
      <AlertTitle>Calculation did not complete</AlertTitle>
      <AlertDescription>
        {errors.length > 0 ? errors.join(" ") : "Unknown error."}
      </AlertDescription>
    </Alert>
  );
}

function ChartStateBadge({ placement }: { placement: ChartPlacement }) {
  if (placement.state === "") {
    return <span>—</span>;
  }
  if (placement.state === "Retrograde") {
    return <Badge variant="destructive">{placement.state}</Badge>;
  }
  return <Badge variant="secondary">{placement.state}</Badge>;
}

function ChartPlacementTable({ division }: { division: number }) {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  const rows = toPlacementRows(result, division);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Body</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Degree</TableHead>
          <TableHead>House</TableHead>
          <TableHead>Nakshatra</TableHead>
          <TableHead>State</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.body}>
            <TableCell>{row.body}</TableCell>
            <TableCell>{row.sign}</TableCell>
            <TableCell>{row.degree}</TableCell>
            <TableCell>{row.house}</TableCell>
            <TableCell>
              {row.nakshatra}
              {row.pada === null ? "" : ` ${row.pada}`}
            </TableCell>
            <TableCell>
              <ChartStateBadge placement={row} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ChartHouseTable({ division }: { division: number }) {
  const {
    state: { result },
  } = useChart();
  const houses = result?.divisions.find(
    (entry) => entry.division === division,
  )?.houses;
  if (!houses) {
    return null;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>House</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Cusp</TableHead>
          <TableHead>Lord</TableHead>
          <TableHead>Occupants</TableHead>
          <TableHead>Significators</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {houses.map((house) => (
          <TableRow key={house.number}>
            <TableCell>{house.number}</TableCell>
            <TableCell>{house.sign === "" ? "—" : house.sign}</TableCell>
            <TableCell>{house.cusp === "" ? "—" : house.cusp}</TableCell>
            <TableCell>{house.lord === "" ? "—" : house.lord}</TableCell>
            <TableCell>
              {house.occupants.length > 0 ? house.occupants.join(", ") : "—"}
            </TableCell>
            <TableCell>
              {house.significators.length > 0
                ? house.significators.join(", ")
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ChartDivisionCharts() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <Accordion defaultValue={["D1"]}>
      {result.divisions.map((division) => (
        <AccordionItem
          key={division.division}
          value={`D${division.division}`}
        >
          <AccordionTrigger>
            {`D${division.division} placements and cusps`}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <ChartPlacementTable division={division.division} />
            <Separator />
            <ChartHouseTable division={division.division} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function ChartDashaTables() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  const systems = [
    { name: "Vimshottari", periods: result.dasha.vimshottari },
    { name: "Chara", periods: result.dasha.chara },
    { name: "Sthira", periods: result.dasha.sthira },
  ];
  return (
    <div className="flex flex-col gap-4">
      {systems.map((system) => (
        <Card key={system.name}>
          <CardHeader>
            <CardTitle>{system.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {system.periods.length === 0 ? (
              <CardDescription>No periods returned.</CardDescription>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahadasha</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {system.periods.map((period) => (
                    <TableRow
                      key={`${period.mahadasha}-${period.start}`}
                    >
                      <TableCell>{period.mahadasha}</TableCell>
                      <TableCell>{period.start}</TableCell>
                      <TableCell>{period.end}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartJaiminiTables() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Chara Karakas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Planet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.jaimini.karakas.map((karaka) => (
                <TableRow key={karaka.role}>
                  <TableCell>{karaka.role}</TableCell>
                  <TableCell>{karaka.planet}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Karakamsha and Upapada</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Karakamsha</TableCell>
                <TableCell>
                  {result.jaimini.karakamsha === ""
                    ? "—"
                    : result.jaimini.karakamsha}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Upapada</TableCell>
                <TableCell>
                  {result.jaimini.upapada === ""
                    ? "—"
                    : result.jaimini.upapada}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Arudha Pada</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House</TableHead>
                <TableHead>Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.jaimini.arudha.map((entry) => (
                <TableRow key={entry.house}>
                  <TableCell>{entry.house}</TableCell>
                  <TableCell>
                    {entry.pada === "" ? "—" : entry.pada}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drishti and Argala</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Rashi Drishti on Lagna</TableCell>
                <TableCell>
                  {result.jaimini.drishti.length > 0
                    ? result.jaimini.drishti.join(", ")
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Supporting Argala</TableCell>
                <TableCell>
                  {result.jaimini.argala.supporting.length > 0
                    ? result.jaimini.argala.supporting.join(", ")
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Obstructing Argala</TableCell>
                <TableCell>
                  {result.jaimini.argala.obstructing.length > 0
                    ? result.jaimini.argala.obstructing.join(", ")
                    : "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartSavTable() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ashtakavarga</CardTitle>
        <CardDescription>
          {`SAV total ${result.sav.total}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sign</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.sav.scores.map((entry) => (
              <TableRow key={entry.sign}>
                <TableCell>{entry.sign}</TableCell>
                <TableCell>{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ChartSummary() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  const lagnaRow = toPlacementRows(result, 1)[0];
  const sun = toPlacementRows(result, 1).find((row) => row.body === "Sun");
  const moon = toPlacementRows(result, 1).find((row) => row.body === "Moon");
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lagnaRow
            ? `Ascendant ${lagnaRow.sign}, ${lagnaRow.degree}`
            : "Ascendant"}
        </CardTitle>
        <CardDescription>First house sidereal rising sign</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Sun</TableCell>
              <TableCell>
                {sun ? `${sun.sign} ${sun.degree}` : "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Moon</TableCell>
              <TableCell>
                {moon ? `${moon.sign} ${moon.degree}` : "—"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ChartSaveMarkdownButton() {
  const {
    actions: { saveMarkdown },
  } = useChart();
  return (
    <Button type="button" variant="secondary" onClick={saveMarkdown}>
      Save as Markdown
    </Button>
  );
}

function ChartAskChatGPTButton() {
  const {
    actions: { askChatGPT },
  } = useChart();
  return (
    <Button type="button" variant="outline" onClick={askChatGPT}>
      Ask ChatGPT
    </Button>
  );
}

function ChartSuccess() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <div className="flex flex-col gap-6">
      <ChartSummary />
      <Tabs defaultValue="divisions" className="flex flex-col gap-4">
        <TabsList className="max-w-full self-start overflow-x-auto">
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
          <TabsTrigger value="dasha">Dasha</TabsTrigger>
          <TabsTrigger value="jaimini">Jaimini</TabsTrigger>
          <TabsTrigger value="sav">Ashtakavarga</TabsTrigger>
        </TabsList>
        <TabsContent value="divisions">
          <ChartDivisionCharts />
        </TabsContent>
        <TabsContent value="dasha">
          <ChartDashaTables />
        </TabsContent>
        <TabsContent value="jaimini">
          <ChartJaiminiTables />
        </TabsContent>
        <TabsContent value="sav">
          <ChartSavTable />
        </TabsContent>
      </Tabs>
      <Separator />
      <div className="flex flex-col gap-3 sm:flex-row">
        <ChartSaveMarkdownButton />
        <ChartAskChatGPTButton />
      </div>
      <Card>
        <CardContent className="pt-6">
          <CardDescription>
            This chart is interpretive guidance, not certainty or a substitute
            for medical, legal, or financial advice. Calculated with Lahiri
            ayanamsa and Whole Sign houses.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartResultSwitch() {
  const {
    state: { status },
  } = useChart();
  if (status === "calculating") {
    return <ChartCalculating />;
  }
  if (status === "failure") {
    return <ChartFailure />;
  }
  if (status === "success") {
    return <ChartSuccess />;
  }
  return <ChartEmpty />;
}

const Chart = {
  Provider: ChartProvider,
  FormFrame: ChartFormFrame,
  DateField: ChartDateField,
  TimeField: ChartTimeField,
  OffsetField: ChartOffsetField,
  SexField: ChartSexField,
  PlaceField: ChartPlaceField,
  CalculateButton: ChartCalculateButton,
  ResultSwitch: ChartResultSwitch,
};

function ChartPage() {
  return (
    <Chart.Provider>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
        <Chart.FormFrame>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Chart.DateField />
            <Chart.TimeField />
            <Chart.OffsetField />
            <Chart.SexField />
          </div>
          <Chart.PlaceField />
          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
            <Chart.CalculateButton />
          </div>
        </Chart.FormFrame>
        <Chart.ResultSwitch />
      </main>
    </Chart.Provider>
  );
}
