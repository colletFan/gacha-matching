export const generateDerangement = (length) => {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};

export const hasPairSwap = (matching) => {
  for (let i = 0; i < matching.length; i++) {
    const target = matching[i];
    if (matching[target] === i) return true;
  }
  return false;
};

export const generateMatching = (names, allowPairSwap) => {
  const n = names.length;
  if (n <= 1) return [];

  let matching = [];
  let attempts = 0;

  while (attempts < 1000) {
    matching = generateDerangement(n);
    
    if (!allowPairSwap && n > 2) {
      if (!hasPairSwap(matching)) {
        break;
      }
    } else {
      break;
    }
    attempts++;
  }

  if (attempts >= 1000) {
    console.warn("Max retries exceeded for derangement without pair swap. Fallback to any derangement.");
    matching = generateDerangement(n); // fallback
  }

  return matching;
};
