import React, { useRef, useEffect, useState } from 'react';
import styles from './SlotRow.module.css';

const SLOT_ITEM_HEIGHT = 50;

const SlotMachine = ({ names, targetName, isSpinning, isDone, onStop }) => {
  const stripRef = useRef(null);
  const reqRef = useRef(null);
  const isSpinningRef = useRef(false);

  // We generate a long list of names to scroll through.
  // The last item will be our targetName so we can stop on it.
  const [stripNames, setStripNames] = useState([]);

  // Keep spinning ref in sync
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    // Don't regenerate strip while spinning - this prevents the bug where
    // parent re-renders (from other slots finishing) cause name changes mid-spin
    if (isSpinningRef.current) return;

    // Generate a sequence of random names to spin through (e.g., 50 items)
    const shuffled = [];
    for (let i = 0; i < 40; i++) {
      shuffled.push(names[Math.floor(Math.random() * names.length)]);
    }
    shuffled.push(targetName); // Final stop
    setStripNames(shuffled);
  }, [names, targetName]);

  useEffect(() => {
    if (isSpinning && !isDone && stripNames.length > 0) {
      let startTime = null;
      const duration = 2500; // fixed 2.5 seconds for all
      const totalDist = (stripNames.length - 1) * SLOT_ITEM_HEIGHT;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        let progress = Math.min(elapsed / duration, 1);

        // easeOutQuart
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentY = -(totalDist * easeOut);

        if (stripRef.current) {
          stripRef.current.style.transform = `translateY(${currentY}px)`;
        }

        if (progress < 1) {
          reqRef.current = requestAnimationFrame(animate);
        } else {
          // Add a small bounce effect at the end
          if (stripRef.current) {
            stripRef.current.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            stripRef.current.style.transform = `translateY(-${totalDist}px)`;
          }
          setTimeout(() => {
            if (stripRef.current) {
              stripRef.current.style.transition = 'none';
            }
            onStop();
          }, 150);
        }
      };

      reqRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isSpinning, isDone, stripNames, onStop]);

  return (
    <div className={styles.slotWindow}>
      {(!isSpinning && !isDone) ? (
        <div className={styles.slotItem}>???</div>
      ) : (
        <div className={styles.slotStrip} ref={stripRef}>
          {stripNames.map((name, idx) => (
            <div
              key={idx}
              className={`${styles.slotItem} ${isDone && idx === stripNames.length - 1 ? styles.highlight : ''}`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SlotRow = ({ giverName, receiverName, allNames, isDone, isSpinning, onSpinStart, onSpinStop, disabled }) => {
  return (
    <div className={styles.rowContainer}>
      <div className={styles.giver}>{giverName}</div>
      <div className={styles.arrow}>→</div>
      <SlotMachine
        names={allNames}
        targetName={receiverName}
        isSpinning={isSpinning}
        isDone={isDone}
        onStop={onSpinStop}
      />
      <button
        className={styles.spinBtn}
        onClick={onSpinStart}
        disabled={disabled || isDone || isSpinning}
      >
        {isDone ? '완료' : '돌리기'}
      </button>
    </div>
  );
};

export default SlotRow;
