import {html, Signal} from  './lib';

const app = document.querySelector('#app');

// initialize counter
const counter = Signal(0);
setInterval(()=>{
  counter.update(v=>++v)
},1000);

// button click handler
const btnSignal = Signal(0);

const classSignal = Signal('red');
setInterval(()=>{
  classSignal.update(c=>{
    return c==='red'?'blue':'red';
  });
},1000);

const checkSignal = Signal(false);


const el = html`
<article>
  <header>counter:</header>
  <div>
    counting: ${counter}
  </div>
</article>
<article>
  <header>click counter:</header>
  <div>
    <button on:click=${()=>btnSignal.update(v=>++v)}>click me: ${btnSignal}</button>
  </div>
</article>
<article class="accordian">
  <header on:click=${evt=>{evt.currentTarget.parentElement.classList.toggle('open')}}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="arrow">
    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
accordian:</header>
  <div class=${classSignal}>
    i'm an accordian, click the header to close me!
  </div>
</article>
<article>
  <header>conditional rendering:</header>
  <div>
    <label><input type="checkbox" on:change=${()=>{checkSignal.update(v=>!v)}}>Check Me</label>
    <p :if=${checkSignal}>Show if True</p>
    <p :else>Show if False</p>
  </div>
</article>`;

app?.appendChild(el);