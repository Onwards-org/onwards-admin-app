// Analyze duplicate entries from registration data

const duplicates = [
  {
    name: "Evie Grice",
    existing: {
      id: 10,
      address: "5 Elmtree road Streetly, B743RX",
      email: "NULL (was fake)",
      phone: "07941301805",
      medical: "ADHD, Anxiety disorders, Autism Spectrum Disorder, Depression",
      registration_date: "existing"
    },
    new: {
      address: "5 Elmtree road Streetly, B743RX",
      email: "none provided",
      phone: "07941301805", 
      medical: "Autism (Diagnosed), ADHD (Diagnosed), Post-traumatic stress disorder (PTSD), Anxiety (Diagnosed), Depression",
      registration_date: "Jun 14, 2025",
      birth: "May 2007"
    },
    recommendation: "UPDATE existing with new detailed medical conditions data"
  },

  {
    name: "Keith Yardley", 
    entries: [
      {
        address: "44 Mary Slater Road Lichfield, WS136FG",
        email: "drkbyardley@hotmail.com", 
        phone: "07485004227",
        birth: "July 1972",
        registration: "Jun 6, 2025"
      },
      {
        address: "44 Mary Slater Road Lichfield, WS136FG",
        email: "drkbyardley@hotmail.com",
        phone: "07485004227", 
        birth: "July 1972",
        registration: "Nov 21, 2024"
      }
    ],
    recommendation: "KEEP the June 2025 entry (more recent), DELETE November 2024 entry"
  },

  {
    name: "Paige Howard",
    entries: [
      {
        address: "42 Foxwood Avenue Birmingham, B437qx",
        email: "paul161112@btinternet.com",
        phone: "07948733627",
        birth: "November 2011", 
        ethnicity: "not specified",
        registration: "Mar 17, 2025"
      },
      {
        address: "42 Foxwood Avenue Birmingham, B437qx", 
        email: "paul161112@btinternet.com",
        phone: "07948733627",
        birth: "November 2011",
        ethnicity: "White: White British",
        registration: "Mar 17, 2025"
      }
    ],
    recommendation: "KEEP the entry with ethnicity specified, DELETE the one without"
  },

  {
    name: "Hayley Howard",
    entries: [
      {
        address: "42 Foxwood Avenue Birmingham, B437qx",
        email: "paul161112@btinternet.com", 
        phone: "07948733627",
        birth: "August 1981",
        ethnicity: "not specified",
        registration: "Mar 17, 2025"
      },
      {
        address: "42 Foxwood Avenue Birmingham, B437qx",
        email: "paul161112@btinternet.com",
        phone: "07948733627", 
        birth: "August 1981",
        ethnicity: "White: White British",
        registration: "Mar 17, 2025"
      }
    ],
    recommendation: "KEEP the entry with ethnicity specified, DELETE the one without"
  }
];

console.log("=== DUPLICATE ANALYSIS ===\\n");

duplicates.forEach((dup, index) => {
  console.log(`${index + 1}. ${dup.name}`);
  console.log(`   Recommendation: ${dup.recommendation}`);
  console.log(`   Reason: ${dup.reason || 'More complete/recent data'}`);
  console.log();
});

// Also check for potential relationship issues
console.log("=== POTENTIAL DATA ISSUES ===\\n");

console.log("1. Gemma Lewis and Ellie Faris share same email (gemma-lewis-83@hotmail.com)");
console.log("   - Different addresses but same contact details");
console.log("   - May be mother/daughter or family members");
console.log("   - KEEP both but verify relationship");
console.log();

console.log("2. Multiple families with shared email addresses:");
console.log("   - Xander Taylor & Lindsay Hall (lindsayjeanettehall8@gmail.com)");
console.log("   - Dania HAMID & Iram Hamid (Iram.hamid1@btinternet.com)"); 
console.log("   - Multiple Oakes family members (oakeydockey@hotmail.com)");
console.log("   - NORMAL: Family members often share email addresses");
console.log();