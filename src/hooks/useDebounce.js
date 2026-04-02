import { useState, useEffect } from "react";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // set a timer to update debounced value after delay
    const timer = setTimeout(() => setDebounced(value), delay);
    // if value changes before delay, cancel the previous timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;