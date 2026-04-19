const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');
const PoliceOfficer = require('./models/PoliceOfficer');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminCount = await Admin.countDocuments();
    const policeCount = await PoliceOfficer.countDocuments();
    console.log(`Admins: ${adminCount}`);
    console.log(`Police Officers: ${policeCount}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
