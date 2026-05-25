import { Suspense } from "react";
import WalletsPanel from "../WalletsPanel";

export default function FinanceWalletsPage() {
  return (
    <Suspense fallback={null}>
      <WalletsPanel />
    </Suspense>
  );
}
