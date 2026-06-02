require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const user = new User({ name: 'Test', email: 'test12345@eduverse.ai', password: 'Password123' });
    await user.save();
    console.log('Saved successfully');
  } catch(e) {
    console.log(e.stack);
  }
  process.exit();
});
