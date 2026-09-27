import type { Metadata } from "next";
import { WsisTool } from "@/components/wsis/wsis-tool";

export const metadata: Metadata = {
  title: "Who Should I Start? - Lineup-Aware Prototype",
  description:
    "Prototype exploring lineup-aware start/sit recommendations: choose how many spots you are filling and get the expert-preferred combination.",
};

export default function WsisPage() {
  return <WsisTool />;
}
