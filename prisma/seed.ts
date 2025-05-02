import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      isAdmin: true,
    },
  });
  console.log('Admin user created:', admin.username);

  // Create sample clients
  const client1Password = await hash('password123', 10);
  const client1 = await prisma.client.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      name: 'Sample Client',
      email: 'client1@example.com',
      phone: '123-456-7890',
      password: client1Password,
    },
  });
  console.log('Sample client created:', client1.name);

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { reference: 'PROD001' },
    update: {},
    create: {
      name: 'Premium Shirt',
      description: 'High quality cotton shirt with elegant design',
      price: 29.99,
      reference: 'PROD001',
      stockQuantity: 100,
      inStock: true,
      category: 'Clothing',
    },
  });

  const product2 = await prisma.product.upsert({
    where: { reference: 'PROD002' },
    update: {},
    create: {
      name: 'Designer Jeans',
      description: 'Stylish jeans for everyday wear',
      price: 49.99,
      reference: 'PROD002',
      stockQuantity: 75,
      inStock: true,
      category: 'Clothing',
    },
  });

  const product3 = await prisma.product.upsert({
    where: { reference: 'PROD003' },
    update: {},
    create: {
      name: 'Luxury Watch',
      description: 'Elegant timepiece with premium materials',
      price: 199.99,
      reference: 'PROD003',
      stockQuantity: 25,
      inStock: true,
      category: 'Accessories',
    },
  });

  console.log('Sample products created');

  // Create sample live session
  const liveSession = await prisma.liveSession.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Summer Collection Showcase',
      description: 'Introducing our latest summer fashion collection',
      scheduledAt: new Date(),
      isActive: true,
      platform: 'WhatsApp',
      platformUrl: 'https://whatsapp.com/group/summer-collection',
    },
  });
  console.log('Sample live session created:', liveSession.title);

  // Create sample order
  const sampleOrder = await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: client1.id,
      liveSessionId: liveSession.id,
      status: 'PENDING',
      totalAmount: 79.98,
      shippingCost: 5.99,
      taxAmount: 8.50,
      notes: 'Please deliver in the afternoon',
      shippingMethod: 'Standard Shipping',
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
      },
    },
  });
  console.log('Sample order created');

  // Add items to the sample order
  await prisma.orderItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderId: sampleOrder.id,
      productId: product1.id,
      quantity: 1,
      price: product1.price,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      orderId: sampleOrder.id,
      productId: product2.id,
      quantity: 1,
      price: product2.price,
    },
  });

  console.log('Sample order items created');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });