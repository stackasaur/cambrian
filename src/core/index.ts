import { getId, isEvent, isDynamic, getAttribute, eventRegex } from "../util";
import { isReactive } from "../reactivity";
import { handleConditionalRendering, IF_ATT } from "../conditional";

export enum REPLACEMENT_TYPE{
    ATTRIBUTE,
    ELEMENT,
    LISTENER
}
export type Replacement = {
    id:string,
    type:REPLACEMENT_TYPE,
    query:string,
    resource:unknown,
    att?:string,
    event?:keyof ElementEventMap,
    value:string
};


function getReplacement(resource:unknown, prev?:string):Replacement|string{
    if (isDynamic(resource)){
        const id = getId();
        const attName = getAttribute(prev);
        // element
        if (attName == null){
            return {
                id,
                type:REPLACEMENT_TYPE.ELEMENT,
                query:`#${id}`,
                resource,
                value:`<ins id="${id}"></ins>`
            };
        } 
        // listener
        else if (eventRegex.test(attName) && isEvent(attName.substring(3))){
            const event = attName.substring(3) as keyof ElementEventMap;
            return {
                id,
                type:REPLACEMENT_TYPE.LISTENER,
                query:`[on\\:${event}="${id}"]`,
                att:`on:${event}`,
                event,
                resource,
                value: `"${id}"`
            };
        } 
        // attribute
        else {
            return {
                id,
                type:REPLACEMENT_TYPE.ATTRIBUTE,
                query:`[${attName.replace(/:/g,"\\:")}="${id}"]`,
                att:attName,
                resource,
                value: `"${id}"`
            };
        }
    }
    else if (typeof resource === "boolean" && prev != null){
        const attName = getAttribute(prev);
        if (attName != null){
            const id = getId();
            return {
                id,
                type:REPLACEMENT_TYPE.ATTRIBUTE,
                query:`[${attName}="${id}"]`,
                att:attName,
                resource,
                value:`"${id}"`
            };
        }
    }
    return String(resource);
}

function parse(templateStrings:TemplateStringsArray, ...resources:unknown[]){
    const template = document.createElement("template");

    const chunks: Array<string> = [];

    const replacementMap: Map<string,Replacement> = new Map();
    
    resources.forEach((resource,idx)=>{
        const prev = templateStrings[idx];

        const replacement = getReplacement(resource,prev);
        if (typeof replacement !== "string")
            replacementMap.set(replacement.id,replacement);
        chunks.push(
            prev,
            typeof replacement === "string"?replacement:replacement.value
        );
    });

    chunks.push(templateStrings[templateStrings.length-1]);
    template.innerHTML = chunks.join("");

    for (const replacement of replacementMap.values()){
        const {resource,type,query,event,att} = replacement;
        let el:Element|Text|null = template.content.querySelector(query);
        if (el != null){
            
            switch(type){
                case REPLACEMENT_TYPE.ATTRIBUTE:{
                    if (att ===  IF_ATT){
                        handleConditionalRendering(resource,el,replacementMap);
                    } else if (att != null){
                        if (isReactive(resource)){
                            resource.subscribe((i:unknown)=>{
                                if (el != null && att != null && el instanceof Element){
                                    if(typeof i === "boolean"){
                                        el.removeAttribute(att);
                                        if (i){
                                            el.toggleAttribute(att);
                                        }
                                    } else{
                                        el.setAttribute(att,String(i));
                                    }
                                }
                            });
                        } else if (typeof resource === "function"){
                            console.log("TODO FUNCTION")
                        } else if(typeof resource === "boolean"){
                            el.removeAttribute(att);
                            if (resource){
                                el.toggleAttribute(att);
                            }
                        } else if (el != null && att != null && el instanceof Element){
                          if(typeof resource === "boolean"){
                            el.removeAttribute(att);
                            if (resource){
                                el.toggleAttribute(att);
                            }
                          } else {
                            el.removeAttribute(att);
                          }
                        }
                    }
                    break;
                }
                case REPLACEMENT_TYPE.ELEMENT:{
                    if (resource instanceof Node){
                        el.replaceWith(resource);
                    }
                    else if (isReactive(resource)){
                        resource.subscribe((i:unknown)=>{
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
                    } else if (typeof resource === "function"){
                        // TODO:
                    }
                    break;
                }
                case REPLACEMENT_TYPE.LISTENER:{
                    if (event != null && typeof resource === "function"){
                        
                        el.addEventListener(event,resource as EventListenerOrEventListenerObject);
                    }
                    if (att != null)
                        el.removeAttribute(att);
                    
                    break;
                }
            }
        }
    }
    replacementMap.clear();
    chunks.length = 0;

    return template.content;
}
function main(templateStrings:TemplateStringsArray, ...resources:unknown[]){

    return parse(templateStrings,...resources);
}

export {main as html};