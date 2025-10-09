# Project Overview: SudokuSolver

## What is this project?
'SudokuSolver' is a modern, beginner-friendly, full-stack web app for playing and solving Sudoku puzzles in your browser. It includes a beautiful and responsive interface to interact with Sudoku puzzles, and a Python backend that checks, solves, and generates new puzzles.

---

## Feature Highlights

- **Play Random Sudoku:** Start a new, computer-generated puzzle and fill in answers with instant feedback.
- **Solve Your Sudoku:** Enter your own puzzle and let the app instantly solve it for you.
- **Smart Validation:** The app visually shows if your input breaks Sudoku rules (red/green flash). Fixed clues can't be changed.
- **Modern, Animated UI:** Responsive grid, attractive buttons, mobile-friendly, and smooth transitions.
- **Support for Clear, Reset, Generate, and Solve:** Easy controls for all puzzle actions.

---

## Technology

- **Frontend:** React (Vite, TypeScript), Tailwind CSS, Framer Motion, Axios
- **Backend:** Python (FastAPI) with CORS enabled
- **Deployment Ready:** 
  - Frontend: Netlify/Vercel
  - Backend: Render.com/Railway

---

## How does it work?

- **Frontend:**
  - Displays a 9x9 Sudoku grid component.
  - Fetches puzzles or solutions from the backend using API calls.
  - Lets the user interact with the puzzle (fill, clear, validate, etc.), with beautiful animations and feedback.

- **Backend:**
  - Returns a new, random, solvable puzzle via `/generate`.
  - Receives your custom puzzle and solves it (if possible) via `/solve`.
  - Built-in backtracking algorithm ensures valid and instant results.

---

## How to run the project

### Prerequisites
- **Node.js + npm** (for the frontend)
- **Python 3.8+** (for the backend)

### Backend (API server)
1. Open a terminal and navigate to the backend:
    ```
    cd SudokuSolver/backend
    ```
2. Create and activate a virtual environment:
   - Windows PowerShell:
      ```
      python -m venv venv
      .\venv\Scripts\Activate.ps1
      ```
3. Install dependencies:
    ```
    pip install -r requirements.txt
    ```
4. Start the server:
    ```
    python main.py
    ```
   - The backend runs at http://localhost:8000

### Frontend (UI)
1. In a new terminal, navigate to the frontend:
    ```
    cd SudokuSolver/frontend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Create a .env file with this content:
    ```
    VITE_API_URL=http://localhost:8000
    ```
4. Start the UI:
    ```
    npm run dev
    ```
   - The frontend runs at http://localhost:5173

---

## Troubleshooting/Common Issues
- **Backend not found/connection error:** Ensure you started the Python API and that your `.env` in frontend points to the right backend URL.
- **CORS errors:** If deploying, set allowed origins appropriately in the backend `main.py`.
- **Grid looks off or blank:** Make sure your browser is not caching old code; refresh the page hard (Ctrl+Shift+R).
- **Backend not starting:** Ensure you have FastAPI and dependencies installed (`pip install -r requirements.txt`).
- **Timeout when generating puzzles:** Backend puzzle generator may be slow for some environments; try again or use fallback logic.

---

## Folder Structure (What file does what?)

- `backend/`
  - `main.py`: FastAPI app and API endpoints
  - `solver.py`: Sudoku solver/backtracking logic
  - `generator.py`: Puzzle generator
  - `requirements.txt`: Python dependencies
- `frontend/`
  - `src/components/SudokuGrid.tsx`: Interactive Sudoku grid component
  - `src/pages/Play.tsx`: Page for playing a random puzzle
  - `src/pages/Solve.tsx`: Page for solving your Sudoku
  - `src/services/api.ts`: API requests logic
  - `App.tsx`, `main.tsx`, `index.css`: App root, config, global UI
  - `tailwind.config.js`: UI style system
- `README.md`: Official project readme (also check this file!)

---

## For Laymen: How Do I Use This?
- Go to the website (or run it locally using the above steps).
- Click "Play" to start a new Sudoku puzzle, or "Solve" to have the app solve your own puzzle.
- Click the cells and type numbers. Red = invalid, green = valid.
- Use the buttons above the grid to generate, clear, or reset the puzzle.
- When done, celebrate your win or see the solution instantly!

---

## Contributing & Support
- **Bugs:** Please open an issue in the repo.
- **Improvements:** Fork the repo, open a pull request.
- **Questions:** Open an issue with details.

---

**Enjoy SudokuSolver!**
