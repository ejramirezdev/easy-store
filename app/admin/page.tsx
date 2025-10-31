import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/"); // o a /login

  // opcional: verificar rol
  // if ((session.user as any).role !== "admin") redirect("/");

  return <div>Panel de Administración</div>;
}
