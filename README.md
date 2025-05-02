# WhatsApp Sales Management Platform

A full-stack web application designed for managing live-streamed product sales through WhatsApp groups. This application helps streamline and automate the sales process for businesses that conduct live sales sessions via WhatsApp.

## Features

- **Product Management**: Catalog, organize, and manage your product inventory
- **Live Session Management**: Schedule and track live sales sessions
- **Order Processing**: Capture and fulfill orders from live sessions
- **Client Management**: Maintain a database of clients with purchase history
- **Payment Tracking**: Monitor payment status and confirmations
- **Automated Shipping Labels**: Generate shipping labels for easy order fulfillment

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Uploads**: Multer
- **Form Validation**: Zod, React Hook Form
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/whatsapp-sales-manager.git
   cd whatsapp-sales-manager
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following:
   ```
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp_sales"
   ```

4. Initialize the database
   ```
   npx prisma db push
   npx prisma db seed
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and Prisma
- UI components from Shadcn UI
- Icons from Lucide React