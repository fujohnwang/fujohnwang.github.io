% Chrome插件的消息通信机制探寻 (Message Passing in Chrome Extension)
% 王福强
% 2023-12-28

# 简介

Chrome Extension的消息通信主要分两大类，一类是Chrome Extension内部组件之间的通信，一类是Chrome Extension与Chrome Extension之间的通信，用英语的词根解释更明了，就是intra-和inter-

在Chrome Extension内部的通信，也会有全局的通信，以及针对单一页面的通信，他们发送消息的方式略有不一样：

```
chrome.runtime.sendMessage

chrome.tabs.sendMessage
```

要对chrome中的页面内容进行操作，可以注入content scripts ^[These are files that run in the context of web pages.They can read details of the web pages the browser visits, make changes to them, and pass information to their parent extension.]或者直接执行scripting， 因为content scripts需要在manifest.json中静态注册matchers以及js文件等资源和配置，所以，相对来说，个人更喜欢直接用` chrome.scripting.executeScript`，这种方式的好处是，可以直接在同一个地方通过function的形式定义要执行的逻辑，比如，在我们点击chrome extension的action按钮之后弹出的popup页面中，我们可以定义要执行的scripting逻辑：

```js
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: queryAndJoin,
            args: [selectorExpr],
        });
    });
```

其中， queryAndJoin是要执行的函数逻辑，可以通过args指定要传入的参数：

```js
   function queryAndJoin(selector) {
        const selectedElements = document.querySelectorAll(selector);
        let resultStr = [...selectedElements].map(a => a.attributes.href.nodeValue).join("\r\n\r\n");

        chrome.runtime.sendMessage({
            action: 'result',
            result: resultStr,
            count: selectedElements.length
        }, function (response) {
            // chrome.tts.speak(`${selectedElements.length} elements are found and returned.`);
        })
    }
```

这样， queryAndJoin函数的执行逻辑就是要注入到当前活动页面的脚步内容（注意：是注入到当前活动页面，而不是当前弹出的action页面/popup页面）。 一般情况下，注入到当前活动页面的scripting与页面原本的dom操作js类似，但假如注入的脚本想要回传信息给当前action页面/popup页面，这个时候，我们就需要用`chrome.runtime.sendMessage`回传消息。

回传消息的接收端，我们可以在action页面/popup页面里定义：

```js
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "result") {
            result = request.result;
            count = request.count;
            chrome.tts.speak(`${request.count} elements are found and returned.`);
        } else {
            console.log(`not supported action: ${request.action}`)
        }
    });
```

> TIP
>
> 所以， content scripts不是必须的，可以[通过Scripting API](https://developer.chrome.com/blog/crx-scripting-api#injecting_a_function_with_arguments)完成同样的目的，而且个人感觉更灵活。

如果说content scripts是针对一个一个页面的，页面的查找和注入是独立的，那么，background.js(或者叫service worker js)就是全局性的。可以类比局部变量和全局变量。

background.js可以全局接管action以及插件安装事件以及各种消息的处理，比如针对浏览器存储的操作（比如localStorage）， 比如action与快捷键的事件处理等等。

下面是各种scripts之间相互消息通信的关系图：

![](images/message_passing_relations.png)

基本上就是通过chrome.runtime的sendMessage和onMessage（或者tabs.sendMessage()）搞定相互之间的通信。

> NOTE
>
> The maximum size of a single message from the native messaging host is 1 MB.
> 
> Each message is serialized using JSON, UTF-8 encoded and is preceded with 32-bit message length in native byte order.

# 长连接通信（Long-lived connections）

sendMessage和onMessage的方式是单次请求通信（Simple one-time requests）， 相当于短连接，我们也可以通过port的形式在content scripts、popup页面与background.js之间创建长连接：

```js
//contentscript.js
const port = chrome.runtime.connect({name: "content-script"});
port.postMessage({greeting: "hello"});

port.onMessage.addListener(function(message) {
  console.log(message.farewell);
});
```

```js
// backgroundscript.js
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "content-script") {
    console.log("Content script connected");

    // port.postMessage({farewell: "goodbye"});

    port.onMessage.addListener(function(message) {
      console.log(message.greeting);
    });
  }
});
```


# [跨插件之间的通信（ Cross-extension messaging）](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external)

> The task of dispatching messages from one extension to another demands knowledge of the target extension’s ID number. 

Extension与Extension之间的通信需要知晓Extension的ID，然后通过sendMessage发送消息的时候指定目标插件的ID：

```js
const targetExtensionId = "ExtensionID-1"

chrome.runtime.sendMessage(targetExtensionId, {greeting: "hello"}, function(response) {
  console.log(response.farewell);
});;
```

接收端可以在接收到消息的时候检查发送方的ID，然后决定是否处理相应消息：

```js
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {

  if (sender.id === "ExtensionID-2") {
    console.log(request.greeting);
    sendResponse({farewell: "goodbye"});
  }

});
```

注意，虽然**发送消息**依然用的chrome.runtime.sendMessage， 但这里用的是chrome.runtime.onMessageExternal来**接收消息**。

以上是Extension之间的一次性消息发送和接收（one-time requests），Extension之间也可以通过长连接进行通信：

```js
// 连接与发送消息
var port = chrome.runtime.connect(laserExtensionId);
port.postMessage(...);

// 连接与接收消息
chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    // See other examples for sample onMessage handlers.
  });
});
```





# GPT3.5的回答

chrome extension的各个组件之间如何通信？

```
Chrome扩展内的各个组件之间可以通过Chrome扩展的消息传递 API 进行通信。以下是几种常用的组件之间通信的方式：

1. 内容脚本和后台脚本之间的通信：

    - 通过 chrome.runtime.sendMessage 和 chrome.runtime.onMessage 方法，在内容脚本和后台脚本之间建立双向通信。
    - 通过 chrome.tabs.sendMessage 和 chrome.runtime.onMessage 方法，在内容脚本和后台脚本之间发送和接收消息。


2. 弹出窗口/选项页面和内容脚本之间的通信：

    - 通过 chrome.tabs.query 和 chrome.tabs.sendMessage 方法，在弹出窗口/选项页面和内容脚本之间发送消息。
    - 通过 chrome.runtime.sendMessage 和 chrome.runtime.onMessage 方法，在选项页面和后台脚本之间发送和接收消息。


3. 弹出窗口/选项页面和后台脚本之间的通信：

    - 通过 chrome.runtime.sendMessage 和 chrome.runtime.onMessage 方法，在弹出窗口/选项页面和后台脚本之间发送和接收消息。

每种通信方式都涉及到消息的发送和接收，并且可以包含附加数据以实现更丰富的通信交互。这种消息传递机制使得不同组件之间能够进行灵活的通信和协作，为构建功能丰富的Chrome扩展提供了基础。
```


# Further Readings

- https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- https://www.linkedin.com/pulse/message-passing-chrome-extension-lakebrains-technologies/



