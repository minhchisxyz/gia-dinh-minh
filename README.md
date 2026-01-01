# Gia Đình Mình

A private cloud storage application for family memories, built with Next.js.

## Features

- **File Management**: Upload, view, and download photos and videos.
- **Folder Organization**: Create and manage folders to organize your memories.
- **Interactions**: Love/Like files and folders.
- **Comments**: Discuss and share thoughts on specific files.
- **User Accounts**: Secure authentication and role-based access.
- **Mobile Friendly**: Responsive design that works great on mobile devices.
- **Cloud Storage**: Integrates with Google Drive for storage and Cloudinary for media optimization.

## Prerequisites

- Node.js (v18 or later recommended)
- PostgreSQL Database
- pnpm (Package manager)
- Google Cloud Project (for Drive API)
- Cloudinary Account

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd gia-dinh-minh
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory. Configure the following variables:

    ```env
    # --- Database ---
    # Connection string to your PostgreSQL database
    DATABASE_URL="postgresql://user:password@localhost:5432/gia_dinh_minh?schema=public"

    # --- Authentication ---
    # Secret for NextAuth (generate one using `npx auth secret` or `openssl rand -base64 32`)
    AUTH_SECRET="your-secret-key"

    # --- Cloudinary (Media Optimization & Storage) ---
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
    NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"
    # Optional: Folder name in Cloudinary (default: gia-dinh-minh)
    CLOUDINARY_FOLDER="gia-dinh-minh"

    # --- Google Drive (File Storage) ---
    # The ID of the folder in Google Drive where files will be stored
    DRIVE_FOLDER_ID="your-drive-folder-id"

    # Google Drive Authentication (Choose Method 1 OR Method 2)

    # Method 1: OAuth2 (Recommended for personal accounts)
    GOOGLE_CLIENT_ID="your-client-id"
    GOOGLE_CLIENT_SECRET="your-client-secret"
    GOOGLE_REFRESH_TOKEN="your-refresh-token"
    # Optional: Redirect URI
    GOOGLE_REDIRECT_URI="https://developers.google.com/oauthplayground"

    # Method 2: Service Account (Recommended for organization/automated access)
    # GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
    # GOOGLE_SERVICE_ACCOUNT_EMAIL="service-account@project.iam.gserviceaccount.com"
    # GOOGLE_PROJECT_ID="your-project-id"
    ```

4.  **Database Setup:**

    Run the Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate deploy
    ```

    (Optional) Seed the database with initial data:

    ```bash
    npx prisma db seed
    ```

5.  **Run the Application:**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

- **Login**: Use your credentials to log in.
- **Upload**: Click the upload button in the sidebar (desktop) or navigation (mobile) to upload images or videos.
- **Create Folder**: Organize files by creating new folders.
- **View**: Click on files to view them in a lightbox.
- **Interact**: Use the heart icon to love items and the comment section to leave messages.

