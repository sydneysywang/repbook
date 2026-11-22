import type { Metadata } from "next";
import { NotFoundMessage } from "@/components/NotFoundMessage";

export const metadata: Metadata = {
  title: "Repbook",
};

export default function NotFound() {
  return <NotFoundMessage />;
}
