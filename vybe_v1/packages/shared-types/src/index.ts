export type PlaceType =
  | "cafe"
  | "bar"
  | "lounge"
  | "coworking"
  | "nightlife";

export type CrowdLevel = "low" | "medium" | "high" | "packed";
export type NoiseLevel = "quiet" | "social" | "loud" | "wild";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSummary {
  id: string;
  name: string;
  slug: string;
  type: PlaceType;
  description: string | null;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  coverImageUrl: string | null;
}

export interface PostFeedItem {
  id: string;
  text: string;
  imageUrl: string | null;
  vibe: number;
  crowdLevel: CrowdLevel;
  noiseLevel: NoiseLevel;
  waitTimeMin: number | null;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe?: boolean;
  user: Pick<AuthUser, "id" | "username" | "avatarUrl" | "city" | "trustScore">;
  place: Pick<PlaceSummary, "id" | "name" | "slug" | "type" | "city">;
}

