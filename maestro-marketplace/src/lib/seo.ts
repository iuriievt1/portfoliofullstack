import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export function createMetadata({
  title,
  description,
  path = "/"
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title: `${title} | ${APP_NAME}`,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url: absoluteUrl(path),
      siteName: APP_NAME,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description
    }
  };
}
