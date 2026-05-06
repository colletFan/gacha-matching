export const generateLadder = (matching) => {
  const n = matching.length;
  let target = [...matching];
  let lines = [];

  // Bubble sort to find adjacent swap sequence
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (target[j] > target[j + 1]) {
        // Swap
        let temp = target[j];
        target[j] = target[j + 1];
        target[j + 1] = temp;
        
        lines.push({ col: j });
      }
    }
  }

  // Convert to ladder format with sequential rows
  return lines.map((line, idx) => ({
    row: idx,
    col: line.col
  }));
};
