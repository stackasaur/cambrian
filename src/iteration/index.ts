export const EACH_ATT = ":each";
export const AS_ATT = ":as";
export const IDX_ATT = ":idx";
export const KEY_ATT = ":key";

const AS_DEFAULT = "it";
const IDX_DEFAULT = "it";

export function handleIteration(resource:unknown, el: Element, replacementMap: Map<string, Replacement>){
    
    const asVal = el.hasAttribute(AS_ATT)
        ? el.getAttribute(AS_ATT)
        : AS_DEFAULT;

    const idxVal = el.hasAttribute(IDX_ATT)
        ? el.getAttribute(IDX_ATT)
        : IDX_DEFAULT;

    
}