
```html
    <script async src="/js/chat-widget.js"></script>
```

that's it， 剩下的就是完成交互，因为这个脚本实现并未实现remote api调用。

只是本地模拟聊天。




或者走iframe嵌入（这样避免css和js污染）：

```html
    <div style="z-index:10000; position: fixed; bottom: 20px; right: 20px;">
      <iframe src="chat.html" style="border-width: 0; height:80vh;"/>
    </div>
```



