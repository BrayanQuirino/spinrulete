export const full_turn = 360;
export const max_options = 1000;
export const max_label_length = 80;
export const spin_duration = 3900;
export const spin_easing = [0.12, 0.74, 0.11, 1];

function create_palette(hues, saturation, lightness) {
  return Array.from({ length: max_options }, (_, index) => {
    const hue = hues[index] ?? ((index - hues.length + 1) * 137.508 + hues[0]) % 360;
    const tone = lightness[index % lightness.length];
    return { fill: `hsl(${hue.toFixed(3)}, ${saturation}%, ${tone}%)`, ink: '#17151c' };
  });
}

export const palettes = [
  { name: 'Intensa', colors: create_palette([46, 3, 271, 145, 210, 327], 100, [61, 65, 73, 58, 69, 66]) },
  { name: 'Pastel', colors: create_palette([42, 12, 256, 162, 214, 327], 72, [78, 83, 87, 81, 85]) },
  { name: 'Tropical', colors: create_palette([174, 25, 79, 342, 196, 57], 86, [55, 67, 65, 72, 63, 75]) },
];

export function normalize_angle(angle) {
  return ((angle % full_turn) + full_turn) % full_turn;
}

/**
 * Sector zero starts at twelve o'clock. Rotate until the winner's center
 * lands on the fixed pointer, using complete turns to animate forward.
 */
export function get_spin_rotation(rotation, count, winner_index) {
  const center = (winner_index + 0.5) * full_turn / count;
  const distance = normalize_angle(-center - rotation);
  return rotation + 5 * full_turn + distance;
}
