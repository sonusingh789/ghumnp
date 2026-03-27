import ForgotPasswordClient from "./ForgotPasswordClient";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your visitNepal77 account password and request a secure password reset link.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
