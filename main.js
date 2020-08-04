import { ToyReact, Component} from './ToyReact'

class MyComponent extends Component{
    render(){
        return <div> 
            <span>hello</span> <span>world</span>
            {this.children}
            {/* {true} */}
            {/* {[1,2,3]} */}
         </div>
    }

}
let a = <MyComponent name='a' id='root'>
    <div>123</div>
</MyComponent>
// let a = <div name='a' id='ida'>
//     <span>hello</span>
//     <span>fuck</span>
//     <span>j</span>
// </div>;  // 会被babel插件 翻译， 然后调用 createElement方法


ToyReact.render( a , document.body )