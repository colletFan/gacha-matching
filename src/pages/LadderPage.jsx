import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData, saveData } from '../utils/storage';
import { generateMatching } from '../utils/matchingLogic';
import Ladder from '../components/Ladder';
import ResultModal from '../components/ResultModal';
import styles from './LadderPage.module.css';

const LadderPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  // Track if any animation is currently running to block multiple clicks
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    if (!loaded || !loaded.names || loaded.mode !== 'ladder') {
      navigate('/');
      return;
    }
    setData(loaded);
  }, [navigate]);

  if (!data) return null;

  const handleBack = () => {
    navigate('/');
  };

  const handleRetry = () => {
    const newMatching = generateMatching(data.names, data.allowPairSwap);
    const newData = {
      ...data,
      matching: newMatching,
      ladderProgress: Array(data.names.length).fill(false)
    };
    saveData(newData);
    setData(newData);
    setIsAnimating(false);
    setShowResult(false);
  };

  const handlePathClick = (idx) => {
    setIsAnimating(true);
    
    // Set this index as 'progress' true
    const newProgress = [...data.ladderProgress];
    newProgress[idx] = true;
    const newData = { ...data, ladderProgress: newProgress };
    saveData(newData);
    setData(newData);

    // Wait for the animation to finish (1.5s path drawing + 0.5s result pop)
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>← 설정으로</button>
        <h1 className={styles.title}>사다리 매칭</h1>
        <div className={styles.spacer}></div>
      </header>

      <Ladder 
        names={data.names}
        matching={data.matching}
        progress={data.ladderProgress}
        onPathClick={handlePathClick}
        disabled={isAnimating}
      />

      <div className={styles.controls}>
        <button className={styles.resultBtn} onClick={() => setShowResult(true)}>
          결과 보기
        </button>
        <button className={styles.retryBtn} onClick={handleRetry} disabled={isAnimating}>
          다시하기
        </button>
      </div>

      {showResult && (
        <ResultModal 
          result={data.matching} 
          names={data.names} 
          onClose={() => setShowResult(false)} 
        />
      )}
    </div>
  );
};

export default LadderPage;
