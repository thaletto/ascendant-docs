import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  findCurrentPeriodIndex,
  formatDashaDate,
  formatDashaDuration,
  type ChartDashaPeriod,
} from "@/lib/chart";
import { useChart } from "@/components/chart/context";

function periodKey(period: ChartDashaPeriod): string {
  return `${period.mahadasha}-${period.start}`;
}

function AntardashaTable({ period }: { period: ChartDashaPeriod }) {
  if (period.antardashas.length === 0) {
    return <p className="text-muted-foreground text-sm">No antardasha periods.</p>;
  }
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 px-2">Antardasha</TableHead>
          <TableHead className="h-8 px-2">Start</TableHead>
          <TableHead className="h-8 px-2">End</TableHead>
          <TableHead className="h-8 px-2">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {period.antardashas.map((antar) => (
          <TableRow key={`${antar.antardasha}-${antar.start}`}>
            <TableCell className="px-2 py-1">{antar.antardasha}</TableCell>
            <TableCell className="px-2 py-1">{formatDashaDate(antar.start)}</TableCell>
            <TableCell className="px-2 py-1">{formatDashaDate(antar.end)}</TableCell>
            <TableCell className="px-2 py-1">{formatDashaDuration(antar.start, antar.end)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DashaSystemTable({ periods, now }: { periods: ChartDashaPeriod[]; now: string }) {
  const current = findCurrentPeriodIndex(periods, now);
  if (periods.length === 0) {
    return <p className="text-muted-foreground text-sm">No dasha periods.</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="text-muted-foreground grid h-8 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 px-2 pr-8 text-xs font-medium">
        <span>Mahadasha</span>
        <span>Start</span>
        <span>End</span>
        <span>Duration</span>
      </div>
      <Accordion
        defaultValue={current === -1 ? [] : [periodKey(periods[current]!)]}
        className="border-0"
      >
        {periods.map((period, index) => (
          <AccordionItem key={periodKey(period)} value={periodKey(period)}>
            <AccordionTrigger className="items-center gap-1 px-2 py-1 text-xs hover:no-underline **:data-[slot=accordion-trigger-icon]:size-3">
              <span
                className={`grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 pr-1 text-left font-normal ${
                  index === current ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className={index === current ? "font-medium" : ""}>{period.mahadasha}</span>
                <span>{formatDashaDate(period.start)}</span>
                <span>{formatDashaDate(period.end)}</span>
                <span>{formatDashaDuration(period.start, period.end)}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <AntardashaTable period={period} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function ChartDashaTimelines() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  const now = new Date().toISOString();
  const systems = [
    { name: "Vimshottari", periods: result.dasha.vimshottari },
    { name: "Chara", periods: result.dasha.chara },
    { name: "Sthira", periods: result.dasha.sthira },
  ];
  return (
    <Tabs defaultValue="Vimshottari">
      <TabsList className="max-w-full self-start overflow-x-auto">
        {systems.map((system) => (
          <TabsTrigger key={system.name} value={system.name}>
            {system.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {systems.map((system) => (
        <TabsContent key={system.name} value={system.name}>
          <DashaSystemTable periods={system.periods} now={now} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
