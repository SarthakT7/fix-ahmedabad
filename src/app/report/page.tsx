import type { Metadata } from "next";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportForm from "@/components/report/report-form";

export const metadata: Metadata = {
  title: "Report Garbage",
  description: "Report a garbage dump in Ahmedabad. Upload a photo, select your ward, and tag your MLA/MP to take action.",
};

export default function ReportPage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-lg px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-gray-900">Report Garbage</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Spotted a dump? Report it. We&apos;ll help you tag the right people.
          </p>
        </div>
        <div className="mx-auto max-w-lg mt-2">
          <ReportForm />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
