# Member Registration Data Upload Script

This script allows you to bulk upload member registration data to the Onwards admin system from a tab-separated values (TSV) file.

## Prerequisites

1. **Server Running**: Make sure the Onwards admin server is running:
   ```bash
   npm run dev:detached
   ```

2. **Data File**: Prepare your member data in a tab-separated text file with proper headers.

## Usage

### Basic Usage
```bash
node upload-members.cjs [data-file.txt]
```

If no file is specified, it will look for `member-data.txt` in the current directory.

### Examples
```bash
# Upload from default file (member-data.txt)
node upload-members.cjs

# Upload from specific file
node upload-members.cjs my-members.txt

# Upload from sample data
node upload-members.cjs sample-member-data.txt
```

## Data File Format

The data file should be a tab-separated text file with the first row containing headers. The script will automatically map common field names to the required API format.

### Required Fields
- **name** (or full_name, first_name + last_name)
- **email** (or email_address)
- **phone** (or telephone, mobile) - Must be valid UK format
- **address** (or full_address, or combination of address_line_1, city, etc.)
- **birth_month** (1-12) and **birth_year** (or date_of_birth)
- **employment_status** (or employment)
- **ethnicity** (or ethnic_background)
- **religion** (or religious_belief)
- **gender**
- **sexual_orientation** (or sexuality)
- **emergency_contact_1_name** and **emergency_contact_1_phone** (or emergency_name_1, emergency_phone_1)

### Optional Fields
- **postcode** (or postal_code, zip)
- **transgender** (or trans) - defaults to "Prefer not to say"
- **hobbies_interests** (or hobbies, interests)
- **pregnancy_maternity** (or pregnancy, maternity) - defaults to "Not applicable"
- **additional_health_info** (or health_info, medical_notes)
- **emergency_contact_2_name** and **emergency_contact_2_phone**
- **medical_conditions** (or conditions) - comma/semicolon separated
- **challenging_behaviours** (or behaviours) - comma/semicolon separated

### Supported Field Name Variations

The script automatically recognizes many common field name variations:

**Names:**
- name, full_name, first_name + last_name

**Contact:**
- email, email_address
- phone, telephone, mobile
- address, full_address, address_line_1 + city + town

**Birth Information:**
- birth_month + birth_year
- date_of_birth, dob (supports DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY formats)

**Emergency Contacts:**
- emergency_contact_1_name, emergency_name_1, emergency_contact_name
- emergency_contact_1_phone, emergency_phone_1, emergency_contact_phone
- emergency_contact_2_name, emergency_name_2
- emergency_contact_2_phone, emergency_phone_2

## Valid Values

The script validates against the system's predefined options:

### Employment Status
- Full-time employment, Part-time employment, Self-employed, Unemployed
- Student - Full-time, Student - Part-time, Retired
- Unable to work due to disability, Volunteer work, Other

### Ethnicity
- White - British, White - Irish, White - Other
- Mixed - White and Black Caribbean, Mixed - White and Black African, Mixed - White and Asian, Mixed - Other
- Asian - Indian, Asian - Pakistani, Asian - Bangladeshi, Asian - Chinese, Asian - Other
- Black - Caribbean, Black - African, Black - Other
- Arab, Other ethnic group, Prefer not to say

### Religion
- No religion, Christian, Buddhist, Hindu, Jewish, Muslim, Sikh
- Any other religion, Prefer not to say

### Gender
- Male, Female, Non-binary, Other, Prefer not to say

### Sexual Orientation
- Heterosexual/Straight, Gay or Lesbian, Bisexual, Pansexual, Asexual
- Other, Prefer not to say

### Medical Conditions (comma/semicolon separated)
- Autism Spectrum Disorder, ADHD, Anxiety disorders, Depression
- Bipolar disorder, OCD, PTSD, Learning disability
- Physical disability, Sensory impairment, Chronic illness, Other

### Challenging Behaviours (comma/semicolon separated)
- Self-harm, Aggression towards others, Property destruction
- Verbal outbursts, Social withdrawal, Repetitive behaviours
- Sensory seeking behaviours, Food-related issues, Sleep difficulties, Other

