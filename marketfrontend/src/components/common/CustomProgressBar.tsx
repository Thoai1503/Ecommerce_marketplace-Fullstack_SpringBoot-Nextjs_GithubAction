import NextTopLoader from "nextjs-toploader";

export default function CustomProgressBar() {
  return (
    <NextTopLoader
      color="#8F0505"
      initialPosition={0.08}
      crawlSpeed={200}
      height={5}
      crawl={true}
      showSpinner={true}
      easing="ease"
      speed={200}
      zIndex={9999}
      showAtBottom={false}
    />
  );
}
