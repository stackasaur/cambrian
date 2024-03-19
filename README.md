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

## Reactivity
_cambrian_ includes an implementation of a simple subscription based object _Reactive_.

Of course, you can use your own implementation too. In the eyes of _cambrian_, a Reactive object is anything that properly implements a `subscribe` method. Subscribe is expected to take a function as a parameter, which uses the changed value as its first argument.

```js
const r = Reactive("foo");
r.subscribe(i=>console.log(i));
// expected output: foo

r.set("bar");
// expected output: bar
```

## Expressions
_cambrian_ includes the ability to bind expressions. Simliar to other syntax, the `expression` template tag can be used to create a reactive expression.

```js
const arg0 = Reactive(1);
const arg1 = Reactive(1);

const exp = expression`${arg0} + ${arg1}`;
console.log(exp.get()); // expected output: 2

arg0.set(2);
console.log(exp.get()); // expected output: 3
```

## Iteration
coming soon

## Components
coming soon

## Roadmap
 - [x] conditional rendering
 - [x] expressions
 - [ ] iteration
 - [ ] components/templates

## Contributing

Accepting Pull Requests, Ideas, Issues, Criticism, and Donations.