import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const message = data?.detail || error.message
    console.error('API error:', status || 'no-status', message)
    return Promise.reject(error)
  }
)

export interface SudokuResponse {
  grid: number[][]
  success: boolean
  message: string
}

export interface SudokuRequest {
  grid: number[][]
}

// API functions
export const sudokuAPI = {
  // Solve a Sudoku puzzle
  solveSudoku: async (grid: number[][]): Promise<{ data: SudokuResponse }> => {
    const request: SudokuRequest = { grid }
    return await api.post('/solve', request)
  },

  // Generate a random Sudoku puzzle
  generatePuzzle: async (): Promise<{ data: SudokuResponse }> => {
    return await api.get('/generate')
  },

  // Health check
  healthCheck: async (): Promise<{ data: { message: string } }> => {
    return await api.get('/')
  },
}

export default api
