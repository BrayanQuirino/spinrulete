export const full_turn = 360;
export const max_options = 50;
export const max_label_length = 80;
export const spin_duration = 3900;
export const spin_easing = [0.12, 0.74, 0.11, 1];

export const palette = [
  { fill: '#ffca50', ink: '#331d06' },
  { fill: '#f76e85', ink: '#3c1022' },
  { fill: '#7842d6', ink: '#ffffff' },
  { fill: '#58dfc5', ink: '#0c3532' },
  { fill: '#4d62dc', ink: '#ffffff' },
  { fill: '#ffa16b', ink: '#3e1c13' },
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
