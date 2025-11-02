# SudokuSolver - Complete Technical Documentation

## Table of Contents
1. Project Overview
2. Architecture Overview
3. Backend Documentation
4. Frontend Documentation
5. Data Flow
6. Algorithms Explained
7. Component Details
8. API Endpoints
9. File Structure
10. Dependencies

---

## 1. PROJECT OVERVIEW

### What is SudokuSolver?
A full-stack web application that allows users to:
- Play randomly generated Sudoku puzzles
- Solve custom Sudoku puzzles using a backend algorithm
- Get real-time validation feedback
- Experience a modern, animated UI with dark mode support

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Python 3.8+ with FastAPI
- **HTTP Client**: Axios

---

## 2. ARCHITECTURE OVERVIEW

### High-Level Architecture
```
Browser (User)
    ↓
React Frontend (Port 5173)
    ↓ HTTP Requests
FastAPI Backend (Port 8000)
    ↓
Python Algorithms (solver.py, generator.py)
```

### Communication Flow
1. User interacts with React UI
2. React makes API calls to FastAPI backend
3. Backend processes requests using Sudoku algorithms
4. Backend returns JSON response
5. React updates UI with results

---

## 3. BACKEND DOCUMENTATION

### 3.1 File: `backend/main.py`

**Purpose**: FastAPI application server that handles HTTP requests

**Key Components**:

#### Import Statements
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
```
- `FastAPI`: Web framework for building APIs
- `HTTPException`: For error handling
- `CORSMiddleware`: Allows frontend (different port) to communicate with backend

#### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Why needed**: Browser security blocks requests between different origins (ports). This allows frontend on port 5173 to talk to backend on port 8000.

#### Data Models (Pydantic)
```python
class SudokuGrid(BaseModel):
    grid: List[List[int]]

class SudokuResponse(BaseModel):
    grid: List[List[int]]
    success: bool
    message: str = ""
```
**Purpose**: Type-safe data validation. Ensures incoming data matches expected format.

#### Endpoint: POST /solve
**Function**: `solve_sudoku(request: SudokuGrid)`

**Step-by-Step**:
1. Validates grid is 9x9
2. Validates all values are integers 0-9
3. Creates SudokuSolver instance
4. Makes copy of grid (doesn't modify original)
5. Calls `solver.solve(grid_copy)` - modifies copy
6. Returns solved grid or error message

**Code Flow**:
```python
solver = SudokuSolver()  # Create solver instance
grid_copy = [row[:] for row in request.grid]  # Deep copy
if solver.solve(grid_copy):  # Solve in place
    return SudokuResponse(grid=grid_copy, success=True, ...)
```

#### Endpoint: GET /generate
**Function**: `generate_sudoku()`

**Step-by-Step**:
1. Creates SudokuGenerator instance
2. Calls `generator.get_random_puzzle()`
3. Returns puzzle with some cells as 0 (empty)
4. Fallback: If generation fails, returns hardcoded sample puzzle

**Why fallback**: Puzzle generation can be slow/complex. Fallback ensures UI always works.

---

### 3.2 File: `backend/solver.py`

**Purpose**: Contains backtracking algorithm to solve Sudoku puzzles

#### Class: `SudokuSolver`

##### Method: `is_valid(grid, row, col, num)`
**Purpose**: Checks if placing number `num` at position (row, col) violates Sudoku rules

**Checks Three Things**:
1. **Row check**: No duplicate in same row
2. **Column check**: No duplicate in same column
3. **Box check**: No duplicate in 3x3 box containing that cell

**Box calculation**:
```python
start_row = row - row % 3  # Rounds down to nearest multiple of 3
start_col = col - col % 3  # Same for column
# Then checks 3x3 box starting at (start_row, start_col)
```

##### Method: `find_empty_cell(grid)`
**Purpose**: Finds first cell with value 0 (empty)
**Returns**: `(row, col)` tuple or `(-1, -1)` if grid is full

##### Method: `solve(grid)`
**Purpose**: Main backtracking algorithm - **CRITICAL METHOD**

**How Backtracking Works**:
1. Find empty cell
2. If no empty cell → puzzle solved! Return True
3. Try numbers 1-9:
   - If number is valid at that position:
     - Place number
     - Recursively try to solve rest of puzzle
     - If recursive call succeeds → Return True (solution found!)
     - If recursive call fails → Remove number (backtrack) and try next number
4. If no number works → Return False (unsolvable)

**Visual Example**:
```
Grid: [5][3][0][0][7][0]...
      [6][0][0][1][9][5]...
      ...
      
Step 1: Find empty at (0,2)
Step 2: Try 1 → Check if valid → Place → Recurse
Step 3: If recursion fails → Remove 1 → Try 2
Step 4: Continue until solution found or all numbers tried
```

**Why Backtracking?**: 
- Tries all possible combinations systematically
- Undoes mistakes when they lead to dead ends
- Guaranteed to find solution if one exists

##### Method: `count_solutions(grid, limit)`
**Purpose**: Counts how many solutions exist (up to limit)
**Use**: Ensures puzzle has unique solution before removing cells during generation

**How**: Similar to solve() but doesn't stop at first solution, counts all

---

### 3.3 File: `backend/generator.py`

**Purpose**: Generates valid Sudoku puzzles with unique solutions

#### Class: `SudokuGenerator`

##### Method: `generate_complete_sudoku()`
**Purpose**: Creates a fully solved 9x9 Sudoku grid

**Strategy**:
1. Fill diagonal 3x3 boxes first (they don't conflict)
2. Use solver to fill the rest

**Why diagonal boxes first?**: Diagonal boxes (top-left, center, bottom-right) are independent - no shared rows/columns.

##### Method: `generate_puzzle(difficulty)`
**Purpose**: Creates unsolved puzzle by removing numbers from complete grid

**Process**:
1. Generate complete solved grid
2. Determine cells to remove based on difficulty:
   - Easy: 35-45 empty cells
   - Medium: 46-55 empty cells
   - Hard: 56-64 empty cells
3. Randomly remove cells while ensuring unique solution
4. Return puzzle with some cells as 0

##### Method: `_create_puzzle(complete_grid, cells_to_remove)`
**Purpose**: Removes cells while maintaining unique solution

**Algorithm**:
```python
For each random position:
    1. Store original value
    2. Remove cell (set to 0)
    3. Check if puzzle still has unique solution
    4. If yes → keep removed
    5. If no → restore original value
