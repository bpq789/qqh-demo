
const strats = {};
const LIFECYCLE = [
    'beforeCreate',
    'created'
]

LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        //{} {created:function(){}} => {created: [fn]}
        //{created: [fn]} {created:function(){}} => {created: [fn,fn]}
        if (c) {
            if (p) {//如果儿子有，父亲也有 让父亲和儿子拼在一起
                return p.concat(c);
            } else {
                return [c]; //儿子有，父亲没有 则将儿子暴露成数组
            }
        } else {//如果儿子没有，父亲有，父亲的必定为数组 直接返回父亲即可
            return p;
        }
    }
})

strats.components = function (parentVal,childVal) {
    const res = Object.create(parentVal);

    if(childVal){
        for(let key in childVal){
            res[key] = childVal[key]; //返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
        }
    }

    return res;
}


export function mergeOptions(parent, child) {
    const options = {};

    for (let key in parent) { // 循环老的
        mergeField(key);
    }

    for (let key in child) { //循环儿子
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }

    function mergeField(key) {
        //策略模式 用策略模式减少if/else
        //我们期望将用户的选项和全局的options进行合并
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            //如果不在策略中则以儿子为主
            options[key] = child[key] || parent[key]; //优先采用儿子，再采用父亲
        }

    }

    return options;
}