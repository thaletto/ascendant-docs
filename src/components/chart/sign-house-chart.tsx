import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildSouthIndianChart,
  SOUTH_INDIAN_GRID_TEMPLATE,
  type SouthIndianCell,
  type SouthIndianChart,
} from "@/lib/chart";
import { useChart } from "@/components/chart/context";
import { cn } from "@/lib/utils";

function cellSpokenSummary(cell: SouthIndianCell): string {
  const house = cell.house === null ? "" : `, house ${cell.house}`;
  if (cell.occupants.length === 0) {
    return `${cell.sign}${house}: empty`;
  }
  const bodies = cell.occupants
    .map((occupant) => {
      const retro = occupant.retrograde ? " retrograde" : "";
      return `${occupant.body}${retro} ${occupant.degree}`.trim();
    })
    .join(", ");
  return `${cell.sign}${house}: ${bodies}`;
}

function ChartBox({ cell }: { cell: SouthIndianCell }) {
  return (
    <div
      style={{ gridArea: cell.area }}
      className={cn(
        "bg-background relative flex min-h-0 flex-col overflow-hidden px-1.5 py-1.5 sm:px-2 sm:py-2",
        cell.isLagna && "bg-accent shadow-[inset_0_0_0_1.5px_var(--foreground)]",
      )}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span
          className={cn(
            "text-[10px] tracking-[0.12em] uppercase",
            cell.isLagna ? "text-foreground/70" : "text-muted-foreground",
          )}
        >
          {cell.signShort}
        </span>
        {cell.house !== null ? (
          <span
            className={cn(
              "font-mono text-[10px] tabular-nums",
              cell.isLagna ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {cell.house}
          </span>
        ) : null}
      </div>
      <ul className="flex min-h-0 flex-1 flex-col justify-center gap-0.2">
        {cell.occupants.map((occupant) => (
          <li
            key={`${occupant.body}-${occupant.degree}`}
            className={cn(
              "flex items-baseline justify-between gap-1 font-mono text-[11px] leading-tight sm:text-xs",
              occupant.isLagna ? "font-medium" : "font-normal",
            )}
          >
            <span>
              {occupant.short}
              {occupant.retrograde ? <span className="text-muted-foreground"> r</span> : null}
            </span>
            <span className="text-muted-foreground tabular-nums">{occupant.degree}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SouthIndianChartView({ chart }: { chart: SouthIndianChart }) {
  const spoken = chart.cells.map(cellSpokenSummary).join(". ");
  return (
    <figure className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={`${chart.title} South Indian chart. Lagna ${chart.lagnaSign} ${chart.lagnaDegree}. ${spoken}`}
        className="bg-foreground/25 mx-auto grid aspect-square w-full max-w-xl gap-px overflow-hidden border border-foreground/40"
        style={{
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gridTemplateRows: "repeat(4, minmax(0, 1fr))",
          gridTemplateAreas: SOUTH_INDIAN_GRID_TEMPLATE,
        }}
      >
        {chart.cells.map((cell) => (
          <ChartBox key={cell.sign} cell={cell} />
        ))}
        <div
          style={{ gridArea: "center" }}
          className="bg-background flex items-center justify-center px-3 text-center"
        >
          <span className="text-sm font-medium tracking-wide">{chart.title}</span>
        </div>
      </div>
    </figure>
  );
}

function SignHouseChart({ division }: { division: number }) {
  const {
    state: { result },
  } = useChart();

  if (!result) {
    return null;
  }

  const chart = buildSouthIndianChart(result, division);
  if (!chart) {
    return null;
  }

  return <SouthIndianChartView chart={chart} />;
}

export function ChartSignHouseCharts() {
  return (
    <Tabs defaultValue="D1">
      <TabsList className="max-w-full self-start overflow-x-auto">
        <TabsTrigger value="D1">D1 · Rashi</TabsTrigger>
        <TabsTrigger value="D9">D9 · Navamsha</TabsTrigger>
      </TabsList>
      <TabsContent value="D1">
        <SignHouseChart division={1} />
      </TabsContent>
      <TabsContent value="D9">
        <SignHouseChart division={9} />
      </TabsContent>
    </Tabs>
  );
}
