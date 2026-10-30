(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const svgNS = 'http://www.w3.org/2000/svg';
  function text(x,y,content,anchor='start') { const el=document.createElementNS(svgNS,'text'); el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('text-anchor',anchor);el.textContent=content;return el; }
  window.updateExplanation = function(p) {
    $('continue-value').textContent=(1-p.maximalStop).toFixed(3);
    $('query-value').textContent=p.k;
    $('expected-value').textContent=p.maximalCost.toFixed(3);
    $('ratio-value').textContent=p.ratio.toFixed(3);
    $('lower-value').textContent=p.lower.toFixed(3);
    $('upper-value').textContent=p.upper.toFixed(3);
    $('bound-n').textContent=p.n;
    $('sharpness').textContent=p.n===2 ? 'The general bracket is loose here: a separate result proves ρ₂ = 1.' : p.n%2 ? 'Odd dimension: the lower and upper bounds coincide.' : `Even dimension: the gap between these bounds is 1/(4n) = ${(1/(4*p.n)).toFixed(5)}.`;
    const x=k=>64+(k-1)/(p.n-1)*696;
    const ymax=Math.max(1.5,p.upper*1.13);
    const y=ratio=>250-ratio/ymax*210;
    const coords=Array.from({length:p.n},(_,i)=>`${x(i+1)},${y((i+1)*(p.n-i)/p.n)}`);
    $('ratio-line').setAttribute('d','M'+coords.join('L'));
    $('ratio-point').setAttribute('cx',x(p.k));$('ratio-point').setAttribute('cy',y(p.ratio));
    const grid=$('chart-grid');grid.replaceChildren();
    const labels=$('chart-labels');labels.replaceChildren(text(64,30,'Query-cost ratio'),text(760,335,'Read threshold k','end'));
    [0,ymax/2,ymax].forEach(v=>{const line=document.createElementNS(svgNS,'path');line.setAttribute('d',`M64 ${y(v)}H760`);line.setAttribute('class','chart-grid');grid.append(line);labels.append(text(48,y(v)+5,v.toFixed(1),'end'));});
    const ticks=new Set([1,Math.ceil(p.n/2),p.n]);ticks.forEach(v=>labels.append(text(x(v),278,String(v),'middle')));
    labels.append(text(x(p.k),Math.max(37,y(p.ratio)-15),`k=${p.k}: ${p.ratio.toFixed(3)}`,p.k===1?'start':p.k===p.n?'end':'middle'));
    $('chart-desc').textContent=`For n=${p.n}, the exact lower-family ratio is k times (n minus k plus one), divided by n. At k=${p.k} it is ${p.ratio.toFixed(3)}. Its maximum is ${p.lower.toFixed(3)}.`;
  };
})();
