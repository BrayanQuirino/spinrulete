import React, { useState as use_state } from 'react';
import { max_label_length, max_options, palette } from './wheel_math.js';

export function OptionsEditor({ options, is_spinning, on_add, on_remove }) {
  const [draft, set_draft] = use_state('');
  const is_full = options.length >= max_options;

  function submit_option(event) {
    event.preventDefault();
    const label = draft.trim();
    if (!label || is_full || is_spinning) return;
    on_add(label);
    set_draft('');
  }

  return (
    <section className="card options_card" aria-labelledby="options_heading">
      <div className="options_heading">
        <h2 id="options_heading">Tus opciones</h2>
        <span className="option_count" aria-label={`${options.length} opciones`}>{options.length}</span>
      </div>
      <form className="option_form" onSubmit={submit_option}>
        <label htmlFor="option_label">Nueva opción</label>
        <div className="form_row">
          <input
            id="option_label"
            value={draft}
            onChange={(event) => set_draft(event.target.value)}
            maxLength={max_label_length}
            placeholder="Ej. Ir al cine"
            disabled={is_spinning || is_full}
          />
          <button className="add_button" type="submit" disabled={!draft.trim() || is_spinning || is_full}>
            <span aria-hidden="true">+</span> Agregar
          </button>
        </div>
      </form>
      {is_full && <p className="editor_note">Llegaste al límite de {max_options} opciones.</p>}
      {options.length ? (
        <ul className="option_list">
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
      ) : <p className="editor_note">Agrega al menos dos opciones para empezar.</p>}
    </section>
  );
}
