// wagmi.ts
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    farcasterFrame(),
    metaMask(), 
    injected({ shimDisconnect: true }), 
    walletConnect({ projectId: "3019281f-07ce-499c-a914-0a34503fcfe1" }), 
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
