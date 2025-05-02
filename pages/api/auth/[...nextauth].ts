import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (!user || !user.isAdmin) return null;
          
          const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!passwordMatch) return null;
          
          return {
            id: String(user.id),
            name: user.username,
            email: user.username,
            role: 'admin'
          };
        } catch (error) {
          console.error('Admin auth error:', error);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: 'client-credentials',
      name: 'Client Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await prisma.client.findUnique({
            where: { email: credentials.email }
          });

          if (!client) return null;
          
          const passwordMatch = await bcrypt.compare(credentials.password, client.passwordHash);
          
          if (!passwordMatch) return null;
          
          return {
            id: String(client.id),
            name: client.name,
            email: client.email,
            role: 'client'
          };
        } catch (error) {
          console.error('Client auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'client';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);