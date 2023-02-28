const rotations = ["N", "E", "S", "W"];

const defaultPlanes = [
  {
    id: 1,
    head: { row: 0, col: 2 },
    pieces: [
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 2, col: 2 },
      { row: 3, col: 1 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },
  {
    id: 2,
    head: { row: 0, col: 7 },
    pieces: [
      { row: 0, col: 7 },
      { row: 1, col: 5 },
      { row: 1, col: 6 },
      { row: 1, col: 7 },
      { row: 1, col: 8 },
      { row: 1, col: 9 },
      { row: 2, col: 7 },
      { row: 3, col: 6 },
      { row: 3, col: 7 },
      { row: 3, col: 8 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },
  {
    id: 3,
    head: { row: 6, col: 2 },
    pieces: [
      { row: 6, col: 2 },
      { row: 7, col: 0 },
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 8, col: 2 },
      { row: 9, col: 1 },
      { row: 9, col: 2 },
      { row: 9, col: 3 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },
];

module.exports = {
  rotations,
  defaultPlanes,
};
