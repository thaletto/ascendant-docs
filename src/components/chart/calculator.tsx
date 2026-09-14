import { ChartProvider } from "@/components/chart/context";
import {
  ChartCalculateButton,
  ChartDateField,
  ChartFormFrame,
  ChartNameField,
  ChartPlaceField,
  ChartSexField,
  ChartTimeField,
} from "@/components/chart/form";
import { ChartResultSwitch } from "@/components/chart/results";

export const Chart = {
  Provider: ChartProvider,
  FormFrame: ChartFormFrame,
  DateField: ChartDateField,
  NameField: ChartNameField,
  TimeField: ChartTimeField,
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
          <Chart.NameField />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Chart.DateField />
            <Chart.TimeField />
            <Chart.SexField />
            <Chart.PlaceField />
          </div>
          <Chart.CalculateButton />
        </Chart.FormFrame>
        <Chart.ResultSwitch />
      </div>
    </Chart.Provider>
  );
}