```

**Why check uniqueness?**: A good Sudoku puzzle must have exactly ONE solution.

##### Method: `_has_unique_solution(grid)`
**Purpose**: Checks if puzzle has exactly one solution
**Implementation**: Uses `solver.count_solutions(grid, limit=2)`
- If count == 1 → unique
- If count >= 2 → multiple solutions

---

## 4. FRONTEND DOCUMENTATION

### 4.1 File Structure
```
frontend/
├── src/
│   ├── main.tsx          # Entry point, sets up React
│   ├── App.tsx           # Main app component, routing
│   ├── index.css         # Global styles, Tailwind setup
│   ├── components/
│   │   ├── Navbar.tsx    # Navigation bar with theme toggle
│   │   └── SudokuGrid.tsx # Reusable Sudoku grid component
│   ├── pages/
│   │   ├── Home.tsx      # Landing page
│   │   ├── Play.tsx      # Play random puzzles page
│   │   └── Solve.tsx     # Solve custom puzzles page
│   └── services/
│       └── api.ts        # API service layer
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

### 4.2 File: `frontend/src/main.tsx`

**Purpose**: Entry point that bootstraps React application

#### What Happens:
1. Imports React and ReactDOM
2. Creates theme context for dark mode
3. Renders App component into #root div in index.html

#### Theme System Explained:

**ThemeContext**:
```typescript
const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void }>(...)
```
- React Context API for sharing theme state globally
- Any component can access theme via `useTheme()` hook

**ThemeProvider Component**:
- Manages theme state (light/dark)
- Reads from localStorage or system preference
- Adds/removes 'dark' class on HTML element
- Saves preference to localStorage

**How Dark Mode Works**:
```typescript
useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');  // Tailwind uses this class
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}, [theme]);
```
- Tailwind CSS checks for `.dark` class on root element
- All `dark:` prefixed classes activate when class exists

**Component Tree**:
```
ReactDOM.createRoot()
  └── <React.StrictMode>
      └── <BrowserRouter>  // React Router for navigation
          └── <ThemeProvider>  // Provides theme context
              └── <App />  // Main app component
```

---

### 4.3 File: `frontend/src/App.tsx`

**Purpose**: Root component that sets up routing and layout

#### Component Structure:
```tsx
<div className="min-h-screen bg-gradient...">  // Background
    <Navbar />  // Always visible navigation
    <motion.main>  // Animated container
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/solve" element={<Solve />} />
        </Routes>
    </motion.main>
</div>
```

#### React Router:
- `Routes`: Container for route definitions
- `Route`: Maps URL path to component
- When user navigates, React Router renders matching component

#### Framer Motion:
```tsx
<motion.main
    initial={{ opacity: 0, y: 20 }}  // Start state
    animate={{ opacity: 1, y: 0 }}   // End state
    transition={{ duration: 0.5 }}   // Animation timing
>
```
- `initial`: Starting animation state (invisible, 20px down)
- `animate`: End state (visible, normal position)
- `transition`: How to animate between states
- Creates smooth fade-in and slide-up effect

---

### 4.4 File: `frontend/src/components/Navbar.tsx`

**Purpose**: Navigation bar with routing links and theme toggle

#### Key Features:

##### Navigation Items:
```typescript
const navItems = [
    { path: '/', label: 'Home' },
    { path: '/play', label: 'Play' },
    { path: '/solve', label: 'Solve' },
]
```

##### Active Tab Indicator:
```tsx
{isActive && (
    <motion.div
        layoutId="activeTab"  // Same ID = smooth transition
        className="absolute inset-0 bg-primary-100..."
    />
)}
<span className="relative z-10">{item.label}</span>
```
- `layoutId`: Framer Motion tracks element with same ID
- When active tab changes, background smoothly moves
- Creates sliding highlight effect

##### Theme Toggle Button:
```tsx
const { theme, setTheme } = useTheme();
const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
```
- Uses `useTheme()` hook from main.tsx
- Toggles between 'light' and 'dark'
- Icon changes based on current theme

---

### 4.5 File: `frontend/src/components/SudokuGrid.tsx`

**Purpose**: Reusable 9x9 Sudoku grid component

#### Props Interface:
```typescript
interface SudokuGridProps {
    grid: number[][];           // 9x9 array of numbers
    onCellChange?: (r, c, v) => void;  // Callback when cell changes
    fixedCells?: boolean[][];   // Which cells can't be edited
    showValidation?: boolean;   // Show red flash for invalid inputs
    isSolving?: boolean;         // Disable input while solving
    className?: string;          // Additional CSS classes
}
```

#### Key State Variables:

##### `flashStates`:
```typescript
const [flashStates, setFlashStates] = useState<{[key: string]: boolean}>({})
```
- Stores which cells have errors
- Key format: "row-col" (e.g., "2-5")
- Value: true = has error, false/undefined = no error

##### `cellStates`:
```typescript
const [cellStates, setCellStates] = useState<{ isFixed: boolean }[][]>([])
```
- Stores which cells are fixed (non-editable)
- Calculated from `fixedCells` prop or non-zero grid values

