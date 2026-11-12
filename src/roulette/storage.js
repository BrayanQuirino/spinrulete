import { max_label_length, max_options } from './wheel_math.js';

const storage_key = 'spinrulete.options.v1';
const starter_labels = ['Pizza', 'Tacos', 'Sushi', 'Hamburguesas', 'Pasta', 'Ensalada'];

export function load_options() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storage_key));
    if (Array.isArray(saved)) {
      return saved
        .filter((label) => typeof label === 'string' && label.trim())
        .slice(0, max_options)
        .map((label) => label.trim().slice(0, max_label_length));
    }
  } catch {
    // Storage can be unavailable or contain data from a previous session.
  }

  return starter_labels;
}

export function save_options(options) {
  try {
    window.localStorage.setItem(storage_key, JSON.stringify(options));
  } catch {
    // Keep the current session usable when storage is disabled or full.
  }
}
