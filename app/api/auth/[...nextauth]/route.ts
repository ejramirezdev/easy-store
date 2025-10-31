import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // tu cliente prisma reutilizable

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "database" }, // usa la tabla Session de Prisma
  pages: {}, // si luego quieres custom login page
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token, user }) {
      if (!session.user) {
        return session;
      }

      let userId = token?.id as string | undefined;
      let userRole = token?.role as ("CUSTOMER" | "ADMIN") | undefined;

      if (!token) {
        if (user) {
          const userRoleFromUser = (user as any).role as
            | "CUSTOMER"
            | "ADMIN"
            | undefined;

          userId = userId ?? (user.id as string | undefined);
          userRole = userRole ?? userRoleFromUser;
        }

        if ((!userId || !userRole) && session.user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
          });

          if (dbUser) {
            userId = userId ?? dbUser.id;
            userRole = userRole ?? dbUser.role;
          }
        }
      }

      if (userId) {
        session.user.id = userId;
      }
      if (userRole) {
        session.user.role = userRole;
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
