class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name,value){
        this.root.setAttribute(name,value)
    }
    appendChild(vchild){
        vchild.mountTo(this.root)
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}
class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content)
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}
export class Component{    // 公共方法
    constructor(){
        this.children = []
    }
    setAttribute(name, value) {
        this[name] = value
    }
    mountTo(parent) {
        let vdom = this.render();
        vdom.mountTo(parent)
    }
    appendChild(vchild){
        this.children.push(vchild)
    }
}
export let ToyReact = {
    createElement(type,attributes,...children){  // 这个方法会被babel插件翻译jsx代码(如retrun <div>...</div> ) 自动调用
        let element;
        if(typeof type === "string"){    // 如果是原生元素(div等)
            element = new ElementWrapper(type)
        }else{                          // 如果是自定义组件
            element = new type();
        }
        for (let name in attributes ){
            element.setAttribute( name,attributes[name] );
        }

        let insertChildren = (children) => {  // children以变量的形式展现
            for (let child of children) {
                if(typeof child === "object" && child instanceof Array){  // 递归处理
                    insertChildren(child)
                }else{

                    if (!(child instanceof Component) 
                        && !(child instanceof ElementWrapper) 
                        && !(child instanceof TextWrapper)  ){  // 不是这三个类型就强转为string
                        child = String(child);
                    }
                    if (typeof child === "string") {  // 如果该元素是文本
                        child = new TextWrapper(child);
                    }
                    element.appendChild(child);
                }
                
            }
        }
        insertChildren(children);
        
        return element;
    },

    render(vdom,element) {
        vdom.mountTo(element)
    },

}