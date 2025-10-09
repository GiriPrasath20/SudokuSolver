class SudokuSolver:
    """
    A Sudoku solver using backtracking algorithm.
    """
    
    def __init__(self):
        self.size = 9
        self.box_size = 3
    
    def is_valid(self, grid: list, row: int, col: int, num: int) -> bool:
        """
        Check if placing num at (row, col) is valid.
        """
        # Check row
        for x in range(self.size):
            if grid[row][x] == num:
                return False
        
        # Check column
        for x in range(self.size):
            if grid[x][col] == num:
                return False
        
        # Check 3x3 box
        start_row = row - row % self.box_size
        start_col = col - col % self.box_size
        
        for i in range(self.box_size):
            for j in range(self.box_size):
                if grid[i + start_row][j + start_col] == num:
                    return False
        
        return True
    
    def find_empty_cell(self, grid: list) -> tuple:
        """
        Find the first empty cell (value 0) in the grid.
        Returns (row, col) if found, (-1, -1) if no empty cells.
        """
        for i in range(self.size):
            for j in range(self.size):
                if grid[i][j] == 0:
                    return (i, j)
        return (-1, -1)
    
    def solve(self, grid: list) -> bool:
        """
        Solve the Sudoku puzzle using backtracking.
        Returns True if solvable, False otherwise.
        Modifies the grid in place.
        """
        row, col = self.find_empty_cell(grid)
        
        # If no empty cells, puzzle is solved
        if row == -1:
            return True
        
        # Try numbers 1-9
        for num in range(1, 10):
            if self.is_valid(grid, row, col, num):
                grid[row][col] = num
                
                # Recursively solve the rest
                if self.solve(grid):
                    return True
                
                # Backtrack if this path doesn't lead to a solution
                grid[row][col] = 0
        
        return False
    
    def is_solvable(self, grid: list) -> bool:
        """
        Check if a Sudoku puzzle is solvable without modifying the original grid.
        """
        # Make a copy to avoid modifying the original
        grid_copy = [row[:] for row in grid]
        return self.solve(grid_copy)
    
    def count_solutions(self, grid: list, limit: int = 2) -> int:
        """
        Count the number of solutions for a Sudoku puzzle.
        Returns the count up to the limit (useful for checking uniqueness).
        """
        grid_copy = [row[:] for row in grid]
        return self._count_solutions_recursive(grid_copy, limit)
    
    def _count_solutions_recursive(self, grid: list, limit: int) -> int:
        """
        Recursive helper for counting solutions.
        """
        row, col = self.find_empty_cell(grid)
        
        if row == -1:
            return 1
        
        count = 0
        for num in range(1, 10):
            if self.is_valid(grid, row, col, num):
                grid[row][col] = num
                count += self._count_solutions_recursive(grid, limit)
                grid[row][col] = 0
                
                if count >= limit:
                    return count
        
        return count
