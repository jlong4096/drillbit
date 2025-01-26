import SidebarNav from "@/components/SidebarNav";
import { getVendors } from "@/app/api/vendor";

const vendors = Object.entries(getVendors()).map(([k, v]): [string, string] => [
  k,
  v.name,
]);

export default function Home() {
  return (
    <main>
      <SidebarNav vendors={vendors} />
    </main>
  );
}
