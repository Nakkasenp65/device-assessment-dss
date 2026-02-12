import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database (Thai Version)...');

  // 1. Create Admin User
  const adminEmail = 'admin@dss.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        role: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Create Condition Categories (Thai)
  const physicalCat = await prisma.conditionCategory.upsert({
    where: { slug: 'physical' },
    update: { name: 'สภาพตัวเครื่อง' },
    create: { slug: 'physical', name: 'สภาพตัวเครื่อง' },
  });

  const functionalCat = await prisma.conditionCategory.upsert({
    where: { slug: 'functional' },
    update: { name: 'การใช้งาน' },
    create: { slug: 'functional', name: 'การใช้งาน' },
  });
  console.log('Categories created.');

  // 3. Create Answer Groups
  const yesNoGroup = await prisma.answerGroup.upsert({
    where: { name: 'ใช่/ไม่ใช่' },
    update: {},
    create: { name: 'ใช่/ไม่ใช่' },
  });

  const gradeGroup = await prisma.answerGroup.upsert({
    where: { name: 'เกรดสภาพ' },
    update: {},
    create: { name: 'เกรดสภาพ' },
  });

  // NEW: Battery Group
  const batteryGroup = await prisma.answerGroup.upsert({
    where: { name: 'ระดับแบตเตอรี่' },
    update: {},
    create: { name: 'ระดับแบตเตอรี่' },
  });

  console.log('Answer Groups created.');

  // 4. Create Brands & Models (Keep English names as they are standard)
  const brands = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OPPO', 'Vivo', 'OnePlus', 'Honor'];
  const brandRecords: Record<string, number> = {};

  for (const name of brands) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    brandRecords[name] = brand.id;
  }

  // Standard models list (same as before)
  const models = [
    // Apple
    { name: 'iPhone 13', brand: 'Apple', year: 2021 },
    { name: 'iPhone 13 Pro', brand: 'Apple', year: 2021 },
    { name: 'iPhone 13 Pro Max', brand: 'Apple', year: 2021 },
    { name: 'iPhone 14', brand: 'Apple', year: 2022 },
    { name: 'iPhone 14 Plus', brand: 'Apple', year: 2022 },
    { name: 'iPhone 14 Pro', brand: 'Apple', year: 2022 },
    { name: 'iPhone 14 Pro Max', brand: 'Apple', year: 2022 },
    { name: 'iPhone 15', brand: 'Apple', year: 2023 },
    { name: 'iPhone 15 Plus', brand: 'Apple', year: 2023 },
    { name: 'iPhone 15 Pro', brand: 'Apple', year: 2023 },
    { name: 'iPhone 15 Pro Max', brand: 'Apple', year: 2023 },
    // Samsung
    { name: 'Galaxy S22', brand: 'Samsung', year: 2022 },
    { name: 'Galaxy S22+', brand: 'Samsung', year: 2022 },
    { name: 'Galaxy S22 Ultra', brand: 'Samsung', year: 2022 },
    { name: 'Galaxy S23', brand: 'Samsung', year: 2023 },
    { name: 'Galaxy S23+', brand: 'Samsung', year: 2023 },
    { name: 'Galaxy S23 Ultra', brand: 'Samsung', year: 2023 },
    { name: 'Galaxy S24', brand: 'Samsung', year: 2024 },
    { name: 'Galaxy S24+', brand: 'Samsung', year: 2024 },
    { name: 'Galaxy S24 Ultra', brand: 'Samsung', year: 2024 },
    // Xiaomi
    { name: 'Xiaomi 13', brand: 'Xiaomi', year: 2022 },
    { name: 'Xiaomi 13 Pro', brand: 'Xiaomi', year: 2022 },
    { name: 'Xiaomi 14', brand: 'Xiaomi', year: 2023 },
    { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', year: 2024 },
    // OPPO
    { name: 'Find X5 Pro', brand: 'OPPO', year: 2022 },
    { name: 'Find X6 Pro', brand: 'OPPO', year: 2023 },
    { name: 'Find X7 Ultra', brand: 'OPPO', year: 2024 },
  ];

  await prisma.model.createMany({
    data: models.map((m) => ({
      name: m.name,
      brand_id: brandRecords[m.brand]!,
      release_year: m.year,
    })),
    skipDuplicates: true,
  });

  // 5. Create Answer Options

  // Grading Options (Thai)
  const gradeOptions = [
    { label: 'สภาพสมบูรณ์ / ไม่มีรอย', score: 0.0 },
    { label: 'มีรอยเล็กน้อย', score: 0.2 },
    { label: 'มีรอยชัดเจน', score: 0.5 },
    { label: 'แตกหัก / เสียหาย', score: 1.0 },
  ];

  const existingGradeOptions = await prisma.answerOption.findFirst({
    where: { group_id: gradeGroup.id },
  });
  if (!existingGradeOptions) {
    await prisma.answerOption.createMany({
      data: gradeOptions.map((g, i) => ({
        group_id: gradeGroup.id,
        label: g.label,
        default_ratio: g.score,
        order_index: i,
      })),
    });
  }

  // Yes/No Options (Thai)
  const yesNoOptions = [
    { label: 'ปกติ / ใช้งานได้', score: 0.0 },
    { label: 'เสีย / ใช้งานไม่ได้', score: 1.0 },
  ];

  const existingYesNoOptions = await prisma.answerOption.findFirst({
    where: { group_id: yesNoGroup.id },
  });
  if (!existingYesNoOptions) {
    await prisma.answerOption.createMany({
      data: yesNoOptions.map((g, i) => ({
        group_id: yesNoGroup.id,
        label: g.label,
        default_ratio: g.score,
        order_index: i,
      })),
    });
  }

  // Battery Options (Specific Request)
  const batteryOptions = [
    { label: 'มากกว่า 95%', score: 0.0 }, // Excellent
    { label: '90% - 95%', score: 0.1 }, // Good
    { label: '85% - 90%', score: 0.3 }, // Fair
    { label: 'ต่ำกว่า 85%', score: 1.0 }, // Poor / Replace
  ];

  const existingBatteryOptions = await prisma.answerOption.findFirst({
    where: { group_id: batteryGroup.id },
  });
  if (!existingBatteryOptions) {
    await prisma.answerOption.createMany({
      data: batteryOptions.map((g, i) => ({
        group_id: batteryGroup.id,
        label: g.label,
        default_ratio: g.score,
        order_index: i,
      })),
    });
  }

  // 6. Create Conditions (Thai)

  // Impact Weight Tiers: 1=Low, 3=Medium, 5=High, 10=Critical
  const physicalConditions = [
    { name: 'สภาพหน้าจอ', type: 'choice', group: gradeGroup.id, weight: 10, icon: 'smartphone' }, // Critical
    { name: 'รอยรอบตัวเครื่อง', type: 'choice', group: gradeGroup.id, weight: 5, icon: 'box' }, // High
    { name: 'สภาพกระจกหลัง', type: 'choice', group: gradeGroup.id, weight: 3, icon: 'smartphone' }, // Medium
    { name: 'เลนส์กล้องหลัง', type: 'choice', group: gradeGroup.id, weight: 5, icon: 'camera' }, // High
    {
      name: 'ปุ่มกด (Power/Volume)',
      type: 'choice',
      group: yesNoGroup.id,
      weight: 3,
      icon: 'power',
    }, // Medium
    { name: 'พอร์ตชาร์จ', type: 'choice', group: yesNoGroup.id, weight: 3, icon: 'plug' }, // Medium
    { name: 'ถาดใส่ซิม', type: 'choice', group: yesNoGroup.id, weight: 1, icon: 'cardsim' }, // Low
  ];

  const functionalConditions = [
    {
      name: 'ระบบสัมผัสหน้าจอ',
      type: 'choice',
      group: yesNoGroup.id,
      weight: 10,
      icon: 'fingerprint',
    }, // Critical
    { name: 'กล้องหน้า', type: 'choice', group: yesNoGroup.id, weight: 5, icon: 'camera' }, // High
    { name: 'กล้องหลัง', type: 'choice', group: yesNoGroup.id, weight: 5, icon: 'camera' }, // High
    {
      name: 'สุขภาพแบตเตอรี่',
      type: 'choice',
      group: batteryGroup.id,
      weight: 10,
      icon: 'battery-charging',
    }, // Critical
    {
      name: 'ระบบสแกน (Face/Touch ID)',
      type: 'choice',
      group: yesNoGroup.id,
      weight: 5,
      icon: 'fingerprint',
    }, // High
    { name: 'การเชื่อมต่อ Wi-Fi', type: 'choice', group: yesNoGroup.id, weight: 3, icon: 'wifi' }, // Medium
    {
      name: 'การเชื่อมต่อ Bluetooth',
      type: 'choice',
      group: yesNoGroup.id,
      weight: 1,
      icon: 'bluetooth',
    }, // Low
    { name: 'ลำโพง', type: 'choice', group: yesNoGroup.id, weight: 3, icon: 'volume-2' }, // Medium
    { name: 'ไมโครโฟน', type: 'choice', group: yesNoGroup.id, weight: 3, icon: 'mic' }, // Medium
  ];

  // Helper to create conditions
  const seedConditions = async (list: any[], catId: number) => {
    for (const c of list) {
      // Try to find by name to avoid dupes if re-run on same thai db
      const exists = await prisma.condition.findFirst({
        where: { name: c.name, category_id: catId },
      });

      if (!exists) {
        await prisma.condition.create({
          data: {
            name: c.name,
            category_id: catId,
            answer_group_id: c.group,
            answer_type: c.type,
            impact_weight: c.weight,
            icon: c.icon,
          },
        });
      }
    }
  };

  await seedConditions(physicalConditions, physicalCat.id);
  await seedConditions(functionalConditions, functionalCat.id);

  console.log('Conditions created.');

  // 7. Create Decision Paths (Thai)
  const decisionPaths = [
    {
      name: 'แลกเปลี่ยน (Trade-In)',
      description_template: 'มูลค่าการแลกเปลี่ยนสำหรับ {brand} {model}',
      weight_physical: 0.4,
      weight_functional: 0.4,
      weight_age: 0.2,
      icon: 'store', // or arrow-right-left
    },
    {
      name: 'ขายมือสอง',
      description_template: 'ราคาตลาดมือสองสำหรับ {brand} {model}',
      weight_physical: 0.35,
      weight_functional: 0.35,
      weight_age: 0.3,
      icon: 'banknote',
    },
    {
      name: 'รีไซเคิล / ขายซาก',
      description_template: 'มูลค่าการนำไปรีไซเคิลของ {brand} {model}',
      weight_physical: 0.25,
      weight_functional: 0.5,
      weight_age: 0.25,
      icon: 'recycle',
    },
  ];

  for (const dp of decisionPaths) {
    const existing = await prisma.decisionPath.findFirst({
      where: { name: dp.name },
    });
    if (!existing) {
      await prisma.decisionPath.create({ data: dp });
    }
  }
  console.log('Decision Paths created.');

  console.log(
    'Seeding completed. Please run "prisma migrate reset" to apply changes cleanly if changing from English.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
