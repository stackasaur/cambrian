# Cambrian
> [!WARNING]
> This library is very much in progress, it is currently v0.1.0 with no target 
> date for a v1.0.0 release. Expect breaking changes and stupid code refactors
> that move everything around in preparation of new features.
---
Creating HTML elements in JavaScript isn't hard.

```js
const p = document.createElement("p");
p.innerText = "Hello World!";
```

However, when you start creating more advanced node-trees, it gets pretty tedious.

```js
const myFunc = ()=>{};
const message = "Hello World!";

const card = document.createElement("article");

const header = document.createElement("header");
card.appendChild(header);

const button = document.createButton("button");
button.innerText = "action";
button.addEventListener("click",myFunc);
header.appendChild(button);

const p = document.createElement("p");
p.innerText = message;
card.appendChild(p);

```

Not only is that annoying to write, it's annoying to read. Fortunately, browsers are very good at loading HTML from string, and you can make this a bit easier on yourself without really worsening <u title="">practical</u> performance.

```js
const myFunc = ()=>{};
const message = "Hello World!";

const card = document.createElement("article");
card.innerHTML = `
    <header>
        <button>action</button>
    </header>
    <p>${message}</p>
`;

const button = card.querySelector("button");
button.addEventListener("click",myFunc);
```

Now, this isn't nearly as bad to write, but still, if you have a lot of events or dynamic content, it gets unweildy. This is where _cambrian_ comes in.

With _cambrian_, the example becomes:

```js
const myFunc = ()=>{};
const message = "Hello World!";

const card = html`
    <article>
        <header>
            <button on:click=${myFunc}>action</button>
        </header>
        <p>${message}</p> 
    </article>
`;
```

That's it!

I'm not going to say _cambrian_ is better than the above methods, because it isn't, but my benchmarks show it is not noticeably worse for the useability improvements.

By no means should you see _cambrian_ as an alternative to popular frameworks like React, Vue, Svelte, etc., but you can see it as a tool you can use within those other frameworks. 

This whole project started as a way to construct popup content within Leaflet maps, and such tasks are what it's good at. Generating simple html elements with events and reactivity.

## Reactivity
_cambrian_ includes an implementation of a simple subscription based object _Reactive_.

Of course, you can use your own implementation too. In the eyes of _cambrian_, a Reactive object is anything that properly implements a `subscribe` method. Subscribe is expected to take a function as a parameter, which uses the changed value as its first argument.

## Roadmap
 - [x] conditional rendering
 - [x] expressions
 - [ ] iteration
 - [ ] components/templates

## Contributing

Accepting Pull Requests, Ideas, Issues, Criticism, and Donations.