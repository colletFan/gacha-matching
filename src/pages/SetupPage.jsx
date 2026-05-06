import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMatching } from '../utils/matchingLogic';
import { saveData, loadData } from '../utils/storage';
import styles from './SetupPage.module.css';

const SetupPage = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState(Array(4).fill(''));
  const [allowPairSwap, setAllowPairSwap] = useState(true);
  const [mode, setMode] = useState('slot');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // 이전 설정값 복원
    const prevData = loadData();
    if (prevData) {
      if (prevData.names) setNames(prevData.names);
      if (prevData.allowPairSwap !== undefined) setAllowPairSwap(prevData.allowPairSwap);
      if (prevData.mode) setMode(prevData.mode);
    }
  }, []);

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
    setErrorMsg('');
  };

  const handleCountChange = (delta) => {
    const newCount = names.length + delta;
    if (newCount >= 2 && newCount <= 10) {
      if (delta > 0) {
        setNames([...names, '']);
      } else {
        setNames(names.slice(0, newCount));
      }
      setErrorMsg('');
    }
  };

  const validate = () => {
    if (names.some(name => name.trim() === '')) {
      return '모든 참가자의 이름을 입력해주세요';
    }
    const uniqueNames = new Set(names.map(n => n.trim()));
    if (uniqueNames.size !== names.length) {
      return '중복된 이름이 있습니다';
    }
    if (names.length === 2 && !allowPairSwap) {
      return '2명일 경우 쌍방 교환 비허용은 불가능합니다';
    }
    return '';
  };

  const handleStart = () => {
    const error = validate();
    if (error) {
      setErrorMsg(error);
      return;
    }

    const trimmedNames = names.map(n => n.trim());
    const matching = generateMatching(trimmedNames, allowPairSwap);

    const payload = {
      names: trimmedNames,
      allowPairSwap,
      mode,
      matching,
      slotProgress: Array(trimmedNames.length).fill(false),
      ladderProgress: Array(trimmedNames.length).fill(false)
    };

    saveData(payload);
    navigate(`/${mode}`);
  };

  const isValid = !names.some(n => n.trim() === '') && 
                  (new Set(names.map(n => n.trim())).size === names.length) &&
                  !(names.length === 2 && !allowPairSwap);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>가챠 매칭 설정</h1>

      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>인원수 설정</h2>
            <div className={styles.counter}>
              <button onClick={() => handleCountChange(-1)} disabled={names.length <= 2}>-</button>
              <span className={styles.count}>{names.length}명</span>
              <button onClick={() => handleCountChange(1)} disabled={names.length >= 10}>+</button>
            </div>
          </div>
          
          <div className={styles.nameList}>
            {names.map((name, i) => (
              <input
                key={i}
                type="text"
                placeholder={`참가자 ${i + 1} 이름 입력`}
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                maxLength={10}
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>쌍방 교환 허용</h2>
          <p className={styles.desc}>
            A→B, B→A, C→D, D→C처럼 두 명끼리만 서로 교환되는 경우를 허용할지 설정합니다. 비허용 시 더 다양하게 섞입니다.
          </p>
          <div className={styles.radioGroup}>
            <label className={`${styles.radio} ${allowPairSwap ? styles.active : ''}`}>
              <input 
                type="radio" 
                checked={allowPairSwap} 
                onChange={() => { setAllowPairSwap(true); setErrorMsg(''); }} 
              />
              허용
            </label>
            <label className={`${styles.radio} ${!allowPairSwap ? styles.active : ''} ${names.length === 2 ? styles.disabled : ''}`}>
              <input 
                type="radio" 
                checked={!allowPairSwap} 
                onChange={() => { if(names.length > 2) setAllowPairSwap(false); }}
                disabled={names.length === 2}
              />
              비허용
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2>연출 방식</h2>
          <div className={styles.radioGroup}>
            <label className={`${styles.radio} ${mode === 'slot' ? styles.active : ''}`}>
              <input 
                type="radio" 
                checked={mode === 'slot'} 
                onChange={() => setMode('slot')} 
              />
              슬롯머신
            </label>
            <label className={`${styles.radio} ${mode === 'ladder' ? styles.active : ''}`}>
              <input 
                type="radio" 
                checked={mode === 'ladder'} 
                onChange={() => setMode('ladder')} 
              />
              사다리
            </label>
          </div>
        </div>

        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
        {(!isValid && !errorMsg) && <div className={styles.error}>{validate()}</div>}

        <button 
          className={styles.startButton} 
          onClick={handleStart}
          disabled={!isValid}
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default SetupPage;
