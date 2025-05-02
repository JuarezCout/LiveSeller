# Getting Started in Replit

This guide helps you quickly run and test the WhatsApp Sales Management System on Replit.

## Quick Start

1. **Start the server:**
   - Press the "Run" button in the Replit interface
   - Or start the workflow manually with the "Start application" workflow
   - The server runs on port 5000 automatically

2. **Database Setup:**
   - The PostgreSQL database is already set up and connected
   - Environment variables are automatically configured in Replit

3. **Seed the Database (if needed):**
   ```bash
   npx tsx prisma/seed.ts
   ```
   This will populate the database with:
   - Admin user (username: `admin`, password: `admin123`)
   - Sample client (email: `client1@example.com`, password: `password123`)
   - Sample products, a live session, and an order

4. **Test the API:**
   Try these endpoints using curl or a REST client:
   
   **Admin Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
   ```
   
   **Client Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/client -H "Content-Type: application/json" -d '{"email":"client1@example.com","password":"password123"}'
   ```
   
   **Get Products:**
   ```bash
   curl http://localhost:5000/api/products
   ```

## Project Structure

- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Database seed script
- `pages/api/*` - API endpoints
- `lib/prisma.ts` - Prisma client
- `lib/upload/multer.ts` - File upload configuration

## Development Tips

- If you need to reset the database: `npx prisma db push --force-reset`
- For API documentation, check the README.md file
- To view the database contents: `npx prisma studio`
- Check logs in the Console panel for debugging

## Next Steps

1. Build the client-side React components
2. Implement the admin dashboard 
3. Create the client portal
4. Add authentication to the frontend
5. Develop live session management UI

The backend API structure is already implemented and ready to use!