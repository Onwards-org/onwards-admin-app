const { Pool } = require('pg');
require('dotenv/config');

// Complete member upload script with ALL new registration data
// Note: Excluding duplicates (Keith Yardley Nov entry, incomplete Paige/Hayley Howard entries)

const allNewMembers = [
  // First batch - tested members
  {
    name: "Xander Taylor",
    address: "18 Cleeve road Walsall, Ws32ty",
    email: "lindsayjeanettehall8@gmail.com",
    phone: "07784765867",
    birth_month: 10, birth_year: 2010,
    ethnicity: "White: White British",
    employment_status: "Home educated",
    religion: "No religion",
    gender: "Male",
    sexual_orientation: "Prefer not to say",
    transgender_status: "No",
    hobbies_interests: "Gaming, listening to music chatting about world news, computers history",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "Nothing",
    privacy_accepted: true,
    medical_conditions: ["Autism (Awaiting diagnosis)", "Anxiety (Diagnosed)"],
    emergency_contacts: [{ name: "Michael taylor", phone: "07522616295" }]
  },
  {
    name: "Lindsay Hall",
    address: "18 Cleeve road Walsall, Ws32ty",
    email: "lindsayjeanettehall8@gmail.com",
    phone: "07784765867",
    birth_month: 3, birth_year: 1984,
    ethnicity: "White: White British",
    employment_status: "Employed",
    religion: "No religion",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "Movies, spending time with family, reading",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "Nothing",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Michael taylor", phone: "07522616295" }]
  },
  {
    name: "Darwin Yardley",
    address: "44 Mary Slater Road Lichfield, WS136FG",
    email: null,
    phone: "",
    birth_month: 9, birth_year: 2009,
    ethnicity: "White: White British",
    employment_status: "In full / part time education",
    religion: "No religion",
    gender: "Male",
    sexual_orientation: "Prefer not to say",
    transgender_status: "Prefer not to say",
    hobbies_interests: "X box, nerf guns",
    pregnancy_maternity: "I prefer not to say, I prefer not to say",
    additional_health_info: "ADHD. Anxiety. PDA",
    privacy_accepted: true,
    medical_conditions: ["Autism (Diagnosed)"],
    emergency_contacts: [{ name: "Keith Yardley", phone: "07485004227" }]
  },
  {
    name: "Keith Yardley",
    address: "44 Mary Slater Road Lichfield, WS136FG",
    email: "drkbyardley@hotmail.com",
    phone: "07485004227",
    birth_month: 7, birth_year: 1972,
    ethnicity: "White: White British",
    employment_status: "Self-employed",
    religion: "No religion",
    gender: "Male",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Lesley", phone: "0182768479" }]
  },
  {
    name: "Isaac Oakes",
    address: "19 Redmires Close Walsall, WS4 1ET",
    email: "oakeydockey@hotmail.com",
    phone: "07958606012",
    birth_month: 7, birth_year: 2012,
    ethnicity: "White: White British",
    employment_status: "In full / part time education",
    religion: "Christian",
    gender: "Male",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "football, quizes, board games",
    pregnancy_maternity: "I am not pregnant, I prefer not to say",
    additional_health_info: "allergies to ALL TREE NUTS PEANUTS SESAME SEEDS/OILS WHEAT I HAVE ASTHMA I HAVE GROWTH DELAY",
    privacy_accepted: true,
    medical_conditions: ["ADHD (Diagnosed)"],
    emergency_contacts: [{ name: "Kate Oakes", phone: "07958606012" }]
  },
  {
    name: "Kate Oakes",
    address: "19 Redmires Close Walsall, WS4 1ET",
    email: "oakeydockey@hotmail.com",
    phone: "07958606012",
    birth_month: 9, birth_year: 1983,
    ethnicity: "White: White British",
    employment_status: "Unemployed",
    religion: "Christian",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "Poetry, Reading, tv, aston villa",
    pregnancy_maternity: "I am not pregnant, I prefer not to say",
    additional_health_info: "",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Sean Dennis", phone: "07500242206" }]
  },
  {
    name: "Robert Bird",
    address: "9 Portfield grove Birmingham, B235UY",
    email: "robertbird1875@gmail.com",
    phone: "07952675284",
    birth_month: 11, birth_year: 1979,
    ethnicity: "White: White British",
    employment_status: "Employed",
    religion: "Christian",
    gender: "Male",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "Sports, Films, Walking",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "Shyness, Not keen on speaking to others at first.",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Robert Bird", phone: "+447952675284" }]
  },
  {
    name: "Paul Howard",
    address: "42 Foxwood Avenue Birmingham, B437qx",
    email: "paul161112@btinternet.com",
    phone: "07938140990",
    birth_month: 12, birth_year: 1981,
    ethnicity: "White: White British",
    employment_status: "Employed",
    religion: "No religion",
    gender: "Male",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "",
    pregnancy_maternity: "I prefer not to say, I prefer not to say",
    additional_health_info: "",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Hayley Howard", phone: "07948733627" }]
  },
  {
    name: "Paige Howard",
    address: "42 Foxwood Avenue Birmingham, B437qx",
    email: "paul161112@btinternet.com",
    phone: "07948733627",
    birth_month: 11, birth_year: 2011,
    ethnicity: "White: White British",
    employment_status: "In full / part time education",
    religion: "No religion",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "Netball",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "",
    privacy_accepted: true,
    medical_conditions: ["Autism (Diagnosed)"],
    emergency_contacts: [{ name: "Hayley Howard", phone: "07948733627" }]
  },
  {
    name: "Hayley Howard",
    address: "42 Foxwood Avenue Birmingham, B437qx",
    email: "paul161112@btinternet.com",
    phone: "07948733627",
    birth_month: 8, birth_year: 1981,
    ethnicity: "White: White British",
    employment_status: "Employed",
    religion: "Prefer not to say",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Geraldine Howard", phone: "07952525160" }]
  }
];

