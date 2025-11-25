import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SudokuGrid from '../components/SudokuGrid'
import { sudokuAPI } from '../services/api'

const Play = () => {
  const [grid, setGrid] = useState<number[][]>(Array(9).fill(null).map(() => Array(9).fill(0)))
  const [originalGrid, setOriginalGrid] = useState<number[][]>([])
  const [fixedCells, setFixedCells] = useState<boolean[][]>(Array(9).fill(null).map(() => Array(9).fill(false)))
  const [undoStack, setUndoStack] = useState<number[][][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  // Generate new puzzle
  const generateNewPuzzle = async () => {
    setIsGenerating(true)
    setMessage('')
    setIsCompleted(false)
    
    try {
      const response = await sudokuAPI.generatePuzzle()
      
      if (response.data.success) {
        const newGrid = response.data.grid
        const newFixedCells = newGrid.map(row => 
          row.map(cell => cell !== 0)
        )
        
        setGrid(newGrid)
        setOriginalGrid([...newGrid.map(row => [...row])])
        setFixedCells(newFixedCells)
        setUndoStack([newGrid.map(row => [...row])])
        setMessage('New puzzle generated! Good luck!')
      } else {
        setMessage('Failed to generate puzzle. Please try again.')
      }
    } catch (error) {
      console.error('Error generating puzzle:', error)
      // Fallback to a safe sample so UI remains usable
      const sampleGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ]
      const sampleFixed = sampleGrid.map(row => row.map(cell => cell !== 0))
      setGrid(sampleGrid)
      setOriginalGrid(sampleGrid.map(r => [...r]))
      setFixedCells(sampleFixed)
      setUndoStack([sampleGrid.map(row => [...row])])
      setMessage('Loaded a fallback puzzle while the server request failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Check if puzzle is completed
  const checkCompletion = (currentGrid: number[][]) => {
    // Check if all cells are filled
    const isFilled = currentGrid.every(row => 
      row.every(cell => cell !== 0)
    )
    
    if (!isFilled) return false
    
    // Check if the solution is valid
    return isValidSudoku(currentGrid)
  }

  // Validate complete Sudoku
  const isValidSudoku = (grid: number[][]): boolean => {
    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set()
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col]
        if (value !== 0 && seen.has(value)) return false
        seen.add(value)
      }
    }
    
    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set()
      for (let row = 0; row < 9; row++) {
        const value = grid[row][col]
        if (value !== 0 && seen.has(value)) return false
        seen.add(value)
      }
    }
    
    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set()
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            const value = grid[row][col]
            if (value !== 0 && seen.has(value)) return false
            seen.add(value)
          }
        }
      }
    }
    
    return true
  }

  // Handle cell change
  const handleCellChange = (row: number, col: number, value: number) => {
    if (fixedCells[row][col]) return
    
    const newGrid = grid.map(r => [...r])
    newGrid[row][col] = value
    setGrid(newGrid)
    setUndoStack(stack => [...stack, newGrid.map(r => [...r])])
    
    // Check completion
    if (checkCompletion(newGrid)) {
      setIsCompleted(true)
      setMessage('🎉 Congratulations! You solved the puzzle!')
    } else {
      setIsCompleted(false)
      setMessage('')
    }
  }

  // Clear user inputs (keep original clues)
  const clearUserInputs = () => {
    setGrid(originalGrid.map(row => [...row]))
    setUndoStack([originalGrid.map(row => [...row])])
    setIsCompleted(false)
    setMessage('')
  }

  const handleUndo = () => {
    setUndoStack(stack => {
      if (stack.length <= 1) return stack
      const next = stack.slice(0, -1)
      setGrid(next[next.length - 1].map(row => [...row]))
      return next
    })
    setIsCompleted(false)
    setMessage('')
  }

  // Initialize with generated puzzle on first load
  useEffect(() => {
    generateNewPuzzle()
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Play Random Sudoku
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate a random Sudoku puzzle and test your solving skills!
        </p>
      </motion.div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg text-center font-medium ${
            isCompleted 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateNewPuzzle}
          disabled={isGenerating}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </div>
          ) : (
            'Generate New Puzzle'
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearUserInputs}
          disabled={grid.every(row => row.every(cell => cell === 0))}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear My Inputs
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUndo}
          disabled={undoStack.length <= 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo
        </motion.button>
      </motion.div>

      {/* Sudoku Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <SudokuGrid
          grid={grid}
          onCellChange={handleCellChange}
          fixedCells={fixedCells}
          showValidation={true}
          isSolving={false}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          How to Play
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Rules:</h4>
            <ul className="space-y-1">
              <li>• Fill in numbers 1-9 in each row, column, and 3x3 box</li>
              <li>• Each number can only appear once per row, column, and box</li>
              <li>• Gray cells are the original clues and cannot be changed</li>
              <li>• Invalid entries will flash red</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Tips:</h4>
            <ul className="space-y-1">
              <li>• Start with cells that have fewer possibilities</li>
              <li>• Look for numbers that can only go in one place</li>
              <li>• Use the elimination method for difficult puzzles</li>
              <li>• Take breaks if you get stuck!</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Play
