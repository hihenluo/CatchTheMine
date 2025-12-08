// src/components/Leaderboard.tsx

import { useState, useEffect } from 'react';

const API_URL = 'https://api.mines.xyz'; 

interface LeaderboardProps { isOpen: boolean; onClose: () => void; }


type Player = { 
    username: string; 
    score: number; 
    pfp: string | null; 
}

export function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
    const [data, setData] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            
            fetch(`${API_URL}/leaderboard`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Server responded with status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(leaderboardData => {
                    setData(leaderboardData);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch leaderboard:", err);
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <>
            <div onClick={onClose} className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
            <aside className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-900/80 backdrop-blur-xl z-50 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'transform-none' : 'translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Top Players</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {isLoading ? (<p className='text-center text-white/70'>Loading leaderboard...</p>) : (
                        <ol className="space-y-3">
                            {data.length > 0 ? (
                                data.map((player, index) => (
                                    <li key={player.username + index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-sm font-bold w-6 text-center text-white/50">{index + 1}</span>
                                            
                                            
                                            {player.pfp ? (
                                                <img src={player.pfp} alt={player.username} className="w-8 h-8 rounded-full bg-purple-400 object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">
                                                    {player.username.charAt(1) || '?'}
                                                </div>
                                            )}
                                            
                                            <span className="font-mono text-sm truncate">{player.username}</span>
                                        </div>
                                        <span className="font-bold text-lg text-purple-400">{player.score}</span>
                                    </li>
                                ))
                            ) : (<p className='text-center text-white/70'>No scores on the board yet. Be the first!</p>)}
                        </ol>
                    )}
                </div>
            </aside>
        </>
    );
}