import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // si no está logueado, envía a inicio (o /login si lo creas)
  },
});

export const config = {
  matcher: ["/admin/:path*"], // protege todo /admin
};
