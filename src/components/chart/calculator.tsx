import { ChartProvider } from "@/components/chart/context";
import {
  ChartCalculateButton,
  ChartDateField,
  ChartFormFrame,
  ChartOffsetField,
  ChartPlaceField,
  ChartSexField,
  ChartTimeField,
} from "@/components/chart/form";
import { ChartResultSwitch } from "@/components/chart/results";

export const Chart = {
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

export function ChartCalculator() {
  return (
    <Chart.Provider>
      <div className="flex w-full flex-col gap-6 sm:gap-8">
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
      </div>
    </Chart.Provider>
  );
}
