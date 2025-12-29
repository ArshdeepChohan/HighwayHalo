const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log('👤 Users already exist, skipping user seed');
    return;
  }

  console.log('👤 Seeding dummy users...');

  const users = [
    {
      username: 'aakash',
      email: 'aakash@test.com',
      phone: '9999999999',
      password: await bcrypt.hash('password123', 10),
      vehicleType: 'Car'
    },
    {
      username: 'anamika',
      email: 'anamika@test.com',
      phone: '8888888888',
      password: await bcrypt.hash('password123', 10),
      vehicleType: 'Bike'
    },
  ];

  await User.insertMany(users);
  console.log('✅ Dummy users seeded successfully');
};

module.exports = seedUsers;
