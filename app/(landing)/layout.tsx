import { redirect } from "next/navigation";
import { auth } from "../(auth)/auth";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If user is authenticated, redirect them to the chat
  if (session) {
    redirect("/chat");
  }

  return <>{children}</>;
}