import { max_label_length, max_options, palette } from './wheel_math.js';

const storage_key = 'spinrulete.options.v1';
const starter_labels = ['Pizza', 'Tacos', 'Sushi', 'Hamburguesas', 'Pasta', 'Ensalada'];

export function append_options(options, labels) {
  const last_color = options.at(-1)?.color_index ?? -1;
  return [...options, ...labels.map((label, index) => ({
    label,
    color_index: (last_color + 1 + index) % palette.length,
  }))];
}

export function load_options() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storage_key));
    if (Array.isArray(saved)) {
      // Migrate older string lists using the same colors they displayed before.
      return saved
        .map((entry) => typeof entry === 'string' ? { label: entry } : entry)
        .filter((entry) => typeof entry?.label === 'string' && entry.label.trim())
        .slice(0, max_options)
        .map(({ label, color_index }, index) => ({
          label: label.trim().slice(0, max_label_length),
          color_index: Number.isInteger(color_index) && color_index >= 0 && color_index < palette.length
            ? color_index
            : index % palette.length,
        }));
    }
  } catch {
    // Storage can be unavailable or contain data from a previous session.
  }

  return append_options([], starter_labels);
}

export function save_options(options) {
  try {
    window.localStorage.setItem(storage_key, JSON.stringify(options));
  } catch {
    // Keep the current session usable when storage is disabled or full.
  }
}
