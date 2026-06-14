import groupService from './src/services/group.service.js';
import prisma from './src/config/database.js';

async function main() {
  try {
    const details = await groupService.getGroupDetails(27);
    console.log("DETAILS RETURNED FROM SERVICE:", JSON.stringify(details, null, 2));
  } catch (err) {
    console.error("Service error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
