import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SudokuGridProps {
  grid: number[][];
  onCellChange?: (row: number, col: number, value: number) => void;
  fixedCells?: boolean[][];
  showValidation?: boolean;
  isSolving?: boolean;
  className?: string;
}

const FILLER_9X9 = Array.from({ length: 9 }, () => Array(9).fill(0));

const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  onCellChange,
  fixedCells,
  showValidation = false,
  isSolving = false,
  className = '',
}) => {
  const [flashStates, setFlashStates] = useState<{[key: string]: boolean}>({}); // only error state now
  const [cellStates, setCellStates] = useState<{ isFixed: boolean }[][]>([]);

  // Normalize grid to always 9x9
  const normalizedGrid: number[][] = useMemo(() => {
    if (!Array.isArray(grid) || grid.length !== 9) return FILLER_9X9;
    return grid.map((row) => (Array.isArray(row) && row.length === 9 ? row : Array(9).fill(0)));
  }, [grid]);

  // Compose fixed matrix
  useEffect(() => {
    const states = normalizedGrid.map((row, rowIdx) =>
      row.map((cell, colIdx) => ({
        isFixed: fixedCells ? !!fixedCells[rowIdx]?.[colIdx] : cell !== 0,
      }))
    );
    setCellStates(states);
  }, [normalizedGrid, fixedCells]);

  // Check if a given value at (row, col) is valid (basic Sudoku rules)
  const isValidValue = (row: number, col: number, value: number): boolean => {
    if (value === 0) return true;
    for (let c = 0; c < 9; c++) {
      if (c !== col && normalizedGrid[row][c] === value) return false;
    }
    for (let r = 0; r < 9; r++) {
      if (r !== row && normalizedGrid[r][col] === value) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && normalizedGrid[r][c] === value) return false;
      }
    }
    return true;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (cellStates[row]?.[col]?.isFixed || isSolving) return;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (onCellChange && numValue >= 0 && numValue <= 9) {
      onCellChange(row, col, numValue);
      // Validate and persist error if wrong for this cell
      if (showValidation && numValue !== 0) {
        const isValid = isValidValue(row, col, numValue);
        const key = `${row}-${col}`;
        setFlashStates((prev) => ({ ...prev, [key]: !isValid })); // only set error true/false
      } else if (numValue === 0) {
        // If cleared, clear error
        const key = `${row}-${col}`;
        setFlashStates((prev) => {
          const p = { ...prev };
          delete p[key];
          return p;
        });
      }
    }
  };

  const getCellClassName = (row: number, col: number): string => {
    const cellKey = `${row}-${col}`;
    const error = !!flashStates[cellKey];
    const isFixed = cellStates[row]?.[col]?.isFixed;
    let base =
      'sudoku-cell text-center transition-all duration-150 outline-none ring-0 ring-primary-500 text-base';
    if (isFixed) {
      base += ' bg-sudoku-cell-fixed text-gray-700 cursor-not-allowed font-bold';
    } else {
      base +=
        ' bg-white hover:bg-sudoku-cell-hover focus:bg-sudoku-cell-hover text-primary-700';
    }
    if (error) base += ' animate-flash-red bg-red-100 border-red-300 text-red-700';
    return base;
  };

  const getWrapperClassName = (row: number, col: number): string => {
    let cn = '';
    if (row % 3 === 0) cn += ' border-t-2';
    if (col % 3 === 0) cn += ' border-l-2';
    if (row === 8) cn += ' border-b-2';
    if (col === 8) cn += ' border-r-2';
    return (
      'border border-gray-300 bg-white box-border flex items-center justify-center' + cn
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sudoku-grid bg-white p-4 rounded-xl shadow-lg ${className}`}
      style={{ display: 'inline-block' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 42px)',
          gridTemplateRows: 'repeat(9, 42px)',
          gap: '0px',
          background: 'white',
        }}
      >
        {normalizedGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getWrapperClassName(rowIndex, colIndex)}
              style={{ width: '42px', height: '42px', boxSizing: 'border-box' }}
            >
              <input
                type="text"
                value={cell === 0 ? '' : cell.toString()}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                readOnly={isSolving || cellStates[rowIndex]?.[colIndex]?.isFixed}
                inputMode="numeric"
                maxLength={1}
                className={getCellClassName(rowIndex, colIndex)}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
              />
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SudokuGrid;
