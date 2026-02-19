import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";

export default function NotFound() {
  return (
    <div>
      <PageHeader title="404" subtitle="Page not found" />
      <div className="container mx-auto px-4 pb-16 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-6 py-3 font-heading uppercase text-gray-200"
        >
          <ArrowLeft className="size-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
