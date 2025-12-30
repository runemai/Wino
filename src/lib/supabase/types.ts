export type WineType = "rød" | "hvid" | "rosé" | "mousserende";

export interface Wine {
  id: string;
  image_url: string | null;
  producer: string;
  appellation: string | null;
  cuvee: string | null;
  vintage: string | null;
  type: WineType;
  country: string | null;
  wine_district: string | null;
  grapes: string | null;
  alcohol: string | null;
  vineyard: string | null;
  created_at: string;
  notes?: string | null;
  balance?: number | null;
  length?: number | null;
  intensity?: number | null;
  complexity?: number | null;
  smagsnote?: string | null;
}

export interface WineCriticReview {
  id: string;
  wine_id: string;
  critic_name: string;
  critic_publication: string | null;
  score: number;
  review_text: string;
  review_date: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      wines: {
        Row: Wine;
        Insert: Omit<Wine, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Wine>;
        Relationships: [];
      };
      wine_critic_reviews: {
        Row: WineCriticReview;
        Insert: Omit<WineCriticReview, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<WineCriticReview>;
        Relationships: [
          {
            foreignKeyName: "wine_critic_reviews_wine_id_fkey";
            columns: ["wine_id"];
            referencedRelation: "wines";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}

