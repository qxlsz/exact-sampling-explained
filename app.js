(function () {
  'use strict';
  const M = window.SamplingMath;
  if (!M) return;
  const $ = id => document.getElementById(id);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {n: 9, k: 5, u: .75, phase: 'idle', elapsed: 0, last: 0, frame: null};
  const decimal = (x, digits = 2) => x.toFixed(digits);
  const percent = x => `${Number((100 * x).toFixed(1))}%`;
  function stop() { if (state.frame !== null) cancelAnimationFrame(state.frame); state.frame = null; }
  function buildCells(id) {
    const parent = $(id); parent.replaceChildren();
    for (let i = 0; i < state.n; ++i) { const cell = document.createElement('span'); cell.textContent = String(i+1); parent.append(cell); }
  }
  function paintPath(prefix, queries, progress, output) {
    const done = state.elapsed >= 420 + queries * 130;
    const reads = state.elapsed < 420 ? 0 : Math.min(queries, Math.floor((state.elapsed - 420) / 130) + 1);
    Array.from($(`${prefix}-cells`).children).forEach((cell, i) => cell.classList.toggle('read', i < reads));
    $(`${prefix}-marker`).style.transform = `translateX(${progress * state.u * 100}cqw)`;
    $(`${prefix}-status`).textContent = state.phase === 'idle' ? `${queries} ${queries === 1 ? 'query' : 'queries'} for this draw` : done ? `Return output ${output} after ${queries} ${queries === 1 ? 'query' : 'queries'}` : state.elapsed < 420 ? 'Follow the shared draw' : `Read ${reads} of ${queries}`;
    $(`${prefix}-lane`).classList.toggle('finished', done && state.phase !== 'idle');
  }
  function paint() {
    const b = M.branch(state.n, state.k, state.u);
    const progress = state.phase === 'idle' ? 1 : Math.min(1, state.elapsed / 420);
    paintPath('baseline', b.baselineQueries, progress, b.output);
    paintPath('constrained', b.maximalQueries, progress, b.output);
  }
  function complete() {
    stop(); state.phase = 'complete';
    state.elapsed = 550 + state.k * 130;
    paint(); $('play').textContent = 'Replay path'; $('pause').disabled = true;
    const b = M.branch(state.n, state.k, state.u);
    $('animation-status').textContent = `Both return output ${b.output}. Queries: ${b.baselineQueries} versus ${b.maximalQueries}.${motion.matches ? ' Reduced motion: final state shown.' : ''}`;
  }
  function tick(now) {
    if (state.phase !== 'running') return;
    if (state.last) state.elapsed += Math.min(now-state.last, 60);
    state.last = now; paint();
    const b = M.branch(state.n, state.k, state.u);
    if (state.elapsed >= 550 + Math.max(b.baselineQueries,b.maximalQueries) * 130) complete();
    else state.frame = requestAnimationFrame(tick);
  }
  function play() {
    stop(); state.phase = 'running'; state.elapsed = 0; state.last = 0;
    $('play').textContent = 'Restart path'; $('pause').textContent = 'Pause'; $('pause').disabled = false;
    $('animation-status').textContent = 'Tracing the same draw through both policies.';
    if (motion.matches) complete(); else state.frame = requestAnimationFrame(tick);
  }
  function sync() {
    stop(); state.phase = 'idle'; state.elapsed = 0;
    const p = M.parameters(state.n, state.k);
    $('n').value = state.n; $('k').max = state.n; $('k').value = state.k; $('draw').value = Math.round(state.u * 1000);
    $('n-value').textContent = state.n; $('k-value').textContent = state.k; $('u-value').textContent = decimal(state.u,3);
    $('baseline-stop').textContent = percent(p.baselineStop); $('constrained-stop').textContent = percent(p.maximalStop);
    $('baseline-cost').textContent = decimal(p.baselineCost); $('constrained-cost').textContent = decimal(p.maximalCost);
    $('baseline-stop-bar').style.transform = `scaleX(${p.baselineStop})`; $('constrained-stop-bar').style.transform = `scaleX(${p.maximalStop})`;
    buildCells('baseline-cells'); buildCells('constrained-cells');
    $('play').textContent = 'Play path'; $('pause').textContent = 'Pause'; $('pause').disabled = true;
    $('animation-status').textContent = 'Choose a draw, then play both paths.';
    paint();
    if (window.updateExplanation) window.updateExplanation(p);
  }
  $('n').addEventListener('input', e => { const oldBest = state.k === Math.ceil((state.n+1)/2); state.n = Number(e.target.value); state.k = oldBest ? Math.ceil((state.n+1)/2) : Math.min(state.k,state.n); sync(); });
  $('k').addEventListener('input', e => {state.k=Number(e.target.value);sync();});
  $('draw').addEventListener('input', e => {state.u=Number(e.target.value)/1000;sync();});
  $('randomize').addEventListener('click', () => { const a=new Uint32Array(1); crypto.getRandomValues(a); state.u=Math.floor(a[0]/4294967296*1000)/1000;sync(); });
  $('play').addEventListener('click',play);
  $('pause').addEventListener('click', () => {
    if (state.phase === 'running') {stop();state.phase='paused';$('pause').textContent='Resume';$('animation-status').textContent='Paused. Resume or change a parameter.';}
    else if (state.phase === 'paused') {state.phase='running';state.last=0;$('pause').textContent='Pause';state.frame=requestAnimationFrame(tick);}
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.phase==='running') $('pause').click(); });
  motion.addEventListener('change', () => {if(motion.matches && (state.phase==='running'||state.phase==='paused')) complete();});
  ['play','n','k','draw','randomize'].forEach(id => {$(id).disabled=false;});
  document.documentElement.classList.add('js');
  sync();
  window.SamplingDemo = Object.freeze({getState:()=>({...state,frame:undefined}),refresh:sync});
})();
