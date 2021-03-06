/**
 * Created by MHC on 2018/4/19.
 */


var React = {
    nextReactRootIndex: 0,
    render: function (element, container) {
        var componentInstance = instantiateReactComponent(element);
        var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
        container.innerHTML = markup;
        //触发完成mount的事件
        const mountReady = new Event('mountReady');
        document.dispatchEvent(mountReady);

    },
    createElement: function (type, config, children) {
        var props = {};
        var propName;
        var config = config || {};
        //看有没有key，用来标识element的类型，方便以后高效的更新，这里可以先不管
        var key = config.key || null;
        //复制config里的内容到props
        for (propName in config) {
            if (config.hasOwnProperty(propName) && propName !== 'key') {
                props[propName] = config[propName];
            }
        }
        //判断children元素是否是多个，多个就转化为children数组
        var childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
            props.children = Array.isArray(children) ? children : [children];
        } else if (childrenLength > 1) {
            var childrenArray = [];
            for (var i = 0; i < childrenLength; i++) {
                childrenArray[i] = arguments[i + 2];
            }
            props.children = childrenArray;
        }

        return new ReactElement(type, key, props);
    },

    createClass: function (spec) {
        //生成子类
        const Constructor = function (props) {
            this.props = props;
            this.state = this.getInitialState ? this.getInitialState() : null;
        }
        //原型继承，继承超级父类
        Constructor.prototype = new ReactClass();
        Constructor.prototype.constructor = Constructor;
        Constructor.prototype = Object.assign(Constructor.prototype, spec);
        return Constructor;
    },

    Component:function () {

    }
};

//组件实例工厂函数
function instantiateReactComponent(node) {
    //字符串或者num
    if (typeof node === 'string' || typeof node === 'number') {
        return new ReactDOMTextComponent(node);
    }
    //html的标签
    if (typeof node === 'object' && typeof  node.type === 'string') {
        return new ReactDOMComponent(node);
    }
    //自定义元素节点
    if (typeof node === 'object' && typeof  node.type === 'function') {
        return new ReactCompositeComponent(node);
    }

    return null
}

/**--------React字符串节点---------**/
//字符串节点
function ReactDOMTextComponent(text) {
    this._currentElement = '' + text;
}

//component渲染时生成的dom结构
ReactDOMTextComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID = rootID;
    return '<span data-reactid="' + rootID + '">' + this._currentElement + '</span>';
};


/**---------React元素节点-React.createElement--------**/
// React = Object.assign(React, ReactCreateElemt);
// ReactCreateElemt = {
//     createElement: function (type, config, children) {
//         var props = {};
//         var propName;
//
//     }
// }

//ReactElement就是虚拟dom的概念，具有一个type属性代表当前的节点类型，还有节点的属性props
//比如对于div这样的节点type就是div，props就是那些attributes
//另外这里的key,可以用来标识这个element，用于优化以后的更新，这里可以先不管，知道有这么个东西就好了

function ReactElement(type, key, props) {
    this.type = type;
    this.key = key;
    this.props = props;
}

/**---------React.createElement的html节点判断渲染--------**/
//生产html节点的fun
function ReactDOMComponent(node) {
    console.log('html节点的ReactElement');
    console.log(node);
    this._currentElement = node;
    this._rootNodeID = null;
}

ReactDOMComponent.prototype.mountComponent = function (rootId) {
    console.log('html节点');
    console.log(this._currentElement.type);
    this._rootNodeID = rootId;
    var props = this._currentElement.props;
    var tagOpen = '<' + this._currentElement.type;
    var tagClose = '</' + this._currentElement.type + '>';
    //拼接id
    tagOpen += ' data-reactid=' + this._rootNodeID;
    //添加属性 todo 可修改for...of
    for (let propKey in props) {
        // tagOpen += `${propKey}=${props[propKey]}`;
        if (/^on[A-Za-z]/.test(propKey)) {
            const eventType = propKey.replace('on', '');
            //针对当前的节点添加事件代理,以_rootNodeID为命名空间
            //需要使用 `${evenType}.${this_rootNodeId}`
            const that = this;
            document.addEventListener(`${eventType.toLocaleLowerCase()}`,function (e) {
                const reactid = e.target.dataset['reactid'];
                if(reactid == that._rootNodeID){
                    props[propKey]();
                }
            })
        }
        //对于children属性以及事件监听的属性不需要进行字符串拼接
        //事件会代理到全局。这边不能拼到dom上不然会产生原生的事件监听
        if (props[propKey] && propKey != 'children' && !/^on[A-Za-z]/.test(propKey)) {
            tagOpen += ` ${propKey}=${props[propKey]}`;
        }
    }
    //获取子节点渲染出的内容
    var content = '';
    var children = props.children || [];
    var childrenInstances = []; //用于保存所有的子节点的componet实例，以后会用到
    var that = this;
    children.map((item, key) => {
        var childComponentInstance = instantiateReactComponent(item);
        childComponentInstance._mountIndex = key;
        childrenInstances.push(childComponentInstance);
        var curRootId = that._rootNodeID + '.' + key;
        var childMarkup = childComponentInstance.mountComponent(curRootId);
        content += ' ' + childMarkup;
    });
    //留给以后更新时用的这边先不用管
    this._renderedChildren = childrenInstances;

    //拼出整个html内容
    // console.log('拼出整个html内容')
    // console.log(tagOpen + '>' + content + tagClose);
    return tagOpen + '>' + content + tagClose;
};

/**---------React.createClass节点判断渲染--------**/
    //定义ReactClass类,所有自定义的超级父类
const ReactClass = function () {

    };
//留给子类去继承覆盖
ReactClass.prototype.render = function () {
};

//构造函数
function ReactCompositeComponent(element) {
    console.log('自定义节点的ReactElement');
    console.log(element);
    this._currentElement = element;
    this._rootNodeID = null;
    this._instance = null;
}
//prototype
ReactCompositeComponent.prototype.mountComponent = function (rootId) {
    this._rootNodeID = rootId;
    //拿到当前元素对应的属性值
    const publicProps = this._currentElement.props;
    const ReactClass = this._currentElement.type;
    console.log('this');
    console.log(this);
    const inst = new ReactClass(publicProps);
    this._instance = inst;
    //保留对当前comonent的引用，下面更新会用到
    inst._reactInternalInstance = this;
    if (inst.componentWillMount) {
        inst.componentWillMount();
        //这里在原始的reactjs其实还有一层处理，就是  componentWillMount调用setstate，不会触发rerender而是自动提前合并，这里为了保持简单，就略去了
    }
    //调用ReactClass的实例的render方法,返回一个element或者一个文本节点
    const renderedElement = this._instance.render();
    //得到renderedElement对应的component类实例
    var renderedComponentInstance = instantiateReactComponent(renderedElement);
    this._renderedComponent = renderedComponentInstance; //存起来留作后用
    //拿到渲染之后的字符串内容，将当前的_rootNodeID传给render出的节点
    var renderedMarkup = renderedComponentInstance.mountComponent(this._rootNodeID);
    //之前我们在React.render方法最后触发了mountReady事件，所以这里可以监听，在渲染完成后会触发。
    document.addEventListener('mountReady', function() {
        //调用inst.componentDidMount
        inst.componentDidMount && inst.componentDidMount();
    });

    return renderedMarkup;
};


