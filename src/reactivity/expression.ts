import { Reactive, isReactive } from "./reactive";

function expression(templateStrings: TemplateStringsArray, ...resources:unknown[]): ReturnType<typeof Reactive>{
    const argNames: string[] = [];
    const chunks: string[] = [];
    const argValues: unknown[] = [];
    let init = false;
    let ret = Reactive(null);
    let func = ()=>{};
    resources.forEach((resource,idx)=>{
        const prev = templateStrings[idx];
        if (isReactive(resource)){
            const argName = `arg${argNames.length}`;
            argNames.push(argName);
            chunks.push(prev,argName);
            resource.subscribe((i:unknown)=>{
                argValues[idx] = i;
                if (init){
                    //@ts-ignore
                    ret.set(func.apply(null,argValues));
                }
            }); 
        } else{
            chunks.push(prev,String(resource));
            argValues[idx] = resource;
        }
    });

    const functionBody = `return (${chunks.join("")})`;
    
    argNames.push(functionBody)
    //@ts-ignore
    func = Function(...argNames);
    console.log('func',func.toString());

    init = true;

    //@ts-ignore
    ret.set(func.apply(null,argValues));
    
    return ret;
}

export {expression, expression as default};