% 如何删除微博所有内容？
% 王福强
% 2022-10-31

如果你没有粗浅的技术背景，建议网上搜索删除微博内容的相关插件，以下脚本起码需要知道什么是devtools。

---

到个人微博主页，打开浏览器的devtools，在console里粘贴执行如下代码：

```js
setInterval(() => {
    document.querySelectorAll('i[title="更多"]')[0].click()
    setTimeout(() => {
        a = document.getElementsByClassName('woo-box-flex woo-box-alignCenter woo-pop-item-main')
        a = Array.from(a)
        b = a.find(i=>i.innerText=='删除')
        b.click()
        setTimeout(() => {
                [...document.querySelectorAll('.woo-modal-main button')].filter(i=> i.innerText=='确定')[0].click()
            }, 1000)
    },2000)
}, 3000)
```

以上代码从别人多年前的代码稍加了改造，不排除后面微博如果改版然后以上代码也不起作用的情况发生。

> NOTE
> 
> - 之所以timeout时间设置为秒级，是因为设置过小会被限速。

GL&amp;HF


