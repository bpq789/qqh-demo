// import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
// import { createElm, patch } from "./vdom/patch";

//类的特点: 将所有的方法都耦合在一起(一般不这样做)
/* class Vue{

} */

//Vue构造函数
function Vue(options) { //options就是用户传进来的配置信息
    this._init(options) //初始化
}

initMixin(Vue); //扩展了init方法

initLifeCycle(Vue); // vm._update vm._render

initGlobalAPI(Vue); //全局api的实现

initStateMixin(Vue); //实现了nextTick $watch

//为了方便观测前后的虚拟节点 测试的

// let render1 = compileToFunction(`<ul key="a" style="color:red">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li>
//     <li key="d">d</li>
// </ul>`)
// let vm1 = new Vue({ data() { return { name: '123' } } })
// let prevVnode = render1.call(vm1)

// let el = createElm(prevVnode);
// document.body.appendChild(el);

// let render2 = compileToFunction(`<ul key="a" style="background:blue;color:red">
//     <li key="b">b</li>
//     <li key="m">m</li>
//     <li key="a">a</li>
//     <li key="p">p</li>
//     <li key="c">c</li>
//     <li key="q">q</li>
// </ul>`)
// let vm2 = new Vue({ data() { return { name: '123' } } })
// let nextVnode = render2.call(vm2)

//直接将新的节点替换掉了老的，不是直接替换 而是比较两个人的区别之后再替换
//diff算法是一个平级比较的过程 父亲和父亲比对 儿子和儿子比对

/* setTimeout(() => {
    let newEl = createElm(nextVnode)
    el.parentNode.replaceChild(newEl,el)
}, 1000); */

// setTimeout(() => {
//     patch(prevVnode, nextVnode)
// }, 1000);

export default Vue