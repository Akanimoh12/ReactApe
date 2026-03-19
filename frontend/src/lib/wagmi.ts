import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "ReactApe",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "PLACEHOLDER_PROJECT_ID",
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http("https://dream-rpc.somnia.network"),
  },
  ssr: true,
});
