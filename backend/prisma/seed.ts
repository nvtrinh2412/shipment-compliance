import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed ISO Countries
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CN', name: 'China' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'JP', name: 'Japan' },
  ];
  for (const c of countries) {
    await prisma.isoCountry.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // Seed ISO Currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'JPY', name: 'Japanese Yen' },
  ];
  for (const c of currencies) {
    await prisma.isoCurrency.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
