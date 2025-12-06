import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useState, useRef } from "react";
import { sdk } from '@farcaster/miniapp-sdk';
import Hub from "../ABI/Hub.json";
import { Notification } from "./Notification";

const GAME_HUB_ADDRESS = "0x24f544cf8ef819cdb1063c2ca9dc5464afadec05";

type ClaimProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NotificationState = {
  message: string;
  type: "success" | "error";
};

export function Claim({ isOpen, onClose }: ClaimProps) {
  const { address } = useAccount();
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const amountToClaimRef = useRef<bigint | null>(null);

  const { data: claimableAmount, isLoading: isReading, refetch } = useReadContract({
    address: GAME_HUB_ADDRESS,
    abi: Hub,
    functionName: 'claimableTokens',
    args: [address],
    query: {
      enabled: isOpen && !!address,
    }
  });

  const { data: hash, isPending, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({ hash });

  const handleShareToFarcaster = async () => {
    if (!amountToClaimRef.current || amountToClaimRef.current <= 0n) {
        console.log("No amount to share was recorded.");
        return;
    };

    setIsSharing(true);
    setNotification({ message: 'Claim successful! Opening Farcaster...', type: 'success' });

    try {
        const castText = `I just claimed my USDC reward from this week's top leaderboard in mines World! 🏆\n\nPlay now to win weekly $USDC prizes and get ready for the $mines airdrop.`;
        
        await sdk.actions.composeCast({
            text: castText,
            embeds: ['https://www.mines.xyz/', 'https://farcaster.xyz/minesxyz/0x9ae10898']
        });

        setTimeout(onClose, 500); 
    } catch (error) {
        console.error("Farcaster compose cast error:", error);
        setNotification({ message: 'Could not open Farcaster composer.', type: 'error' });
    } finally {
        setIsSharing(false);
    }
  };
  
  useEffect(() => {
    if (isSuccess) {
      handleShareToFarcaster();
      refetch();
    } else if (isError) {
      setNotification({ message: 'Claim failed. Please try again.', type: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError]);

  const handleClaim = () => {
    if (typeof claimableAmount === 'bigint') {
        amountToClaimRef.current = claimableAmount;
    }
    writeContract({
      address: GAME_HUB_ADDRESS,
      abi: Hub,
      functionName: 'claimReward',
    });
  };
  
  const hasClaimableAmount = typeof claimableAmount === 'bigint' && claimableAmount > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in">
       {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-gradient-to-br from-purple-800 via-indigo-900 to-gray-900 rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full border border-white/20">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">Claim Rewards</h2>
        
        <div className="space-y-6 text-center">
            {isReading ? (
                <p className="text-lg text-white/80">Checking your eligibility...</p>
            ): hasClaimableAmount ? (
                <>
                    <p className="text-lg text-green-400">You are eligible to claim:</p>
                    <p className="text-4xl font-bold text-white">{formatUnits(claimableAmount, 6)} USDC</p>
                </>
            ) : (
                <p className="text-lg text-red-400">You have no rewards to claim at this time.</p>
            )}
        </div>
        <div className="mt-8 flex flex-col gap-4">
            <button
                onClick={handleClaim}
                disabled={!hasClaimableAmount || isPending || isConfirming || isSharing}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg font-semibold text-xl transition-all duration-200 ease-in-out hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                {isPending ? 'Check Wallet...' : isConfirming ? 'Claiming...' : isSharing ? 'Sharing...' : 'Claim Now'}
            </button>
        </div>
        
        <div className="mt-4">
             <button
                onClick={onClose}
                disabled={isConfirming || isSharing}
                className="w-full px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg shadow-lg font-semibold disabled:opacity-50"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}