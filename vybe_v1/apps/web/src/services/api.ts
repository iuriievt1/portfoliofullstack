import type { AuthResponse, AuthUser, PlaceDetails, PlaceSummary, PostFeedItem } from "../types";
import { getAuthToken } from "../lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? payload?.error ?? "Request failed");
  }

  return response.json();
}

export const api = {
  register(payload: { email: string; username: string; password: string; city?: string }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload: { email: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me() {
    return request<AuthUser>("/auth/me");
  },
  getFeed() {
    return request<PostFeedItem[]>("/posts/feed");
  },
  getPlaces(params?: { city?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.city) query.set("city", params.city);
    if (params?.type) query.set("type", params.type);
    return request<PlaceSummary[]>(`/places${query.toString() ? `?${query.toString()}` : ""}`);
  },
  getPlace(id: string) {
    return request<PlaceDetails>(`/places/${id}`);
  },
  createPost(payload: {
    placeId: string;
    text: string;
    imageUrl?: string;
    vibe: number;
    crowdLevel: string;
    noiseLevel: string;
    waitTimeMin?: number;
    expiresInHours: number;
  }) {
    return request<PostFeedItem>("/posts", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  likePost(id: string) {
    return request<{ success: boolean }>(`/posts/${id}/like`, { method: "POST" });
  },
  unlikePost(id: string) {
    return request<{ success: boolean }>(`/posts/${id}/like`, { method: "DELETE" });
  },
  deletePost(id: string) {
    return request<{ success: boolean }>(`/posts/${id}`, { method: "DELETE" });
  },
  getMyProfile() {
    return request<AuthUser>("/users/me");
  },
  getUser(id: string) {
    return request<AuthUser>(`/users/${id}`);
  },
  updateProfile(payload: { bio?: string; avatarUrl?: string; city?: string }) {
    return request<AuthUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    return request<{ url: string }>("/upload/image", {
      method: "POST",
      body
    });
  }
};

