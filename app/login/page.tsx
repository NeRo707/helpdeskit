// app/login/page.tsx (NO "use client")
import { redirect } from "next/navigation";
import { getMe } from "@/actions/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getMe();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
