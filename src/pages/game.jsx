import React, { useEffect, useState } from "react";

const SIZE = 4;

const createEmptyBoard = () =>
  Array(SIZE)
    .fill()
    .map(() => Array(SIZE).fill(0));

function randomTile(board) {
  let empty = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) empty.push([i, j]);
    }
  }

  if (empty.length === 0) return board;

  const [x, y] = empty[Math.floor(Math.random() * empty.length)];
  board[x][y] = Math.random() > 0.9 ? 4 : 2;

  return [...board];
}

function initializeBoard() {
  let board = createEmptyBoard();
  board = randomTile(board);
  board = randomTile(board);
  return board;
}

function compress(row) {
  let filtered = row.filter((num) => num);
  while (filtered.length < SIZE) filtered.push(0);
  return filtered;
}

function merge(row) {
  let score = 0;

  for (let i = 0; i < SIZE - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }

  return { row, score };
}

function moveLeft(board) {
  let newBoard = [];
  let totalScore = 0;

  for (let i = 0; i < SIZE; i++) {
    let row = compress(board[i]);
    let merged = merge(row);
    row = compress(merged.row);
    totalScore += merged.score;
    newBoard.push(row);
  }

  return { board: newBoard, score: totalScore };
}

function reverse(board) {
  return board.map((row) => [...row].reverse());
}

function transpose(board) {
  return board[0].map((_, i) => board.map((row) => row[i]));
}

function boardsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function Game() {
  const [board, setBoard] = useState(initializeBoard());
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      let movedBoard;
      let gainedScore = 0;

      switch (e.key) {
        case "ArrowLeft":
          ({ board: movedBoard, score: gainedScore } = moveLeft(board));
          break;

        case "ArrowRight":
          movedBoard = reverse(board);
          ({ board: movedBoard, score: gainedScore } = moveLeft(movedBoard));
          movedBoard = reverse(movedBoard);
          break;

        case "ArrowUp":
          movedBoard = transpose(board);
          ({ board: movedBoard, score: gainedScore } = moveLeft(movedBoard));
          movedBoard = transpose(movedBoard);
          break;

        case "ArrowDown":
          movedBoard = transpose(board);
          movedBoard = reverse(movedBoard);
          ({ board: movedBoard, score: gainedScore } = moveLeft(movedBoard));
          movedBoard = reverse(movedBoard);
          movedBoard = transpose(movedBoard);
          break;

        default:
          return;
      }

      if (!boardsEqual(board, movedBoard)) {
        movedBoard = randomTile(movedBoard);
        setBoard(movedBoard);
        setScore((prev) => prev + gainedScore);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [board]);

  const restartGame = () => {
    setBoard(initializeBoard());
    setScore(0);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>2048</h1>
        <div style={styles.score}>Score: {score}</div>
        <button style={styles.button} onClick={restartGame}>
          Restart
        </button>
        <p style={styles.instructions}>Use arrow keys ⬅️ ➡️ ⬆️ ⬇️ to play</p>
      </div>

      <div style={styles.grid}>
        {board.flat().map((num, index) => (
          <div key={index} style={styles.cell(num)}>
            {num !== 0 ? num : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e1e2f, #111)",
    color: "white",
    overflow: "hidden"
  },

  header: {
    marginBottom: 30,
    textAlign: "center"
  },

  title: {
    fontSize: "64px",
    marginBottom: 10
  },

  score: {
    fontSize: "24px",
    marginBottom: 10
  },

  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 100px)",
    gridTemplateRows: "repeat(4, 100px)",
    gap: "12px",
    padding: "20px",
    borderRadius: "20px",
    background: "#222"
  },

  cell: (num) => ({
    width: "100px",
    height: "100px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    fontWeight: "bold",
    background: num === 0 ? "#333" : "#f5d76e",
    color: num === 0 ? "transparent" : "#111",
    transition: "0.2s"
  })
};