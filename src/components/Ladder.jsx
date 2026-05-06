import React, { useMemo, useState, useEffect } from 'react';
import { generateLadder } from '../utils/ladderGenerator';
import styles from './Ladder.module.css';

const COL_WIDTH = 100;
const ROW_HEIGHT = 40;
const TOP_PADDING = 60;
const BOTTOM_PADDING = 60;

const Ladder = ({ names, matching, progress, onPathClick, disabled }) => {
  const n = names.length;
  const lines = useMemo(() => generateLadder(matching), [matching]);
  const maxRow = lines.length;
  
  const width = n * COL_WIDTH;
  const height = TOP_PADDING + maxRow * ROW_HEIGHT + BOTTOM_PADDING;

  // Pre-calculate paths for each starting index
  const paths = useMemo(() => {
    const calculatedPaths = [];
    
    for (let startIdx = 0; startIdx < n; startIdx++) {
      let currentCol = startIdx;
      let horizontalMoves = 0;
      let d = `M ${(currentCol + 0.5) * COL_WIDTH} 0`;
      d += ` L ${(currentCol + 0.5) * COL_WIDTH} ${TOP_PADDING}`;
      
      for (let row = 0; row < maxRow; row++) {
        const line = lines.find(l => l.row === row);
        if (line) {
          const y = TOP_PADDING + (row + 0.5) * ROW_HEIGHT;
          // draw down to the line's Y
          d += ` L ${(currentCol + 0.5) * COL_WIDTH} ${y}`;
          
          if (line.col === currentCol) {
            currentCol += 1;
            horizontalMoves += 1;
            d += ` L ${(currentCol + 0.5) * COL_WIDTH} ${y}`;
          } else if (line.col === currentCol - 1) {
            currentCol -= 1;
            horizontalMoves += 1;
            d += ` L ${(currentCol + 0.5) * COL_WIDTH} ${y}`;
          }
        }
      }
      
      // Draw to the bottom
      d += ` L ${(currentCol + 0.5) * COL_WIDTH} ${height}`;
      const totalLength = height + horizontalMoves * COL_WIDTH;
      calculatedPaths.push({ d, endCol: currentCol, totalLength });
    }
    
    return calculatedPaths;
  }, [n, lines, height]);

  // Color palette for paths
  const colors = ['#ff007f', '#00d2ff', '#ffd700', '#00ff00', '#ff8c00', '#ff00ff', '#00ffff', '#fff'];

  return (
    <div className={styles.ladderWrapper}>
      <svg className={styles.ladderSvg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Draw vertical base lines */}
        {Array.from({ length: n }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={(i + 0.5) * COL_WIDTH}
            y1={TOP_PADDING}
            x2={(i + 0.5) * COL_WIDTH}
            y2={height - BOTTOM_PADDING}
            className={styles.baseLine}
          />
        ))}

        {/* Draw horizontal base lines */}
        {lines.map((line, i) => {
          const y = TOP_PADDING + (line.row + 0.5) * ROW_HEIGHT;
          return (
            <line
              key={`h-${i}`}
              x1={(line.col + 0.5) * COL_WIDTH}
              y1={y}
              x2={(line.col + 1.5) * COL_WIDTH}
              y2={y}
              className={styles.baseLine}
            />
          );
        })}

        {/* Draw active paths */}
        {paths.map((p, i) => (
          progress[i] && (
            <path
              key={`p-${i}`}
              d={p.d}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className={styles.activePath}
              style={{
                strokeDasharray: p.totalLength,
                strokeDashoffset: p.totalLength,
              }}
            />
          )
        ))}

        {/* Draw Top Names */}
        {names.map((name, i) => (
          <g 
            key={`top-${i}`} 
            className={`${styles.topNameBtn} ${progress[i] ? styles.done : ''} ${disabled && !progress[i] ? styles.disabled : ''}`}
            onClick={() => {
              if (!disabled && !progress[i]) onPathClick(i);
            }}
          >
            <rect 
              x={i * COL_WIDTH + 10} 
              y={10} 
              width={COL_WIDTH - 20} 
              height={40} 
              rx="8" 
              fill={progress[i] ? colors[i % colors.length] : 'rgba(255,255,255,0.1)'} 
            />
            <text 
              x={(i + 0.5) * COL_WIDTH} 
              y={35} 
              textAnchor="middle" 
              fill={progress[i] ? '#000' : '#fff'}
              fontWeight="bold"
            >
              {name}
            </text>
          </g>
        ))}

        {/* Draw Bottom Names */}
        {paths.map((p, i) => {
          const isRevealed = progress[i];
          const receiverName = names[matching[i]];
          // The final position of path i is p.endCol
          return (
            <g key={`bot-${p.endCol}`} className={isRevealed ? styles.popResult : styles.hiddenResult}>
              <rect
                x={p.endCol * COL_WIDTH + 10}
                y={height - 50}
                width={COL_WIDTH - 20}
                height={40}
                rx="8"
                fill={colors[i % colors.length]}
              />
              <text
                x={(p.endCol + 0.5) * COL_WIDTH}
                y={height - 25}
                textAnchor="middle"
                fill="#000"
                fontWeight="bold"
              >
                {receiverName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Ladder;
