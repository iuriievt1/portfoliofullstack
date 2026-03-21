import Image from "next/image";

export function ProductGallery({
  images,
  title
}: {
  images: Array<{ url: string; alt: string | null }>;
  title: string;
}) {
  const primary = images[0];

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary">
        {primary ? <Image src={primary.url} alt={primary.alt ?? title} fill className="object-cover" /> : null}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-4">
          {images.slice(1, 5).map((image) => (
            <div key={image.url} className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
              <Image src={image.url} alt={image.alt ?? title} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
