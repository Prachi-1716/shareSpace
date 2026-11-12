

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./User');
const Item = require('./Items');

// Plain-text sample password, stored as-is (no hashing for now).
const TEST_PASSWORD = 'Test@1234';

async function query() {

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // 1. Drop the whole collections (documents AND indexes).
  for (const Model of [Item, User]) {
    try {
      await Model.collection.drop();
      console.log(`Dropped collection "${Model.collection.name}"`);
    } catch (err) {
      if (err.codeName !== 'NamespaceNotFound') throw err;
      console.log(`Collection "${Model.collection.name}" did not exist, skipping`);
    }
    // dropping also removes the indexes, so recreate the ones in the schema
    await Model.createCollection();
    await Model.syncIndexes();
  }

  // 2. Create 2 users with the plain sample password (no hashing for now)
  const password = TEST_PASSWORD;

  // const [aarav, neha] = await User.create([
  //   {
  //     name: 'Aarav Sharma',
  //     email: 'aarav@example.com',
  //     password,
  //     contactNo: '9000000001', // dummy number
  //     city: 'Pune',
  //     bio: 'Loves DIY projects and happy to lend out tools.',
  //   },
  //   {
  //     name: 'Neha Patil',
  //     email: 'neha@example.com',
  //     password,
  //     contactNo: '9000000002', // dummy number
  //     city: 'Pune',
  //     bio: 'Home cook. Borrower and lender.',
  //   },
  // ]);
  // console.log('Created users:');
  // [aarav, neha].forEach((u) =>
  //   console.log(`  ${u.name} <${u.email}> id=${u._id} photo=${u.profilePhoto}`)
  // );

  // // 3. Create 2 listings, one per user (lender = that user's _id).
  // const items = await Item.create([
  //   {
  //     title: 'Bosch Power Drill',
  //     description:
  //       'Corded 500W drill with a set of 10 drill bits. Good for walls, wood and metal.',
  //     images: ['https://placehold.co/600x400?text=Power+Drill'],
  //     category: 'Tools',
  //     condition: 'Good',
  //     pricePerDay: 50,
  //     lender: aarav._id,
  //     city: 'Pune',
  //     area: 'Akurdi',
  //     maxBorrowDays: 3,
  //     pickupNotes: 'Available after 6 PM on weekdays.',
  //   },
  //   {
  //     title: 'Pressure Cooker 5L',
  //     description:
  //       'Stainless steel 5 litre pressure cooker, great for parties and big batches.',
  //     images: ['https://placehold.co/600x400?text=Pressure+Cooker'],
  //     category: 'Kitchen',
  //     condition: 'Good',
  //     pricePerDay: 30,
  //     lender: neha._id,
  //     city: 'Pune',
  //     area: 'Pimpri',
  //     maxBorrowDays: 5,
  //     pickupNotes: 'Please return it washed.',
  //   },
  // ]);
  // console.log('Created listings:');
  // items.forEach((i) =>
  //   console.log(`  ${i.title} (Rs ${i.pricePerDay}/day) id=${i._id}`)
  // );

  // console.log(`\nDone. Test login password for both users: ${TEST_PASSWORD}`);
}

query()
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error('Seeding failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  });