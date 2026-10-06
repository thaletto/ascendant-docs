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

export function ChartKpCaption() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <p className="text-muted-foreground m-0! text-sm">
      Calculated with <span className="font-mono">{result.kp.astroParams.ayanamsa}</span> ayanamsa
      and <span className="font-mono">{result.kp.astroParams.houseSystem}</span> houses.
    </p>
  );
}

export function ChartKpCuspTable() {
  const {
    state: { result },
  } = useChart();
  if (!result || result.kp.cusps.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>House</TableHead>
            <TableHead>Sign</TableHead>
            <TableHead>Cusp</TableHead>
            <TableHead>Sign Lord</TableHead>
            <TableHead>Star Lord</TableHead>
            <TableHead>Sub Lord</TableHead>
            <TableHead>Sub-Sub Lord</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.kp.cusps.map((cusp) => (
            <TableRow key={cusp.house}>
              <TableCell>{cusp.house}</TableCell>
              <TableCell>{cusp.sign === "" ? "—" : cusp.sign}</TableCell>
              <TableCell>{cusp.degree === "" ? "—" : cusp.degree}</TableCell>
              <TableCell>{cusp.signLord === "" ? "—" : cusp.signLord}</TableCell>
              <TableCell>{cusp.starLord === "" ? "—" : cusp.starLord}</TableCell>
              <TableCell>{cusp.subLord === "" ? "—" : cusp.subLord}</TableCell>
              <TableCell>{cusp.subSubLord === "" ? "—" : cusp.subSubLord}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ChartKpTable() {
  const {
    state: { result },
  } = useChart();
  if (!result) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1.5">
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
