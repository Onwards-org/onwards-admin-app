# Google Maps API Setup

To enable address autocomplete functionality, you need to set up a Google Maps API key.

## Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select existing one)

3. **Enable the Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API" 
   - Click "Enable"

4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict the API Key** (recommended for production):
   - Click on your API key in the credentials list
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `*.onwards.org.uk/*`)
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API"

6. **Add to .env file**:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```

7. **Restart the development server** after adding the API key

## Notes:
- The API key is prefixed with `VITE_` because it's used in the client-side code
- For production, make sure to restrict the API key to your domain only
- Google gives $200/month free credits which should be sufficient for most organizations
- If the API key is not configured, users can still enter addresses manually

## Billing:
- Places API Autocomplete costs about $2.83 per 1,000 requests
- Most small organizations will stay within the free tier limit