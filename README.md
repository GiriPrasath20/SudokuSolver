# Sudoku Solver

A modern, full-stack Sudoku web application with a beautiful animated UI and Python backend.

## 🎯 Features

### Frontend
- **Play Random Sudoku**: Generate and solve random Sudoku puzzles
- **Solve My Sudoku**: Input your own puzzle and get the solution
- **Real-time Validation**: Visual feedback for correct/incorrect inputs
- **Beautiful Animations**: Smooth transitions and flash effects
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

### Backend
- **Fast Sudoku Solving**: Backtracking algorithm implementation
- **Puzzle Generation**: Create valid Sudoku puzzles with unique solutions
- **RESTful API**: Clean FastAPI endpoints
- **CORS Enabled**: Ready for frontend integration

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd SudokuSolver/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd SudokuSolver/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
SudokuSolver/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── solver.py        # Sudoku solving algorithm
│   ├── generator.py     # Puzzle generation logic
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SudokuGrid.tsx    # Reusable Sudoku grid component
│   │   │   └── Navbar.tsx        # Navigation component
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Play.tsx          # Random puzzle game
│   │   │   └── Solve.tsx         # Custom puzzle solver
│   │   ├── services/
│   │   │   └── api.ts            # API service layer
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # App entry point
│   │   └── index.css             # Global styles
│   ├── package.json              # Node.js dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── vite.config.ts            # Vite configuration
└── README.md
```

## 🔧 API Endpoints

### POST /solve
Solve a Sudoku puzzle.

**Request Body:**
```json
{
  "grid": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    // ... 9x9 grid with 0s as blanks
  ]
}
```

**Response:**
```json
{
  "grid": [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    // ... solved grid
  ],
  "success": true,
  "message": "Sudoku solved successfully!"
}
```

### GET /generate
Generate a random Sudoku puzzle.

**Response:**
```json
{
  "grid": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    // ... partially filled grid
  ],
  "success": true,
  "message": "Random Sudoku puzzle generated successfully!"
}
```

## 🎨 UI Features

### SudokuGrid Component
- Interactive 9x9 grid with editable cells
- Real-time validation with visual feedback
- Fixed cells (original clues) are non-editable
- Smooth animations for user interactions
- Flash effects for correct/incorrect inputs

### Animations
- **Flash Red**: Invalid input feedback
- **Flash Green**: Correct input confirmation
- **Bounce In**: Component entrance animations
- **Fade In**: Smooth page transitions

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive grid sizing
- Optimized for all screen sizes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

3. Set environment variables:
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Render/Railway)
1. Create a `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Deploy with your Python dependencies in `requirements.txt`

## 🧠 Algorithm Details

### Sudoku Solving
The solver uses a backtracking algorithm:
1. Find the first empty cell
2. Try numbers 1-9 in that cell
3. Check if the number is valid (no conflicts)
4. If valid, recursively solve the rest
5. If no valid number works, backtrack and try the next number

### Puzzle Generation
The generator creates valid puzzles by:
1. Filling diagonal 3x3 boxes first (they're independent)
2. Solving the complete grid using backtracking
3. Removing cells while ensuring a unique solution
4. Validating uniqueness using solution counting

## 🛠️ Development

### Adding New Features
1. Backend: Add new endpoints in `main.py`
2. Frontend: Create components in `src/components/`
3. API: Update service functions in `src/services/api.ts`

### Testing
```bash
# Backend
python -m pytest

# Frontend
npm test
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Sudoku Solving! 🎯**
