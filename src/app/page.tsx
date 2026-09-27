import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Who Should I Start?",
  description:
    "Some weeks you’re not picking one player, you’re picking two. Tell Who Should I Start? what you need and it recommends the combination.",
};

export default function Home() {
  return <LandingPage />;
}
