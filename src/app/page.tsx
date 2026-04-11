import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import DynamicMap from "@/components/map/dynamic-map";
import IntroBanner from "@/components/intro-banner";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="relative flex-1 pt-[48px] pb-[68px] md:pb-0">
        <DynamicMap />
        <IntroBanner />
      </main>
      <MobileNav />
    </div>
  );
}
