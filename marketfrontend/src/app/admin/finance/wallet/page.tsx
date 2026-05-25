import { Suspense } from "react";
import WalletsPanel from "../WalletsPanel";

export default function FinanceWalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletsPanel />
    </Suspense>
  );
}
