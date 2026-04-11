import DesktopGate from "@/components/desktop-gate";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportForm from "@/components/report/report-form";

export default function ReportPage() {
  return (
    <DesktopGate>
      <div className="flex h-full flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px]">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Report Garbage</h1>
            <p className="text-sm text-gray-500 mb-5">
              Help clean Ahmedabad — report a garbage dump near you.
            </p>
          </div>
          <ReportForm />
        </main>
        <MobileNav />
      </div>
    </DesktopGate>
  );
}
