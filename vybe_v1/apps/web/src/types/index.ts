import type { AuthUser, PlaceSummary, PostFeedItem } from "@vybe/shared-types";

export type { AuthUser, PlaceSummary, PostFeedItem };

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface PlaceDetails extends PlaceSummary {
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  coverImageUrl: string | null;
  posts: PostFeedItem[];
}

