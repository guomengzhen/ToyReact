class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type)  // 创建的实Dom
    }
    setAttribute(name,value){
        if( name.match(/^on([\s\S]+)$/) ){  // 处理事件
            // console.log(RegExp.$1)  [\s\S]表示所有字符
            let event = RegExp.$1.replace(/^[\s\S]/,s => s.toLowerCase());
            this.root.addEventListener(event,value)
        }
        if (name === 'className') { name = 'class' };
        this.root.setAttribute(name,value)
    }
    appendChild(vchild){
        let range = document.createRange();
        if(this.root.children.length){
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild)
        }else{
            range.setStart(this.root,0)
            range.setEnd(this.root,0)
        }
        vchild.mountTo(range)
    }
    mountTo(range){
        range.deleteContents();
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
}
class TextWrapper{   
    constructor(content){
        this.root = document.createTextNode(content)
    }
    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
}
export class Component{    // 公共方法
    constructor(){
        this.children = []
        this.props = Object.create(null);
    }
    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value
    }
    mountTo(range) {
        // let vdom = this.render();
        // vdom.mountTo(parent)
        this.range = range
        this.update()

    }
    update(){
        let placeholder = document.createComment("placeholder")
        let range = document.createRange()
        range.setStart(this.range.endContainer,this.range.endOffset)
        range.setEnd(this.range.endContainer, this.range.endOffset)
        range.insertNode(placeholder)
        this.range.deleteContents();

        let vdom = this.render()
        vdom.mountTo(this.range)
    }
    appendChild(vchild){
        this.children.push(vchild)
    }
    setState(state){
        let merge = (oldState,newState) => {
            for (let p in newState) { 
                if (typeof newState[p] === 'object' && newState[p] !== null){ //复杂数据类型更新需要递归处理
                    if (typeof oldState[p] !== 'object'){ // oldState 不是对象，在递归调用前让它是对象，不然报错
                        if (newState[p] instanceof Array){
                            oldState[p] = []
                        }else{
                            oldState[p] = {}
                        };
                        
                    }
                    merge(oldState[p], newState[p])
                }else{
                    oldState[p] = newState[p]
                };
            };
        };

        if(!this.state && state){
            this.state = {}
        }
        merge(this.state,state)
        this.update()
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

        let insertChildren = (children) => {  // children以变量的形式展现时
            for (let child of children) {
                if(typeof child === "object" && child instanceof Array){  // 递归处理
                    insertChildren(child)
                }else{
                    if(child=== null || child === void 0){ child = "" };
                    if (!(child instanceof Component) 
                        && !(child instanceof ElementWrapper) 
                        && !(child instanceof TextWrapper)  ){  // 不是这三个类型就强转为string
                        child = String(child);
                    };
                    if (typeof child === "string") {  // 如果该元素是文本
                        child = new TextWrapper(child);
                    };
                    element.appendChild(child);
                }
                
            }
        }
        insertChildren(children);
        
        return element;
    },

    render(vdom,element) {
        let range = document.createRange()
        if(element.children.length){
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }

        vdom.mountTo(range)
    },

}