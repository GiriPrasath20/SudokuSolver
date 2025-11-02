import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Welcome to{' '}
          <span className="text-primary-600 dark:text-primary-400">Sudoku Solver</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Challenge your mind with our interactive Sudoku puzzles or solve your own!
          Choose from playing a random puzzle or inputting your own to solve.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Play Random Sudoku */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Play Random Sudoku
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get a fresh, randomly generated Sudoku puzzle to solve. 
              Perfect your skills with different difficulty levels!
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/play"
                className="btn-primary inline-block w-full"
              >
                Start Playing
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Solve My Sudoku */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Solve My Sudoku
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Got a Sudoku puzzle you can't solve? Input your puzzle 
              and let our smart algorithm solve it for you!
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/solve"
                className="btn-primary inline-block w-full"
              >
                Solve Puzzle
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Features
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Fast Solving</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Lightning-fast backtracking algorithm</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Smart Validation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Real-time input validation with visual feedback</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Responsive Design</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Works perfectly on all devices</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
