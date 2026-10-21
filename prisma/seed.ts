import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Khata Vani database with rich Kirana store data...');

  // Clean old data for clean demo state
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.settings.deleteMany();

  // Setup Shop Settings
  await prisma.settings.create({
    data: {
      shopName: 'श्री गणेश किराना स्टोर (Shree Ganesh Kirana)',
      language: 'hi',
      defaultUnits: 'kg,packet,piece,liter',
      backupPreferences: JSON.stringify({ autoBackup: true, frequency: 'daily' }),
    },
  });

  // Seed 15 diverse Kirana products
  const productsData = [
    {
      name: 'Fortune Sunlite Refined Oil 1L (फॉर्च्यून तेल)',
      category: 'Edible Oils',
      unit: 'liter',
      quantity: 4, // Below reorder threshold -> Triggers Reorder!
      reorderThreshold: 10,
      purchaseCost: 110.0,
      sellingPrice: 135.0,
      supplierId: 'Adani Wilmar Dist.',
    },
    {
      name: 'Aashirvaad Shudh Chakki Atta 5kg (आशीर्वाद आटा)',
      category: 'Staples',
      unit: 'packet',
      quantity: 6, // Low stock
      reorderThreshold: 8,
      purchaseCost: 205.0,
      sellingPrice: 245.0,
      supplierId: 'ITC Direct Supply',
    },
    {
      name: 'Daawat Rozana Basmati Rice 5kg (बासमती चावल)',
      category: 'Staples',
      unit: 'kg',
      quantity: 45,
      reorderThreshold: 15,
      purchaseCost: 65.0,
      sellingPrice: 85.0,
      supplierId: 'Punjab Grain Depot',
    },
    {
      name: 'Tata Salt Vacuum Evaporated 1kg (टाटा नमक)',
      category: 'Staples',
      unit: 'packet',
      quantity: 2, // Critical Low Stock -> Triggers urgent alert!
      reorderThreshold: 12,
      purchaseCost: 21.0,
      sellingPrice: 28.0,
      supplierId: 'Tata Consumer Wholesale',
    },
    {
      name: 'Parle-G Gold Biscuits 100g (पारले-जी बिस्किट)',
      category: 'Snacks & Biscuits',
      unit: 'packet',
      quantity: 80,
      reorderThreshold: 25,
      purchaseCost: 8.5,
      sellingPrice: 10.0,
      supplierId: 'Parle Agency',
    },
    {
      name: 'Maggi 2-Minute Masala Noodles 70g (मैगी नूडल्स)',
      category: 'Instant Food',
      unit: 'packet',
      quantity: 65,
      reorderThreshold: 20,
      purchaseCost: 11.5,
      sellingPrice: 14.0,
      supplierId: 'Nestle City Agency',
    },
    {
      name: 'Amul Pasteurised Butter 100g (अमूल मक्खन)',
      category: 'Dairy',
      unit: 'piece',
      quantity: 18,
      reorderThreshold: 8,
      purchaseCost: 48.0,
      sellingPrice: 56.0,
      supplierId: 'Amul Cold Chain',
    },
    {
      name: 'Taj Mahal Premium Tea 250g (ताज महल चाय)',
      category: 'Beverages',
      unit: 'packet',
      quantity: 14,
      reorderThreshold: 5,
      purchaseCost: 155.0,
      sellingPrice: 185.0,
      supplierId: 'HUL Depot',
    },
    {
      name: 'MDH Deggi Mirch Powder 100g (एमडीएच देगी मिर्च)',
      category: 'Spices',
      unit: 'packet',
      quantity: 22,
      reorderThreshold: 6,
      purchaseCost: 68.0,
      sellingPrice: 82.0,
      supplierId: 'MDH Spices Trader',
    },
    {
      name: 'Surf Excel Quick Wash Detergent 1kg (सर्फ एक्सेल)',
      category: 'Cleaning & Household',
      unit: 'packet',
      quantity: 3, // Low stock -> Reorder Alert!
      reorderThreshold: 7,
      purchaseCost: 128.0,
      sellingPrice: 155.0,
      supplierId: 'HUL Depot',
    },
    {
      name: 'Dettol Original Bathing Soap 75g (डेटॉल साबुन)',
      category: 'Personal Care',
      unit: 'piece',
      quantity: 35,
      reorderThreshold: 10,
      purchaseCost: 32.0,
      sellingPrice: 40.0,
      supplierId: 'Reckitt Distributor',
    },
    {
      name: 'Haldirams Nagpur Bhujia Sev 200g (भुजिया सेव)',
      category: 'Snacks & Biscuits',
      unit: 'packet',
      quantity: 28,
      reorderThreshold: 10,
      purchaseCost: 45.0,
      sellingPrice: 55.0,
      supplierId: 'Haldiram Direct',
    },
    {
      name: 'Sugar M-Grade Khandsari 1kg (सफेद चीनी)',
      category: 'Staples',
      unit: 'kg',
      quantity: 90,
      reorderThreshold: 20,
      purchaseCost: 38.0,
      sellingPrice: 46.0,
      supplierId: 'Mandi Sugar Mill',
    },
    {
      name: 'Colgate Strong Teeth Toothpaste 150g (कोलगेट)',
      category: 'Personal Care',
      unit: 'piece',
      quantity: 19,
      reorderThreshold: 6,
      purchaseCost: 78.0,
      sellingPrice: 95.0,
      supplierId: 'Colgate-Palmolive Agent',
    },
    {
      name: 'Cadbury Dairy Milk Silk Chocolate 60g (डेयरी मिल्क)',
      category: 'Snacks & Biscuits',
      unit: 'piece',
      quantity: 12,
      reorderThreshold: 8,
      purchaseCost: 72.0,
      sellingPrice: 85.0,
      supplierId: 'Mondelez India',
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const p = await prisma.product.create({ data: item });
    createdProducts.push(p);
  }

  console.log(`Created ${createdProducts.length} Kirana products.`);

  // Generate realistic historical sales and stock-ins across the last 5 days
  const now = new Date();
  const txs = [];

  for (let daysAgo = 5; daysAgo >= 0; daysAgo--) {
    const dayDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Initial stock in on day 5
    if (daysAgo === 5) {
      for (const p of createdProducts) {
        txs.push({
          productId: p.id,
          type: 'stock-in',
          quantity: Number(p.quantity) + 15,
          unitPrice: Number(p.purchaseCost || 50),
          note: 'शुरुआती थोक खरीद (Initial Wholesale Stock)',
          timestamp: new Date(dayDate.getTime() + 9 * 3600000),
        });
      }
    }

    // Daily customer sales
    const dailySales = [
      { prodIdx: 2, qty: 5, note: 'शर्मा जी (नकद बिक्री)' },
      { prodIdx: 4, qty: 10, note: 'संजू किराना (UPI PhonePe)' },
      { prodIdx: 5, qty: 6, note: 'दुकानदार काउंटर सेल (Cash)' },
      { prodIdx: 0, qty: 2, note: 'वर्मा जी (Paytm QR)' },
      { prodIdx: 1, qty: 3, note: 'गुप्ता जी आटा (उधार खाता)' },
      { prodIdx: 3, qty: 4, note: 'टाटा नमक 4 पैकेट' },
      { prodIdx: 7, qty: 2, note: 'चाय पत्ती (Cash)' },
      { prodIdx: 10, qty: 3, note: 'डेटॉल साबुन' },
      { prodIdx: 11, qty: 4, note: 'हल्दीराम भुजिया' },
    ];

    for (const s of dailySales) {
      const prod = createdProducts[s.prodIdx];
      if (prod) {
        txs.push({
          productId: prod.id,
          type: 'sale',
          quantity: s.qty,
          unitPrice: Number(prod.sellingPrice || 50),
          note: s.note,
          timestamp: new Date(dayDate.getTime() + (10 + (Math.random() * 8)) * 3600000),
        });
      }
    }
  }

  for (const t of txs) {
    await prisma.transaction.create({ data: t });
  }

  console.log(`Created ${txs.length} realistic transactions.`);
  console.log('Khata Vani seed data ready for judge demo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
