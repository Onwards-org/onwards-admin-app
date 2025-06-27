<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Join Onwards Community</h1>
        <p class="text-gray-600">
          Please complete this registration form to become a member of our community.
        </p>
      </div>

      <div class="mb-6">
        <div class="flex justify-center items-start space-x-8">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex flex-col items-center"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2"
              :class="[
                index < currentStep
                  ? 'bg-onwards-blue text-white'
                  : index === currentStep
                  ? 'bg-onwards-blue text-white'
                  : 'bg-gray-300 text-gray-700'
              ]"
            >
              {{ index + 1 }}
            </div>
            <span class="text-xs font-medium text-center max-w-20 leading-tight" :class="index <= currentStep ? 'text-onwards-blue' : 'text-gray-500'">
              {{ step.title }}
            </span>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Privacy Statement -->
        <FormCard
          v-if="currentStep === 0"
          title="Privacy Statement"
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :show-previous="false"
          :can-proceed="form.privacy_accepted"
        >
          <div class="prose max-w-none mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Onwards member privacy notice</h3>
            
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              This privacy notice tells you what to expect us to do with your personal information.
            </p>

            <h4 class="text-base font-semibold text-gray-900 mb-2">What information we collect, use, and why</h4>
            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              We collect or use the following information to provide services and goods, including delivery and third party referrals:
            </p>
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li>Names and contact details</li>
              <li>Gender</li>
              <li>Addresses</li>
              <li>Date of birth</li>
              <li>Emergency contact details</li>
              <li>Health information (including medical conditions, test results, allergies, medical requirements and medical history)</li>
              <li>Dietary information (including allergies and health conditions)</li>
              <li>Information about care needs (including disabilities, home conditions, dietary requirements and general care provisions)</li>
              <li>Information about lifestyle, interests or personal history</li>
            </ul>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              We also collect or use the following information to provide services and goods, including delivery and third party referrals:
            </p>
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li>Racial or ethnic origin</li>
              <li>Religious or philosophical beliefs</li>
              <li>Health information</li>
              <li>Sexual orientation information</li>
            </ul>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              We collect or use the following information to receive donations or funding and organise fundraising activities:
            </p>
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li>Names and contact details</li>
            </ul>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              We collect or use the following personal information to comply with legal requirements:
            </p>
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li>Name</li>
              <li>Contact information</li>
            </ul>

            <h4 class="text-base font-semibold text-gray-900 mb-2">Lawful bases and data protection rights</h4>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              Under UK data protection law, we must have a "lawful basis" for collecting and using your personal information. There is a list of possible lawful bases in the UK GDPR. You can find out more about lawful bases on the ICO's website.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              Which lawful basis we rely on may affect your data protection rights which are in brief set out below. You can find out more about your data protection rights and the exemptions which may apply on the ICO's website:
            </p>
            
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li><strong>Your right of access</strong> - You have the right to ask us for copies of your personal information. You can request other information such as details about where we get personal information from and who we share personal information with. There are some exemptions which means you may not receive all the information you ask for.</li>
              <li><strong>Your right to rectification</strong> - You have the right to ask us to correct or delete personal information you think is inaccurate or incomplete.</li>
              <li><strong>Your right to erasure</strong> - You have the right to ask us to delete your personal information.</li>
              <li><strong>Your right to restriction of processing</strong> - You have the right to ask us to limit how we can use your personal information.</li>
              <li><strong>Your right to object to processing</strong> - You have the right to object to the processing of your personal data.</li>
              <li><strong>Your right to data portability</strong> - You have the right to ask that we transfer the personal information you gave us to another organisation, or to you.</li>
              <li><strong>Your right to withdraw consent</strong> – When we use consent as our lawful basis you have the right to withdraw your consent at any time.</li>
            </ul>

            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              If you make a request, we must respond to you without undue delay and in any event within one month.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              To make a data protection rights request, please contact us using the contact details at the top of this privacy notice.
            </p>

            <h4 class="text-base font-semibold text-gray-900 mb-2">Our lawful bases for the collection and use of your data</h4>
            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              Our lawful bases for collecting or using personal information to provide services and goods, including delivery and third party referrals are:
            </p>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              <strong>Consent</strong> - we have permission from you after we gave you all the relevant information. All of your data protection rights may apply, except the right to object. To be clear, you do have the right to withdraw your consent at any time.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              Our lawful bases for collecting or using personal information to receive donations or funding and organise fundraising activities are:
            </p>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              <strong>Consent</strong> - we have permission from you after we gave you all the relevant information. All of your data protection rights may apply, except the right to object. To be clear, you do have the right to withdraw your consent at any time.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              Our lawful bases for collecting or using personal information to comply with legal requirements are:
            </p>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              <strong>Consent</strong> - we have permission from you after we gave you all the relevant information. All of your data protection rights may apply, except the right to object. To be clear, you do have the right to withdraw your consent at any time.
            </p>

            <h4 class="text-base font-semibold text-gray-900 mb-2">Where we get personal information from</h4>
            <ul class="text-sm text-gray-700 leading-relaxed mb-4 list-disc pl-5">
              <li>Directly from you</li>
              <li>Family members or carers</li>
            </ul>

            <h4 class="text-base font-semibold text-gray-900 mb-2">How long we keep information</h4>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              We will keep your personal data until you inform us you no longer wish to be a member, or for a period of 6 months since your last attendance.
            </p>

            <h4 class="text-base font-semibold text-gray-900 mb-2">How to complain</h4>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              If you have any concerns about our use of your personal data, you can make a complaint to us using the contact details at the top of this privacy notice.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              If you remain unhappy with how we've used your data after raising a complaint with us, you can also complain to the ICO.
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-2">
              <strong>The ICO's address:</strong>
            </p>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              Information Commissioner's Office<br>
              Wycliffe House<br>
              Water Lane<br>
              Wilmslow<br>
              Cheshire<br>
              SK9 5AF
            </p>

            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              <strong>Helpline number:</strong> 0303 123 1113<br>
              <strong>Website:</strong> <a href="https://www.ico.org.uk/make-a-complaint" class="text-onwards-blue hover:underline">https://www.ico.org.uk/make-a-complaint</a>
            </p>

            <p class="text-sm text-gray-700 leading-relaxed">
              <strong>Last updated:</strong> 8 November 2024
            </p>
          </div>
          
          <label class="flex items-center">
            <input
              v-model="form.privacy_accepted"
              type="checkbox"
              class="rounded border-gray-300 text-onwards-blue focus:ring-onwards-blue"
            />
            <span class="ml-2 text-sm text-gray-700">
              I have read and understood the privacy statement and consent to the processing of my personal data
            </span>
          </label>
        </FormCard>

        <!-- Personal Information -->
        <FormCard
          v-if="currentStep === 1"
          title="Personal Information"
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :can-proceed="isPersonalInfoValid"
        >
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.phone }"
                placeholder="e.g., 07123456789 or +447123456789"
              />
              <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
            </div>

            <AddressInput
              v-model="form.address"
              label="Home Address"
              placeholder="Please enter your full address including postcode"
              :error="errors.address"
              @address-selected="handleAddressSelected"
            />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Birth Month</label>
                <select
                  v-model="form.birth_month"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  :class="{ 'border-red-500': errors.birth_month }"
                >
                  <option value="">Select month</option>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
                <p v-if="errors.birth_month" class="text-red-500 text-sm mt-1">{{ errors.birth_month }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Birth Year</label>
                <select
                  v-model="form.birth_year"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  :class="{ 'border-red-500': errors.birth_year }"
                >
                  <option value="">Select year</option>
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
                <p v-if="errors.birth_year" class="text-red-500 text-sm mt-1">{{ errors.birth_year }}</p>
              </div>
            </div>
          </div>
        </FormCard>

        <!-- Demographics -->
        <FormCard
          v-if="currentStep === 2"
          title="Demographics"
          description="This information helps us understand our community and report to funding bodies."
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :can-proceed="isDemographicsValid"
        >
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Employment/Education Status</label>
              <select
                v-model="form.employment_status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.employment_status }"
              >
                <option value="">Please select</option>
                <option v-for="option in employmentOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.employment_status" class="text-red-500 text-sm mt-1">{{ errors.employment_status }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
              <select
                v-model="form.ethnicity"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.ethnicity }"
              >
                <option value="">Please select</option>
                <option v-for="option in ethnicityOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.ethnicity" class="text-red-500 text-sm mt-1">{{ errors.ethnicity }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Religion</label>
              <select
                v-model="form.religion"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.religion }"
              >
                <option value="">Please select</option>
                <option v-for="option in religionOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.religion" class="text-red-500 text-sm mt-1">{{ errors.religion }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                v-model="form.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.gender }"
              >
                <option value="">Please select</option>
                <option v-for="option in genderOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.gender" class="text-red-500 text-sm mt-1">{{ errors.gender }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sexual Orientation</label>
              <select
                v-model="form.sexual_orientation"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.sexual_orientation }"
              >
                <option value="">Please select</option>
                <option v-for="option in sexualOrientationOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.sexual_orientation" class="text-red-500 text-sm mt-1">{{ errors.sexual_orientation }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Transgender/Gender Reassignment</label>
              <select
                v-model="form.transgender_status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                :class="{ 'border-red-500': errors.transgender_status }"
              >
                <option value="">Please select</option>
                <option v-for="option in transgenderOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <p v-if="errors.transgender_status" class="text-red-500 text-sm mt-1">{{ errors.transgender_status }}</p>
            </div>
          </div>
        </FormCard>

        <!-- Emergency Contacts -->
        <FormCard
          v-if="currentStep === 3"
          title="Emergency Contacts"
          description="Please provide at least one emergency contact."
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :can-proceed="isEmergencyContactsValid"
        >
          <div class="space-y-4">
            <div
              v-for="(contact, index) in form.emergency_contacts"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium text-gray-900">Contact {{ index + 1 }}</h4>
                <button
                  v-if="form.emergency_contacts.length > 1"
                  @click="removeEmergencyContact(index)"
                  type="button"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    v-model="contact.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    v-model="contact.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
            
            <button
              @click="addEmergencyContact"
              type="button"
              class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-onwards-blue hover:text-onwards-blue transition-colors"
            >
              + Add Another Emergency Contact
            </button>
          </div>
        </FormCard>

        <!-- Health Information -->
        <FormCard
          v-if="currentStep === 4"
          title="Health Information"
          description="This information helps us provide appropriate support."
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :can-proceed="true"
        >
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Medical Conditions (Optional)</label>
              <p class="text-sm text-gray-600 mb-3">Select all that apply</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                  v-for="condition in medicalConditionsOptions"
                  :key="condition"
                  class="flex items-center"
                >
                  <input
                    v-model="form.medical_conditions"
                    type="checkbox"
                    :value="condition"
                    class="rounded border-gray-300 text-onwards-blue focus:ring-onwards-blue"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ condition }}</span>
                </label>
              </div>
              <div v-if="form.medical_conditions.includes('Other')" class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Please specify other medical condition:</label>
                <input
                  v-model="form.medical_conditions_other"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  placeholder="Please specify..."
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Challenging Behaviours</label>
              <p class="text-sm text-gray-600 mb-3">Select all that apply (optional)</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                  v-for="behaviour in challengingBehavioursOptions"
                  :key="behaviour"
                  class="flex items-center"
                >
                  <input
                    v-model="form.challenging_behaviours"
                    type="checkbox"
                    :value="behaviour"
                    class="rounded border-gray-300 text-onwards-blue focus:ring-onwards-blue"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ behaviour }}</span>
                </label>
              </div>
              <div v-if="form.challenging_behaviours.includes('Other')" class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Please specify other challenging behaviour:</label>
                <input
                  v-model="form.challenging_behaviours_other"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  placeholder="Please specify..."
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pregnancy/Maternity Status</label>
              <p class="text-sm text-gray-600 mb-3">Select all that apply (optional)</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                  v-for="option in pregnancyOptions"
                  :key="option"
                  class="flex items-center"
                >
                  <input
                    v-model="form.pregnancy_maternity"
                    type="checkbox"
                    :value="option"
                    class="rounded border-gray-300 text-onwards-blue focus:ring-onwards-blue"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ option }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Additional Health Information</label>
              <textarea
                v-model="form.additional_health_info"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                placeholder="Any additional health information that would help us support you better..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hobbies & Interests</label>
              <textarea
                v-model="form.hobbies_interests"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                placeholder="Tell us about your hobbies and interests..."
              ></textarea>
            </div>
          </div>
        </FormCard>

        <!-- Review -->
        <FormCard
          v-if="currentStep === 5"
          title="Review Your Information"
          description="Please review your information before submitting."
          :current-step="currentStep + 1"
          :total-steps="steps.length"
          show-progress
          :can-proceed="true"
          :is-last-step="true"
          :loading="loading"
        >
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Personal Information</h4>
              <p><strong>Name:</strong> {{ form.name }}</p>
              <p><strong>Email:</strong> {{ form.email }}</p>
              <p><strong>Phone:</strong> {{ form.phone }}</p>
              <p><strong>Address:</strong> {{ form.address }}</p>
              <p><strong>Date of Birth:</strong> {{ months.find(m => m.value === form.birth_month)?.label }} {{ form.birth_year }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Demographics</h4>
              <p><strong>Employment Status:</strong> {{ form.employment_status }}</p>
              <p><strong>Ethnicity:</strong> {{ form.ethnicity }}</p>
              <p><strong>Religion:</strong> {{ form.religion }}</p>
              <p><strong>Gender:</strong> {{ form.gender }}</p>
              <p><strong>Sexual Orientation:</strong> {{ form.sexual_orientation }}</p>
              <p><strong>Transgender Status:</strong> {{ form.transgender_status }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Emergency Contacts</h4>
              <div v-for="(contact, index) in form.emergency_contacts" :key="index" class="mb-1">
                <p><strong>{{ contact.name }}:</strong> {{ contact.phone }}</p>
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Health Information</h4>
              <div class="mb-3">
                <p class="font-medium">Medical Conditions:</p>
                <p v-if="form.medical_conditions.length === 0" class="text-gray-600">None selected</p>
                <ul v-else class="list-disc list-inside text-sm">
                  <li v-for="condition in form.medical_conditions" :key="condition">{{ condition }}</li>
                </ul>
              </div>
              <div v-if="form.challenging_behaviours.length > 0" class="mb-3">
                <p class="font-medium">Challenging Behaviours:</p>
                <ul class="list-disc list-inside text-sm">
                  <li v-for="behaviour in form.challenging_behaviours" :key="behaviour">{{ behaviour }}</li>
                </ul>
              </div>
              <p v-if="form.pregnancy_maternity"><strong>Pregnancy/Maternity:</strong> {{ form.pregnancy_maternity }}</p>
              <p v-if="form.additional_health_info"><strong>Additional Health Info:</strong> {{ form.additional_health_info }}</p>
              <p v-if="form.hobbies_interests"><strong>Hobbies & Interests:</strong> {{ form.hobbies_interests }}</p>
            </div>
          </div>
        </FormCard>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FormCard from '@/components/FormCard.vue'
import AddressInput from '@/components/AddressInput.vue'
import {
  EMPLOYMENT_OPTIONS,
  ETHNICITY_OPTIONS,
  RELIGION_OPTIONS,
  GENDER_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  TRANSGENDER_OPTIONS,
  PREGNANCY_OPTIONS,
  MEDICAL_CONDITIONS_OPTIONS,
  CHALLENGING_BEHAVIOURS_OPTIONS
} from '@shared/types'

const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)

const steps = [
  { title: 'Privacy' },
  { title: 'Personal Info' },
  { title: 'Demographics' },
  { title: 'Emergency Contacts' },
  { title: 'Health Information' },
  { title: 'Review' }
]

const form = ref({
  privacy_accepted: false,
  name: '',
  phone: '',
  email: '',
  address: '',
  postcode: '', // Store postcode separately for reporting
  birth_month: null as number | null,
  birth_year: null as number | null,
  employment_status: '',
  ethnicity: '',
  religion: '',
  gender: '',
  sexual_orientation: '',
  transgender_status: '',
  hobbies_interests: '',
  pregnancy_maternity: [] as string[],
  additional_health_info: '',
  emergency_contacts: [{ name: '', phone: '' }],
  medical_conditions: [] as string[],
  medical_conditions_other: '',
  challenging_behaviours: [] as string[],
  challenging_behaviours_other: ''
})

const errors = ref<Record<string, string>>({})

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= 1940; i--) {
    years.push(i)
  }
  return years
})

