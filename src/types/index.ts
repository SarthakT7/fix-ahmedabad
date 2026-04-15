export interface Zone {
  id: string;
  name: string;
  slug: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  zone_id: string;
  zone_name?: string;
  boundary: GeoJSON.Geometry;
  centroid_lat: number;
  centroid_lng: number;
}

export interface Representative {
  id: string;
  name: string;
  role: "corporator" | "mla" | "mp";
  party: string | null;
  constituency: string | null;
  photo_url: string | null;
  twitter_handle: string | null;
  phone: string | null;
  email: string | null;
}

export interface Report {
  id: string;
  ward_id: string;
  ward?: Ward;
  latitude: number;
  longitude: number;
  address: string | null;
  severity: "minor" | "moderate" | "severe" | "critical";
  description: string | null;
  image_url: string | null;
  status: "open" | "acknowledged" | "in_progress" | "resolved";
  reporter_name: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface ReportFormData {
  latitude: number;
  longitude: number;
  ward_id: string;
  address: string;
  severity: string;
  description?: string;
  image_url?: string;
  reporter_name?: string;
}
