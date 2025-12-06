// src/hooks/useLivesLocalStorage.ts (Final Robust Version)

import { useState } from 'react';


interface StoredData {
  lives: number;
  resetTimestamp: number;
}


const MAX_LIVES = 2; 
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;


const createDefaultState = (): StoredData => ({
  lives: MAX_LIVES,
  resetTimestamp: Date.now() + TWENTY_FOUR_HOURS_IN_MS,
});

export function useLivesLocalStorage(key: string) {
  const [storedValue, setStoredValue] = useState<StoredData>(() => {
    if (typeof window === 'undefined') {
      return createDefaultState();
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);

        
        if (
          typeof parsedItem === 'object' &&
          parsedItem !== null &&
          typeof parsedItem.lives === 'number' &&
          typeof parsedItem.resetTimestamp === 'number'
        ) {
          
          if (Date.now() >= parsedItem.resetTimestamp) {
            return createDefaultState(); 
          }
          return parsedItem as StoredData; 
        }
        
      }
    } catch (error) {
      console.error("Error reading or parsing localStorage, creating default state:", error);
    }
    
  
    return createDefaultState();
  });

  // This function updates the number of lives.
  const setValue = (value: number | ((val: number) => number)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue.lives) : value;
      
      const newValue: StoredData = { ...storedValue, lives: valueToStore };
      
      setStoredValue(newValue);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  // Return the lives count, the setter function, and the reset timestamp.
  return [storedValue.lives, setValue, storedValue.resetTimestamp] as const;
}