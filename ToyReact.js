let childrenSymbol = Symbol("children");
class ElementWrapper{
    constructor(type){
        // this.root = document.createElement(type)  // 创建的实Dom
        this.type = type            
        this.props = Object.create(null)
        this[childrenSymbol] = []
        this.children =[]
    }
    setAttribute(name,value){
        // if( name.match(/^on([\s\S]+)$/) ){  // 处理事件
        //     // console.log(RegExp.$1)  [\s\S]表示所有字符
        //     let event = RegExp.$1.replace(/^[\s\S]/,s => s.toLowerCase());
        //     this.root.addEventListener(event,value)
        // }
        // if (name === 'className') { name = 'class' };
        // this.root.setAttribute(name,value)
        this.props[name] = value; 
    }

    appendChild(vchild){
        // let range = document.createRange();
        // if(this.root.children.length){
        //     range.setStartAfter(this.root.lastChild);
        //     range.setEndAfter(this.root.lastChild)
        // }else{
        //     range.setStart(this.root,0)
        //     range.setEnd(this.root,0)
        // }
        // vchild.mountTo(range)
        this[childrenSymbol].push(vchild)
        this.children.push(vchild.vdom)
    }
    get vdom(){
        return this;
    }
    mountTo(range) {   // 虚拟dom所有的操作都放到mountTo 产生实dom来做
        this.range = range
        
        let placeholder = document.createComment("placeholder")
        let endRange = document.createRange();
        endRange.setStart(range.endContainer,range.endOffset)
        endRange.setEnd(range.endContainer, range.endOffset)
        endRange.insertNode(placeholder)

        range.deleteContents();
        let element = document.createElement(this.type);
        for (let name  in this.props) {   //setAttribute
            let value = this.props[name];
            // 处理事件
            if( name.match(/^on([\s\S]+)$/) ){   //[\s\S]表示所有字符
                let event = RegExp.$1.replace(/^[\s\S]/,s => s.toLowerCase());
                element.addEventListener(event,value)
            }
            if (name === 'className') { name = 'class' };

            element.setAttribute(name,value)
        };
        for (let child of this.children) { // appendChild
            let range = document.createRange();
            if(element.children.length){
                range.setStartAfter(element.lastChild);
                range.setEndAfter(element.lastChild)
            }else{
                range.setStart(element,0)
                range.setEnd(element,0)
            }
            child.mountTo(range)
        };
        // range.deleteContents();
        range.insertNode(element)
    }
}
class TextWrapper{   
    constructor(content){
        this.root = document.createTextNode(content)
        this.type = "#text"
        this.props = Object.create(null)
        this.children = []
    }
    mountTo(range) {
        this.range = range;
        range.deleteContents();
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
    get vdom(){
        return this;
    }
}
export class Component{    // 公共方法
    constructor(){
        this.children = []
        this.props = Object.create(null);
    }
    get type(){
        return this.constructor.name;
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
        // let placeholder = document.createComment("placeholder")
        // let range = document.createRange()
        // range.setStart(this.range.endContainer,this.range.endOffset)
        // range.setEnd(this.range.endContainer, this.range.endOffset)
        // range.insertNode(placeholder)
        // this.range.deleteContents();

        let vdom = this.vdom
        if (this.oldVdom){
            let isSameNode= (node1,node2) => {
                if(node1.type!== node2.type) 
                    return false;
                for (let name in node1.props) { 
                    // if (typeof node1.props[name] === "function" && typeof node2.props[name] === "function"  // 对事件的处理
                    //     && node1.props[name].toString() === node2.props[name].toString())
                    //     continue;
                    if (typeof node1.props[name] === "object" && typeof node2.props[name] === "object"  // 对事件的处理
                        && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name]))
                        continue;

                    if (node1.props[name] !== node2.props[name])
                        return false;
                }
                if (Object.keys(node1.props).length !== Object.keys(node2.props).length ){
                    return false;
                }
                    
                return true;
            }
            let isSameTree = (node1,node2) =>{
                if (!isSameNode(node1,node2)){
                    return false;
                }
                if (node1.children.length !== node2.children.length ){
                    return false;
                }
                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i])){
                        return false
                    } 
                }
                return true;
            }

            let replace = (newTree,oldTree) =>{
                if (isSameTree(newTree, oldTree))   // 新旧dom比对
                    return;

                if (!isSameNode(newTree, oldTree)) { // 新旧根节点对比
                    newTree.mountTo(oldTree.range)

                } else {
                    for (let i = 0; i < newTree.children.length; i++) {
                        replace( newTree.children[i], oldTree.children[i] )
                        
                    }
                }
            }
            replace(vdom, this.oldVdom)
            // console.log( vdom)
            // console.log(this.vdom)

        }else{  
            // 第一次mountTO
            vdom.mountTo(this.range)
        }

        this.oldVdom = vdom;
    }

    get vdom(){
        return this.render().vdom;
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