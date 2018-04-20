# 根据React源码实现自己的React


## 1实现react渲染过程

### 暂时不考虑JSX

### react虚拟DOM 
* 需要理解React Element概念 ---React Element 元素是一个描述了 DOM Node 的对象。
* React Element 分为两种 分别是DOM Element 和 Component Element。
```
    React Element的意义：
        JavaScript 对象很轻量。用对象来作为 React Element，那么 React 可以轻松的创建或销毁这些元素，
    而不必去太担心操作成本
        React 具有分析这些对象的能力，进一步，也具有分析虚拟 Dom 的能力。当改变出现时，（相比于真实 Dom）
    更新虚拟 Dom 的性能优势非常明显。
    
    ReactElement
    数据类，只包含 props refs key 等
        由 React.creatElement(ReactElement.js) 创建，React.createClass 中 render 中返回的实际
    也是个 ReactElement
    
    ReactComponent
        控制类，包含组件状态，操作方法等包括字符组件、原生 DOM 组件、自定义组件(和空组件)
        在挂载组件(mountComponent)的时候，会调用到 instantiateReactComponent 方法，利用工厂模式，
    通过不同的输入返回不同的 component
        代码(instantiateReactComponent.js)
        
    ReactDOMTextComponent 
        只关心文本，ReactDOMComponent 会稍微简单一些，ReactCompositeComponent 需要关心的最多，包括得到原生 DOM 的渲染内容
    
    ReactClass
        这个比较特殊，对比 ES5 写法: var MyComponent = React.createClass({})，ES6写法：
    class MyComponent extends React.Component，为什么用createClass却得到了Component呢？通过源码来看，这两个 api 的实现
    几乎是一样的，也可以看到，ES6 的写法简洁的多，不用那些getInitialState等特定 api，React 在之后的版本也会抛弃createClass这个 
    api。并且，在此 api 中，React 进行了autobind。
    ReactClass.js:
```

### 1.1实现react渲染
```


```
