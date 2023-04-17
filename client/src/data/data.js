export const rotations = ["N", "E", "S", "W"];

export const defaultPlanes = [
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
    head: { row: 4, col: 2 },
    pieces: [
      { row: 4, col: 2 },
      { row: 5, col: 0 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 6, col: 2 },
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },
  {
    id: 3,
    head: { row: 3, col: 5 },
    pieces: [
      { row: 3, col: 5 },
      { row: 2, col: 7 },
      { row: 2, col: 6 },
      { row: 2, col: 5 },
      { row: 2, col: 4 },
      { row: 2, col: 3 },
      { row: 1, col: 5 },
      { row: 0, col: 6 },
      { row: 0, col: 5 },
      { row: 0, col: 4 },
    ],
    posIndex: 2,
    pos: "S",
    valid: true,
    destroyed: false,
  },
  {
    id: 4,
    head: { row: 7, col: 5 },
    pieces: [
      { row: 7, col: 5 },
      { row: 6, col: 7 },
      { row: 6, col: 6 },
      { row: 6, col: 5 },
      { row: 6, col: 4 },
      { row: 6, col: 3 },
      { row: 5, col: 5 },
      { row: 4, col: 6 },
      { row: 4, col: 5 },
      { row: 4, col: 4 },
    ],
    posIndex: 2,
    pos: "S",
    valid: true,
    destroyed: false,
  },

  {
    id: 5,
    head: { row: 0, col: 8 },
    pieces: [
      { row: 0, col: 8 },
      { row: 1, col: 6 },
      { row: 1, col: 7 },
      { row: 1, col: 8 },
      { row: 1, col: 9 },
      { row: 1, col: 10 },
      { row: 2, col: 8 },
      { row: 3, col: 7 },
      { row: 3, col: 8 },
      { row: 3, col: 9 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },

  {
    id: 6,
    head: { row: 4, col: 8 },
    pieces: [
      { row: 4, col: 8 },
      { row: 5, col: 6 },
      { row: 5, col: 7 },
      { row: 5, col: 8 },
      { row: 5, col: 9 },
      { row: 5, col: 10 },
      { row: 6, col: 8 },
      { row: 7, col: 7 },
      { row: 7, col: 8 },
      { row: 7, col: 9 },
    ],
    posIndex: 0,
    pos: "N",
    valid: true,
    destroyed: false,
  },

  {
    id: 7,
    head: { row: 3, col: 11 },
    pieces: [
      { row: 3, col: 11 },
      { row: 2, col: 13 },
      { row: 2, col: 12 },
      { row: 2, col: 11 },
      { row: 2, col: 10 },
      { row: 2, col: 9 },
      { row: 1, col: 11 },
      { row: 0, col: 12 },
      { row: 0, col: 11 },
      { row: 0, col: 10 },
    ],
    posIndex: 2,
    pos: "S",
    valid: true,
    destroyed: false,
  },

  {
    id: 8,
    head: { row: 7, col: 11 },
    pieces: [
      { row: 7, col: 11 },
      { row: 6, col: 13 },
      { row: 6, col: 12 },
      { row: 6, col: 11 },
      { row: 6, col: 10 },
      { row: 6, col: 9 },
      { row: 5, col: 11 },
      { row: 4, col: 12 },
      { row: 4, col: 11 },
      { row: 4, col: 10 },
    ],
    posIndex: 2,
    pos: "S",
    valid: true,
    destroyed: false,
  },
];

export const updatePieces = plane => {
  if (plane.pos === "N") {
    plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
    plane.pieces[1] = { row: plane.head.row + 1, col: plane.head.col - 2 };
    plane.pieces[2] = { row: plane.head.row + 1, col: plane.head.col - 1 };
    plane.pieces[3] = { row: plane.head.row + 1, col: plane.head.col };
    plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col + 1 };
    plane.pieces[5] = { row: plane.head.row + 1, col: plane.head.col + 2 };
    plane.pieces[6] = { row: plane.head.row + 2, col: plane.head.col };
    plane.pieces[7] = { row: plane.head.row + 3, col: plane.head.col - 1 };
    plane.pieces[8] = { row: plane.head.row + 3, col: plane.head.col };
    plane.pieces[9] = { row: plane.head.row + 3, col: plane.head.col + 1 };
  } else if (plane.pos === "E") {
    plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
    plane.pieces[1] = { row: plane.head.row - 2, col: plane.head.col - 1 };
    plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col - 1 };
    plane.pieces[3] = { row: plane.head.row, col: plane.head.col - 1 };
    plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col - 1 };
    plane.pieces[5] = { row: plane.head.row + 2, col: plane.head.col - 1 };
    plane.pieces[6] = { row: plane.head.row, col: plane.head.col - 2 };
    plane.pieces[7] = { row: plane.head.row - 1, col: plane.head.col - 3 };
    plane.pieces[8] = { row: plane.head.row, col: plane.head.col - 3 };
    plane.pieces[9] = { row: plane.head.row + 1, col: plane.head.col - 3 };
  } else if (plane.pos === "S") {
    plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
    plane.pieces[1] = { row: plane.head.row - 1, col: plane.head.col - 2 };
    plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col - 1 };
    plane.pieces[3] = { row: plane.head.row - 1, col: plane.head.col };
    plane.pieces[4] = { row: plane.head.row - 1, col: plane.head.col + 1 };
    plane.pieces[5] = { row: plane.head.row - 1, col: plane.head.col + 2 };
    plane.pieces[6] = { row: plane.head.row - 2, col: plane.head.col };
    plane.pieces[7] = { row: plane.head.row - 3, col: plane.head.col - 1 };
    plane.pieces[8] = { row: plane.head.row - 3, col: plane.head.col };
    plane.pieces[9] = { row: plane.head.row - 3, col: plane.head.col + 1 };
  } else {
    plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
    plane.pieces[1] = { row: plane.head.row - 2, col: plane.head.col + 1 };
    plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col + 1 };
    plane.pieces[3] = { row: plane.head.row, col: plane.head.col + 1 };
    plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col + 1 };
    plane.pieces[5] = { row: plane.head.row + 2, col: plane.head.col + 1 };
    plane.pieces[6] = { row: plane.head.row, col: plane.head.col + 2 };
    plane.pieces[7] = { row: plane.head.row - 1, col: plane.head.col + 3 };
    plane.pieces[8] = { row: plane.head.row, col: plane.head.col + 3 };
    plane.pieces[9] = { row: plane.head.row + 1, col: plane.head.col + 3 };
  }
};
