"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { BotIcon } from "@/components/icons";
import {
  ArrowRightIcon,
  ChatBubbleIcon,
  RocketIcon,
  LightningBoltIcon,
  LockClosedIcon,
  CheckCircledIcon,
  CodeIcon,
  MixIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";

export default function LandingPage() {
  const { guestAccounts } = useFeatureFlags();

  const features = [
    {
      icon: <ChatBubbleIcon className="h-5 w-5" />,
      title: "Always Available",
      description:
        "Get instant answers - day and night.",
    },
    {
      icon: <LightningBoltIcon className="h-5 w-5" />,
      title: "Lightning Fast",
      description:
        "No waiting. Responses in seconds.",
    },
    {
      icon: <GlobeIcon className="h-5 w-5" />,
      title: "Multi-language",
      description:
        "Understands and responds in many languages.",
    },
    {
      icon: <MixIcon className="h-5 w-5" />,
      title: "Easy to Use",
      description:
        "No installation. Start directly in your browser.",
    },
    {
      icon: <LockClosedIcon className="h-5 w-5" />,
      title: "Secure",
      description:
        "Your data stays protected and private.",
    },
    {
      icon: <CodeIcon className="h-5 w-5" />,
      title: "Learns & Adapts",
      description:
        "Improves with every conversation.",
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <BotIcon />
              <span className="font-semibold text-lg">AI Chatbot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              {guestAccounts && (
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/guest?redirectUrl=/";
                  }}
                  className="rounded-md px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
                >
                  Try as Guest
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              Smart answers to your questions. Instantly available, no setup needed.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  Sign In
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {guestAccounts && (
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/guest?redirectUrl=/";
                  }}
                  className="rounded-md px-8 py-3 font-medium text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Try as Guest →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight sm:text-4xl">
              What Can It Do?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Simple features for better conversations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="mb-8 font-bold text-3xl tracking-tight sm:text-4xl">
              Your Benefits
            </h2>
            <div className="mx-auto max-w-3xl grid gap-4 md:grid-cols-2">
              <div className="flex items-start text-left">
                <CheckCircledIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Always Online</p>
                  <p className="text-muted-foreground text-sm">No own hosting needed</p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircledIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Instant Start</p>
                  <p className="text-muted-foreground text-sm">No installation needed</p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircledIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Keeps Learning</p>
                  <p className="text-muted-foreground text-sm">Gets better with every answer</p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircledIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Try Free</p>
                  <p className="text-muted-foreground text-sm">As guest without signup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 font-bold text-3xl tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                1
              </div>
              <h3 className="mb-2 font-semibold">Sign In</h3>
              <p className="text-muted-foreground text-sm">With account or as guest</p>
            </div>
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                2
              </div>
              <h3 className="mb-2 font-semibold">Ask Questions</h3>
              <p className="text-muted-foreground text-sm">Just type in the chat</p>
            </div>
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                3
              </div>
              <h3 className="mb-2 font-semibold">Get Answers</h3>
              <p className="text-muted-foreground text-sm">Instant and accurate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2025 AI Chatbot</p>
          </div>
        </div>
      </footer>
    </div>
  );
}