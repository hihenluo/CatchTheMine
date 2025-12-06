// src/components/Game.tsx (Final - With More Bombs)

import { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

import blueImg from '../assets/blue.png';
import emeraldImg from '../assets/emerald.png';
import goldImg from '../assets/gold.png';
import silverImg from '../assets/silver.png';
import bombImg from '../assets/dynamite.png';

const minesChoices = [
  { name: 'Blue', src: blueImg },
  { name: 'Silver', src: silverImg },
  { name: 'Gold', src: goldImg },
  { name: 'Emerald', src: emeraldImg },
];

interface GameProps {
  onGameEnd: () => void;
}

type ItemOnScreen = { id: number; x: number; y: number; src: string; alt: string; rotation: number; type: 'mines' | 'bomb'; };

const API_URL = import.meta.env.VITE_API_URL;

export function Game({ onGameEnd }: GameProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [screen, setScreen] = useState<'ready' | 'playing' | 'result'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [itemsOnScreen, setItemsOnScreen] = useState<ItemOnScreen[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [submissionResult, setSubmissionResult] = useState<{message: string; finalScore: number} | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const gameLoopRef = useRef<number>();
  const timersRef = useRef({
      lastminesSpawn: 0,
      nextminesSpawnInterval: 800,
      lastBombSpawn: 0,
      nextBombSpawnInterval: 800, // Initial bomb interval
      lastSecondUpdate: 0,
  });

  const handleGameOver = () => setScreen('result');

  const handleStartGame = () => {
    timersRef.current = {
      lastminesSpawn: 0, nextminesSpawnInterval: 800,
      lastBombSpawn: 0, nextBombSpawnInterval: 800,
      lastSecondUpdate: 0,
    };
    setScreen('playing');
    setTimeLeft(30);
    setScore(0);
    setItemsOnScreen([]);
    setSubmissionResult(null);
    setSubmissionError('');
  };

  const handleSubmitScore = async () => {
    if (!address || score <= 0) {
      setSubmissionError("You must have a score greater than 0 to submit.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionStatus('Please sign the message in your wallet...');

    try {
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(2);
      const message = `I scored ${score} in mines World! Nonce: ${nonce}, Timestamp: ${timestamp}`;

      const signature = await signMessageAsync({ message });
      setSubmissionStatus('Submitting your score...');
      
      const response = await fetch(`${API_URL}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, score, message, signature, timestamp, nonce }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
      
      setSubmissionResult(result);
    } catch (error: any) {
      console.error("Submission failed:", error);
      setSubmissionError(error.message || 'Failed to submit score.');
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };
  
  const handleShareToFarcaster = async () => {
    if (!submissionResult) return;
    setIsSharing(true);
    try {
        const castText = `I just earned ${submissionResult.finalScore} points in mines World! 👾\n\nMy total points are accumulating for the $mines airdrop soon. Play now To win $USDC in Weekly`;
        await sdk.actions.composeCast({
            text: castText,
            embeds: ['https://www.mines.xyz/', 'https://farcaster.xyz/minesxyz/0xfb551434']
        });
    } catch (error) {
        console.error("Farcaster compose cast error:", error);
        alert("Could not open Farcaster composer.");
    } finally {
        setIsSharing(false);
    }
  };
  
  const createItem = (type: 'mines' | 'bomb') => {
    let newItemData;
    if (type === 'bomb') {
        newItemData = { name: 'Bomb', src: bombImg, type: 'bomb' };
    } else {
        newItemData = minesChoices[Math.floor(Math.random() * minesChoices.length)];
    }

    const itemId = Date.now() + Math.random();
    const newItem: ItemOnScreen = {
        id: itemId,
        x: Math.random() * 90, y: Math.random() * 90,
        src: newItemData.src, alt: newItemData.name,
        rotation: type === 'mines' ? Math.random() * 15 : 0,
        type: type
    };
    setItemsOnScreen(prev => [...prev, newItem]);

    if (type === 'bomb') {
        setTimeout(() => {
            setItemsOnScreen(prev => prev.filter(item => item.id !== itemId));
        }, 3000); // Bombs disappear after 3 seconds if not clicked
    }
  };
  
  const handleCatchItem = (clickedItem: ItemOnScreen) => {
    if (clickedItem.type === 'bomb') {
      setScore(prevScore => Math.max(0, prevScore - 3));
    } else {
      setScore(p => p + 1); 
      
      setTimeout(() => createItem('mines'), 100);
      
      if (Math.random() > 0.4) {
        setTimeout(() => createItem('mines'), 250);
      }
    }
    setItemsOnScreen(p => p.filter(i => i.id !== clickedItem.id)); 
  };
  
  useEffect(() => {
    if (screen !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    // Initial items
    for(let i=0; i<3; i++) {
        setTimeout(() => createItem('mines'), i * 200);
    }

    const gameLoop = (timestamp: number) => {
      if (!timersRef.current) return;

      // Update timer
      if (timestamp - timersRef.current.lastSecondUpdate > 1000) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
        timersRef.current.lastSecondUpdate = timestamp;
      }

      
      if (timestamp - timersRef.current.lastminesSpawn > timersRef.current.nextminesSpawnInterval) {
        createItem('mines');
        timersRef.current.lastminesSpawn = timestamp;
        timersRef.current.nextminesSpawnInterval = timeLeft < 15 ? 450 : 1100; // a bit faster
      }

      // ## GAMEPLAY CHANGE: Spawn Bombs more frequently ##
      if (timestamp - timersRef.current.lastBombSpawn > timersRef.current.nextBombSpawnInterval) {
        createItem('bomb');
        timersRef.current.lastBombSpawn = timestamp;
        timersRef.current.nextBombSpawnInterval = (Math.random() * 800) + (timeLeft < 15 ? 450 : 1200);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [screen, timeLeft]);

  return (
    <div className="relative w-full max-w-lg min-h-[450px] flex flex-col items-center justify-center text-center bg-purple-100 rounded-2xl p-4 font-['Poppins'] text-gray-800">
      
      {screen === 'result' && (
        <button onClick={onGameEnd} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
      
      {screen === 'ready' && (
        <div className="flex flex-col items-center justify-center animate-fade-in w-full">
          <h2 className="text-3xl font-bold text-purple-800">Get Ready...</h2>
           <img src={blueImg} alt="mines" className="h-32 w-32 object-contain my-8" />
          <button onClick={handleStartGame} className="w-full max-w-xs px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-bold text-xl transition-transform duration-200 ease-in-out hover:scale-105">
            Start Game
          </button>
        </div>
      )}

      {screen === 'playing' && (
        <div className="absolute inset-0 w-full h-full bg-purple-200 rounded-lg overflow-hidden">
          <div className="absolute top-2 left-3 bg-purple-900/50 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">Time: {timeLeft}s</div>
          <div className="absolute top-2 right-3 bg-purple-900/50 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">Score: {score}</div>
          {itemsOnScreen.map(item => (
            <div key={item.id} className="absolute w-20 h-20 cursor-pointer transition-transform duration-300 hover:scale-125 animate-fade-in" style={{ top: `${item.y}%`, left: `${item.x}%`, transform: `rotate(${item.rotation}deg)` }} onClick={() => handleCatchItem(item)}>
              <img src={item.src} alt={item.alt} />
            </div>
          ))}
        </div>
      )}
      
      {screen === 'result' && (
        <div className="flex flex-col items-center justify-center px-4 w-full">
          <h1 className="text-3xl font-bold mb-2 text-purple-800">Game Over!</h1>
          <p className="text-xl text-gray-600 mb-6">Your final score: <span className="font-bold text-purple-600">{score}</span></p>

          {score > 0 ? (
            <div className="w-full max-w-sm">
              {!submissionResult ? (
                <>
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Submit your score to save your points!</h2>
                  <button onClick={handleSubmitScore} disabled={isSubmitting} className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-semibold text-lg transition-all duration-200 ease-in-out disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : 'Submit Score'}
                  </button>
                  {submissionStatus && <p className="text-sm text-gray-500 mt-3 animate-pulse">{submissionStatus}</p>}
                </>
              ) : (
                <div className='text-center mt-4 p-4 bg-green-100 rounded-lg'>
                  <h3 className='text-lg font-semibold text-green-800'>Success!</h3>
                  <p className='text-sm text-green-700 mt-1 break-words'>{submissionResult.message}</p>
                  
                  <p className='text-xs text-gray-600 mt-4 border-t border-gray-300 pt-2'>
                    Your points have been successfully saved.
                  </p>

                  <button onClick={handleShareToFarcaster} disabled={isSharing} className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-semibold transition-transform duration-200 ease-in-out hover:scale-105 disabled:bg-purple-400">
                    {isSharing ? 'Opening Composer...' : 'Share Your Score!'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">You scored 0. Try again to earn points!</p>
          )}

          {submissionError && (
            <div className='text-center mt-4 p-4 bg-red-100 rounded-lg w-full max-w-sm'>
                <h3 className='text-lg font-semibold text-red-800'>Error</h3>
                <p className='text-sm text-red-700 mt-1'>{submissionError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}