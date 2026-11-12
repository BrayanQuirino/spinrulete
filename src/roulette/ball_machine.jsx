import React from 'react';
import { palette } from './wheel_math.js';
import './ball_machine.css';

export const ball_mix_duration = 2500;
export const ball_draw_duration = 3400;

/** Pack the balls into a compact rack at rest and stagger their paths in motion. */
function get_ball_style(index, count, color_index) {
  const columns = Math.min(count, Math.max(4, Math.ceil(Math.sqrt(count * 1.65))));
  const row = Math.floor(index / columns);
  const in_row = Math.min(columns, count - row * columns);
  const gap = Math.min(19, 86 / columns);
  const { fill, ink } = palette[color_index];

  return {
    '--ball_fill': fill,
    '--ball_ink': ink,
    '--ball_x': `${50 + (index % columns - (in_row - 1) / 2) * gap}%`,
    '--ball_y': `${86 - row * (count > 18 ? 11 : 17)}%`,
    '--bounce_x': `${13 + (index * 29 + 37) % 74}%`,
    '--bounce_y': `${12 + (index * 17 + 19) % 43}%`,
    '--cross_x': `${13 + (index * 47 + 11) % 74}%`,
    '--cross_y': `${18 + (index * 31 + 9) % 58}%`,
  };
}

export function BallMachine({ options, pending_index, winner_index }) {
  const count = options.length;
  const selected_index = pending_index ?? winner_index;
  const is_mixing = pending_index !== null;
  const density = count > 30 ? ' dense' : count > 14 ? ' compact' : '';

  return (
    <div
      className={`ball_machine${density}${is_mixing ? ' is_mixing' : ''}`}
      style={{ '--mix_time': `${ball_mix_duration}ms`, '--drop_time': `${ball_draw_duration - ball_mix_duration}ms` }}
      aria-hidden="true"
    >
      <div className="ball_glass">
        <div className="ball_rack">
          {options.map(({ color_index }, index) => (
            <span
              key={index}
              className={`draw_ball rack_ball${index === selected_index ? ' selected_ball' : ''}`}
              style={get_ball_style(index, count, color_index)}
            >{index + 1}</span>
          ))}
        </div>
      </div>
      <div className="ball_base">
        <div className="ball_chute" />
        <div className="ball_tray">
          {selected_index !== null && (
            <span className="draw_ball prize_ball" style={get_ball_style(selected_index, count, options[selected_index].color_index)}>
              {selected_index + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
