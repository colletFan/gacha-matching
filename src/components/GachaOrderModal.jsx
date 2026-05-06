import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GachaOrderModal.module.css';

const ROW_HEIGHT = 52;  // row height in px
const ROW_GAP = 12;     // gap between rows in px
const ROW_STEP = ROW_HEIGHT + ROW_GAP; // total step per row

const GachaOrderModal = ({ result, names, gachaOrder, onOrderDecided, onClose }) => {
  // Phase: 'idle' | 'rolling' | 'revealed' | 'reordering' | 'done'
  const [phase, setPhase] = useState('idle');
  const [displayNumbers, setDisplayNumbers] = useState([]);
  const [finalOrder, setFinalOrder] = useState(null);
  // positionMap[i] = which visual position row i occupies (0-based from top)
  const [positionMap, setPositionMap] = useState(null);
  const intervalRef = useRef(null);

  const n = result ? result.length : 0;

  // Build position map from order array: order[i] = 1-based order number for row i
  const buildPositionMap = useCallback((order) => {
    // order[i] is the 1-based rank for row i
    // We want positionMap[i] = visual position (0-based) = order[i] - 1
    const map = order.map(o => o - 1);
    return map;
  }, []);

  // Initialize based on existing gachaOrder
  useEffect(() => {
    if (gachaOrder) {
      setFinalOrder(gachaOrder);
      setPositionMap(buildPositionMap(gachaOrder));
      setPhase('done');
    } else {
      setDisplayNumbers(Array(n).fill('?'));
      // Default position: row i at position i
      setPositionMap(Array.from({ length: n }, (_, i) => i));
      setPhase('idle');
    }
  }, [gachaOrder, n, buildPositionMap]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const generateRandomOrder = useCallback(() => {
    // Create array [1, 2, 3, ..., n] and shuffle (Fisher-Yates)
    const order = Array.from({ length: n }, (_, i) => i + 1);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [n]);

  const handleDecideOrder = () => {
    if (phase === 'rolling') return;

    // Reset positions to original order before starting
    setPositionMap(Array.from({ length: n }, (_, i) => i));
    setPhase('rolling');

    // Start rolling animation
    intervalRef.current = setInterval(() => {
      const randomNums = Array.from({ length: n }, () =>
        Math.floor(Math.random() * n) + 1
      );
      setDisplayNumbers(randomNums);
    }, 50);

    // After 1.5s, stop and reveal
    setTimeout(() => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      const order = generateRandomOrder();
      setFinalOrder(order);
      setDisplayNumbers(order);
      setPhase('revealed');

      // After 0.5s, reorder by moving rows to their sorted positions
      setTimeout(() => {
        setPositionMap(buildPositionMap(order));
        setPhase('reordering');

        // After reorder animation completes (0.5s transition)
        setTimeout(() => {
          setPhase('done');
          onOrderDecided(order);
        }, 600);
      }, 500);
    }, 1500);
  };

  if (!result || result.length === 0) return null;

  const isOrderDecided = phase === 'done' && finalOrder;
  const buttonLabel = isOrderDecided ? '다시 순서 정하기' : '순서 정하기';
  const isButtonDisabled = phase === 'rolling' || phase === 'revealed' || phase === 'reordering';

  const getOrderDisplay = (idx) => {
    if (phase === 'idle') return '?';
    if (phase === 'rolling') return displayNumbers[idx] || '?';
    if (finalOrder) return finalOrder[idx];
    return '?';
  };

  const listHeight = n * ROW_STEP - ROW_GAP; // total height without trailing gap

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.title}>가챠 순서</h2>
        <div className={styles.divider}></div>

        <div
          className={styles.resultList}
          style={{ height: `${listHeight}px`, position: 'relative' }}
        >
          {result.map((targetIdx, i) => {
            const visualPos = positionMap ? positionMap[i] : i;
            const topPx = visualPos * ROW_STEP;
            const shouldAnimate = phase === 'reordering' || phase === 'done';

            return (
              <div
                key={i}
                className={styles.resultRow}
                style={{
                  position: 'absolute',
                  top: `${topPx}px`,
                  left: 0,
                  right: 0,
                  height: `${ROW_HEIGHT}px`,
                  transition: shouldAnimate
                    ? 'top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'none',
                }}
              >
                <div className={styles.matchInfo}>
                  <span className={styles.giver}>{names[i]}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.receiver}>{names[targetIdx]}</span>
                </div>
                <div className={`${styles.orderBadge} ${
                  phase === 'rolling' ? styles.rolling : ''
                } ${
                  (phase === 'revealed' || phase === 'reordering' || phase === 'done') && finalOrder ? styles.revealed : ''
                }`}>
                  {getOrderDisplay(i)}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.divider}></div>

        <button
          className={styles.decideButton}
          onClick={handleDecideOrder}
          disabled={isButtonDisabled}
        >
          {buttonLabel}
        </button>

        <button className={styles.confirmButton} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default GachaOrderModal;
