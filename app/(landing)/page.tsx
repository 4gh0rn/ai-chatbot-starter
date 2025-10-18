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
      title: "24/7 Availability",
      description:
        "Your AI assistant never sleeps. Provide instant support to your customers around the clock.",
    },
    {
      icon: <LightningBoltIcon className="h-5 w-5" />,
      title: "Instant Responses",
      description:
        "Reduce response times from hours to seconds with intelligent, context-aware conversations.",
    },
    {
      icon: <GlobeIcon className="h-5 w-5" />,
      title: "Multi-language Support",
      description:
        "Break language barriers. Communicate with customers in their preferred language automatically.",
    },
    {
      icon: <MixIcon className="h-5 w-5" />,
      title: "Easy Integration",
      description:
        "Connect with your favorite tools and platforms. No coding required to get started.",
    },
    {
      icon: <LockClosedIcon className="h-5 w-5" />,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and SOC 2 compliance ensure your data stays safe and private.",
    },
    {
      icon: <CodeIcon className="h-5 w-5" />,
      title: "Custom Training",
      description:
        "Train your chatbot on your specific data and use cases for perfectly tailored responses.",
    },
  ];

  const benefits = [
    "Save 80% on support costs",
    "Handle 1000+ conversations simultaneously",
    "Increase customer satisfaction by 45%",
    "Reduce first response time to under 1 second",
    "Scale support without hiring",
    "Free your team for complex tasks",
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
              Transform Customer Support with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI-Powered Conversations
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              Automate customer support 24/7 and reduce response times with our
              intelligent chatbot. No coding required. Get started in minutes.
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
              Everything You Need to Scale Support
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Powerful features designed to help you deliver exceptional
              customer experiences at scale.
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
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="mb-8 font-bold text-3xl tracking-tight sm:text-4xl">
                Why Choose Our AI Chatbot?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircledIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>See the Difference</CardTitle>
                  <CardDescription>
                    Join thousands of companies already transforming their
                    customer support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">{"<1 second"}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[95%] bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[94%] bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cost Reduction</span>
                      <span className="font-medium">80%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[80%] bg-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial/Learning Section */}
      <section className="border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-blue-700 text-sm dark:bg-blue-900/30 dark:text-blue-400">
                  <RocketIcon className="mr-2 h-3 w-3" />
                  Learning Resources
                </div>
                <h2 className="mb-4 font-bold text-3xl tracking-tight">
                  Master Your AI Assistant
                </h2>
                <p className="mb-6 text-muted-foreground text-lg">
                  Access our comprehensive tutorial track to learn best
                  practices, advanced features, and optimization techniques.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircledIcon className="mr-2 h-4 w-4 text-green-600" />
                    Interactive tutorials and guides
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircledIcon className="mr-2 h-4 w-4 text-green-600" />
                    Best practices from industry experts
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircledIcon className="mr-2 h-4 w-4 text-green-600" />
                    Real-world implementation examples
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    variant="outline"
                    disabled
                    className="cursor-not-allowed opacity-50"
                  >
                    Tutorial Track Coming Soon
                  </Button>
                  <p className="mt-2 text-muted-foreground text-xs">
                    Tutorial resources are currently being developed
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 dark:from-blue-950/20 dark:to-cyan-950/20 lg:p-12">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                      <BotIcon />
                    </div>
                    <p className="font-medium text-lg">
                      Learn at your own pace
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm">
                      From beginner to expert
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-white sm:text-4xl">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="mb-8 text-blue-100 text-xl">
            Join thousands of companies delivering exceptional customer
            experiences with AI.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[200px] bg-white text-blue-600 hover:bg-gray-100"
              >
                Sign In
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {guestAccounts && (
              <button
                onClick={() => {
                  window.location.href = "/api/auth/guest?redirectUrl=/";
                }}
                className="min-w-[200px] rounded-md border border-white bg-transparent px-8 py-3 font-medium text-sm text-white transition-colors hover:bg-white/10"
              >
                Try as Guest
              </button>
            )}
          </div>
          <p className="mt-6 text-blue-100 text-sm">
            Get started instantly • No account required for guest mode
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2025 AI Chatbot. All rights reserved.</p>
            <p className="mt-2">
              Built with Next.js and AI SDK • Powered by advanced language
              models
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}