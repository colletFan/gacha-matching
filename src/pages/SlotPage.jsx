import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData, saveData } from '../utils/storage';
import { generateMatching } from '../utils/matchingLogic';
import SlotRow from '../components/SlotRow';
import ResultModal from '../components/ResultModal';
import GachaOrderModal from '../components/GachaOrderModal';
import styles from './SlotPage.module.css';

const SlotPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showGachaOrder, setShowGachaOrder] = useState(false);

  // local states for spinning
  const [spinningIdxs, setSpinningIdxs] = useState([]);

  useEffect(() => {
    const loaded = loadData();
    if (!loaded || !loaded.names || loaded.mode !== 'slot') {
      navigate('/');
      return;
    }
    setData(loaded);
  }, [navigate]);

  // Memoize the names array so child components don't re-render
  // when other parts of data change (e.g., slotProgress)
  // Hooks must be called before any conditional return (Rules of Hooks)
  const stableNames = useMemo(() => data ? data.names : [], [data?.names]);

  const handleSpinStart = useCallback((idx) => {
    setSpinningIdxs(prev => [...prev, idx]);
  }, []);

  const handleSpinStop = useCallback((idx) => {
    setSpinningIdxs(prev => prev.filter(i => i !== idx));
    setData(prevData => {
      const newProgress = [...prevData.slotProgress];
      newProgress[idx] = true;
      const newData = { ...prevData, slotProgress: newProgress };
      saveData(newData);
      return newData;
    });
  }, []);

  if (!data) return null;

  const handleBack = () => {
    navigate('/');
  };

  const handleRetry = () => {
    const newMatching = generateMatching(data.names, data.allowPairSwap);
    const newData = {
      ...data,
      matching: newMatching,
      slotProgress: Array(data.names.length).fill(false),
      gachaOrder: null
    };
    saveData(newData);
    setData(newData);
    setSpinningIdxs([]);
    setShowResult(false);
  };

  const handleAutoPlay = () => {
    if (!data) return;
    const undoneIdxs = data.slotProgress
      .map((done, idx) => (!done ? idx : -1))
      .filter(idx => idx !== -1);
    setSpinningIdxs(prev => [...new Set([...prev, ...undoneIdxs])]);
  };

  const isAnySpinning = spinningIdxs.length > 0;
  const allDone = data.slotProgress.every(Boolean);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>← 설정으로</button>
        <h1 className={styles.title}>슬롯 매칭</h1>
        <div className={styles.spacer}></div>
      </header>

      <div className={styles.slotBoard}>
        {data.names.map((name, i) => (
          <SlotRow
            key={i}
            giverName={name}
            receiverName={data.names[data.matching[i]]}
            allNames={stableNames}
            isDone={data.slotProgress[i]}
            isSpinning={spinningIdxs.includes(i)}
            onSpinStart={() => handleSpinStart(i)}
            onSpinStop={() => handleSpinStop(i)}
            disabled={isAnySpinning}
          />
        ))}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.autoBtn}
          onClick={handleAutoPlay}
          disabled={isAnySpinning || allDone}
        >
          전체 한 번에 돌리기
        </button>

        <div className={styles.actionGroup}>
          <button className={styles.resultBtn} onClick={() => setShowResult(true)}>
            결과 보기
          </button>
          <button className={styles.orderBtn} onClick={() => setShowGachaOrder(true)}>
            가챠 순서 정하기
          </button>
          <button className={styles.retryBtn} onClick={handleRetry}>
            다시하기
          </button>
        </div>
      </div>

      {showResult && (
        <ResultModal
          result={data.matching}
          names={data.names}
          onClose={() => setShowResult(false)}
        />
      )}

      {showGachaOrder && (
        <GachaOrderModal
          result={data.matching}
          names={data.names}
          gachaOrder={data.gachaOrder || null}
          onOrderDecided={(order) => {
            const newData = { ...data, gachaOrder: order };
            saveData(newData);
            setData(newData);
          }}
          onClose={() => setShowGachaOrder(false)}
        />
      )}
    </div>
  );
};

export default SlotPage;
