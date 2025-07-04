const { Pool } = require('pg');
require('dotenv/config');

// New registration data (excluding duplicates we identified)
const newMembers = [
  {
    name: "Xander Taylor",
    address: "18 Cleeve road Walsall, Ws32ty",
    email: "lindsayjeanettehall8@gmail.com",
    phone: "07784765867",
    birth_month: 10,
    birth_year: 2010,
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
    birth_month: 3,
    birth_year: 1984,
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
    email: "",
    phone: "",
    birth_month: 9,
    birth_year: 2009,
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
    birth_month: 7,
    birth_year: 1972,
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
    birth_month: 7,
    birth_year: 2012,
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
    birth_month: 9,
    birth_year: 1983,
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
    birth_month: 11,
    birth_year: 1979,
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
    birth_month: 12,
    birth_year: 1981,
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
    birth_month: 11,
    birth_year: 2011,
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
    birth_month: 8,
    birth_year: 1981,
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

// Continue with more members...
const moreMembers = [
  {
    name: "Lucie Chapman",
    address: "10 Pomeroy rd BHAM, B43 7LJ",
    email: "kirstyjchapman@gmail.com",
    phone: "07951265009",
    birth_month: 12,
    birth_year: 2010,
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
    birth_month: 11,
    birth_year: 1986,
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
  },
  {
    name: "Karen Ghosh",
    address: "103 Little Sutton road Sutton Coldfield, B75 6PT",
    email: "kghosh1993@yahoo.co.uk",
    phone: "07930573549",
    birth_month: 3,
    birth_year: 1970,
    ethnicity: "Asian: Asian Indian",
    employment_status: "Employed",
    religion: "No religion",
    gender: "Female",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "READING",
    pregnancy_maternity: "I prefer not to say, I prefer not to say",
    additional_health_info: "Mother of Syon who has ASD - HE IS 16",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Balbinder Balu", phone: "+447930573549" }]
  },
  {
    name: "Syon Ghosh Bhatt",
    address: "103 Sutton Coldfield, B75 6PT",
    email: "syon.ghoah.bhatt@gmail.com",
    phone: "07930573549",
    birth_month: 12,
    birth_year: 2008,
    ethnicity: "Asian: Asian Indian",
    employment_status: "In full / part time education",
    religion: "No religion",
    gender: "Male",
    sexual_orientation: "Heterosexual",
    transgender_status: "No",
    hobbies_interests: "Cycling",
    pregnancy_maternity: "I am not pregnant, I prefer not to say",
    additional_health_info: "ADHD",
    privacy_accepted: true,
    medical_conditions: [],
    emergency_contacts: [{ name: "Karen Ghosh", phone: "07930573549" }]
  }
];

async function uploadMembers() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('Starting upload of new registration data...\\n');
  
  const allMembers = [...newMembers, ...moreMembers];
  let successCount = 0;
  let errorCount = 0;
  
  for (const memberData of allMembers) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
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
      const postcode = postcodeMatch ? postcodeMatch[1] : '';
      
      const memberResult = await client.query(memberQuery, [
        memberData.name,
        memberData.phone || '',
        memberData.email || null,
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
          await client.query(
            'INSERT INTO medical_conditions (member_id, condition) VALUES ($1, $2)',
            [memberId, condition]
          );
        }
        console.log(\`  ✅ Added \${memberData.medical_conditions.length} medical conditions\`);
      }
      
      // Insert emergency contacts
      if (memberData.emergency_contacts && memberData.emergency_contacts.length > 0) {
        for (const contact of memberData.emergency_contacts) {
          await client.query(
            'INSERT INTO emergency_contacts (member_id, name, phone) VALUES ($1, $2, $3)',
            [memberId, contact.name, contact.phone]
          );
        }
        console.log(\`  ✅ Added \${memberData.emergency_contacts.length} emergency contacts\`);
      }
      
      await client.query('COMMIT');
      successCount++;
      console.log(\`  ✅ Successfully uploaded: \${memberData.name} (ID: \${memberId})\\n\`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      errorCount++;
      console.error(\`  ❌ Error uploading \${memberData.name}: \${error.message}\\n\`);
    } finally {
      client.release();
    }
  }
  
  await pool.end();
  
  console.log(\`\\n=== UPLOAD SUMMARY ===\`);
  console.log(\`✅ Successfully uploaded: \${successCount} members\`);
  console.log(\`❌ Errors: \${errorCount} members\`);
  console.log(\`📊 Total processed: \${allMembers.length} members\`);
}

uploadMembers();