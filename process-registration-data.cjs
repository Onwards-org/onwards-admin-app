const { Pool } = require('pg');
require('dotenv/config');

// Helper function to parse medical conditions string
function parseMedicalConditions(conditionsStr) {
  if (!conditionsStr || conditionsStr.trim() === '') return [];
  
  return conditionsStr.split('\\n')
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .map(c => c.replace(/^"|"$/g, '')); // Remove quotes
}

// Helper function to extract postcode from address
function extractPostcode(address) {
  const postcodeMatch = address.match(/([A-Z]{1,2}[0-9]{1,2}[A-Z]?)$/i);
  return postcodeMatch ? postcodeMatch[1].toUpperCase() : '';
}

// Parse the raw registration data - EXCLUDING DUPLICATES
const rawData = \`
Xander Taylor	18 Cleeve road Walsall, Ws32ty	lindsayjeanettehall8@gmail.com		Non	07784765867	October	2010	Jun 11, 2025	White: White British	Gaming ,listening to music chatting about world news , computers history	Michael taylor, 07522616295	"Autism (Awaiting diagnosis)
Anxiety (Diagnosed)"	That's fine, let's pick some things!	None	I am not pregnant, I am not on, or returning from, maternity leave	Prefer not to say	Male	No	Home educated
Lindsay Hall	18 Cleeve road Walsall, Ws32ty	lindsayjeanettehall8@gmail.com	Nothing	Non	07784765867	March	1984	Jun 11, 2025	White: White British	Movies ,spending time with family , reading	Michael taylor, 07522616295		That's fine, let's pick some things!	None	I am not pregnant, I am not on, or returning from, maternity leave	Heterosexual	Female	No	Employed
Darwin Yardley	44 Mary Slater Road Lichfield, WS136FG		ADHD.  Anxiety.	PDA		September	2009	Jun 6, 2025	White: White British	X box, nerf guns	Keith Yardley, 07485004227	Autism (Diagnosed)	That's fine, let's pick some things!	None	I prefer not to say, I prefer not to say	Prefer not to say	Male	Prefer not to say	In full / part time education
Keith Yardley	44 Mary Slater Road Lichfield, WS136FG	drkbyardley@hotmail.com			07485004227	July	1972	Jun 6, 2025	White: White British		Lesley, 0182768479		I'd prefer not to	None	I am not pregnant, I am not on, or returning from, maternity leave	Heterosexual	Male	No	Self-employed
Isaac Oakes	19 Redmires Close Walsall, WS4 1ET	oakeydockey@hotmail.com	"allergies to
ALL TREE NUTS
PEANUTS
SESAME SEEDS/OILS
WHEAT
I HAVE ASTHMA 
I HAVE  GROWTH DELAY"		07958606012	July	2012	Apr 21, 2025	White: White British	"football 
quizes
board games"	Kate Oakes, 07958606012	ADHD (Diagnosed)	That's fine, let's pick some things!	Christian	I am not pregnant, I prefer not to say	Heterosexual	Male	No	In full / part time education
Kate Oakes	19 Redmires Close Walsall, WS4 1ET	oakeydockey@hotmail.com			07958606012	September	1983	Apr 21, 2025	White: White British	"Poetry
Reading 
tv
aston villa"	Sean Dennis, 07500242206		That's fine, let's pick some things!	Christian	I am not pregnant, I prefer not to say	Heterosexual	Female	No	Unemployed
Robert Bird	9 Portfield grove Birmingham, B235UY	robertbird1875@gmail.com		"Shyness,
Not keen on speaking to others at first."	07952675284	November	1979	Mar 21, 2025	White: White British	Sports,  Films, Walking,	Robert Bird, +447952675284		That's fine, let's pick some things!	Christian	I am not pregnant, I am not on, or returning from, maternity leave	Heterosexual	Male	No	Employed
Paul Howard	42 Foxwood Avenue Birmingham, B437qx	paul161112@btinternet.com			07938140990	December	1981	Mar 17, 2025	White: White British		Hayley Howard, 07948733627		I'd prefer not to	None	I prefer not to say, I prefer not to say	Heterosexual	Male	No	Employed
Paige Howard	42 Foxwood Avenue Birmingham, B437qx	paul161112@btinternet.com			07948733627	November	2011	Mar 17, 2025	White: White British	Netball	Hayley Howard, 07948733627	Autism (Diagnosed)	That's fine, let's pick some things!	None	I am not pregnant, I am not on, or returning from, maternity leave	Heterosexual	Female	No	In full / part time education
Hayley Howard	42 Foxwood Avenue Birmingham, B437qx	paul161112@btinternet.com			07948733627	August	1981	Mar 17, 2025	White: White British		Geraldine Howard, 07952525160		I'd prefer not to	Prefer not to say	I am not pregnant, I am not on, or returning from, maternity leave	Heterosexual	Female	No	Employed
\`;

// Helper function to parse month name to number
function monthToNumber(monthName) {
  const months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  return months[monthName] || 1;
}

function parseRegistrationData(rawData) {
  const lines = rawData.trim().split('\\n').filter(line => line.trim());
  const members = [];
  
  for (const line of lines) {
    const fields = line.split('\\t');
    if (fields.length < 19) continue; // Skip incomplete lines
    
    const member = {
      name: fields[0].trim(),
      address: fields[1].trim(),
      email: fields[2].trim() || null,
      phone: fields[5].trim() || '',
      birth_month: monthToNumber(fields[6].trim()),
      birth_year: parseInt(fields[7].trim()),
      ethnicity: fields[9].trim(),
      employment_status: fields[19].trim(),
      religion: fields[14].trim() === 'None' ? 'No religion' : fields[14].trim(),
      gender: fields[17].trim(),
      sexual_orientation: fields[16].trim(),
      transgender_status: fields[18].trim(),
      hobbies_interests: fields[10].trim(),
      pregnancy_maternity: fields[15].trim(),
      additional_health_info: (fields[3].trim() + ' ' + fields[4].trim()).trim(),
      privacy_accepted: true,
      medical_conditions: parseMedicalConditions(fields[12].trim()),
      emergency_contacts: [{ 
        name: fields[11].split(',')[0].trim(), 
        phone: fields[11].split(',')[1] ? fields[11].split(',')[1].trim() : ''
      }]
    };
    
    members.push(member);
  }
  
  return members;
}

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
  
  const postcode = extractPostcode(memberData.address);
  
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
      if (condition.trim()) {
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
      if (contact.name.trim()) {
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
  
  console.log('Starting upload of registration data...\\n');
  
  const members = parseRegistrationData(rawData);
  let successCount = 0;
  let errorCount = 0;
  
  console.log(\`Parsed \${members.length} members from registration data\\n\`);
  
  for (const memberData of members) {
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
  
  console.log(\`\\n=== UPLOAD SUMMARY ===\`);
  console.log(\`✅ Successfully uploaded: \${successCount} members\`);
  console.log(\`❌ Errors: \${errorCount} members\`);
  console.log(\`📊 Total processed: \${members.length} members\`);
}

main();