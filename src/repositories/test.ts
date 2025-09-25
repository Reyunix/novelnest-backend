import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Asegúrate de cargar las variables de entorno antes de cualquier cosa
dotenv.config({ path: './apps/backend/.env' });

const prisma = new PrismaClient();

export async function checkDbConnection() {
  try {
    const users = await prisma.user.findMany();
    console.log('Usuarios encontrados:', users);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}
