import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChart } from "@/components/chart/context";
import { formatSignifyingHouses } from "@/lib/chart";

export function ChartKpTable() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Calculated with {result.kp.astroParams.ayanamsa} ayanamsa and{" "}
        {result.kp.astroParams.houseSystem} houses.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Body</TableHead>
            <TableHead>Sign Lord</TableHead>
            <TableHead>Star Lord</TableHead>
            <TableHead>Sub Lord</TableHead>
            <TableHead>Signifying Houses</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.kp.rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.signLord === "" ? "—" : row.signLord}</TableCell>
              <TableCell>{row.starLord === "" ? "—" : row.starLord}</TableCell>
              <TableCell>{row.subLord === "" ? "—" : row.subLord}</TableCell>
              <TableCell>{formatSignifyingHouses(row.signifyingHouses)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
