import { PrismaClient } from '../../generated/prisma';
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') {
    globalThis.prisma = prisma;
}
export default prisma;
