import { isReactive } from "../reactivity";
function* idGenerator(){
    let ct = 0;
    while (true) {
        yield `f-${Date.now()}-${ct++}`;
    }
}
const generator = idGenerator();
function getId(salt=''){
    return `${salt}${generator.next().value}`;
}

const eventNames=new Set(["readystatechange","pointerlockchange","pointerlockerror","beforecopy","beforecut","beforepaste","freeze","prerenderingchange","resume","search","visibilitychange","fullscreenchange","fullscreenerror","webkitfullscreenchange","webkitfullscreenerror","beforexrselect","abort","beforeinput","beforematch","beforetoggle","blur","cancel","canplay","canplaythrough","change","click","close","contentvisibilityautostatechange","contextlost","contextmenu","contextrestored","cuechange","dblclick","drag","dragend","dragenter","dragleave","dragover","dragstart","drop","durationchange","emptied","ended","error","focus","formdata","input","invalid","keydown","keypress","keyup","load","loadeddata","loadedmetadata","loadstart","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","mousewheel","pause","play","playing","progress","ratechange","reset","resize","scroll","securitypolicyviolation","seeked","seeking","select","slotchange","stalled","submit","suspend","timeupdate","toggle","volumechange","waiting","webkitanimationend","webkitanimationiteration","webkitanimationstart","webkittransitionend","wheel","auxclick","gotpointercapture","lostpointercapture","pointerdown","pointermove","pointerrawupdate","pointerup","pointercancel","pointerover","pointerout","pointerenter","pointerleave","selectstart","selectionchange","animationend","animationiteration","animationstart","transitionrun","transitionstart","transitionend","transitioncancel","copy","cut","paste","scrollend"]);
function isEvent(evtName: string): evtName is keyof ElementEventMap{
    return (eventNames.has(evtName.toLowerCase()));
}

/**
 * isDynamic
 * @description determines if an Object is subject to change or not
 * @param {unknown}obj
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isDynamic(obj: unknown): obj is object|Function|Node|typeof isReactive{
    return typeof obj === "function" || obj instanceof Node || isReactive(obj);
}

/** 
 * getAttribute
 * @description based on the template string, determines if a variable is used
 * in the context of an attribute. Returns the attribute name if so, otherwise
 * returns undefined
 * @param {string}prev the previous template string
 * @returns {string|undefined}
**/
function getAttribute(prev?:string){
    if (prev != null){
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
    }
    return undefined;
}
const eventRegex = /on:[a-z]+/;

export {getId, isEvent, isDynamic, getAttribute, eventRegex}