type subscriptionFn = (v:unknown)=>void;
type updateFn = (v:unknown)=>unknown;

function Reactive(val:unknown){
    const subscriptions: Set<subscriptionFn> = new Set();
    let value = val;
    
    function get(){
        return value;
        // let val;
        // subscribe((v:unknown)=>{val=v})();
        // return val;
    }
    function set(val:unknown){
      value = val;
      fire();
    }
    function update(fn:updateFn=()=>{}){
        set(fn(value));
    }
  
    function subscribe(run:subscriptionFn=()=>{}){
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
        get,
        set,
        get value(){
            return get();
        },
        set value(v){
            set(v);
        },
        fire
    }
}

function isReactive(obj: unknown): obj is ReturnType<typeof Reactive>{
    return (obj != null && typeof obj === "object" && "subscribe" in obj);
}

export {isReactive, Reactive, Reactive as default};