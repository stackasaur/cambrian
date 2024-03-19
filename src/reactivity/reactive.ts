type subscriptionFn = (v:unknown)=>void;
type updateFn = (v:unknown)=>unknown;

const noop = ()=>{};

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
    function update(fn:updateFn=noop){
        set(fn(value));
    }
  
    function subscribe(run:subscriptionFn=noop){
      subscriptions.add(run);
      run(value);
      return ()=>{subscriptions.delete(run)};
    }
    function fire(){
        subscriptions.forEach(i=>i(value));
    }
    function clear(){
        subscriptions.clear();
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
        fire,
        clear
    }
}

function Readable(val:unknown){
    const reactive = Reactive(val);
    return {
        subscribe:reactive.subscribe,
        get:reactive.get,
        get value(){
            return reactive.get();
        },
        clear:reactive.clear,
        fire:reactive.fire
    } 
}

function isReactive(obj: unknown): obj is ReturnType<typeof Reactive>{
    return (obj != null && typeof obj === "object" && "subscribe" in obj);
}

export {isReactive, Reactive, Readable, Reactive as default};