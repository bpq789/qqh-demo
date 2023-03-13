import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

/* rollup默认可以导出一个对象，作为打包的配置文件 */
export default {
    input: './src/index.js', //输入文件路径
    output: {
        file: './dist/vue.js', //输出文件路径
        name: 'Vue', //输出文件名字 global.Vue 是个全局实例
        format: 'umd', //输出文件的代码格式 esm es6模块 commonjs模块 iife自执行函数 umd统一模块规范(包含cmd、amd、commonjs)
        sourcemap: true //希望可以调试源代码
    },
    plugins: [
        babel({
            exclude: "node_modules/**" //排除node_modules中所有文件 /*是拦截所有的文件夹，不包含子文件夹  /**是拦截所有的文件夹及里面的子文件夹
        }),
        resolve()
    ]
}


//为什么vue2只能支持ie9以上的  因为Object.defineProperty不支持低版本的，不能换成低版本的语法
//proxy是es6的，也没有替代方案