#### Grid Normalization:
```typescript
const normalizedGrid: number[][] = useMemo(() => {
    if (!Array.isArray(grid) || grid.length !== 9) return FILLER_9X9;
    return grid.map((row) => (Array.isArray(row) && row.length === 9 ? row : Array(9).fill(0)));
}, [grid]);
```
**Purpose**: Ensures grid is always exactly 9x9, even if malformed input
- `useMemo`: Only recalculates when `grid` changes (performance)

#### Validation Logic: `isValidValue()`

**Checks Three Rules**:
1. **Row**: No duplicate in row `row`
2. **Column**: No duplicate in column `col`
3. **3x3 Box**: No duplicate in box containing (row, col)

**Box Calculation**:
```typescript
const boxRow = Math.floor(row / 3) * 3;  // 0, 3, or 6
const boxCol = Math.floor(col / 3) * 3;  // 0, 3, or 6
```
- Divides row/col by 3, floors it, multiplies by 3
- Gives starting position of 3x3 box
- Example: row=5 → Math.floor(5/3)=1 → 1*3=3 (box starts at row 3)

#### Cell Change Handler: `handleCellChange()`

**Process**:
1. Check if cell is fixed or solving → return early
2. Convert string input to number (or 0 if empty)
3. Validate number is 0-9
4. Call parent's `onCellChange` callback
5. If validation enabled:
   - Check if value is valid
   - Store error state in `flashStates`
   - If cleared (value=0), remove error

#### CSS Class Generation: `getCellClassName()`

**Builds dynamic classes**:
- Base classes: sizing, centering, transitions
- If fixed: gray background, bold, not-allowed cursor
- If editable: white background, hover effects
- If error: red background, red text, flash animation

**Dark Mode Support**:
- Every class has `dark:` variant
- Example: `bg-white dark:bg-gray-900`

#### Grid Rendering:

**Structure**:
```tsx
<motion.div>  // Container with animation
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 42px)' }}>
        {normalizedGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
                <div className="wrapper">  // Cell container
                    <input />  // Actual input field
                </div>
            ))
        )}
    </div>
</motion.div>
```

**CSS Grid Layout**:
- `gridTemplateColumns: 'repeat(9, 42px)'`: 9 columns, each 42px wide
- `gridTemplateRows: 'repeat(9, 42px)'`: 9 rows, each 42px tall
- Creates perfect 9x9 grid

**Border Logic**: `getWrapperClassName()`
- Thicker borders every 3 cells (box boundaries)
- Creates visual separation of 3x3 boxes

---

### 4.6 File: `frontend/src/pages/Home.tsx`

**Purpose**: Landing page with feature cards

#### Features:
- Welcome message
- Two cards: "Play Random Sudoku" and "Solve My Sudoku"
- Feature section with icons
- All with Framer Motion animations
- Links to /play and /solve routes

---

### 4.7 File: `frontend/src/pages/Play.tsx`

**Purpose**: Page for playing randomly generated puzzles

#### State Management:

##### `grid`:
- Current state of puzzle (9x9 array)
- Updates when user types

##### `originalGrid`:
- Original puzzle from server
- Used for reset functionality

