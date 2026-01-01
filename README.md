# Gia Đình Mình

A private cloud storage application for family memories, built with Next.js.

## Features

- **File Management**: Upload, view, and download photos and videos.
- **Folder Organization**: Create and manage folders to organize your memories.
- **Interactions**: Love/Like files and folders.
- **Comments**: Discuss and share thoughts on specific files.
- **User Accounts**: Secure authentication and role-based access.
- **Mobile Friendly**: Responsive design that works great on mobile devices.
- **Local Storage**: Files are stored locally on the server, keeping your data private.

## Prerequisites

- Node.js (v18 or later recommended)
- PostgreSQL Database
- pnpm (Package manager)

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

    Create a `.env` file in the root directory. You primarily need to configure the `DATABASE_URL` for the application to function.

    ```env
    # Connection string to your PostgreSQL database
    DATABASE_URL="postgresql://user:password@localhost:5432/gia_dinh_minh?schema=public"

    # Secret for NextAuth (generate one using `npx auth secret` or `openssl rand -base64 32`)
    AUTH_SECRET="your-secret-key"
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

