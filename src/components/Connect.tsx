import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";

// ---- ICONS ----
const FarcasterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4C14.8 4 17.3 5.4 18.8 7.5H15.5V9.5H22V2.5H20V5.7C18.1 3.3 15.2 1.5 12 1.5C6.2 1.5 1.5 6.2 1.5 12C1.5 17.8 6.2 22.5 12 22.5C17.8 22.5 22.5 17.8 22.5 12H20C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4Z"
      fill="white"
    />
  </svg>
);

const MetaMaskIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#E17726" />
    <path d="M12 6L12 11L18 14L12 17L6 14L12 11" fill="white" />
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#3B99FC" />
    <path
      d="M10.9 13.4C13.7 10.7 18.3 10.7 21.1 13.4L22 14.3C22.4 14.7 22.4 15.3 22 15.7C21.6 16.1 21 16.1 20.6 15.7L19.7 14.8C17.6 12.7 14.4 12.7 12.3 14.8L11.4 15.7C11 16.1 10.4 16.1 10 15.7C9.6 15.3 9.6 14.7 10 14.3L10.9 13.4Z"
      fill="white"
    />
  </svg>
);

// ---- MAIN COMPONENT ----
export function Connect() {
  useEffect(() => {
    try {
      sdk.actions.addMiniApp();
    } catch {
      // ignore if not in Farcaster env
    }
  }, []);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending, error } = useConnect();

  const [isModalOpen, setIsModalOpen] = useState(false);

 
  if (isConnected) {
    return (
      <div className="relative font-['Poppins']">
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 bg-purple-600/80 hover:bg-purple-700/90 backdrop-blur-md text-white font-bold py-2 px-4 rounded-full shadow-lg border border-purple-400/50 transition-all duration-300"
        >
          <span>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className="text-red-300 ml-2">(Disconnect)</span>
        </button>
      </div>
    );
  }


  return (
    <div className="font-['Poppins']">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300"
      >
        Connect Wallet
      </button>

     
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-80 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center text-white mb-6">
              Select Wallet
            </h2>

            <div className="space-y-3">
              {connectors.map((conn) => {
                let Icon: React.FC | null = null;
                if (conn.name.toLowerCase().includes("meta")) Icon = MetaMaskIcon;
                else if (conn.name.toLowerCase().includes("farcaster"))
                  Icon = FarcasterIcon;
                else if (conn.name.toLowerCase().includes("walletconnect"))
                  Icon = WalletConnectIcon;

                return (
                  <button
                    key={conn.uid}
                    onClick={() => {
                      connect({ connector: conn });
                      setIsModalOpen(false);
                    }}
                    disabled={isPending}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-purple-600/70 hover:bg-purple-700/80 rounded-xl shadow-md text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                    {Icon && <Icon />}
                    <span className="font-semibold">
                      {isPending ? "Connecting..." : conn.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-red-400 mt-4 text-sm text-center">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
