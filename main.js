import { ToyReact, Component} from './ToyReact'

class Square extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }
    render() {
        return (
            <button className="square" onClick={() => this.setState({ value: 'X' }) }>
                {this.state.value ? this.state.value :"" }
            </button>
        );
    }
}
class Board extends Component {
    renderSquare(i) {
        return <Square value={i} />;
    }
    render() {
        const status = 'Next player: X';

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

// class MyComponent extends Component{
//     render(){
//         return <div> 
//             <span>hello</span> 
//             <span>world</span>
//             {this.children}
//          </div>
//     }

// }

// let a = <div name='a' id='ida'>
//     <span>hello</span>
//     <span>fuck</span>
//     <span>j</span>
// </div>;  // 会被babel插件 翻译， 然后调用 createElement方法
let a = <Board />

ToyReact.render( a , document.body )