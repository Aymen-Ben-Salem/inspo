export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      post_media: {
        Row: {
          alt: string;
          created_at: string;
          height: number;
          id: string;
          position: number;
          post_id: string;
          poster_url: string | null;
          type: string;
          url: string;
          width: number;
        };
        Insert: {
          alt?: string;
          created_at?: string;
          height: number;
          id?: string;
          position?: number;
          post_id: string;
          poster_url?: string | null;
          type?: string;
          url: string;
          width: number;
        };
        Update: {
          alt?: string;
          created_at?: string;
          height?: number;
          id?: string;
          position?: number;
          post_id?: string;
          poster_url?: string | null;
          type?: string;
          url?: string;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          category: string;
          colors: string[];
          created_at: string;
          creator_avatar_url: string;
          creator_handle: string | null;
          creator_name: string;
          creator_url: string | null;
          description: string;
          id: string;
          industries: string[];
          published_at: string | null;
          slug: string;
          source_url: string;
          status: string;
          styles: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          colors?: string[];
          created_at?: string;
          creator_avatar_url: string;
          creator_handle?: string | null;
          creator_name: string;
          creator_url?: string | null;
          description: string;
          id?: string;
          industries?: string[];
          published_at?: string | null;
          slug: string;
          source_url: string;
          status?: string;
          styles?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          colors?: string[];
          created_at?: string;
          creator_avatar_url?: string;
          creator_handle?: string | null;
          creator_name?: string;
          creator_url?: string | null;
          description?: string;
          id?: string;
          industries?: string[];
          published_at?: string | null;
          slug?: string;
          source_url?: string;
          status?: string;
          styles?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          consented_at: string;
          created_at: string;
          email: string;
          id: string;
          source: string;
        };
        Insert: {
          consented_at?: string;
          created_at?: string;
          email: string;
          id?: string;
          source?: string;
        };
        Update: {
          consented_at?: string;
          created_at?: string;
          email?: string;
          id?: string;
          source?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
