// wagmi.ts

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base } from "@reown/appkit/networks";

const projectId = "cd169b99d42633d1d81f5aee613d0eed";

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base],
  ssr: true,
  connectors: [],
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: "Catch The Mine",
    description: "Catch The Mine",
    url: "https://catchthemine.xyz/",
    icons: ["https://catchthemine.xyz/logo.png"],
  },
  themeMode: "dark",
});

export const config = wagmiAdapter.wagmiConfig;
