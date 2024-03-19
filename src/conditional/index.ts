import type { Replacement } from "../core";
import { isReactive, type Reactive } from "../reactivity";

export const IF_ATT = ":if";
export const ELIF_ATT = ":elseif";
export const ELSE_ATT = ":else";

function render(
	rendered: boolean[],
	el: Element,
	els: Element[]
): Element | undefined {
	for (let i = 0; i < rendered.length; i++) {
		const r = rendered[i];
		const e = els[i];
		if (r) {
			if (e != null) {
				el.replaceWith(e);
			}
			return e;
		}
	}
	return undefined;
}

export function handleConditionalRendering(resource:unknown, el: Element, replacementMap: Map<string, Replacement>) {
	let renderedElement = el;
	el.removeAttribute(":if");
	const rendered: boolean[] = [false];

	let sibling = el.nextElementSibling;
	const elifEls: Element[] = [];
	let elseEl: Element | undefined;

	const elifReplacementMap: Map<string, Replacement> = new Map();

	while (sibling != null) {
		if (sibling.hasAttribute(":elseif")) {
			elifEls.push(sibling);
			rendered.push(false);
			const elifId = sibling.getAttribute(":elseif");
			if (elifId != null && replacementMap.has(elifId)) {
				const replacement = replacementMap.get(elifId);
				if (replacement != null) {
					elifReplacementMap.set(elifId, replacement);
					replacementMap.delete(elifId);
				}
			}
			const tmp = sibling;
			sibling = sibling.nextElementSibling;
			tmp.remove();
		} else if (sibling.hasAttribute(":else")) {
			elseEl = sibling;

			const elseId = sibling.getAttribute(":else");
			if (elseId != null && replacementMap.has(elseId)) {
				replacementMap.delete(elseId);
			}
			elseEl.removeAttribute(":else");

			rendered.push(true);
			sibling.remove();
			break;
		} else {
			break;
		}
	}
	const els = [el, ...elifEls];
	if (elseEl != null) els.push(elseEl);

	if (isReactive(resource)) {
		resource.subscribe((i: unknown) => {
			rendered[0] = !!i;
			const e = render(rendered, renderedElement, els);
			if (e != null) renderedElement = e;
		});
	}
	elifEls.forEach((el, idx) => {
		const key = el.getAttribute(":elseif");
		if (key != null && elifReplacementMap.has(key)) {
			const replacement = elifReplacementMap.get(key);
			if (replacement != null) {
				const resource = replacement.resource as ReturnType<typeof Reactive>;
				resource.subscribe((i: unknown) => {
					rendered[idx + 1] = !!i;
					const e = render(rendered, renderedElement, els);
					if (e != null) renderedElement = e;
				});
			}
		}
		el.removeAttribute(":elseIf");
	});
}
