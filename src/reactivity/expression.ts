import { Reactive, isReactive } from "./reactive";

function expression(templateStrings: TemplateStringsArray, ...resources:unknown[]): ReturnType<typeof Reactive>{
    const argNames: string[] = [];
    const chunks: string[] = [];
    const argValues: unknown[] = [];
    let init = false;
    const ret = Reactive(null);
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
                    //@ts-expect-error dynamic args
                    ret.value = func(...argValues);
                }
            }); 
        } else{
            chunks.push(prev,String(resource));
            argValues[idx] = resource;
        }
    });
    chunks.push(templateStrings[templateStrings.length-1]);
    const functionBody = `return (${chunks.join("")})`;
    
    
    argNames.push(functionBody)
    //@ts-expect-error dynamic function
    func = Function(...argNames);

    init = true;

    //@ts-expect-error dynamic args
    ret.value = func(...argValues);
    return ret;
}

export {expression, expression as default};