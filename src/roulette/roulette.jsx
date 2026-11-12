import React, { useEffect as use_effect, useRef as use_ref, useState as use_state } from 'react';
import { BallMachine, ball_draw_duration, ball_mix_duration } from './ball_machine.jsx';
import { CapybaraRace, max_racers, race_duration } from './capybara_race.jsx';
import { OptionsEditor } from './options_editor.jsx';
import { create_roulette_audio, get_tick_times } from './roulette_audio.js';
import { append_options, load_options, save_options } from './storage.js';
import { Wheel } from './wheel.jsx';
import { get_spin_rotation, palette, spin_duration } from './wheel_math.js';

export function Roulette() {
  const [options, set_options] = use_state(load_options);
  const [rotation, set_rotation] = use_state(0);
  const [duration, set_duration] = use_state(0);
  const [is_spinning, set_is_spinning] = use_state(false);
  const [winner_index, set_winner_index] = use_state(null);
  const [pending_draw, set_pending_draw] = use_state(null);
  const [mode, set_mode] = use_state('wheel');
  const [sound_enabled, set_sound_enabled] = use_state(true);
  const audio_ref = use_ref(null);
  const timer_ref = use_ref(null);
  const draw_balls = mode === 'balls';
  const race = mode === 'race';
  const draw_wheel = mode === 'wheel';
  const selected_option = options[winner_index];
  const winner = selected_option?.label;
  const winner_color = palette[selected_option?.color_index];
  const can_spin = options.length >= 2 && (!race || options.length <= max_racers) && !is_spinning;

  use_effect(() => save_options(options), [options]);
  use_effect(() => () => {
    window.clearTimeout(timer_ref.current);
    audio_ref.current?.close();
    audio_ref.current = null;
  }, []);

  function clear_result() {
    set_duration(0);
    set_rotation(0);
    set_winner_index(null);
  }

  function update_options(next_options) {
    set_options(next_options);
    clear_result();
  }

  function change_mode(next_mode) {
    if (mode === next_mode || is_spinning) return;
    clear_result();
    set_mode(next_mode);
  }

  function import_options(labels, replace) {
    update_options(append_options(replace ? [] : options, labels));
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

  function run_draw() {
    if (!can_spin) return;

    const selected_index = Math.floor(Math.random() * options.length);
    const reduce_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation_duration = reduce_motion ? 0 : race ? race_duration : draw_balls ? ball_draw_duration : spin_duration;
    const next_rotation = draw_wheel ? get_spin_rotation(rotation, options.length, selected_index) : rotation;
    set_winner_index(null);

    if (draw_wheel) {
      set_duration(animation_duration);
      set_rotation(next_rotation);
    }

    if (sound_enabled) {
      audio_ref.current ??= create_roulette_audio();
      audio_ref.current?.unlock();
      if (audio_ref.current && animation_duration && !race) {
        const times = draw_balls
          ? [0, 90, 230, 410, 570, 720, 910, 1110, 1260, 1480, 1740, 2030, ball_mix_duration + 540]
          : get_tick_times(rotation, next_rotation, options.length, animation_duration);
        audio_ref.current.play_spin(times);
      }
    }

    function finish_draw() {
      set_winner_index(selected_index);
      set_pending_draw(null);
      set_is_spinning(false);
      audio_ref.current?.play_win();
    }

    if (!animation_duration) {
      finish_draw();
      return;
    }

    if (!draw_wheel) set_pending_draw(selected_index);
    set_is_spinning(true);
    timer_ref.current = window.setTimeout(finish_draw, animation_duration);
  }

  return (
    <div className="workspace">
      <section className="wheel_stage" aria-label={race ? 'Carrera de capibaras' : draw_balls ? 'Sorteo de bolas' : 'Ruleta'}>
        <div className="draw_modes" role="group" aria-label="Tipo de sorteo">
          <button type="button" aria-pressed={draw_wheel} disabled={is_spinning} onClick={() => change_mode('wheel')}>Ruleta</button>
          <button type="button" aria-pressed={draw_balls} disabled={is_spinning} onClick={() => change_mode('balls')}>Sorteo de bolas</button>
          <button type="button" aria-pressed={race} disabled={is_spinning} onClick={() => change_mode('race')}>Capibaras</button>
        </div>
        {draw_wheel && <Wheel options={options} rotation={rotation} duration={duration} can_spin={can_spin} on_spin={run_draw} />}
        {draw_balls && <BallMachine options={options} pending_index={pending_draw} winner_index={winner_index} />}
        {race && <CapybaraRace options={options} pending_index={pending_draw} winner_index={winner_index} />}
        <div className="result">
          <span className="screen_reader_status" role="status" aria-atomic="true">
            {winner ? `Resultado: ${winner}${draw_balls ? `, bola ${winner_index + 1}` : ''}` : ''}
          </span>
          {winner && (
            <div className="winner_card" style={{ backgroundColor: winner_color.fill, color: winner_color.ink }}>
              <div className="winner_text">
                <span className="winner_label">{draw_balls ? `Resultado · Bola ${winner_index + 1}` : 'Resultado'}</span>
                <strong>{winner}</strong>
              </div>
              <button
                className="winner_remove"
                type="button"
                aria-label={`Quitar de la lista: ${winner}`}
                onClick={() => remove_option(winner_index)}
              >Quitar de la lista</button>
            </div>
          )}
          {options.length < 2 && <span className="draw_status">Agrega al menos dos opciones para sortear.</span>}
        </div>
        <div className="wheel_controls">
          <button className="spin_button" type="button" onClick={run_draw} disabled={!can_spin}>
            <span aria-hidden="true">{race ? '⚑' : draw_balls ? '●' : '↻'}</span>{' '}
            {race ? (is_spinning ? 'En carrera…' : 'Iniciar carrera') : draw_balls ? (is_spinning ? 'Mezclando…' : 'Sacar una bola') : (is_spinning ? 'Girando…' : 'Girar ruleta')}
          </button>
          <button className="sound_button" type="button" aria-label="Sonido" aria-pressed={sound_enabled} onClick={toggle_sound}>
            <span aria-hidden="true">♪</span> {sound_enabled ? 'Sonido activo' : 'Silenciado'}
          </button>
        </div>
      </section>
      <OptionsEditor show_numbers={draw_balls} options={options} is_spinning={is_spinning} on_import={import_options} on_remove={remove_option} />
    </div>
  );
}
