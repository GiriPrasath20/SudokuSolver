import random
from solver import SudokuSolver

class SudokuGenerator:
    """
    A Sudoku puzzle generator that creates valid puzzles with unique solutions.
    """
    
    def __init__(self):
        self.solver = SudokuSolver()
        self.size = 9
        self.box_size = 3
    
    def generate_complete_sudoku(self) -> list:
        """
        Generate a complete, solved Sudoku grid.
        """
        grid = [[0 for _ in range(self.size)] for _ in range(self.size)]
        
        # Fill diagonal 3x3 boxes first (they are independent)
        self._fill_diagonal_boxes(grid)
        
        # Solve the rest using backtracking
        self.solver.solve(grid)
        
        return grid
    
    def _fill_diagonal_boxes(self, grid: list):
        """
        Fill the three diagonal 3x3 boxes with random valid numbers.
        """
        for box in range(0, self.size, self.box_size):
            self._fill_box(grid, box, box)
    
    def _fill_box(self, grid: list, row: int, col: int):
        """
        Fill a 3x3 box with random valid numbers.
        """
        numbers = list(range(1, 10))
        random.shuffle(numbers)
        
        for i in range(self.box_size):
            for j in range(self.box_size):
                grid[row + i][col + j] = numbers[i * self.box_size + j]
    
    def generate_puzzle(self, difficulty: str = "medium") -> list:
        """
        Generate a Sudoku puzzle by removing numbers from a complete grid.
        
        Args:
            difficulty: "easy", "medium", or "hard"
        
        Returns:
            A 9x9 grid with some cells filled (0s represent empty cells)
        """
        # Generate a complete Sudoku first
        complete_grid = self.generate_complete_sudoku()
        
        # Determine how many cells to remove based on difficulty
        if difficulty == "easy":
            cells_to_remove = random.randint(35, 45)  # 35-45 empty cells
        elif difficulty == "medium":
            cells_to_remove = random.randint(46, 55)  # 46-55 empty cells
        else:  # hard
            cells_to_remove = random.randint(56, 64)  # 56-64 empty cells
        
        # Create a puzzle by removing cells
        puzzle = self._create_puzzle(complete_grid, cells_to_remove)
        
        return puzzle
    
    def _create_puzzle(self, complete_grid: list, cells_to_remove: int) -> list:
        """
        Create a puzzle by removing cells while ensuring a unique solution.
        """
        # Make a copy of the complete grid
        puzzle = [row[:] for row in complete_grid]
        
        # Get all cell positions
        positions = [(i, j) for i in range(self.size) for j in range(self.size)]
        random.shuffle(positions)
        
        removed_count = 0
        
        for row, col in positions:
            if removed_count >= cells_to_remove:
                break
            
            # Store the original value
            original_value = puzzle[row][col]
            
            # Remove the cell
            puzzle[row][col] = 0
            
            # Check if the puzzle still has a unique solution
            if self._has_unique_solution(puzzle):
                removed_count += 1
            else:
                # Restore the cell if it breaks uniqueness
                puzzle[row][col] = original_value
        
        return puzzle
    
    def _has_unique_solution(self, grid: list) -> bool:
        """
        Check if the puzzle has exactly one solution.
        """
        solutions_count = self.solver.count_solutions(grid, limit=2)
        return solutions_count == 1
    
    def get_random_puzzle(self) -> list:
        """
        Generate a random difficulty puzzle.
        """
        difficulties = ["easy", "medium", "hard"]
        difficulty = random.choice(difficulties)
        return self.generate_puzzle(difficulty)
