import prisma from './src/config/database.js';

async function main() {
  try {
    const group = await prisma.group.findUnique({
      where: { id: 27 },
      include: {
        memberships: {
          include: {
            user: true
          }
        }
      }
    });
    console.log("DATABASE GROUP 27:", JSON.stringify(group, null, 2));
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
