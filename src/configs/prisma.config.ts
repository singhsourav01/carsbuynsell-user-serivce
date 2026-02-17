import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
  errorFormat: "pretty",
 
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
