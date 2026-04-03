import { getParticipants } from "../memory/roomParticipants.js";

export const colors = [
  "#FF6B6B", // soft red
  "#4ECDC4", // aqua
  "#556270", // slate blue-gray
  "#C7F464", // lime green
  "#FFB400", // amber
  "#6A5ACD", // slate blue
  "#20B2AA", // light sea green
  "#FF7F50", // coral
  "#3CB371", // medium sea green
  "#9370DB", // medium purple
];

// const generateColor = () => {
//   const roomParticipants = getParticipants();
//   let usedColors = [];

//   for (const participant of roomParticipants) {
//     usedColors.push(participant.color);
//   }

//   for (const color of colors) {
//     if (!usedColors.includes(color)) {
//       return color;
//     }
//   }
// };


// const generateColor = () => {
//   const roomParticipants = getParticipants();
//   const usedColors = roomParticipants.map(p => p.color);

//   for (const color of colors) {
//     if (!usedColors.includes(color)) {
//       return color;
//     }
//   }
// };

const generateColor = (roomId) => {
  const usedColors = getParticipants(roomId).map(p => p.color);

  return colors.find(color => !usedColors.includes(color));
};

export default generateColor;
