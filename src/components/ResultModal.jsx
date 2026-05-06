import React from 'react';
import styles from './ResultModal.module.css';

const ResultModal = ({ result, names, onClose }) => {
  if (!result || result.length === 0) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.title}>매칭 결과</h2>
        <div className={styles.divider}></div>
        <div className={styles.resultList}>
          {result.map((targetIdx, i) => (
            <div key={i} className={styles.resultRow}>
              <span className={styles.giver}>{names[i]}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.receiver}>{names[targetIdx]}</span>
            </div>
          ))}
        </div>
        <div className={styles.divider}></div>
        <button className={styles.confirmButton} onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default ResultModal;