const employmentOptions = EMPLOYMENT_OPTIONS
const ethnicityOptions = ETHNICITY_OPTIONS
const religionOptions = RELIGION_OPTIONS
const genderOptions = GENDER_OPTIONS
const sexualOrientationOptions = SEXUAL_ORIENTATION_OPTIONS
const transgenderOptions = TRANSGENDER_OPTIONS

const isPersonalInfoValid = computed(() => {
  return !!(form.value.name.length >= 2 &&
            /^(\+44|0)[1-9]\d{8,9}$/.test(form.value.phone) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
            form.value.address.length >= 10 &&
            form.value.birth_month !== null &&
            form.value.birth_year !== null)
})

const isDemographicsValid = computed(() => {
  return !!(form.value.employment_status &&
            form.value.ethnicity &&
            form.value.religion &&
            form.value.gender &&
            form.value.sexual_orientation &&
            form.value.transgender_status)
})

const pregnancyOptions = PREGNANCY_OPTIONS
const medicalConditionsOptions = MEDICAL_CONDITIONS_OPTIONS
const challengingBehavioursOptions = CHALLENGING_BEHAVIOURS_OPTIONS

const isEmergencyContactsValid = computed(() => {
  return !!(form.value.emergency_contacts.length > 0 &&
            form.value.emergency_contacts.every(contact => 
              contact.name.length >= 2 && 
              /^(\+44|0)[1-9]\d{8,9}$/.test(contact.phone)
            ))
})

const addEmergencyContact = () => {
  form.value.emergency_contacts.push({ name: '', phone: '' })
}

const removeEmergencyContact = (index: number) => {
  form.value.emergency_contacts.splice(index, 1)
}

const handleSubmit = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    submitForm()
  }
}

const handleAddressSelected = (addressData: any) => {
  // Store the postcode separately for demographic reporting
  if (addressData.postal_code) {
    form.value.postcode = addressData.postal_code
  }
}

const submitForm = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/members/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (errorData.details) {
        errors.value = {}
        errorData.details.forEach((detail: any) => {
          errors.value[detail.field] = detail.message
        })
      }
      throw new Error(errorData.error || 'Registration failed')
    }

    router.push('/register-success')
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}
</script>