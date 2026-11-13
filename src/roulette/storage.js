import { max_label_length, max_options } from './wheel_math.js';

const storage_key = 'spinrulete.options.v1';
const starter_labels = ['Pizza', 'Tacos', 'Sushi', 'Hamburguesas', 'Pasta', 'Ensalada'];

function assign_colors(options) {
  const reserved = new Set(options.map(({ color_index }) => color_index));
  const assigned = new Set();
  let next_color = 0;

  return options.map(({ label, color_index }) => {
    if (Number.isInteger(color_index) && color_index >= 0 && color_index < max_options && !assigned.has(color_index)) {
      assigned.add(color_index);
      return { label, color_index };
    }

    while (reserved.has(next_color)) next_color += 1;
    return { label, color_index: next_color++ };
  });
}

export function append_options(options, labels) {
  return assign_colors([...options, ...labels.map((label) => ({ label }))]);
}

export function sync_options(options, labels) {
  const colors_by_label = new Map();
  for (const { label, color_index } of options) {
    if (!colors_by_label.has(label)) colors_by_label.set(label, []);
    colors_by_label.get(label).push(color_index);
  }

  return assign_colors(labels.map((label) => ({
    label,
    color_index: colors_by_label.get(label)?.shift(),
  })));
}

export function load_options() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storage_key));
    if (Array.isArray(saved)) {
      // Keep the first use of each saved color and give duplicates a free color.
      const options = saved
        .map((entry) => typeof entry === 'string' ? { label: entry } : entry)
        .filter((entry) => typeof entry?.label === 'string' && entry.label.trim())
        .slice(0, max_options)
        .map(({ label, color_index }) => ({ label: label.trim().slice(0, max_label_length), color_index }));
      if (options.length) return assign_colors(options);
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