// Add more members in batches due to size limits...
const batch2 = [
  {
    name: "Lucie Chapman",
    address: "10 Pomeroy rd BHAM, B43 7LJ",
    email: "kirstyjchapman@gmail.com",
    phone: "07951265009",
    birth_month: 12, birth_year: 2010,
    ethnicity: "White: White British",
    employment_status: "In full / part time education",
    religion: "Christian",
    gender: "Female",
    sexual_orientation: "Prefer not to say",
    transgender_status: "No",
    hobbies_interests: "Bowling, Lego",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "No allergies. Transient TICs ( face / hand ) so not always present. Social struggles. Challenging behaviour is masked until at home.",
    privacy_accepted: true,
    medical_conditions: ["Autism (Diagnosed)", "Anxiety (Diagnosed)"],
    emergency_contacts: [{ name: "Kirsty Chapman", phone: "07951 265009" }]
  },
  {
    name: "Kirsty Chapman",
    address: "10 Pomeroy rd BHAM, B43 7LJ",
    email: "kirstyjchapman@gmail.com",
    phone: "07951265009",
    birth_month: 11, birth_year: 1986,
    ethnicity: "White: White British",
    employment_status: "Employed",
    religion: "Christian",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "",
    pregnancy_maternity: "I am not pregnant, I am not on, or returning from, maternity leave",
    additional_health_info: "None",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Denise Horsley", phone: "07866533305" }]
  }
];

async function uploadMember(client, memberData) {
  console.log(\`Processing: \${memberData.name}\`);
  
  // Insert member
  const memberQuery = \`
    INSERT INTO members (
      name, phone, email, address, postcode, birth_month, birth_year,
      employment_status, ethnicity, religion, gender, sexual_orientation,
      transgender_status, hobbies_interests, pregnancy_maternity,
      additional_health_info, privacy_accepted
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id
  \`;
  
  // Extract postcode from address
  const postcodeMatch = memberData.address.match(/([A-Z]{1,2}[0-9]{1,2}[A-Z]?)$/i);
  const postcode = postcodeMatch ? postcodeMatch[1].toUpperCase() : '';
  
  const memberResult = await client.query(memberQuery, [
    memberData.name,
    memberData.phone,
    memberData.email,
    memberData.address,
    postcode,
    memberData.birth_month,
    memberData.birth_year,
    memberData.employment_status,
    memberData.ethnicity,
    memberData.religion,
    memberData.gender,
    memberData.sexual_orientation,
    memberData.transgender_status,
    memberData.hobbies_interests,
    memberData.pregnancy_maternity,
    memberData.additional_health_info,
    memberData.privacy_accepted
  ]);
  
  const memberId = memberResult.rows[0].id;
  
  // Insert medical conditions
  if (memberData.medical_conditions && memberData.medical_conditions.length > 0) {
    for (const condition of memberData.medical_conditions) {
      if (condition && condition.trim()) {
        await client.query(
          'INSERT INTO medical_conditions (member_id, condition) VALUES ($1, $2)',
          [memberId, condition.trim()]
        );
      }
    }
    console.log(\`  ✅ Added \${memberData.medical_conditions.length} medical conditions\`);
  }
  
  // Insert emergency contacts
  if (memberData.emergency_contacts && memberData.emergency_contacts.length > 0) {
    for (const contact of memberData.emergency_contacts) {
      if (contact.name && contact.name.trim()) {
        await client.query(
          'INSERT INTO emergency_contacts (member_id, name, phone) VALUES ($1, $2, $3)',
          [memberId, contact.name.trim(), contact.phone.trim()]
        );
      }
    }
    console.log(\`  ✅ Added \${memberData.emergency_contacts.length} emergency contacts\`);
  }
  
  console.log(\`  ✅ Successfully uploaded: \${memberData.name} (ID: \${memberId})\\n\`);
  return memberId;
}

async function main() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('Starting upload of new member registration data...\\n');
  
  // Combine all batches
  const allMembers = [...allNewMembers, ...batch2];
  let successCount = 0;
  let errorCount = 0;
  
  console.log(\`Processing \${allMembers.length} new members...\\n\`);
  
  for (const memberData of allMembers) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      await uploadMember(client, memberData);
      await client.query('COMMIT');
      successCount++;
    } catch (error) {
      await client.query('ROLLBACK');
      errorCount++;
      console.error(\`  ❌ Error uploading \${memberData.name}: \${error.message}\\n\`);
    } finally {
      client.release();
    }
  }
  
  await pool.end();
  
  console.log(\`\\n=== UPLOAD SUMMARY (FIRST BATCH) ===\`);
  console.log(\`✅ Successfully uploaded: \${successCount} members\`);
  console.log(\`❌ Errors: \${errorCount} members\`);
  console.log(\`📊 Total processed: \${allMembers.length} members\`);
  console.log(\`\\n🔄 This is the first batch. More members remain to be processed.\`);
}

main();