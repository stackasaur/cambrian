import { getId, isEvent } from "./util";
import {isSignal} from "./signal";

function isDynamic(obj: unknown){
    return typeof obj === "function" || obj instanceof Node || isSignal(obj);
}

/** based on the previous template strings, determine if the dynamic
 *  expression is used as an attribute
**/
function getAttribute(prev:string){
    for (let i=prev.length-1;i>=0;i--){
        const c = prev.charAt(i);

        if (c === ">")
            return undefined;

        else if (c === "="){
            let attNameEnd;
            let attNameStart;
            for (let j=i-1;j>=0;j--){
                const c = prev.charAt(j);
                if (attNameEnd != null && c === " "){
                    attNameStart = j+1;
                    break;
                } else if (attNameEnd == null){
                    attNameEnd = j+1;
                }
            }
            if (attNameStart != null && attNameEnd != null){
                return prev.substring(attNameStart,attNameEnd);
            }
        } else if (c !== " "){
            return undefined;
        }
    }
    return undefined;
}
const eventRegex = /on:[a-z]+/;
function html(templateStrings:TemplateStringsArray, ...args: Array<unknown>): DocumentFragment{
    // const strings = [...templateStrings];
    const wrapper = document.createElement("template");
    const chunks: Array<String> = [];

    const resourceMap = new Map();
    const attributeMap = new Map();
    const keyMap = new Map();
    const events: Set<keyof ElementEventMap> = new Set();

    if (args != null){        
        args.forEach((arg,idx)=>{
            let prev = templateStrings[idx];
            // let next = templateStrings.length>idx+1
            //     ? templateStrings[idx+1]
            //     : null;            
            
            if (isDynamic(arg)){
                const id = keyMap.has(arg)
                    ? keyMap.get(arg)
                    : (getId());
                
                resourceMap.set(id,arg);
                keyMap.set(arg,id);

                const attName = getAttribute(prev);
                // tag
                if (attName == null){
                    chunks.push(prev,`<ins id="${id}"></ins>`);
                }
                // listener
                else if (eventRegex.test(attName) && isEvent(attName.substring(3))){
                    //@ts-ignore
                    const event: keyof ElementEventMap = attName.substring(3);

                    if (!events.has(event)){
                        events.add(event);
                    }

                    chunks.push(prev,`"${id}"`);
                }
                // att
                else {
                    attributeMap.set(id,attName);
                    chunks.push(prev,`"${id}"`);
                }
            } else {
                chunks.push(prev,String(arg));
            }
        });
    }
    chunks.push(templateStrings[templateStrings.length-1]);

    // try to use experimental
    if ("setHTML" in wrapper && typeof wrapper.setHTML === "function")
        wrapper.setHTML(chunks.join(""));
    else
        wrapper.innerHTML = chunks.join("");

    for(const event of events){
        const els = wrapper.content.querySelectorAll(`[on\\:${event}]`);
        for (const el of els){
            const att = el.getAttribute(`on:${event}`);
            if (resourceMap.has(att)){
                const func = resourceMap.get(att);
                el.addEventListener(event,func);
                el.removeAttribute(`on:${event}`);
            }
        }
    }
    resourceMap.forEach((value,key)=>{
        let el:Element|Text|null = wrapper.content.querySelector(`#${key}`);
        if (el != null){
            if (value instanceof Node){
                el.replaceWith(value);
            } else if (isSignal(value)){
                value.subscribe((i:unknown)=>{
                    if (el != null){
                        if (el instanceof Element){
                            const newNode = document.createTextNode(String(i));
                            el.replaceWith(newNode);
                            el = newNode;
                        } else if (el instanceof Text){
                            el.textContent = String(i);
                        }
                    }
                });
            } else if (typeof value === "function"){
                console.log("TODO FUNCTION")
            }
        }
    });

    attributeMap.forEach((value,key)=>{
        let el = wrapper.content.querySelector(`[${value}="${key}"]`);
        if (el != null && resourceMap.has(key)){
            const resource = resourceMap.get(key);
            if (isSignal(resource)){
                resource.subscribe((i:unknown)=>{
                    if (el != null){
                        el.setAttribute(value,String(i));
                    }
                });
            } else if (typeof resource === "function"){
                console.log("TODO FUNCTION")
            } else{
                el.removeAttribute(value);
            }
        }
    });

    return wrapper.content;
}

export {html, html as default};