//我们希望重写数组中的部分方法



let oldArrayProto = Array.prototype; //获取数组的原型


//newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto); //创建一个空对象，其原型是oldArrayProto

//找到所有的变异方法
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]//concat slice都不会改变原来的数组

methods.forEach(method => {
    newArrayProto[method] = function (...args) {
        //push()
        const result = oldArrayProto[method].call(this, ...args) //内部调用原来的方法,函数的劫持 切片编程

        //我们需要对新增的数据再次进行劫持
        let inserted;//新增的内容
        let ob = this.__ob__;
        switch (method) {
            case 'push'://arr.push(1,2,3)
            case 'unshift'://arr.unift(1,2,3)
                inserted = args;
                break;
            case 'splice'://arr.splice(0,1,{a:1})
                inserted = args.slice(2)

            default:
                break;
        }

        if(inserted){//对新增的内容再次进行观测
            ob.observeArray(inserted);
        }

        //走到这里
        ob.dep.notify(); //数组变化了 通知对应的watcher实现更新逻辑

        return result
    }
})