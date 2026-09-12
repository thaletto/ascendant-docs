import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toPlacementRows, type ChartPlacement } from "@/lib/chart";
import { useChart } from "@/components/chart/context";
import {
  ChartAskChatGPTButton,
  ChartSaveMarkdownButton,
} from "@/components/chart/actions";

export function ChartEmpty() {
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

export function ChartCalculating() {
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

export function ChartFailure() {
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

export function ChartStateBadge({ placement }: { placement: ChartPlacement }) {
  if (placement.state === "") {
    return <span>—</span>;
  }
  if (placement.state === "Retrograde") {
    return <Badge variant="destructive">{placement.state}</Badge>;
  }
  return <Badge variant="secondary">{placement.state}</Badge>;
}

export function ChartPlacementTable({ division }: { division: number }) {
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

export function ChartHouseTable({ division }: { division: number }) {
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

export function ChartDivisionCharts() {
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

export function ChartDashaTables() {
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

export function ChartJaiminiTables() {
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

export function ChartSavTable() {
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

export function ChartSummary() {
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

export function ChartSuccess() {
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

export function ChartResultSwitch() {
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
