const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Actualizar usuario #26 con presupuesto de 31.5M
  const updated = await prisma.user.update({
    where: { id: 26 },
    data: {
      budgetRange: {
        min: 0,
        max: 31500000,
      },
    },
    select: { id: true, email: true, budgetRange: true },
  });

  console.log('✅ Usuario actualizado:', updated);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
