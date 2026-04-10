require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Admin = require('./models/Admin');
const PoliceOfficer = require('./models/PoliceOfficer');
const PoliceStation = require('./models/PoliceStation');
const IPCSection = require('./models/IPCSection');

// Seed data
const ipcSectionsData = require('./seeds/ipcSections');
const policeStationsData = require('./seeds/policeStations');
const { admin: adminData, policeOfficers: policeOfficersData } = require('./seeds/users');

const seed = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clear existing data ──
    console.log('\n🗑️  Clearing existing seed data...');
    await Promise.all([
      Admin.deleteMany({}),
      PoliceOfficer.deleteMany({}),
      PoliceStation.deleteMany({}),
      IPCSection.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared');

    // ── Seed IPC Sections ──
    console.log('\n📜 Seeding IPC Sections...');
    await IPCSection.insertMany(ipcSectionsData);
    console.log(`✅ ${ipcSectionsData.length} IPC sections seeded`);

    // ── Seed Police Stations ──
    console.log('\n🏛️  Seeding Police Stations...');
    const stations = await PoliceStation.insertMany(policeStationsData);
    console.log(`✅ ${stations.length} police stations seeded`);

    // Build station lookup map
    const stationMap = {};
    stations.forEach((station) => {
      stationMap[station.stationCode] = station;
    });

    // ── Seed Admin ──
    console.log('\n👤 Seeding Admin account...');
    const adminUser = await Admin.create(adminData);
    console.log(`✅ Admin created: ${adminUser.email} / password: ${adminData.password}`);

    // ── Seed Police Officers ──
    console.log('\n👮 Seeding Police Officers...');
    for (const officerData of policeOfficersData) {
      const station = stationMap[officerData.stationCode];
      if (!station) {
        console.log(`⚠️  Station ${officerData.stationCode} not found, skipping ${officerData.name}`);
        continue;
      }

      const officer = await PoliceOfficer.create({
        name: officerData.name,
        badgeNumber: officerData.badgeNumber,
        rank: officerData.rank,
        assignedPoliceStation: station._id,
        policeStationCode: station.stationCode,
        district: station.district,
        state: station.state,
        mobile: officerData.mobile,
        email: officerData.email,
        password: officerData.password,
      });

      console.log(`✅ Officer: ${officer.name} (${officer.badgeNumber}) → ${station.name}`);
    }

    // ── Summary ──
    console.log('\n═══════════════════════════════════════════════');
    console.log('  🎉 SEED COMPLETE — Summary');
    console.log('═══════════════════════════════════════════════');
    console.log(`  IPC Sections  : ${ipcSectionsData.length}`);
    console.log(`  Police Stations: ${stations.length}`);
    console.log(`  Admin Accounts : 1`);
    console.log(`  Police Officers: ${policeOfficersData.length}`);
    console.log('═══════════════════════════════════════════════');
    console.log('\n📋 Login Credentials:');
    console.log('─────────────────────────────────────────────');
    console.log(`  Admin:  ${adminData.email} / ${adminData.password}`);
    policeOfficersData.forEach((o) => {
      console.log(`  Police: ${o.badgeNumber} / ${o.password}`);
    });
    console.log('─────────────────────────────────────────────');
    console.log('  Citizens: Register via OTP (send-otp → verify-otp)');
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