## Phone Number Validation

UK phone numbers are required and must be in one of these formats:
- 07123456789
- +447123456789
- 01234567890
- +441234567890

The script will attempt to clean and correct common formatting issues.

## Output

The script provides:

1. **Console Output**: Real-time progress with success/error messages
2. **Summary Report**: Total processed, successful, and failed uploads
3. **Detailed Log File**: JSON report saved as `upload-report-YYYY-MM-DD-HH-MM-SS.json`

### Sample Output
```
ℹ️ [2024-01-15T10:30:00.000Z] 🚀 Onwards Member Registration Upload Script
ℹ️ [2024-01-15T10:30:00.000Z] Data file: sample-member-data.txt
ℹ️ [2024-01-15T10:30:00.000Z] API endpoint: http://localhost:8080/api/members/register
ℹ️ [2024-01-15T10:30:00.000Z] Checking server health...
✅ [2024-01-15T10:30:00.000Z] Server is running and accessible
ℹ️ [2024-01-15T10:30:00.000Z] Reading data file: sample-member-data.txt
ℹ️ [2024-01-15T10:30:00.000Z] Found 5 lines (including header)
ℹ️ [2024-01-15T10:30:00.000Z] Processing row 2/5...
✅ [2024-01-15T10:30:00.000Z] ✅ Row 2: John Smith (john.smith@email.com) uploaded successfully
ℹ️ [2024-01-15T10:30:00.000Z] Processing row 3/5...
✅ [2024-01-15T10:30:00.000Z] ✅ Row 3: Sarah Johnson (sarah.j@email.com) uploaded successfully
...
ℹ️ [2024-01-15T10:30:00.000Z] 📊 UPLOAD SUMMARY
ℹ️ [2024-01-15T10:30:00.000Z] Total records processed: 4
✅ [2024-01-15T10:30:00.000Z] Successful uploads: 4
❌ [2024-01-15T10:30:00.000Z] Failed uploads: 0
ℹ️ [2024-01-15T10:30:00.000Z] 📝 Detailed report saved to: upload-report-2024-01-15T10-30-00.json
✅ [2024-01-15T10:30:00.000Z] 🎉 Upload process completed!
```

## Error Handling

The script includes comprehensive error handling:

- **Validation Errors**: Missing or invalid required fields
- **API Errors**: Server connectivity issues, duplicate emails, validation failures
- **File Errors**: Missing files, incorrect format, parsing issues
- **Network Errors**: Timeout, connection refused, server errors

Common errors and solutions:

1. **Server Health Check Failed**: Make sure the server is running with `npm run dev:detached`
2. **Invalid Phone Number**: Ensure UK phone numbers are properly formatted
3. **Invalid Email**: Check for typos in email addresses
4. **Duplicate Member**: Email already exists in the system
5. **Missing Emergency Contact**: At least one emergency contact is required

## Troubleshooting

### Server Not Running
```bash
# Check if server is running
npm run dev:health

# Start the server
npm run dev:detached

# Check server status
npm run dev:status
```

### Invalid Data Format
- Ensure the file is tab-separated (not comma-separated)
- Check that the first row contains proper headers
- Verify that required fields are present for all rows

### Permission Errors
- Ensure the script has read permissions for the data file
- Check that the current directory is writable for the report file

## Sample Data File

A sample data file `sample-member-data.txt` is included with the script showing the proper format and field names.

## Integration with Existing Systems

The script can be easily integrated into automated workflows:

```bash
# Example: Download data and upload
curl -o member-data.txt "https://example.com/export/members.txt"
node upload-members.cjs member-data.txt

# Example: Process multiple files
for file in data/*.txt; do
  echo "Processing $file"
  node upload-members.cjs "$file"
done
```

## Security Notes

- The script connects to localhost only by default
- No authentication is required for the registration endpoint (as per system design)
- All data is validated on the server side
- Personal data should be handled according to GDPR requirements
- Consider using HTTPS in production environments

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Review the detailed JSON report file
3. Verify the server is running and accessible
4. Ensure your data file format matches the requirements
5. Check for any network connectivity issues