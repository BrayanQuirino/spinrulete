import React from 'react';
import { palette } from './wheel_math.js';
import './capybara_race.css';

export const max_racers = 10;
export const race_duration = 3200;

export function CapybaraRace({ options, pending_index, winner_index }) {
  if (options.length > max_racers) {
    return <p className="race_notice" role="status">La carrera admite hasta 10 opciones. Quita {options.length - max_racers} para correr.</p>;
  }
  if (!options.length) return null;

  const finishing_index = pending_index ?? winner_index;
  const state = pending_index !== null ? ' racing' : winner_index !== null ? ' finished' : '';

  return (
    <ol className={`race_track${state}`} aria-label="Carriles de la carrera" style={{ '--race_time': `${race_duration}ms` }}>
      {options.map(({ label, color_index }, index) => {
        const is_first = index === finishing_index;
        const { fill } = palette[color_index];
        return (
          <li className={`race_lane${winner_index === index ? ' winning_lane' : ''}`} key={index}>
            <span className="race_name" title={label}>
              <span className="race_dot" aria-hidden="true" style={{ backgroundColor: fill }} />
              <span className="race_name_text">{label}</span>
            </span>
            <span className="race_course" aria-hidden="true">
              <span className="race_finish" />
              <span className="capy_runner" style={{
                '--bib': fill,
                '--early': (is_first ? .15 : .13 + (index * 7 % 10) * .022),
                '--middle': (is_first ? .46 : .43 + (index * 3 % 10) * .024),
                '--late': (is_first ? .81 : .66 + (index * 9 % 10) * .008),
                '--finish': (is_first ? 1 : .74 + (index * 7 % 10) * .017),
                '--stride_time': `${250 + index * 13 % 100}ms`,
              }}>
                <span className="capy_shadow" />
                <span className="capy_animal">
                  <span className="capy_foot back_foot" />
                  <span className="capy_foot front_foot" />
                  <span className="capy_body" />
                  <span className="capy_bib" />
                  <span className="capy_head" />
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
