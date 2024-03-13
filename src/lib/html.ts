import { getId, isEvent } from "./util";
import {isSignal} from "./signal";

/**
 * isDynamic
 * @description determines if an Object is subject to change or not
 * @param {unknown}obj
 * @returns {boolean}
 */
function isDynamic(obj: unknown): obj is object|Function|Node|typeof isSignal{
    return typeof obj === "function" || obj instanceof Node || isSignal(obj);
}

/** 
 * getAttribute
 * @description based on the template string, determines if a variable is used
 * in the context of an attribute. Returns the attribute name if so, otherwise
 * returns undefined
 * @param {string}prev the previous template string
 * @returns {string|undefined}
**/
function getAttribute(prev:string){
    for (let i=prev.length-1;i>=0;i--){
        const c = prev.charAt(i);

        // if a close angle is the notable first character seen, it must be
        // in a tag
        if (c === ">")
            return undefined;

        // currently, when used in an attribute, quotes aren't supported.
        // if it's an equals sign, look backwards for the attribute name
        else if (c === "="){
            let attNameEnd;
            let attNameStart;
            for (let j=i-1;j>=0;j--){
                const c = prev.charAt(j);

                // if the attribute name end exists and a space is reached, the
                // the name has been passed.
                if (attNameEnd != null && c === " "){
                    attNameStart = j+1;
                    break;
                } 
                // if the name end hasn't been set yet and the current
                // character isn't a space, it's the end.
                else if (attNameEnd == null && c !== " "){
                    attNameEnd = j+1;
                }
            }
            if (attNameStart != null && attNameEnd != null){
                return prev.substring(attNameStart,attNameEnd);
            }
        } 
        // if anything else, it can't be an attribute
        // TODO: support quotes?
        else if (c !== " "){
            return undefined;
        }
    }
    return undefined;
}
// events must have on:event syntax to pass the built in parser
const eventRegex = /on:[a-z]+/;
function html(templateStrings:TemplateStringsArray, ...args: Array<unknown>): DocumentFragment{
    // use a template because anything can be a child of a template
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
                // get a locally unique identifier to use to find elements
                const id = getId();
                resourceMap.set(id,arg);
                keyMap.set(arg,id);

                const attName = getAttribute(prev);
                // content, insert a placeholder element
                if (attName == null){
                    chunks.push(prev,`<ins id="${id}"></ins>`);
                }
                // listener, store the key for the resource as the on:event val
                else if (eventRegex.test(attName) && isEvent(attName.substring(3))){
                    //@ts-ignore - TODO: fix this one
                    const event: keyof ElementEventMap = attName.substring(3);
                    if (!events.has(event)){
                        events.add(event);
                    }
                    chunks.push(prev,`"${id}"`);
                }
                // att, set the attribute as [att="id"] for querying,
                // map the key to the attribute name for reference
                else {
                    attributeMap.set(id,attName);
                    chunks.push(prev,`"${id}"`);
                }
            } 
            // if the value isn't a tracked dynamic type, just cast it
            else {
                chunks.push(prev,String(arg));
            }
        });
    }
    chunks.push(templateStrings[templateStrings.length-1]);

    // TODO: try to use experimental setHTML
    // if ("setHTML" in wrapper && typeof wrapper.setHTML === "function")
    //     wrapper.setHTML(chunks.join(""));
    // else
        wrapper.innerHTML = chunks.join("");

    // for each tracked event, find all referencing elements, create proper
    // event listener and remove attribute
    for(const event of events){
        const els = wrapper.content.querySelectorAll(`[on\\:${event}]`);
        for (const el of els){
            const att = el.getAttribute(`on:${event}`);
            if (resourceMap.has(att)){
                const func = resourceMap.get(att);
                el.addEventListener(event,func);
                el.removeAttribute(`on:${event}`);
                resourceMap.delete(att);
            }
        }
    }
    // for everything in the attribute map, find the element, update the
    // attribute
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
            resourceMap.delete(key);
        }
    });

    // for everything left in the resourcemap, find the element, and insert
    // the resource
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

    

    // clear all the maps/sets/arrays
    resourceMap.clear();
    keyMap.clear();
    attributeMap.clear();
    events.clear();
    chunks.length = 0;

    return wrapper.content;
}

export {html, html as default};