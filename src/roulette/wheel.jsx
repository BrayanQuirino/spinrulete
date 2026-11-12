import React, { useEffect as use_effect, useRef as use_ref } from 'react';
import { palette, spin_easing } from './wheel_math.js';

const canvas_size = 900;
const radius = canvas_size / 2;
const circle = 2 * Math.PI;

function fit_label(context, label, available_width) {
  if (context.measureText(label).width <= available_width) return label;

  const characters = Array.from(label);
  while (characters.length && context.measureText(characters.join('') + '…').width > available_width) {
    characters.pop();
  }
  return characters.join('') + '…';
}

function draw_wheel(canvas, options) {
  const context = canvas.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, canvas_size, canvas_size);
  if (!options.length) return;

  const sector = circle / options.length;
  context.save();
  context.translate(radius, radius);

  options.forEach((label, index) => {
    const start = -Math.PI / 2 + index * sector;
    const { fill, ink } = palette[index % palette.length];
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius - 2, start, start + sector);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = '#21113b35';
    context.stroke();

    context.save();
    context.rotate(start + sector / 2);
    context.font = `700 ${Math.min(38, Math.max(18, 590 / options.length))}px system-ui, sans-serif`;
    context.fillStyle = ink;
    context.textBaseline = 'middle';
    context.textAlign = 'right';
    context.fillText(fit_label(context, label, 265), radius - 38, 0);
    context.restore();
  });

  context.restore();
}

export function Wheel({ options, rotation, duration, can_spin, on_spin }) {
  const canvas_ref = use_ref(null);

  use_effect(() => {
    draw_wheel(canvas_ref.current, options);
  }, [options]);

  return (
    <button className="wheel" type="button" aria-label="Girar tocando la rueda" disabled={!can_spin} onClick={on_spin}>
      {options.length > 0 && <span className="wheel_pointer" />}
      <canvas
        className="wheel_canvas"
        aria-hidden="true"
        ref={canvas_ref}
        width={canvas_size}
        height={canvas_size}
        style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${duration}ms`, transitionTimingFunction: `cubic-bezier(${spin_easing.join(',')})` }}
      />
      <span className="wheel_hub" aria-hidden="true">▶</span>
    </button>
  );
}
