import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import { MemberModel } from './src/server/models/Member.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function importCleanedData() {
  try {
    console.log('Loading cleaned registration data...')
    
    const dataPath = path.join(__dirname, 'registration-data-cleaned.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const membersData = JSON.parse(rawData)
    
    console.log(`Found ${membersData.length} members to import`)
    
    let imported = 0
    let skipped = 0
    
    for (const memberData of membersData) {
      try {
        // Check if member with this email already exists
        const existingMember = await MemberModel.findByEmail(memberData.email)
        if (existingMember) {
          console.log(`Skipping ${memberData.name} - email already exists`)
          skipped++
          continue
        }
        
        // Extract emergency contacts and medical conditions
        const emergencyContacts = memberData.emergency_contacts || []
        const medicalConditions = memberData.medical_conditions || []
        const challengingBehaviours = memberData.challenging_behaviours || []
        
        // Remove these from member data as they're not part of the main member record
        const { emergency_contacts, medical_conditions, challenging_behaviours, ...cleanMemberData } = memberData
        
        // Create the member
        const member = await MemberModel.create(cleanMemberData)
        console.log(`Created member: ${member.name} (ID: ${member.id})`)
        
        // Add emergency contacts
        for (const contact of emergencyContacts) {
          if (contact.name && contact.phone) {
            await MemberModel.addEmergencyContact(member.id, {
              name: contact.name,
              phone: contact.phone
            })
            console.log(`  Added emergency contact: ${contact.name}`)
          }
        }
        
        // Add medical conditions
        for (const condition of medicalConditions) {
          if (condition && condition.trim()) {
            await MemberModel.addMedicalCondition(member.id, condition)
            console.log(`  Added medical condition: ${condition}`)
          }
        }
        
        // Add challenging behaviours
        for (const behaviour of challengingBehaviours) {
          if (behaviour && behaviour.trim()) {
            await MemberModel.addChallengingBehaviour(member.id, behaviour)
            console.log(`  Added challenging behaviour: ${behaviour}`)
          }
        }
        
        imported++
        
      } catch (error) {
        console.error(`Error importing ${memberData.name}:`, error.message)
      }
    }
    
    console.log(`\\nImport completed:`)
    console.log(`- Imported: ${imported} members`)
    console.log(`- Skipped: ${skipped} members`)
    console.log(`- Total processed: ${imported + skipped} members`)
    
  } catch (error) {
    console.error('Error importing data:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

// Run the import
importCleanedData()