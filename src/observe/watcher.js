import Dep, { popTarget, pushTarget } from "./dep";

let id = 0

//1.当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
//2.调用_render()方法会取值  走到get上

//每个属性有一个dep(属性就是被观察者) watcher就是观察者 属性变化了会通知观察者来更新 -> 观察者模式

class Watcher { //不同组件有不同的watcher new Watcher
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++;

        this.renderWatcher = options;//是一个渲染过程

        if (typeof exprOrFn === 'string') {
            this.getter = function () {
                return vm[exprOrFn];
            }
        } else {
            this.getter = exprOrFn; //getter意味着调用这个函数可以发生取值操作
        }

        this.deps = []; // 后续我们实现计算属性，和一些清理工作需要用到

        this.depsId = new Set();

        this.lazy = options.lazy;

        this.cb = cb;

        this.dirty = this.lazy; //缓存值

        this.vm = vm;

        this.user = options.user; //标识是否是用户自己的watcher

        this.value = this.lazy ? undefined : this.get();

    }

    get() {
        pushTarget(this); //静态属性就是只有一份
        let value = this.getter.call(this.vm); //会去vm上取值 vm._render(vm._update)
        popTarget(); //渲染完毕后清空 
        return value;
    }

    evaluate() {
        this.value = this.get(); //获取到的用户函数的返回值 并且还要标识为脏
        this.dirty = false;
    }

    addDep(dep) { // 一个组件对应着多个属性 重复的属性也不用记录
        let id = dep.id;

        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); //watcher已经记住dep了而且已经去重了，此时让dep也记住watcher
        }
    }

    update() {
        if (this.lazy) {
            //如果是计算属性 依赖的值变化了 就标识计算属性是脏值了
            this.dirty = true;
        } else {
            queueWatcher(this); //把当前的watcher暂存起来
            // this.get(); //重新渲染
        }

    }

    run() {
        let oldValue = this.value;
        //渲染的时候用的是最新的vm来渲染的

        let newValue = this.get(); //vm.name = 最后一次的值

        this.value = newValue;

        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }

    depend() {
        let i = this.deps.length;
        while (i--) {
            //dep.depend()
            this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
        }
    }
}

let queue = [];
let has = {};
let pending = false; //防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = []; //在刷新的过程中可能还有新的watcher,重新放到queue中
    has = {};
    pending = false;
    flushQueue.forEach(watcher => watcher.run());
}


function queueWatcher(watcher) {
    const id = watcher.id;
    if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        //不管我们的update执行多少次，但是最终只执行一轮刷新操作

        if (!pending) {
            nextTick(flushSchedulerQueue, 0);
            pending = true;
        }

    }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
    let cds = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cds.forEach(cb => cb());
}


//nextTick中没有直接使用某个api,而是采用优雅降级的方式
//内部先采用的是promise(ie不兼容)  -> html5的MutationObserver(h5的api) -> 可以考虑ie专享的setImmdiate -> setTimeout

let timeFunc;

// if(Promise){
//     timeFunc = () => {
//         Promise.resolve().then(flushCallbacks);
//     }
// }else if(MutationObserver){
//     let observer = new MutationObserver(flushCallbacks); //这里传入的回调时异步执行的
//     let textNode = document.createTextNode(1);
//     observer.observe(textNode,{
//         characterData: true
//     })//检测textNode的数据变化，一旦发生了变化就执行传入的回调函数
//     timeFunc = () => {
//         textNode.textContent = 2; //让textNode的数据发生变化
//     }
// }else if(setImmdiate){
//     timeFunc = () => {
//         setImmdiate(flushCallbacks);
//     }
// }else{
//     timeFunc = () => {
//         setTimeout(flushCallbacks);
//     }
// }

export function nextTick(cb) { //先内部还是先用户
    callbacks.push(cb); //维护nextTick中的callback方法
    if (!waiting) {
        // setTimeout(flushCallbacks, 0); //最后一起刷新，按照顺序依次执行
        // timeFunc(); //兼容ie的写法
        Promise.resolve().then(flushCallbacks); //不需要兼容ie
        waiting = true;
    }
}


//需要给每个属性增加一个dep,目的就是手机watcher

//一个视图中 有多少属性 (n个属性会对应一个视图) n个dep对应一个watcher
//一个属性对应多个视图 1个dep对应多个watcher
//多对多的关系

export default Watcher;