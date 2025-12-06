import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { sdk } from "@farcaster/miniapp-sdk";

// Import local components, hooks, and assets
import { Connect } from "./components/Connect";
import { Game } from "./components/Game";
import { Claim } from "./components/Claim";
import { Notification } from "./components/Notification";
import { useLivesLocalStorage } from "./hooks/useLivesLocalStorage";
import Hub from "./ABI/Hub.json";
import assetsImg from "./assets/blue.png";
import bombImg from "./assets/bomb.png";

// Icon Components
const ClaimIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-400">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const UsdcIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="12" fill="#1976d2" />{" "}
    {/* Blue background */}
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill="white"
    >
      $
    </text>
  </svg>
);
const ClockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.2426 16.2426L12 12V6"
      stroke="#9333ea"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const GAME_HUB_ADDRESS = "0x24f544cf8ef819cdb1063c2ca9dc5464afadec05";

type NotificationState = {
  message: string;
  type: "success" | "error";
};

function App() {
  const { address, isConnected } = useAccount();
  const guestOrAddress = address || "guest";

  const [lives, setLives, resetTimestamp] = useLivesLocalStorage(
    `lives_game_${guestOrAddress}`
  );

 

  const [isClaimOpen, setIsClaimOpen] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  const { data: hash, isPending, writeContract } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({ hash });

  const processedTxHashRef = useRef<`0x${string}` | undefined>();

  useEffect(() => {
    try {
      sdk.actions.ready ();
      sdk.actions.addMiniApp();
      console.log("Farcaster SDK ready");
    } catch (e) {
      console.warn(
        "Farcaster SDK not available. This is expected in a normal browser.",
        e
      );
    }
  }, []);

  useEffect(() => {
    if (hash && hash !== processedTxHashRef.current) {
      if (isSuccess) {
        console.log("Purchase successful on-chain!", receipt);
        setLives((currentLives) => currentLives + 5);
        setNotification({
          message: "Purchase successful! You've received 5 extra lives.",
          type: "success",
        });
        processedTxHashRef.current = hash;
      } else if (isError) {
        console.error("Purchase transaction failed");
        setNotification({
          message: "Purchase failed. The transaction was rejected or reverted.",
          type: "error",
        });
        processedTxHashRef.current = hash;
      }
    }
  }, [isSuccess, isError, hash, receipt, setLives]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const distance = resetTimestamp - now;

      if (distance < 0) {
        setCountdown("Ready!");
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTimestamp]);

  const handleBuyLives = () => {
    processedTxHashRef.current = undefined;
    writeContract({
      address: GAME_HUB_ADDRESS,
      abi: Hub,
      functionName: "buyLives",
      value: parseEther("0.00018"),
    });
  };

  const handlePlayClick = () => {
    if (lives > 0) {
      setIsPlaying(true);
    } else {
      setNotification({
        message: "You are out of lives! Wait for the daily reset.",
        type: "error",
      });
    }
  };

  const handleGameEnd = () => {
    setIsPlaying(false);
    setLives((currentLives) => Math.max(0, currentLives - 1));
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-purple-800 via-indigo-900 to-gray-900 font-['Poppins'] text-white overflow-hidden p-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {isConnected && (
        <div className="absolute top-4 right-4 z-20">
          <Connect />
        </div>
      )}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {isPlaying ? (
          <div className="w-full max-w-md md:max-w-lg animate-fade-in">
            <Game onGameEnd={handleGameEnd} />
          </div>
        ) : (
          <div className="text-center animate-fade-in w-full flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              Catch The Mine
            </h1>
            <p className="text-white/70 mb-8">Catching Game</p>
            {isConnected ? (
              <div className="w-full max-w-md animate-fade-in mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 text-left space-y-4 mb-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    Game Info & Rewards
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-lg">Catch The Mine</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={assetsImg}
                        alt="Mines"
                        className="h-8 w-8"
                      />
                      <span className="font-bold text-green-400 text-lg">
                        +7 Point
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-lg">Avoid Bombs</span>
                    <div className="flex items-center gap-2">
                      <img src={bombImg} alt="Bomb" className="h-8 w-8" />
                      <span className="font-bold text-red-400 text-lg">
                        -4 Points
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                    <UsdcIcon />
                    <span className="text-lg">
                      Top 8 get{" "}
                      <span className="font-bold text-blue-400">USDC</span>{" "}
                      weekly!
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                    <ClockIcon />
                    <span className="text-lg">
                      <span className="font-bold text-purple-400">
                        $$$$
                      </span>{" "}
                      Token coming soon!
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={handlePlayClick}
                      disabled={lives <= 0}
                      className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg font-semibold text-xl transition-transform duration-200 ease-in-out hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                      Play Game
                    </button>
                    <div className="mt-2 text-white/80">
                      <p>
                        Lives remaining:{" "}
                        <span className="font-bold text-xl">{lives}</span>
                      </p>
                      {lives <= 0 && (
                        <p className="text-sm mt-1">
                          Next lives in:{" "}
                          <span className="font-mono">{countdown}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={handleBuyLives}
                      disabled={isPending || isConfirming}
                      className="w-full px-8 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg font-semibold text-lg transition-all duration-200 ease-in-out hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                      {isPending
                        ? "Check Wallet..."
                        : isConfirming
                        ? "Purchasing..."
                        : "Buy 5 Lives ($0.5 in ETH)"}
                    </button>
                    {isConfirming && (
                      <p className="mt-2 text-sm text-white/60">
                        Confirming transaction on-chain...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-lg text-white/80 mb-4">
                  Please connect your wallet to play!
                </p>
                <Connect />
              </div>
            )}
          </div>
        )}
        {!isPlaying && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setIsClaimOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl shadow-lg"
            >
              <ClaimIcon />
              <span>Claim</span>
            </button>
          </div>
        )}
      </div>
      <Claim isOpen={isClaimOpen} onClose={() => setIsClaimOpen(false)} />
    </main>
  );
}

export default App;