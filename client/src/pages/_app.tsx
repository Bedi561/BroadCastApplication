import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Toaster richColors position="top-right" />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
