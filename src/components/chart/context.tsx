import { createContext, use, useState, type ReactNode } from "react";
import {
  buildChartMarkdown,
  buildChatPromptUrl,
  toUtcIso,
  validateChartInput,
  type ChartBirthInput,
  type ChartResult,
} from "@/lib/chart";
import { searchPlaces, type PlaceOption } from "@/lib/place";

export type ChartStatus = "empty" | "calculating" | "failure" | "success";

export interface ChartPageState {
  birth: ChartBirthInput;
  placeOptions: PlaceOption[];
  searching: boolean;
  searchError: string;
  status: ChartStatus;
  result: ChartResult | null;
  errors: string[];
}

export interface ChartPageActions {
  updateBirth: (patch: Partial<ChartBirthInput>) => void;
  searchPlace: () => void;
  selectPlace: (displayName: string) => void;
  calculate: () => void;
  saveMarkdown: () => void;
  askChatGPT: () => void;
}

export interface ChartPageMeta {
  title: string;
}

export interface ChartContextValue {
  state: ChartPageState;
  actions: ChartPageActions;
  meta: ChartPageMeta;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
  const value = use(ChartContext);
  if (!value) {
    throw new Error("Chart components must be used inside Chart.Provider.");
  }
  return value;
}

function defaultUtcOffset(): number {
  return -new Date().getTimezoneOffset();
}

export function ChartProvider({ children }: { children: ReactNode }) {
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
      const options = await searchPlaces(query);
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
