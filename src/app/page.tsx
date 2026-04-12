import { redirect } from "next/navigation";
import { readSession, roleHome } from "@/lib/auth";

export default async function Home() {
  const session = await readSession();
  if (!session) {
    redirect("/login");
  }
  redirect(roleHome(session.role));
}
