import { redirect } from "next/navigation";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q : "";
  redirect(`/products?q=${encodeURIComponent(q)}`);
}