##### `fixedCells`:
- Boolean array marking which cells are clues (non-editable)
- True = clue (can't change), False = user input (can change)

##### `undoStack`:
- Array of grid states for undo functionality
- Each user action adds new state to stack
- Undo pops last state

##### `isGenerating`:
- Loading state while fetching new puzzle
- Shows spinner in button

##### `message`:
- Success/error messages to user
- Updates on completion, errors, etc.

##### `isCompleted`:
- Boolean tracking if puzzle is solved correctly
- Triggers congratulations message

#### Key Functions:

##### `generateNewPuzzle()`:
```typescript
1. Set loading state
2. Call API: sudokuAPI.generatePuzzle()
3. On success:
   - Update grid with puzzle
   - Mark non-zero cells as fixed
   - Save original grid for reset
   - Initialize undo stack
4. On error:
   - Use fallback sample puzzle
5. Clear loading state
```

##### `checkCompletion(grid)`:
```typescript
1. Check if all cells filled (no zeros)
2. If not filled → return false
3. Validate complete Sudoku using isValidSudoku()
4. Return true if valid and complete
```

##### `isValidSudoku(grid)`:
**Validates complete puzzle**:
- Each row has 1-9 exactly once
- Each column has 1-9 exactly once
- Each 3x3 box has 1-9 exactly once

**Implementation**:
- Uses Set to track seen numbers
- If any duplicate found → invalid
- All rows, columns, boxes must pass

##### `handleCellChange(row, col, value)`:
```typescript
1. Check if cell is fixed → return if so
2. Create new grid copy
3. Update cell value
4. Save to undo stack
5. Check if puzzle now complete
6. Update completion state
```

##### `clearUserInputs()`:
- Resets grid to original puzzle
- Removes all user inputs
- Keeps original clues

##### `handleUndo()`:
```typescript
1. Check if undo stack has more than 1 state
2. Remove last state from stack
3. Restore previous state
4. Clear completion message
```

#### useEffect Hook:
```typescript
useEffect(() => {
    generateNewPuzzle()
}, [])
```
- Runs once on component mount
- Automatically generates puzzle when page loads
- Empty dependency array = run once

---

### 4.8 File: `frontend/src/pages/Solve.tsx`

**Purpose**: Page for solving custom user-input puzzles

#### Differences from Play.tsx:

##### All Cells Editable:
```typescript
const alwaysEditable = Array(9).fill(null).map(() => Array(9).fill(false))
```
- Unlike Play mode, no cells are fixed
- User can input their entire puzzle

##### Additional State:

##### `solvedGrid`:
- Stores solution from backend
- Separate from user input grid

##### `hasSolution`:
- Whether backend returned valid solution

##### `showSolution`:
- Toggle to show/hide solved puzzle
- Allows user to compare their input with solution

#### Key Functions:

##### `solvePuzzle()`:
```typescript
1. Check if grid is empty → show message
2. Set loading state
3. Call API: sudokuAPI.solveSudoku(grid)
4. On success:
   - Store solution in solvedGrid
   - Set hasSolution = true
   - Show solution
   - Display success message
5. On error:
   - Show error message
   - Clear solution state
```

##### `toggleSolution()`:
- Switches between showing user input and solution
- Only works if `hasSolution` is true

##### `resetToOriginal()`:
- Restores grid to original user input
- Clears solution display

##### Sample Puzzles:
- Provides pre-filled puzzle buttons
- "Easy Puzzle" and "Medium Puzzle"
- Clicking loads puzzle into grid
- User can then solve it

---

### 4.9 File: `frontend/src/services/api.ts`

**Purpose**: API service layer for backend communication

#### Axios Instance:
```typescript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
})
```
- `baseURL`: Default backend URL, can be overridden via .env
- `timeout`: Request fails after 20 seconds
- `import.meta.env.VITE_API_URL`: Vite environment variable

#### Request Interceptor:
```typescript
api.interceptors.request.use((config) => {
    console.log(`Making ${config.method} request to: ${config.url}`)
    return config
})
```
- Logs every request for debugging
- Runs before request is sent

#### Response Interceptor:
```typescript
api.interceptors.response.use(
    (response) => response,  // Success: return response
    (error) => {  // Error: log and reject
        console.error('API error:', error.response?.status, error.message)
        return Promise.reject(error)
    }
)
```

#### API Functions:

##### `solveSudoku(grid)`:
```typescript
const request: SudokuRequest = { grid }
return await api.post('/solve', request)
```
- Sends POST to /solve endpoint
- Includes grid in request body
- Returns Promise with response data

##### `generatePuzzle()`:
```typescript
return await api.get('/generate')
```
- Sends GET to /generate endpoint
- No body needed
- Returns Promise with puzzle data

---

### 4.10 File: `frontend/src/index.css`

**Purpose**: Global styles and Tailwind CSS setup

#### Tailwind Directives:
```css
@tailwind base;     /* Base styles */
@tailwind components;  /* Component classes */
@tailwind utilities;   /* Utility classes */
```

#### Custom Component Classes:

##### `.btn-primary`:
- Primary button style
- Blue background, white text
- Hover effects and animations
- Dark mode variants

##### `.sudoku-cell`:
- Base styles for grid cells
- Focus ring, transitions

##### `.sudoku-cell-wrapper`:
- Container for each cell
- Border styling

##### Animation Keyframes:

##### `flashRed`:
- Flashes red for invalid input
- 0% → transparent
- 50% → red background
- 100% → transparent

##### `flashGreen`:
- Similar to flashRed but green

##### `bounceIn`:
- Entrance animation
- Scales from 0.3 to 1.0
- Fades in opacity

---

### 4.11 Configuration Files

#### `frontend/vite.config.ts`:
```typescript
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true
    }
})
```
- Configures Vite build tool
- Sets dev server port to 5173
- `host: true` allows access from network

#### `frontend/tailwind.config.js`:
```javascript
darkMode: 'class',  // Enable dark mode via class
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```
- `darkMode: 'class'`: Dark mode activated by `.dark` class
- `content`: Files to scan for Tailwind classes
- Custom colors and animations defined here

#### `frontend/tsconfig.json`:
- TypeScript compiler configuration
- Strict type checking enabled
- React JSX settings

#### `frontend/postcss.config.js`:
- PostCSS processor config
- Runs Tailwind CSS and Autoprefixer

---

## 5. DATA FLOW

### 5.1 Generating a Puzzle (Play Page)

**Step-by-Step Flow**:

1. **User clicks "Generate New Puzzle"**
   - `Play.tsx`: `generateNewPuzzle()` called
   - Sets `isGenerating = true`

2. **API Call**:
   - `Play.tsx` → `sudokuAPI.generatePuzzle()`
   - `api.ts`: Makes GET request to `http://localhost:8000/generate`
   - Axios sends HTTP GET request

3. **Backend Processing**:
   - `main.py`: `generate_sudoku()` receives request
   - Creates `SudokuGenerator()` instance
   - Calls `generator.get_random_puzzle()`
   - `generator.py`: Generates complete grid, removes cells
   - Returns puzzle grid

4. **Response**:
   - Backend sends JSON: `{ grid: [...], success: true, message: "..." }`
   - Axios receives response
   - `api.ts` returns data to `Play.tsx`

5. **State Update**:
   - `Play.tsx` receives response
   - Updates `grid` state with puzzle
   - Creates `fixedCells` array (true where value != 0)
   - Saves `originalGrid` for reset
   - Initializes `undoStack`
   - Sets `isGenerating = false`

6. **UI Update**:
   - React re-renders `SudokuGrid` component
   - Grid displays puzzle
   - Fixed cells shown with gray background

### 5.2 Solving a Puzzle (Solve Page)

**Step-by-Step Flow**:

1. **User enters puzzle**:
   - Clicks cells and types numbers
   - `Solve.tsx`: `handleCellChange()` called
   - Updates `grid` state
   - Adds state to `undoStack`

2. **User clicks "Solve Puzzle"**:
   - `Solve.tsx`: `solvePuzzle()` called
   - Checks if grid is empty → shows message if so
   - Sets `isSolving = true`

3. **API Call**:
   - `Solve.tsx` → `sudokuAPI.solveSudoku(grid)`
   - `api.ts`: Makes POST request to `http://localhost:8000/solve`
   - Request body: `{ grid: [[...], [...], ...] }`

4. **Backend Processing**:
   - `main.py`: `solve_sudoku()` receives request
   - Validates grid format and values
   - Creates `SudokuSolver()` instance
   - Makes copy of grid
   - Calls `solver.solve(grid_copy)`
   - `solver.py`: Backtracking algorithm solves puzzle
   - Returns solved grid

5. **Response**:
   - Backend sends JSON: `{ grid: [...], success: true, ... }`
   - Axios receives response
   - `api.ts` returns data to `Solve.tsx`

6. **State Update**:
   - `Solve.tsx` receives response
   - Updates `solvedGrid` state
   - Sets `hasSolution = true`
   - Sets `showSolution = true`
   - Shows success message
   - Sets `isSolving = false`

7. **UI Update**:
   - React re-renders `SudokuGrid`
   - Displays solved puzzle
   - Shows "Solution displayed" message

### 5.3 User Input Validation (Play Page)

**Real-Time Flow**:

1. **User types in cell**:
   - `SudokuGrid.tsx`: `handleCellChange()` called
   - Converts input to number

2. **Validation Check**:
   - If `showValidation = true`:
     - Calls `isValidValue(row, col, value)`
     - Checks row, column, and box for duplicates

3. **Error State Update**:
   - If invalid: Sets `flashStates["row-col"] = true`
   - If valid: Removes error state

4. **CSS Class Update**:
   - `getCellClassName()` reads `flashStates`
   - Adds red background class if error exists
   - Applies flash animation

5. **UI Re-render**:
   - Cell flashes red if invalid
   - Returns to normal if valid

---

## 6. ALGORITHMS EXPLAINED

### 6.1 Backtracking Algorithm (Depth-First Search)

**Concept**: Try a solution, if it doesn't work, undo and try next option

**For Sudoku**:

```
solve(grid):
    1. Find empty cell
    2. If no empty cell → SOLVED! Return true
    
    3. For each number 1-9:
        a. Try placing number in cell
        b. If valid:
            - Place number
            - Recursively solve rest of grid
            - If recursive solve succeeds → Return true
            - If recursive solve fails → Remove number (backtrack)
        c. Try next number
    
    4. If no number works → Return false (unsolvable)
```

**Visual Example**:
```
Initial Grid:
[5][3][0][0][7][0]...
[6][0][0][1][9][5]...

Step 1: Find empty at (0,2)
Step 2: Try 1 → Check valid? → Place → Recurse
        Recursive call finds next empty at (0,3)
        Tries numbers...
        If fails → backtrack to (0,2)
        Remove 1, try 2
Step 3: Try 2 → Check valid? → Place → Recurse
        Recursive calls continue...
        Eventually finds solution
        Returns true all the way up
```

**Time Complexity**: O(9^m) where m = number of empty cells
- Worst case: Try all 9 numbers for each empty cell
- In practice: Much faster due to validation pruning

**Space Complexity**: O(m) for recursion stack
- Maximum depth = number of empty cells

### 6.2 Puzzle Generation Algorithm

**Strategy**:

1. **Generate Complete Grid**:
   - Fill diagonal boxes (independent)
   - Use backtracking to fill rest

2. **Remove Cells**:
   - Randomly shuffle all positions
   - For each position:
     - Remove cell (set to 0)
     - Check if still has unique solution
     - If yes → keep removed
     - If no → restore value

3. **Difficulty Control**:
   - Remove more cells for harder puzzles
   - Stop when target number removed

**Why Check Uniqueness?**:
- A valid Sudoku must have exactly ONE solution
- Removing too many cells can create multiple solutions
- Must verify after each removal

---

## 7. COMPONENT CONNECTIONS

### 7.1 Component Hierarchy

```
main.tsx
  └── ThemeProvider
      └── App.tsx
          ├── Navbar.tsx
          │   └── (uses useTheme hook)
          └── Routes
              ├── Home.tsx
              ├── Play.tsx
              │   └── SudokuGrid.tsx
              └── Solve.tsx
                  └── SudokuGrid.tsx
```

### 7.2 Data Flow Between Components

**Parent → Child (Props)**:
- `Play.tsx` → `SudokuGrid`: Passes `grid`, `fixedCells`, `onCellChange`
- `Solve.tsx` → `SudokuGrid`: Passes `grid`, `onCellChange`

**Child → Parent (Callbacks)**:
- `SudokuGrid` → `Play.tsx`: Calls `onCellChange(row, col, value)`
- `SudokuGrid` → `Solve.tsx`: Calls `onCellChange(row, col, value)`

**Global State (Context)**:
- `ThemeProvider` → `Navbar`: Provides `theme`, `setTheme` via `useTheme()`

### 7.3 Hook Usage

**useState**: Manages component state
- `Play.tsx`: grid, originalGrid, fixedCells, undoStack, etc.
- `Solve.tsx`: grid, solvedGrid, hasSolution, etc.
- `SudokuGrid.tsx`: flashStates, cellStates

**useEffect**: Side effects
- `Play.tsx`: Generate puzzle on mount
- `Solve.tsx`: Initialize empty grid on mount
- `SudokuGrid.tsx`: Update cellStates when props change
- `main.tsx`: Apply theme class to HTML element

**useMemo**: Memoized calculations
- `SudokuGrid.tsx`: Normalize grid (only recalculates when grid changes)

**useContext**: Access context
- `Navbar.tsx`: `useTheme()` accesses ThemeContext

---

## 8. API ENDPOINTS

### 8.1 GET /
**Purpose**: Health check
**Request**: None
**Response**: `{ "message": "Sudoku API is running!" }`

### 8.2 POST /solve
**Purpose**: Solve a Sudoku puzzle
**Request Body**:
```json
{
    "grid": [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        ...
    ]
}
```
**Response** (Success):
```json
{
    "grid": [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        ...
    ],
    "success": true,
    "message": "Sudoku solved successfully!"
}
```
**Response** (Failure):
```json
{
    "grid": [...original grid...],
    "success": false,
    "message": "This Sudoku puzzle is unsolvable."
}
```

### 8.3 GET /generate
**Purpose**: Generate random puzzle
**Request**: None
**Response**:
```json
{
    "grid": [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        ...
    ],
    "success": true,
    "message": "Random Sudoku puzzle generated successfully!"
}
```

---

## 9. FILE STRUCTURE DETAILED

### Backend Files:

#### `backend/main.py`
- **Lines 1-12**: Imports and setup
- **Lines 14-23**: FastAPI app, CORS middleware
- **Lines 25-31**: Pydantic models
- **Lines 33-35**: Root endpoint
- **Lines 37-75**: POST /solve endpoint
- **Lines 77-110**: GET /generate endpoint
- **Lines 112-114**: Server startup

#### `backend/solver.py`
- **Lines 1-8**: Class definition and initialization
- **Lines 10-33**: `is_valid()` method
- **Lines 35-44**: `find_empty_cell()` method
- **Lines 46-70**: `solve()` main backtracking algorithm
- **Lines 72-78**: `is_solvable()` wrapper
- **Lines 80-107**: `count_solutions()` and helper

#### `backend/generator.py`
- **Lines 1-12**: Class definition and initialization
- **Lines 14-26**: `generate_complete_sudoku()`
- **Lines 28-34**: `_fill_diagonal_boxes()`
- **Lines 35-44**: `_fill_box()`
- **Lines 46-70**: `generate_puzzle()` with difficulty
- **Lines 72-102**: `_create_puzzle()` removal logic
- **Lines 104-109**: `_has_unique_solution()`
- **Lines 111-117**: `get_random_puzzle()`

### Frontend Files:

#### Component Files:
- Each component file: ~150-350 lines
- Organized by: imports, interfaces, component, exports

#### Service Files:
- `api.ts`: ~70 lines
- Contains: axios config, interceptors, API functions

#### Configuration Files:
- `vite.config.ts`: Build configuration
- `tailwind.config.js`: Style system configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies list

---

## 10. DEPENDENCIES

### Backend Dependencies (`requirements.txt`):

#### `fastapi==0.104.1`
- **Purpose**: Web framework for building APIs
- **Used for**: Creating endpoints, request/response handling
- **Key features**: Automatic API docs, type validation

#### `uvicorn[standard]==0.24.0`
- **Purpose**: ASGI server to run FastAPI
- **Used for**: Running the backend server
- **Command**: `uvicorn.run(app, host="0.0.0.0", port=8000)`

#### `pydantic==2.5.0`
- **Purpose**: Data validation using Python type annotations
- **Used for**: Validating request/response models
- **In code**: `BaseModel` classes for SudokuGrid, SudokuResponse

#### `python-multipart==0.0.6`
- **Purpose**: Handle multipart form data
- **Used for**: File uploads (not used in this project, but FastAPI requires it)

### Frontend Dependencies (`package.json`):

#### Production Dependencies:

##### `react` & `react-dom`
- **Purpose**: UI library for building interfaces
- **Version**: ^18.2.0
- **Used for**: All React components

##### `react-router-dom`
- **Purpose**: Client-side routing
- **Version**: ^6.20.1
- **Used for**: Navigation between pages

##### `framer-motion`
- **Purpose**: Animation library
- **Version**: ^10.16.16
- **Used for**: Page transitions, button animations

##### `axios`
- **Purpose**: HTTP client
- **Version**: ^1.6.2
- **Used for**: API requests to backend

#### Dev Dependencies:

##### `typescript`
- **Purpose**: Typed JavaScript
- **Used for**: Type checking, better IDE support

##### `vite`
- **Purpose**: Build tool and dev server
- **Used for**: Fast development, building production bundle

##### `tailwindcss`
- **Purpose**: Utility-first CSS framework
- **Used for**: Styling all components

##### `@vitejs/plugin-react`
- **Purpose**: Vite plugin for React
- **Used for**: Processing React/JSX files

---

## 11. HOW IT ALL WORKS TOGETHER

### Startup Sequence:

1. **Backend Starts** (`python main.py`):
   - FastAPI app initializes
   - CORS middleware configured
   - Server listens on port 8000
   - Endpoints registered

2. **Frontend Starts** (`npm run dev`):
   - Vite dev server starts on port 5173
   - TypeScript compiles
   - React app loads `main.tsx`
   - `ThemeProvider` initializes, reads localStorage
   - `App` component renders
   - `BrowserRouter` sets up routing
   - `Navbar` renders with theme toggle
   - Default route (`/`) shows `Home` component

3. **User Navigation**:
   - User clicks "Play" link
   - React Router navigates to `/play`
   - `Play` component mounts
   - `useEffect` runs, calls `generateNewPuzzle()`
   - API request sent to backend
   - Grid renders with puzzle

4. **User Interaction**:
   - User types in cell
   - `SudokuGrid` calls `handleCellChange()`
   - Calls parent's `onCellChange` prop
   - `Play` component updates `grid` state
   - React re-renders `SudokuGrid`
   - Validation runs, shows error if invalid

5. **Solving**:
   - User clicks "Solve Puzzle"
   - API request sent with current grid
   - Backend runs backtracking algorithm
   - Solution returned
   - UI updates with solved puzzle

---

## 12. KEY CONCEPTS EXPLAINED

### 12.1 React Hooks

**useState**:
```typescript
const [count, setCount] = useState(0)
```
- `count`: Current state value
- `setCount`: Function to update state
- `useState(0)`: Initial value
- When `setCount` called, component re-renders

**useEffect**:
```typescript
useEffect(() => {
    // Side effect code
}, [dependency])
```
- Runs after render
- Empty array `[]` = run once on mount
- Array with values = run when values change
- No array = run on every render (rare)

**useMemo**:
```typescript
const expensive = useMemo(() => compute(), [dependency])
```
- Memoizes computed value
- Only recomputes when dependency changes
- Performance optimization

**useContext**:
```typescript
const value = useContext(MyContext)
```
- Accesses context value
- No need to pass props through all components

### 12.2 TypeScript Interfaces

**Purpose**: Define shape of objects

**Example**:
```typescript
interface Props {
    name: string
    age: number
    optional?: boolean  // ? = optional
}
```

**Benefits**:
- Type checking at compile time
- IDE autocomplete
- Catches errors early

### 12.3 Async/Await

**Purpose**: Handle asynchronous operations (API calls)

**Without async/await**:
```typescript
fetch('/api').then(response => {
    return response.json()
}).then(data => {
    console.log(data)
})
```

**With async/await**:
```typescript
const response = await fetch('/api')
const data = await response.json()
console.log(data)
```

**In this project**:
```typescript
const response = await sudokuAPI.generatePuzzle()
if (response.data.success) {
    setGrid(response.data.grid)
}
```

### 12.4 Array Methods

**map()**: Transform each element
```typescript
[1, 2, 3].map(x => x * 2)  // [2, 4, 6]
grid.map(row => row.map(cell => cell !== 0))
```

**filter()**: Keep elements matching condition
```typescript
[1, 2, 3, 4].filter(x => x > 2)  // [3, 4]
```

**every()**: Check if all elements pass test
```typescript
grid.every(row => row.every(cell => cell !== 0))  // All filled?
```

**find()**: Find first matching element
```typescript
[1, 2, 3].find(x => x > 1)  // 2
```

### 12.5 CSS Grid vs Flexbox

**CSS Grid** (used for Sudoku grid):
- 2D layout (rows and columns)
- Perfect for grids/tables
- `gridTemplateColumns: 'repeat(9, 42px)'`

**Flexbox** (used elsewhere):
- 1D layout (row OR column)
- Good for navigation, buttons
- `display: flex`

---

## 13. COMMON PATTERNS

### 13.1 State Management Pattern

**Pattern**: Parent manages state, passes to child**

**Example**:
```typescript
// Parent (Play.tsx) manages the grid state
const [grid, setGrid] = useState<number[][]>(...)

// Passes state and setter to child component
<SudokuGrid 
  grid={grid} 
  onCellChange={handleCellChange}  // Callback to update parent state
/>
```

**Why**: Single source of truth. Parent controls data, child displays it.

---

### 13.2 Callback Pattern

**Pattern**: Child calls parent function to update state**

**Example**:
```typescript
// In Play.tsx (parent)
const handleCellChange = (row: number, col: number, value: number) => {
  const newGrid = grid.map(r => [...r])
  newGrid[row][col] = value
  setGrid(newGrid)  // Parent updates its own state
}

// In SudokuGrid.tsx (child)
onChange={(e) => onCellChange(rowIndex, colIndex, numValue)}
```

**Why**: React data flows down, events flow up. Child notifies parent of changes.

---

### 13.3 Undo/Redo Pattern (Stack-Based)

**Pattern**: Store state history in array, pop to undo**

**Example**:
```typescript
const [undoStack, setUndoStack] = useState<number[][][]>([])

// On change, push new state
handleCellChange = () => {
  setUndoStack(stack => [...stack, newGrid.map(r => [...r])])
}

// Undo: pop last state
handleUndo = () => {
  setUndoStack(stack => {
    const next = stack.slice(0, -1)  // Remove last
    setGrid(next[next.length - 1])     // Set to previous
    return next
  })
}
```

**Why**: Stack (LIFO) naturally models undo - last in, first out.

---

### 13.4 Deep Copy Pattern

**Pattern**: Always copy nested arrays/objects before modifying**

**Example**:
```typescript
// ❌ WRONG - modifies original
const newGrid = grid
newGrid[0][0] = 5  // Changes original!

// ✅ CORRECT - creates copy
const newGrid = grid.map(row => [...row])  // Shallow copy of rows
newGrid[0][0] = 5  // Safe, original unchanged

// For deeply nested:
const newGrid = [...grid.map(row => [...row])]
```

**Why**: React requires immutability. State must be new objects for change detection.

---

### 13.5 Normalization Pattern

**Pattern**: Always ensure data format before use**

**Example**:
```typescript
const normalizedGrid: number[][] = useMemo(() => {
  if (!Array.isArray(grid) || grid.length !== 9) return FILLER_9X9
  return grid.map((row) => 
    Array.isArray(row) && row.length === 9 ? row : Array(9).fill(0)
  )
}, [grid])
```

**Why**: Prevents errors from invalid data. Always returns valid 9x9 grid.

---

### 13.6 Error Boundary Pattern

**Pattern**: Catch errors gracefully, show fallback UI**

**Example**:
```typescript
try {
  const response = await sudokuAPI.generatePuzzle()
  setGrid(response.data.grid)
} catch (error) {
  // Fallback to sample puzzle instead of crashing
  setGrid(sampleGrid)
  setMessage('Loaded fallback puzzle')
}
```

**Why**: App stays usable even if API fails. Better UX than blank screen.

---

### 13.7 Conditional Rendering Pattern

**Pattern**: Show/hide UI based on state**

**Example**:
```typescript
{message && (
  <div className="alert">{message}</div>
)}

{isGenerating ? (
  <div>Loading...</div>
) : (
  <button>Generate</button>
)}
```

**Why**: Clean, readable conditional UI. React handles null/undefined safely.

---

### 13.8 Derived State Pattern

**Pattern**: Compute values from state instead of storing separately**

**Example**:
```typescript
// ✅ GOOD - derived from grid
const isCompleted = grid.every(row => row.every(cell => cell !== 0))

// ❌ BAD - storing separately (can get out of sync)
const [isCompleted, setIsCompleted] = useState(false)
```

**Why**: Single source of truth. Can't have state mismatch.

---

## 14. TESTING & DEBUGGING

### 14.1 Testing the Backend

**Manual Test - Solve Endpoint**:
```bash
curl -X POST http://localhost:8000/solve \
  -H "Content-Type: application/json" \
  -d '{"grid": [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]]}'
```

**Manual Test - Generate Endpoint**:
```bash
curl http://localhost:8000/generate
```

---

### 14.2 Testing the Frontend

**Browser Console**:
- Open DevTools (F12)
- Check Network tab for API calls
- Check Console for errors

**Common Issues**:
1. **CORS Error**: Backend not running or wrong URL
2. **Grid Not Showing**: Check console for React errors
3. **Theme Not Working**: Check if `dark` class added to `<html>`

---

### 14.3 Debugging Tips

**React DevTools**:
- Install React DevTools browser extension
- Inspect component props/state
- See component hierarchy

**Console Logging**:
```typescript
console.log('Grid state:', grid)
console.log('API response:', response.data)
```

**Breakpoints**:
- Set `debugger;` in code
- Browser pauses execution there
- Inspect variables

---

## 15. DEPLOYMENT GUIDE

### 15.1 Frontend Deployment (Vercel)

1. **Build the app**:
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in frontend directory
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com`

3. **Or use GitHub integration**:
   - Push to GitHub
   - Connect repo to Vercel
   - Auto-deploys on push

---

### 15.2 Backend Deployment (Render/Railway)

1. **Create Procfile**:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. **Update CORS**:
```python
allow_origins=["https://your-frontend-url.vercel.app"]
```

3. **Deploy**:
   - Push to GitHub
   - Connect to Render/Railway
   - Set Python version: 3.8+
   - Auto-deploys

---

## 16. EXTENDING THE PROJECT

### 16.1 Adding Difficulty Levels

**Modify generator.py**:
```python
def get_puzzle_by_difficulty(self, difficulty: str):
    if difficulty == "easy":
        return self.generate_puzzle("easy")
    elif difficulty == "hard":
        return self.generate_puzzle("hard")
```

**Add to API endpoint**:
```python
@app.get("/generate/{difficulty}")
async def generate_sudoku(difficulty: str):
    generator = SudokuGenerator()
    puzzle = generator.generate_puzzle(difficulty)
    return SudokuResponse(grid=puzzle, success=True)
```

---

### 16.2 Adding Timer Feature

**In Play.tsx**:
```typescript
const [time, setTime] = useState(0)

useEffect(() => {
  const timer = setInterval(() => {
    setTime(prev => prev + 1)
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

**Display**:
```typescript
<div>Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</div>
```

---

### 16.3 Adding Hints Feature

**Backend endpoint**:
```python
@app.post("/hint")
async def get_hint(request: SudokuGrid):
    solver = SudokuSolver()
    # Find first empty cell and its possible value
    row, col = solver.find_empty_cell(request.grid)
    # Return hint
    return {"row": row, "col": col, "value": hint_value}
```

---

## 17. PERFORMANCE OPTIMIZATIONS

### 17.1 React Optimizations

**useMemo for expensive calculations**:
```typescript
const normalizedGrid = useMemo(() => {
  // Expensive operation
  return normalizeGrid(grid)
}, [grid])  // Only recompute when grid changes
```

**useCallback for stable functions**:
```typescript
const handleChange = useCallback((row, col, value) => {
  // Function definition
}, [dependencies])
```

---

### 17.2 Backend Optimizations

**Early exit in validation**:
```python
def is_valid(self, grid, row, col, num):
    # Check row - exit early if invalid
    for x in range(9):
        if grid[row][x] == num:
            return False  # Immediately return, don't check rest
    # Continue checks...
```

---

## 18. SECURITY CONSIDERATIONS

### 18.1 Input Validation

**Always validate**:
```python
if len(request.grid) != 9:
    raise HTTPException(status_code=400, detail="Invalid grid size")

for row in request.grid:
    for cell in row:
        if not isinstance(cell, int) or cell < 0 or cell > 9:
            raise HTTPException(status_code=400, detail="Invalid cell value")
```

---

### 18.2 Rate Limiting

**Add rate limiting** (using slowapi):
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/solve")
@limiter.limit("10/minute")
async def solve_sudoku(request: Request, ...):
    # Endpoint code
```

---

## 19. TROUBLESHOOTING

### 19.1 Common Issues

**Issue**: Grid not updating
- **Solution**: Check if `setGrid` is called with new array (not modified old one)

**Issue**: Dark mode not working
- **Solution**: Check if `dark` class added to `<html>` element in browser

**Issue**: CORS errors
- **Solution**: Verify backend CORS origins match frontend URL

**Issue**: Puzzle generation slow
- **Solution**: Normal, generation is computationally expensive. Consider timeout/fallback

---

## 20. GLOSSARY

- **Backtracking**: Algorithm that tries solutions, undoes if wrong, tries next
- **CORS**: Cross-Origin Resource Sharing - allows frontend/backend different ports
- **Immutability**: Never modify state directly, always create new objects
- **State**: React data that when changed, triggers re-render
- **Props**: Data passed from parent to child component
- **Hook**: React function (like useState, useEffect) that adds features
- **API**: Application Programming Interface - contract for communication
- **Endpoint**: URL path that handles specific request (e.g., /solve)

---

## 21. CONCLUSION

This SudokuSolver project demonstrates:
- Full-stack web development
- React state management patterns
- Algorithm implementation (backtracking)
- RESTful API design
- Modern UI with animations
- Responsive design
- Dark mode implementation

**Key Takeaways**:
1. State flows down, events flow up
2. Always copy data before modifying
3. Handle errors gracefully
4. Use TypeScript for type safety
5. Component-based architecture is powerful

---

**Document Version**: 1.0
**Last Updated**: 2025
**Project**: SudokuSolver
**Author**: Giri Prasath

---

END OF DOCUMENTATION