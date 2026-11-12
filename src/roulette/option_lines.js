/** Keep the original order and duplicates. A wrapped display line is still one entry. */
export function parse_option_lines(draft) {
  return draft.split(/\r\n|[\n\r]/).map((line) => line.trim()).filter(Boolean);
}
