import React, { useEffect as use_effect, useRef as use_ref, useState as use_state } from 'react';
import { OptionsEditor } from './options_editor.jsx';
import { load_options, save_options } from './storage.js';
import { Wheel } from './wheel.jsx';
import { get_spin_rotation, spin_duration } from './wheel_math.js';

export function Roulette() {
  const [options, set_options] = use_state(load_options);
  const [rotation, set_rotation] = use_state(0);
  const [duration, set_duration] = use_state(0);
  const [is_spinning, set_is_spinning] = use_state(false);
  const [winner, set_winner] = use_state('');
  const timer_ref = use_ref(null);

  use_effect(() => save_options(options), [options]);
  use_effect(() => () => window.clearTimeout(timer_ref.current), []);

  function update_options(next_options) {
    set_options(next_options);
    set_duration(0);
    set_rotation(0);
    set_winner('');
  }

  function add_option(label) {
    update_options([...options, label]);
  }

  function remove_option(index) {
    update_options(options.filter((_, option_index) => option_index !== index));
  }

  function spin_wheel() {
    if (options.length < 2 || is_spinning) return;

    const winner_index = Math.floor(Math.random() * options.length);
    const next_rotation = get_spin_rotation(rotation, options.length, winner_index);
    const reduce_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    set_duration(reduce_motion ? 0 : spin_duration);
    set_rotation(next_rotation);
    set_winner('');

    if (reduce_motion) {
      set_winner(options[winner_index]);
      return;
    }

    set_is_spinning(true);
    // Keep the announced result in sync with the end of the visual spin.
    timer_ref.current = window.setTimeout(() => {
      set_winner(options[winner_index]);
      set_is_spinning(false);
    }, spin_duration);
  }

  return (
    <div className="workspace">
      <section className="card wheel_card" aria-label="Ruleta">
        <Wheel options={options} rotation={rotation} duration={duration} />
        <button className="spin_button" type="button" onClick={spin_wheel} disabled={options.length < 2 || is_spinning}>
          <span aria-hidden="true">↻</span> {is_spinning ? 'Girando…' : 'Girar ruleta'}
        </button>
        <div className="result" role="status" aria-atomic="true">
          {winner ? <>Resultado <strong>{winner}</strong></> : options.length < 2 ? 'Agrega al menos dos opciones para girar.' : null}
        </div>
      </section>
      <OptionsEditor options={options} is_spinning={is_spinning} on_add={add_option} on_remove={remove_option} />
    </div>
  );
}
