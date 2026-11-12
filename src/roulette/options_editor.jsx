import React, { useState as use_state } from 'react';
import { parse_option_lines } from './option_lines.js';
import { max_label_length, max_options, palette } from './wheel_math.js';

export function OptionsEditor({ options, is_spinning, on_import, on_remove }) {
  const [draft, set_draft] = use_state('');
  const [feedback, set_feedback] = use_state('');
  const pending = parse_option_lines(draft);
  const long_line = pending.findIndex((label) => label.length > max_label_length);

  function submit_options(event) {
    event.preventDefault();
    const replace = event.nativeEvent.submitter?.value === 'replace';
    const capacity = replace ? max_options : max_options - options.length;
    if (!pending.length || is_spinning) return;

    if (long_line >= 0) {
      set_feedback(`La opción ${long_line + 1} supera los ${max_label_length} caracteres.`);
      return;
    }

    if (pending.length > capacity) {
      set_feedback(capacity > 0
        ? `Caben ${capacity} opciones más con esta acción. Revisa la lista antes de continuar.`
        : 'La ruleta está llena. Quita opciones o usa «Reemplazar lista».');
      return;
    }

    on_import(pending, replace);
    set_draft('');
    set_feedback(replace ? 'Lista reemplazada.' : 'Opciones agregadas.');
  }

  return (
    <section className="card options_card" id="opciones" aria-labelledby="options_heading">
      <div className="options_heading">
        <h2 id="options_heading">Tus opciones</h2>
        <span className="option_count" aria-label={`${options.length} de ${max_options} opciones`}>{options.length}/{max_options}</span>
      </div>
      <form className="option_form" onSubmit={submit_options}>
        <label htmlFor="option_label">Escribe o pega una lista</label>
        <p className="editor_note" id="list_hint">Una opción por línea. Las líneas vacías se omiten.</p>
        <textarea
          id="option_label"
          value={draft}
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
          <button className="add_button" type="submit" value="append" disabled={!pending.length || is_spinning}>
            {pending.length ? `Agregar ${pending.length}` : 'Agregar'}
          </button>
          <button className="replace_button" type="submit" value="replace" disabled={!pending.length || !options.length || is_spinning}>
            Reemplazar lista
          </button>
        </div>
        <p className="editor_feedback" role="status">{feedback}</p>
      </form>
      {options.length > 0 && (
        <ul className="option_list" aria-label="Opciones en la ruleta">
          {options.map((label, index) => (
            <li key={index} className="option_row">
              <span className="option_dot" style={{ background: palette[index % palette.length].fill }} />
              <span className="option_label">{label}</span>
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
