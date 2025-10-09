from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sys
import os

# Add the backend directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from solver import SudokuSolver
from generator import SudokuGenerator

app = FastAPI(title="Sudoku API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SudokuGrid(BaseModel):
    grid: List[List[int]]

class SudokuResponse(BaseModel):
    grid: List[List[int]]
    success: bool
    message: str = ""

@app.get("/")
async def root():
    return {"message": "Sudoku API is running!"}

@app.post("/solve", response_model=SudokuResponse)
async def solve_sudoku(request: SudokuGrid):
    """
    Solve a Sudoku puzzle.
    
    Input: 9x9 grid with 0s as blanks
    Output: Solved grid or error if unsolvable
    """
    try:
        # Validate grid size
        if len(request.grid) != 9 or any(len(row) != 9 for row in request.grid):
            raise HTTPException(status_code=400, detail="Grid must be 9x9")
        
        # Validate grid values
        for row in request.grid:
            for cell in row:
                if not isinstance(cell, int) or cell < 0 or cell > 9:
                    raise HTTPException(status_code=400, detail="Grid values must be integers between 0-9")
        
        solver = SudokuSolver()
        
        # Make a copy to avoid modifying the original
        grid_copy = [row[:] for row in request.grid]
        
        if solver.solve(grid_copy):
            return SudokuResponse(
                grid=grid_copy,
                success=True,
                message="Sudoku solved successfully!"
            )
        else:
            return SudokuResponse(
                grid=request.grid,
                success=False,
                message="This Sudoku puzzle is unsolvable."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error solving Sudoku: {str(e)}")

@app.get("/generate", response_model=SudokuResponse)
async def generate_sudoku():
    """
    Generate a valid random Sudoku puzzle with a unique solution.
    """
    try:
        generator = SudokuGenerator()
        # Use quicker random difficulty path to reduce generation time/complexity
        puzzle = generator.get_random_puzzle()

        return SudokuResponse(
            grid=puzzle,
            success=True,
            message="Random Sudoku puzzle generated successfully!"
        )

    except Exception:
        # Fallback to a known-valid sample puzzle so the UI remains usable
        sample_puzzle = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
        ]
        return SudokuResponse(
            grid=sample_puzzle,
            success=True,
            message="Generated fallback puzzle."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
