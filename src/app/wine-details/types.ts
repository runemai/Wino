export type WineTypeOption = {
  value: "rød" | "hvid" | "rosé" | "mousserende";
  label: string;
};

export type EntryMode = "camera" | "upload" | "manual";

export type FormShape = {
  producer: string;
  appellation: string;
  cuvee: string;
  vintage: string;
  type: WineTypeOption["value"];
  country: string;
  wine_district: string;
  grapes: string;
  alcohol: string;
  vineyard: string;
  consumed_date: string;
  balance?: number | null;
  length?: number | null;
  intensity?: number | null;
  complexity?: number | null;
  smagsnote?: string | null;
};

export type Extraction = {
  producer: string | null | undefined;
  appellation: string | null | undefined;
  cuvee?: string | null | undefined;
  vintage: string | null | undefined;
  type: WineTypeOption["value"] | null | undefined;
  country?: string | null | undefined;
  wine_district?: string | null | undefined;
  grapes?: string | null | undefined;
  alcohol?: string | null | undefined;
  vineyard?: string | null | undefined;
  label_summary?: string | null | undefined;
  notes?: string | null | undefined;
  confidence?: number | null | undefined;
};

export const aiTrackableFields: Array<keyof FormShape> = [
  "appellation",
  "cuvee",
  "vintage",
  "country",
  "wine_district",
  "grapes",
  "alcohol",
  "vineyard",
];

export const createEmptyFormState = (): FormShape => ({
  producer: "",
  appellation: "",
  cuvee: "",
  vintage: "",
  type: "rød",
  country: "",
  wine_district: "",
  grapes: "",
  alcohol: "",
  vineyard: "",
  consumed_date: new Date().toISOString().split("T")[0], // Default til i dag
  balance: null,
  length: null,
  intensity: null,
  complexity: null,
  smagsnote: "",
});

