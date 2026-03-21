import { CrowdLevel, NoiseLevel, PlaceType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const praguePlaces = [
  {
    name: "Miners Coffee JZP",
    slug: "miners-coffee-jzp",
    type: PlaceType.cafe,
    description: "Specialty coffee spot with a polished brunch crowd near Jiriho z Podebrad.",
    city: "Prague",
    address: "Namesti Jiriho z Podebrad, Prague 3",
    latitude: 50.0785,
    longitude: 14.4516,
    verified: true,
    coverImageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
  },
  {
    name: "Manifesto Market Andel",
    slug: "manifesto-market-andel",
    type: PlaceType.lounge,
    description: "Open-air food and culture hub with a social crowd and shifting energy throughout the day.",
    city: "Prague",
    address: "Ostrovského 34, Prague 5",
    latitude: 50.0713,
    longitude: 14.4037,
    verified: true,
    coverImageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b"
  },
  {
    name: "Scott.Weber Workspace",
    slug: "scott-weber-workspace",
    type: PlaceType.coworking,
    description: "Premium coworking with quiet corners, phone booths, and an ambitious city-tech crowd.",
    city: "Prague",
    address: "Rohanske nabrezi 678/23, Prague 8",
    latitude: 50.0935,
    longitude: 14.4512,
    verified: true,
    coverImageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72"
  },
  {
    name: "Anonymous Bar",
    slug: "anonymous-bar",
    type: PlaceType.bar,
    description: "Cryptic cocktail bar with theatrical drinks and intimate late-night energy.",
    city: "Prague",
    address: "Michalska 12, Prague 1",
    latitude: 50.0852,
    longitude: 14.4206,
    verified: true,
    coverImageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b"
  },
  {
    name: "Duplex Prague",
    slug: "duplex-prague",
    type: PlaceType.nightlife,
    description: "Rooftop nightlife venue with DJs, bottle service, and a high-energy weekend crowd.",
    city: "Prague",
    address: "Vaclavske namesti 21, Prague 1",
    latitude: 50.0818,
    longitude: 14.4252,
    verified: true,
    coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
  }
];

async function main() {
  for (const place of praguePlaces) {
    await prisma.place.upsert({
      where: { slug: place.slug },
      create: place,
      update: place
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@vybe.city" },
    create: {
      email: "demo@vybe.city",
      username: "vybe_prague",
      passwordHash: "$2b$10$19ICA90Z6XdtS/cgZbkt0.wt6rkCLTDxoumkf4nAFQxtemtcGj8Yu",
      city: "Prague",
      bio: "Live city signals, tested in Prague.",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      trustScore: 88
    },
    update: {}
  });

  const places = await prisma.place.findMany({ take: 3 });

  const demoPosts = [
    {
      placeId: places[0]?.id,
      text: "Terrace tables are filling up, but there is still room for a laptop setup by the window.",
      vibe: 8,
      crowdLevel: CrowdLevel.medium,
      noiseLevel: NoiseLevel.social,
      waitTimeMin: 4,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 3)
    },
    {
      placeId: places[1]?.id,
      text: "The food hall is already buzzing and the outside seating feels perfect for sunset drinks.",
      vibe: 9,
      crowdLevel: CrowdLevel.high,
      noiseLevel: NoiseLevel.loud,
      waitTimeMin: 12,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 5)
    },
    {
      placeId: places[2]?.id,
      text: "Quiet enough for calls right now. Phone booths are free and coffee queue is basically zero.",
      vibe: 7,
      crowdLevel: CrowdLevel.low,
      noiseLevel: NoiseLevel.quiet,
      waitTimeMin: 0,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6)
    }
  ].filter((post) => post.placeId);

  for (const post of demoPosts) {
    await prisma.post.create({
      data: {
        ...post,
        userId: demoUser.id,
        isActive: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
