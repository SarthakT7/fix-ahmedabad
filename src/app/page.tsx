import DesktopGate from "@/components/desktop-gate";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import DynamicMap from "@/components/map/dynamic-map";

export default function HomePage() {
  return (
    <DesktopGate>
      <div className="flex h-full flex-col">
        <Header />
        <main className="flex-1 pt-[52px] pb-[68px]">
          <DynamicMap />
        </main>
        <MobileNav />
      </div>
    </DesktopGate>
  );
}
