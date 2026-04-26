const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const products = [
    { name: 'Laptop Pro 14', price: 1599.99, available: true },
    { name: 'Mechanical Keyboard', price: 129.5, available: true },
    { name: 'Wireless Mouse', price: 59.9, available: true },
    { name: '4K Monitor', price: 399.0, available: true },
    { name: 'USB-C Hub', price: 49.99, available: false },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        price: product.price,
        available: product.available,
      },
      create: product,
    });
  }

  const count = await prisma.product.count();
  console.log(`Seed completed: ${count} products in database.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
