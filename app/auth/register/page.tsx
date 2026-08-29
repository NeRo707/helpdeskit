import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account - IT Helpdesk",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
