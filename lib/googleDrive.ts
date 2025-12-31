import {google, drive_v3} from "googleapis"
import {GoogleAuth, OAuth2Client} from "google-auth-library"

let drive: drive_v3.Drive
let authClient: any

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground"
  )
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })
  authClient = oauth2Client
  drive = google.drive({ version: 'v3', auth: oauth2Client })
} else {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!privateKey) {
    throw new Error("GOOGLE_PRIVATE_KEY is not set")
  }
  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("GOOGLE_PRIVATE_KEY does not start with '-----BEGIN PRIVATE KEY-----'. Check your .env file.")
  }

  const authOptions = {
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
      project_id: process.env.GOOGLE_PROJECT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  }


  const auth = new GoogleAuth(authOptions)
  authClient = auth

  drive = google.drive({ version: 'v3', auth })
}

export default drive
export async function getAccessToken() {
  return authClient.getAccessToken()
}
