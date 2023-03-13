const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;

const startTagOpen = new RegExp(`^<${qnameCapture}`); //他匹配到的分组时一个标签名 <xxx 匹配到的是开始标签的名字 <xxx <namespace:xxx

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配的是</xxxx 最终匹配到的分组就是结束标签的名字

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
//第一个分组就是属性的key value就是分组3/分组4/分组5
const startTagClose = /^\s*(\/?)>/; // > /> 匹配到的是开始标签结尾的位置

//vue3采用的不是使用正则
//对模板进行编译

export function paresHTML(html) { //html最开始肯定是一个<

    const ELEMENT_TYPE = 1; //定义元素类型
    const TEXT_TYPE = 3; //定义文本类型
    const stack = []; //用于存放元素的
    let currentParent; //指向的是栈中的最后一个
    let root; //根属性节点

    function creatASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    //最终需要转化成一颗抽象语法树

    //利用栈型结构来构造一棵树
    function start(tag, attrs) {
        let node = creatASTElement(tag, attrs); //创造一个ast节点
        if (!root) { //看一下是否为空数组
            root = node; // 如果为空则该节点是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node); //将节点放入栈中
        currentParent = node; //currentParent为栈中的最后一个
    }

    function chars(text) {
        text = text.trim()
        text && currentParent.children.push({ //文本直接放到当前指向的节点
            type: TEXT_TYPE,
            text,
            parent: currentParent
        });
    }

    function end() {
        stack.pop(); //弹出最后一个节点,校验标签是否合法
        currentParent = stack[stack.length - 1];
    }

    function advance(n) {//截去匹配完的部分
        html = html.substring(n);
    }
    function parseStartTag() {//解析开始标签
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1], //标签名字
                attrs: [], //标签属性
            }
            advance(start[0].length); //截去匹配完的部分

            //如果不是开始标签的结束，就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length) //截去标签部分
                match.attrs.push({
                    name: attr[1], //开始标签属性名
                    value: attr[3] || attr[4] || attr[5] || true //开始标签属性值
                })
            }

            if (end) { //截去开始标签的结束部分
                advance(end[0].length)
            }

            return match
        }

        return false; //不是开始标签
    }
    while (html) {
        //如果textEnd为0，说明是一个开始标签或者结束标签，如哦textEnd大于0，说明就是文本的结束位置
        let textEnd = html.indexOf('<'); //如果indexOf中的索引是0，则说明是一个标签

        if (textEnd === 0) {
            const startTagMatch = parseStartTag();//解析开始标签 开始标签的匹配结果

            if (startTagMatch) { //解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            let endTagMatch = html.match(endTag); //匹配结束标签
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end();
                continue
            }
        }

        if (textEnd > 0) {
            let text = html.substring(0, textEnd); //文本内容

            if (text) {
                chars(text);
                advance(text.length); //解析到的文本
            }
        }
    }

    return root
}