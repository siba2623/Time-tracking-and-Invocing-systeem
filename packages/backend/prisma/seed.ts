import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'administrator',
    },
  });

  // Create employee users
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      passwordHash: employeePassword,
      name: 'John Smith',
      role: 'employee',
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      passwordHash: employeePassword,
      name: 'Jane Doe',
      role: 'employee',
    },
  });

  // Create clients
  const client1 = await prisma.client.upsert({
    where: { id: 'client-acme' },
    update: {},
    create: {
      id: 'client-acme',
      name: 'Acme Corporation',
      contactEmail: 'contact@acme.com',
      contactPhone: '555-0100',
      address: '123 Business Ave, Suite 100',
      active: true,
    },
  });


  const client2 = await prisma.client.upsert({
    where: { id: 'client-techstart' },
    update: {},
    create: {
      id: 'client-techstart',
      name: 'TechStart Inc',
      contactEmail: 'info@techstart.com',
      contactPhone: '555-0200',
      address: '456 Innovation Blvd',
      active: true,
    },
  });

  // Create services
  const consulting = await prisma.service.upsert({
    where: { id: 'service-consulting' },
    update: {},
    create: {
      id: 'service-consulting',
      name: 'Consulting',
      description: 'General consulting services',
      active: true,
    },
  });

  const development = await prisma.service.upsert({
    where: { id: 'service-development' },
    update: {},
    create: {
      id: 'service-development',
      name: 'Software Development',
      description: 'Custom software development',
      active: true,
    },
  });

  const training = await prisma.service.upsert({
    where: { id: 'service-training' },
    update: {},
    create: {
      id: 'service-training',
      name: 'Training',
      description: 'Technical training and workshops',
      active: true,
    },
  });

  // Create default rates
  await prisma.rate.upsert({
    where: { serviceId_employeeId: { serviceId: consulting.id, employeeId: null } },
    update: {},
    create: {
      serviceId: consulting.id,
      employeeId: null,
      hourlyRate: 150,
    },
  });

  await prisma.rate.upsert({
    where: { serviceId_employeeId: { serviceId: development.id, employeeId: null } },
    update: {},
    create: {
      serviceId: development.id,
      employeeId: null,
      hourlyRate: 175,
    },
  });

  await prisma.rate.upsert({
    where: { serviceId_employeeId: { serviceId: training.id, employeeId: null } },
    update: {},
    create: {
      serviceId: training.id,
      employeeId: null,
      hourlyRate: 125,
    },
  });

  // Create employee allocations
  await prisma.employeeAllocation.upsert({
    where: { employeeId: employee1.id },
    update: {},
    create: {
      employeeId: employee1.id,
      percentage: 15,
    },
  });

  await prisma.employeeAllocation.upsert({
    where: { employeeId: employee2.id },
    update: {},
    create: {
      employeeId: employee2.id,
      percentage: 20,
    },
  });

  // Create billing rules
  await prisma.billingRule.upsert({
    where: { id: 'rule-travel' },
    update: {},
    create: {
      id: 'rule-travel',
      name: 'Travel Expenses',
      type: 'travel',
      defaultAmount: 50,
      description: 'Standard travel expense allowance',
      active: true,
    },
  });

  console.log('Seeding completed!');
  console.log({ admin, employee1, employee2, client1, client2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
