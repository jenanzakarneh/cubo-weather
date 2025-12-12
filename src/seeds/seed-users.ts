import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import dataSource from 'src/data-source';

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(User);

  const count = await repo.count();
  if (count > 0) {
    console.log('Users already exist, skipping seeding.');
    await dataSource.destroy();
    return;
  }

  const saltRounds = 10;

  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const userPassword = await bcrypt.hash('User@123', saltRounds);

  const admin = repo.create({
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    name: 'Admin User',
  });

  const user = repo.create({
    email: 'user@example.com',
    password: userPassword,
    role: 'user',
    name: 'Normal User',
  });

  await repo.save([admin, user]);

  console.log('Seeded users:');
  console.log('  admin@example.com / Admin@123');
  console.log('  user@example.com / User@123');

  await dataSource.destroy();
}

seed()
  .then(() => {
    console.log('Seeding done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding error', err);
    process.exit(1);
  });
