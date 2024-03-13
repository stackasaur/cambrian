function Signal(val:unknown){
    const subscriptions: Set<Function> = new Set();
    let value = val;
    
    function get(){
        let val;
        subscribe((v:unknown)=>{val=v})();
        return val;
    }
    function set(val:unknown){
      value = val;
      fire();
    }
    function update(fn:Function=()=>{}){
        set(fn(value));
    }
  
    function subscribe(run:Function=()=>{}){
      subscriptions.add(run);
      run(value);
      return ()=>{subscriptions.delete(run)};
    }
    function fire(){
        subscriptions.forEach(i=>i(value));
    }

    return {
        subscribe,
        update,
        set,
        get,
        fire
    }
}

function isSignal(obj: unknown): obj is ReturnType<typeof Signal>{
    return (obj != null && typeof obj === "object" && "subscribe" in obj);
}

export {isSignal, Signal, Signal as default};