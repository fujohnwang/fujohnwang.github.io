% Chrome Extension Development Cookbook
% 王福强
% 2022-03-13


# 持久化状态用localStorage吗？

推荐用chrome.storage.sync或者chrome.storage.local， 而不是HTML5的localStorage，虽然后者更通用， 但既然是开发chrome extension，自然用chrome提供的API更贴近方案特性。

另外，因为chrome.storage.sync在用户没有登录的情况下会fallback去使用chrome.storage.local，所以，我觉得只要记住任何情况下都使用chrome.storage.sync就可以了：

```js
chrome.storage.sync.set({[key]: value}, function () {
    console.log(`done!`);
});
```


# background.js or background page

如果只是单纯的使用background.js，写写简单的应用是可以的，但复杂点儿就不好使了，因为没法import其它的第三方库， 这个时候，就可以指定一个background page，然后在background page里引用一个background.js，在这个js里面就可以import并依赖其它类库了。

比如，manifest.json里可以这样定义：

```json
"background": {
 "page": "background.html"
}
```

然后在background.html里引用：

```html
<script type="module" src="background.js"></script>
```

**注意**： `type="module"`是必须的！



# popup.html是必须的吗？

```json
  "action": {
    "default_icon": "icon.jpg",
    "default_popup": "index.html"
  }
```

**不是**。

popup.html背后对应的其实是action的处理，并非action一定要关联一个popup.html，但一旦有了popup.html，则action的click事件就不起作用了(It's possible to install a click handler for when the user clicks the action item. However, this won't fire if the action has a popup (default or otherwise).)。 

所以，我们也可以不提供popup.html，而是通过(在background.js里)处理action事件来自定义任何逻辑。：


```js
chrome.action.onClicked.addListener(function(tab) {
  chrome.action.setTitle({tabId: tab.id, title: "You are on tab:" + tab.id});
  // or open a new window： https://stackoverflow.com/questions/5345435/pop-up-window-center-screen
  var w = 440;
  var h = 220;
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2); 

  chrome.windows.create({'url': 'redirect.html', 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top} , function(window) {});
});
```

类似的道理，command（快捷键）的处理也可以这样处理：

```js
chrome.commands.onCommand.addListener(command => {
  chrome.tabs.query({currentWindow: true}, tabs => {
      ...
  });
});
```


# 如何定义popup的长宽？

```html
<body style="width:600px; height:580px">
</body>
```

# 如何居中或者自定义popup？

自定义处理action事件，然后有两种方式：

1. chrome.window.create(top, left, url)
2. 在Listener中查询当前activeTab，在其基础上注入contentScript然后唤起一个Modal dialog

第一种方式会有窗口的边框， 要自定义的彻底，第二种是推荐的做法。



# 使用indexedDB总是报错，说什么store找不着...

要在chrome extension里使用IndexedDB，必须在manifest.json里加上`unlimitedStorage`这个permission！！！（老的文档可能会告诉你不需要加任何东西）

```json
{
  ...
  "permissions": [
    "storage",
    "unlimitedStorage",
    ...
  ],
  ...
}
```








