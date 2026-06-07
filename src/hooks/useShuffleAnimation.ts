import { useState, useCallback } from 'react';

export function useShuffleAnimation() {
  const [shuffling, setShuffling] = useState(false);
  const [complete, setComplete] = useState(false);

  const startShuffle = useCallback(() => {
    setShuffling(true);
    setComplete(false);
  }, []);

  const onShuffleComplete = useCallback(() => {
    setShuffling(false);
    setComplete(true);
  }, []);

  const reset = useCallback(() => {
    setShuffling(false);
    setComplete(false);
  }, []);

  return { shuffling, complete, startShuffle, onShuffleComplete, reset };
}
