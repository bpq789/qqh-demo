import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";


export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {//将vnode转化为真实dom

        const vm = this;
        const el = vm.$el;

        const prevVnode = vm._vnode;

        vm._vnode = vnode; //把组件第一次产生的虚拟节点保存到_vnode上

        if (prevVnode) { //之前渲染过了
            vm.$el = patch(prevVnode, vnode);
        } else {
            vm.$el = patch(el, vnode);
        }

        //patch既有初始化的功能，又有更新的功能
        // vm.$el = patch(el, vnode);
    }

    //_c('div',{},children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments);
    }

    //_v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    }

    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value);
    }


    Vue.prototype._render = function () {
        const vm = this;
        //当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起

        //让with中的this指向vm
        return vm.$options.render.call(vm); //通过ast语法转义后生成的render方法
    }
}

export function mountComponent(vm, el) { //这里的el是通过querySelector处理过的
    vm.$el = el;
    //1.调用render方法产生虚拟DOM

    const updateComponent = () => {
        vm._update(vm._render()); //把虚拟节点变为真实节点
    }

    new Watcher(vm, updateComponent, true);//true用于标识是一个渲染过程

    // vm._render(); //vm.$options.render() 返回虚拟节点
    // vm._update(vm._render()); //把虚拟节点变为真实节点

    //2.根据虚拟DOM产生真实DOM

    //3.插入到el元素中
}

/* 
    Vue核心流程
        1.创造了响应式数据
        2.模板转换成ast语法树
        3.将ast语法树转换成了render函数
        4.后续每次数据更新可以只执行render函数(无需再次执行ast转化的过程)

        render函数会去产生虚拟节点(使用响应式数据)

        根据生成的虚拟节点创造真实的DOM
*/


export function callHook(vm, hook) { //调用钩子函数
    const handlers = vm.$options[hook];
    if (handlers) {
        handlers.forEach(handler => handler.call(vm));
    }
}