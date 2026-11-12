import React, { useEffect as use_effect, useRef as use_ref, useState as use_state } from 'react';
import { OptionsEditor } from './options_editor.jsx';
import { create_roulette_audio, get_tick_times } from './roulette_audio.js';
import { load_options, save_options } from './storage.js';
import { Wheel } from './wheel.jsx';
import { get_spin_rotation, spin_duration } from './wheel_math.js';

export function Roulette() {
  const [options, set_options] = use_state(load_options);
  const [rotation, set_rotation] = use_state(0);
  const [duration, set_duration] = use_state(0);
  const [is_spinning, set_is_spinning] = use_state(false);
  const [winner, set_winner] = use_state('');
  const [sound_enabled, set_sound_enabled] = use_state(true);
  const audio_ref = use_ref(null);
  const timer_ref = use_ref(null);
  const can_spin = options.length >= 2 && !is_spinning;

  use_effect(() => save_options(options), [options]);
  use_effect(() => () => {
    window.clearTimeout(timer_ref.current);
    audio_ref.current?.close();
    audio_ref.current = null;
  }, []);

  function update_options(next_options) {
    set_options(next_options);
    set_duration(0);
    set_rotation(0);
    set_winner('');
  }

  function import_options(labels, replace) {
    update_options(replace ? labels : [...options, ...labels]);
  }

  function remove_option(index) {
    update_options(options.filter((_, option_index) => option_index !== index));
  }

  function toggle_sound() {
    const next_enabled = !sound_enabled;
    if (next_enabled) {
      audio_ref.current ??= create_roulette_audio();
      audio_ref.current?.unlock();
    }
    audio_ref.current?.set_muted(!next_enabled);
    set_sound_enabled(next_enabled);
  }

  function spin_wheel() {
    if (!can_spin) return;

    const winner_index = Math.floor(Math.random() * options.length);
    const next_rotation = get_spin_rotation(rotation, options.length, winner_index);
    const reduce_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation_duration = reduce_motion ? 0 : spin_duration;
    set_duration(animation_duration);
    set_rotation(next_rotation);
    set_winner('');

    if (sound_enabled) {
      audio_ref.current ??= create_roulette_audio();
      audio_ref.current?.unlock();
      if (audio_ref.current && animation_duration) {
        audio_ref.current.play_spin(get_tick_times(rotation, next_rotation, options.length, animation_duration));
      }
    }

    function finish_spin() {
      set_winner(options[winner_index]);
      set_is_spinning(false);
      audio_ref.current?.play_win();
    }

    if (reduce_motion) {
      finish_spin();
      return;
    }

    set_is_spinning(true);
    timer_ref.current = window.setTimeout(finish_spin, animation_duration);
  }

  return (
    <div className="workspace">
      <section className="card wheel_card" aria-label="Ruleta">
        <div className="wheel_toolbar">
          <a href="#opciones">Editar opciones</a>
          <button className="sound_button" type="button" aria-label="Sonido" aria-pressed={sound_enabled} onClick={toggle_sound}>
            <span aria-hidden="true">{sound_enabled ? '♪' : '♩'}</span> {sound_enabled ? 'Sonido activo' : 'Sonido silenciado'}
          </button>
        </div>
        <Wheel options={options} rotation={rotation} duration={duration} can_spin={can_spin} on_spin={spin_wheel} />
        <div className="result" role="status" aria-atomic="true">
          {winner && (
            <div className="winner_card">
              <span aria-hidden="true">✦</span>
              <div><span className="winner_label">Resultado</span><strong>{winner}</strong></div>
              <span aria-hidden="true">✦</span>
            </div>
          )}
          {!winner && options.length < 2 && 'Agrega al menos dos opciones para girar.'}
        </div>
        <button className="spin_button" type="button" onClick={spin_wheel} disabled={!can_spin}>
          <span aria-hidden="true">↻</span> {is_spinning ? 'Girando…' : 'Girar ruleta'}
        </button>
      </section>
      <OptionsEditor options={options} is_spinning={is_spinning} on_import={import_options} on_remove={remove_option} />
    </div>
  );
}
