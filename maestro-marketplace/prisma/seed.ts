import { PrismaClient, ProductStatus, PromotionType, SellerStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.sellerPayoutAccount.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Maestro123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@maestro.local",
      passwordHash,
      firstName: "Olivia",
      lastName: "Stone",
      role: UserRole.ADMIN
    }
  });

  const sellerUserOne = await prisma.user.create({
    data: {
      email: "founder@verdestudio.com",
      passwordHash,
      firstName: "Lena",
      lastName: "Brooks",
      role: UserRole.SELLER
    }
  });

  const sellerUserTwo = await prisma.user.create({
    data: {
      email: "owner@ateliernorth.com",
      passwordHash,
      firstName: "Marcus",
      lastName: "Lane",
      role: UserRole.SELLER
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@maestro.local",
      passwordHash,
      firstName: "James",
      lastName: "Reed",
      role: UserRole.CUSTOMER
    }
  });

  const sellerOne = await prisma.sellerProfile.create({
    data: {
      userId: sellerUserOne.id,
      slug: "verde-studio",
      storeName: "Verde Studio",
      legalName: "Verde Studio LLC",
      supportEmail: "support@verdestudio.com",
      description: "Sustainable home and wellness products with premium finishing.",
      status: SellerStatus.ACTIVE,
      payoutsEnabled: true,
      detailsSubmitted: true,
      onboardingCompletedAt: new Date(),
      approvedAt: new Date()
    }
  });

  const sellerTwo = await prisma.sellerProfile.create({
    data: {
      userId: sellerUserTwo.id,
      slug: "atelier-north",
      storeName: "Atelier North",
      legalName: "Atelier North GmbH",
      supportEmail: "hello@ateliernorth.com",
      description: "Curated design objects and elevated everyday essentials.",
      status: SellerStatus.ACTIVE,
      payoutsEnabled: true,
      detailsSubmitted: true,
      onboardingCompletedAt: new Date(),
      approvedAt: new Date()
    }
  });

  const home = await prisma.category.create({
    data: {
      name: "Home",
      slug: "home",
      description: "Elevated home goods for modern spaces.",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    }
  });

  const wellness = await prisma.category.create({
    data: {
      name: "Wellness",
      slug: "wellness",
      description: "Wellness products crafted for daily rituals.",
      imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15"
    }
  });

  const decor = await prisma.category.create({
    data: {
      name: "Decor",
      slug: "decor",
      description: "High-trust design accents with premium materials.",
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f"
    }
  });

  const candle = await prisma.product.create({
    data: {
      sellerId: sellerOne.id,
      categoryId: wellness.id,
      title: "Botanical Balance Candle",
      slug: "botanical-balance-candle",
      shortDescription: "Hand-poured soy candle with a fresh cedar-lime profile.",
      description: "A premium hand-poured soy candle designed for calm evening rituals. The scent opens with bright lime and settles into cedar, green tea, and soft amber.",
      sku: "VERDE-CANDLE-001",
      basePrice: 36,
      compareAtPrice: 44,
      currency: "USD",
      status: ProductStatus.ACTIVE,
      featured: true,
      publishedAt: new Date(),
      searchKeywords: ["candle", "wellness", "soy", "botanical", "cedar"],
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1603006905393-c5b2c3f4a6db",
            alt: "Botanical candle",
            position: 0,
            isPrimary: true
          }
        ]
      },
      variants: {
        create: [
          {
            name: "Single",
            sku: "VERDE-CANDLE-001-S",
            price: 36,
            stock: 48,
            reservedStock: 2,
            isDefault: true,
            attributes: { size: "220g" }
          }
        ]
      }
    }
  });

  const diffuser = await prisma.product.create({
    data: {
      sellerId: sellerOne.id,
      categoryId: home.id,
      title: "Green Glass Diffuser",
      slug: "green-glass-diffuser",
      shortDescription: "Minimal diffuser with smoky green glass and clean scent oil.",
      description: "A designer diffuser set built for living rooms, reception areas, and boutique retail spaces. Includes premium reeds and a balanced evergreen fragrance.",
      sku: "VERDE-DIFFUSER-002",
      basePrice: 58,
      compareAtPrice: 69,
      currency: "USD",
      status: ProductStatus.ACTIVE,
      featured: true,
      publishedAt: new Date(),
      searchKeywords: ["diffuser", "glass", "home", "fragrance"],
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1602872030219-ad2b9a54315b",
            alt: "Glass diffuser",
            position: 0,
            isPrimary: true
          }
        ]
      },
      variants: {
        create: [
          {
            name: "Standard",
            sku: "VERDE-DIFFUSER-002-S",
            price: 58,
            stock: 26,
            reservedStock: 1,
            isDefault: true,
            attributes: { volume: "250ml" }
          }
        ]
      }
    }
  });

  const vase = await prisma.product.create({
    data: {
      sellerId: sellerTwo.id,
      categoryId: decor.id,
      title: "Stone Form Vase",
      slug: "stone-form-vase",
      shortDescription: "Architectural ceramic vase with matte stone finish.",
      description: "A sculptural vase designed for premium interiors. The silhouette is bold, the finish is muted, and the proportions are balanced for both shelf styling and table placement.",
      sku: "ATN-VASE-101",
      basePrice: 92,
      compareAtPrice: 118,
      currency: "USD",
      status: ProductStatus.ACTIVE,
      featured: true,
      publishedAt: new Date(),
      searchKeywords: ["vase", "ceramic", "decor", "minimal"],
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1616627459831-24c3cc4897d8",
            alt: "Ceramic vase",
            position: 0,
            isPrimary: true
          }
        ]
      },
      variants: {
        create: [
          {
            name: "Small",
            sku: "ATN-VASE-101-S",
            price: 92,
            stock: 12,
            isDefault: true,
            attributes: { size: "Small" }
          },
          {
            name: "Large",
            sku: "ATN-VASE-101-L",
            price: 118,
            stock: 7,
            attributes: { size: "Large" }
          }
        ]
      }
    }
  });

  const throwProduct = await prisma.product.create({
    data: {
      sellerId: sellerTwo.id,
      categoryId: home.id,
      title: "Merino Soft Throw",
      slug: "merino-soft-throw",
      shortDescription: "Premium merino blend throw with elegant drape.",
      description: "Designed for boutique interiors and elevated home environments, this merino blend throw offers softness, warmth, and a premium retail presentation.",
      sku: "ATN-THROW-102",
      basePrice: 124,
      currency: "USD",
      status: ProductStatus.ACTIVE,
      featured: false,
      publishedAt: new Date(),
      searchKeywords: ["throw", "merino", "textile", "home"],
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41",
            alt: "Premium throw blanket",
            position: 0,
            isPrimary: true
          }
        ]
      },
      variants: {
        create: [
          {
            name: "Forest",
            sku: "ATN-THROW-102-F",
            price: 124,
            stock: 16,
            isDefault: true,
            attributes: { color: "Forest" }
          },
          {
            name: "Sand",
            sku: "ATN-THROW-102-S",
            price: 124,
            stock: 9,
            attributes: { color: "Sand" }
          }
        ]
      }
    }
  });

  await prisma.review.createMany({
    data: [
      {
        productId: candle.id,
        userId: customer.id,
        rating: 5,
        title: "Premium quality",
        body: "Looks premium, burns clean, and the scent feels refined."
      },
      {
        productId: diffuser.id,
        userId: admin.id,
        rating: 4,
        title: "Strong packaging",
        body: "Well packed and visually premium. Great fit for gifting."
      }
    ]
  });

  await prisma.product.update({
    where: { id: candle.id },
    data: { averageRating: 5, reviewCount: 1 }
  });

  await prisma.product.update({
    where: { id: diffuser.id },
    data: { averageRating: 4, reviewCount: 1 }
  });

  await prisma.promotion.create({
    data: {
      title: "Spring Interior Refresh",
      slug: "spring-interior-refresh",
      description: "Save 15% on selected home products this week.",
      type: PromotionType.PERCENTAGE,
      percentageOff: 15,
      startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      products: {
        connect: [{ id: diffuser.id }, { id: throwProduct.id }]
      }
    }
  });

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      label: "Welcome 10% Off",
      description: "Applies a first-order discount across the marketplace.",
      scope: "PLATFORM",
      percentageOff: 10,
      minimumOrderValue: 50,
      isActive: true
    }
  });

  const shippingAddress = {
    fullName: "James Reed",
    line1: "14 Green Street",
    city: "Chicago",
    state: "IL",
    postalCode: "60601",
    country: "US",
    phone: "+1 555 000 1111"
  };

  const candleVariant = await prisma.productVariant.findFirstOrThrow({ where: { sku: "VERDE-CANDLE-001-S" } });
  const diffuserVariant = await prisma.productVariant.findFirstOrThrow({ where: { sku: "VERDE-DIFFUSER-002-S" } });

  const order = await prisma.order.create({
    data: {
      orderNumber: "MAE-10001",
      userId: customer.id,
      sellerId: sellerOne.id,
      status: "PAID",
      paymentStatus: "PAID",
      subtotal: 94,
      discountTotal: 9.4,
      shippingTotal: 8,
      taxTotal: 7.12,
      total: 99.72,
      currency: "USD",
      couponCode: "WELCOME10",
      shippingAddress,
      billingAddress: shippingAddress,
      paidAt: new Date(),
      items: {
        create: [
          {
            productId: candle.id,
            variantId: candleVariant.id,
            quantity: 1,
            titleSnapshot: "Botanical Balance Candle",
            skuSnapshot: "VERDE-CANDLE-001-S",
            unitPrice: 36,
            totalPrice: 36
          },
          {
            productId: diffuser.id,
            variantId: diffuserVariant.id,
            quantity: 1,
            titleSnapshot: "Green Glass Diffuser",
            skuSnapshot: "VERDE-DIFFUSER-002-S",
            unitPrice: 58,
            totalPrice: 58
          }
        ]
      }
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: "ORDER",
        title: "Order paid successfully",
        body: `Your order ${order.orderNumber} has been paid and is now being prepared.`
      },
      {
        userId: sellerUserOne.id,
        type: "ORDER",
        title: "New order received",
        body: `You received a new order: ${order.orderNumber}.`
      },
      {
        userId: sellerUserTwo.id,
        type: "SYSTEM",
        title: "Promotion available",
        body: "Create a seasonal promotion to increase conversion in your catalog."
      }
    ]
  });

  await prisma.sellerPayoutAccount.create({
    data: {
      sellerId: sellerOne.id,
      externalAccountLast4: "4242",
      payoutsEnabled: true,
      detailsSubmitted: true
    }
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
