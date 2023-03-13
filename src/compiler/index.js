import { paresHTML } from "./parse";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{xxx}} 匹配到的内容就是我们表达式的变量

function genProps(attrs) { //生成属性对象
    let str = ''; //{name,value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') {
            //style: {color: "red"}  "color:red" => {color: "red"}
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }

    return `{${str.slice(0, -1)}}`;
}

function gen(node) {
    if (node.type === 1) {
        return codegen(node);
    } else { //文本

        let text = node.text;
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        } else {
            //循环分割
            // _v(_s(name) + 'hello' + _s(age))
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while (match = defaultTagRE.exec(text)) {
                let index = match.index; //匹配的位置
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }

                tokens.push(`_s(${match[1].trim()})`);

                lastIndex = index + match[0].length;
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex, text.length)));
            }

            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(children) { //生成孩子对象
    return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
    let children = genChildren(ast.children);
    let code = `_c(${JSON.stringify(ast.tag)},
    ${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}
    ${ast.children.length > 0 ? `,${children}` : ''})`;

    return code;
}

export function compileToFunction(template) {

    //1.就是将template转换成ast语法树
    let ast = paresHTML(template);

    //2.生成render方法 (render执行后的返回结果就是虚拟DOM)

    //模板引擎的实现原理就是 with + new Function
    let code = codegen(ast); //生成代码

    code = `with(this){return ${code}}`;

    let render = new Function(code); //根据代码生成render函数

    return render;

    /* 
        render(){
            return _c('div',{id: 'app'},_c('div',{style: {color: 'red'}},_v(_s(name) + 'hello')))
        }
    */
}