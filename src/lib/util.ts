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

export {getId, isEvent}