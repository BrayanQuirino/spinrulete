import React, { useState as use_state } from 'react';
import { parse_option_lines } from './option_lines.js';
import { max_label_length, max_options, palette } from './wheel_math.js';

export function OptionsEditor({ options, is_spinning, on_import, on_remove, show_numbers }) {
  const [draft, set_draft] = use_state(null);
  const [feedback, set_feedback] = use_state('');
  const current_list = options.map(({ label }) => label).join('\n');
  const editor_text = draft ?? current_list;
  const pending = parse_option_lines(editor_text);
  const includes_current_list = options.every(({ label }, index) => pending[index] === label);
  const additions = includes_current_list ? pending.slice(options.length) : pending;

  function submit_options() {
    const labels = additions;
    const capacity = max_options - options.length;
    if (!labels.length || is_spinning) return;

    const long_line = labels.findIndex((label) => label.length > max_label_length);

    if (long_line >= 0) {
      set_feedback(`La opción ${long_line + 1} supera los ${max_label_length} caracteres.`);
      return;
    }

    if (labels.length > capacity) {
      set_feedback(capacity > 0
        ? `Caben ${capacity} opciones más con esta acción. Revisa la lista antes de continuar.`
        : 'La ruleta está llena. Quita opciones o usa «Reemplazar lista».');
      return;
    }

    on_import(labels, false);
    set_draft(null);
    set_feedback('Opciones agregadas.');
  }

  function clear_list() {
    on_import([], true);
    set_draft('');
    set_feedback('Lista vacía. Escribe o pega opciones y pulsa Agregar.');
  }

  return (
    <section className="card options_card" id="opciones" aria-labelledby="options_heading">
      <div className="options_heading">
        <h2 id="options_heading">Tus opciones</h2>
        <span className="option_count" aria-label={`${options.length} de ${max_options} opciones`}>{options.length}/{max_options}</span>
      </div>
      <form className="option_form" onSubmit={(event) => {
        event.preventDefault();
        submit_options();
      }}>
        <label htmlFor="option_label">Escribe o pega una lista</label>
        <p className="editor_note" id="list_hint">Una opción por línea. Las líneas vacías se omiten.</p>
        <textarea
          id="option_label"
          value={editor_text}
          onChange={(event) => {
            set_draft(event.target.value);
            set_feedback('');
          }}
          aria-describedby="list_hint"
          rows={8}
          placeholder={'Pizza\nTacos\nSushi'}
          readOnly={is_spinning}
        />
        <div className="list_actions">
          <button className="add_button" type="submit" disabled={!additions.length || is_spinning}>
            {additions.length ? `Agregar ${additions.length}` : 'Agregar'}
          </button>
          <button className="replace_button" type="button" onClick={clear_list} disabled={is_spinning || (!options.length && !editor_text)}>
            Reemplazar lista
          </button>
        </div>
        <p className="editor_feedback" role="status">{feedback}</p>
      </form>
      {options.length > 0 && (
        <ul className="option_list" aria-label="Opciones en la ruleta">
          {options.map(({ label, color_index }, index) => (
            <li key={index} className="option_row">
              <span className="option_dot" style={{ background: palette[color_index].fill }} />
              <span className="option_label">{show_numbers && <span className="option_number">{index + 1}. </span>}{label}</span>
              <button
                className="remove_button"
                type="button"
                aria-label={`Eliminar opción ${index + 1}: ${label}`}
                disabled={is_spinning}
                onClick={() => on_remove(index)}
              >×</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
