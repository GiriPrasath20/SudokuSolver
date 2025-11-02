import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SudokuGrid from '../components/SudokuGrid'
import { sudokuAPI } from '../services/api'

const Solve = () => {
  const [grid, setGrid] = useState<number[][]>([])
  const [undoStack, setUndoStack] = useState<number[][][]>([])
  const [originalGrid, setOriginalGrid] = useState<number[][]>([])
  const [solvedGrid, setSolvedGrid] = useState<number[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const [message, setMessage] = useState('')
  const [hasSolution, setHasSolution] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  // Initialize empty grid
  const initializeEmptyGrid = () => {
    return Array(9).fill(null).map(() => Array(9).fill(0))
  }

  // Override: in this mode, ALL cells are editable, so use an always-false fixedCells
  const alwaysEditable = Array(9).fill(null).map(() => Array(9).fill(false))

  // Handle cell change
  const handleCellChange = (row: number, col: number, value: number) => {
    if (isSolving) return
    
    const newGrid = [...grid]
    newGrid[row][col] = value
    setGrid(newGrid)
    setUndoStack(stack => [...stack, newGrid.map(r => [...r])])
    setHasSolution(false)
    setShowSolution(false)
    setMessage('')
  }

  // Add Undo function
  const handleUndo = () => {
    setUndoStack(stack => {
      if (stack.length <= 1) return stack
      const next = stack.slice(0, -1)
      setGrid(next[next.length - 1].map(row => [...row]))
      return next
    })
    setHasSolution(false)
    setShowSolution(false)
    setMessage('')
  }

  // Solve the puzzle
  const solvePuzzle = async () => {
    // Check if grid is empty
    const isEmpty = grid.every(row => row.every(cell => cell === 0))
    if (isEmpty) {
      setMessage('Please enter some numbers in the grid first!')
      return
    }

    setIsSolving(true)
    setMessage('')
    
    try {
      const response = await sudokuAPI.solveSudoku(grid)
      
      if (response.data.success) {
        setSolvedGrid(response.data.grid)
        setHasSolution(true)
        setShowSolution(true)
        setMessage('Puzzle solved successfully! 🎉')
      } else {
        setMessage(response.data.message || 'This puzzle cannot be solved.')
        setHasSolution(false)
        setShowSolution(false)
      }
    } catch (error) {
      console.error('Error solving puzzle:', error)
      setMessage('Error solving puzzle. Please check your input and try again.')
      setHasSolution(false)
      setShowSolution(false)
    } finally {
      setIsSolving(false)
    }
  }

  // Clear the grid
  const clearGrid = () => {
    const emptyGrid = initializeEmptyGrid()
    setGrid(emptyGrid)
    setOriginalGrid(emptyGrid)
    setSolvedGrid(emptyGrid)
    setUndoStack([emptyGrid.map(row => [...row])])
    setHasSolution(false)
    setShowSolution(false)
    setMessage('')
  }

  // Reset to original input
  const resetToOriginal = () => {
    setGrid([...originalGrid.map(row => [...row])])
    setUndoStack([originalGrid.map(row => [...row])])
    setShowSolution(false)
    setMessage('')
  }

  // Show solution
  const toggleSolution = () => {
    if (hasSolution) {
      setShowSolution(!showSolution)
      setMessage(showSolution ? '' : 'Showing the solved puzzle!')
    }
  }

  // Initialize with empty grid
  useEffect(() => {
    const emptyGrid = initializeEmptyGrid()
    setGrid(emptyGrid)
    setOriginalGrid([...emptyGrid.map(row => [...row])])
    setUndoStack([emptyGrid.map(row => [...row])])
  }, [])

  // Do not auto-sync original grid while typing; keep user's initial snapshot

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Solve My Sudoku
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your Sudoku puzzle and let our algorithm solve it for you!
        </p>
      </motion.div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg text-center font-medium ${
            hasSolution 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
              : message.includes('Error') || message.includes('cannot be solved')
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
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
          onClick={solvePuzzle}
          disabled={isSolving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSolving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Solving...</span>
            </div>
          ) : (
            'Solve Puzzle'
          )}
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
        {hasSolution && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSolution}
            className={`${showSolution ? 'btn-secondary' : 'btn-primary'} bg-green-600 hover:bg-green-700`}
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetToOriginal}
          disabled={grid.every(row => row.every(cell => cell === 0))}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Input
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearGrid}
          className="btn-danger"
        >
          Clear All
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
          grid={showSolution ? solvedGrid : grid}
          onCellChange={handleCellChange}
          fixedCells={alwaysEditable}
          showValidation={false}
          isSolving={isSolving}
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
          How to Use
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Input Your Puzzle:</h4>
            <ul className="space-y-1">
              <li>• Click on any cell to enter numbers 1-9</li>
              <li>• Leave cells blank (0) for empty spaces</li>
              <li>• Enter all the given numbers from your puzzle</li>
              <li>• Use the arrow keys to navigate between cells</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Solving:</h4>
            <ul className="space-y-1">
              <li>• Click "Solve Puzzle" to find the solution</li>
              <li>• Our algorithm uses backtracking to find solutions</li>
              <li>• If multiple solutions exist, we'll find one</li>
              <li>• Invalid puzzles will show an error message</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Sample Puzzles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Need a Sample Puzzle?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Here are some sample puzzles you can try:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
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
              setGrid([...sampleGrid.map(row => [...row])])
              setOriginalGrid([...sampleGrid.map(row => [...row])])
              setUndoStack([...sampleGrid.map(row => [...row])])
              setHasSolution(false)
              setShowSolution(false)
              setMessage('Sample puzzle loaded! Click "Solve Puzzle" to see the solution.')
            }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 text-left"
          >
            <h4 className="font-medium text-gray-800 dark:text-gray-100">Easy Puzzle</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">A simple puzzle with many given numbers</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const sampleGrid = [
                [0, 0, 0, 6, 0, 0, 4, 0, 0],
                [7, 0, 0, 0, 0, 3, 6, 0, 0],
                [0, 0, 0, 0, 9, 1, 0, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 5, 0, 1, 8, 0, 0, 0, 3],
                [0, 0, 0, 3, 0, 6, 0, 4, 5],
                [0, 4, 0, 2, 0, 0, 0, 6, 0],
                [9, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 1, 0, 0]
              ]
              setGrid([...sampleGrid.map(row => [...row])])
              setOriginalGrid([...sampleGrid.map(row => [...row])])
              setUndoStack([...sampleGrid.map(row => [...row])])
              setHasSolution(false)
              setShowSolution(false)
              setMessage('Medium puzzle loaded! This one is a bit more challenging.')
            }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 text-left"
          >
            <h4 className="font-medium text-gray-800 dark:text-gray-100">Medium Puzzle</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">A more challenging puzzle with fewer clues</p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Solve
