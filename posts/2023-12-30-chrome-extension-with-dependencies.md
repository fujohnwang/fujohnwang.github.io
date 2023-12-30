% 在开发Chrome Extension的时候如何使用第三方js库或者npm依赖？
% 王福强
% 2023-12-30


popup页面的生成和逻辑实际上是可以用npm的，比如使用svelte框架或者各种前端框架的逻辑与基础设施，引入npm依赖，并使用rollup等进行编译打包。

不能用npm依赖的地方是单独的background.js，假如我们在manifest.json里使用[如下定义](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#use-external-libraries)的话：

```json
    "background": {
        "scripts": ["jquery.min.js", "background.js"]
    },
```

那么就很难用npm依赖来编写background.js的逻辑， 但好在有一个fallback方案，那就是在manifest.json里配置background.html然后引用一个background.js，那么，这种情况下，就跟popup页面的编写类似了，可以引用npm依赖，只要最终打包成一个独立的background.js就可以了： 

```json
    "background": {
        "page": "background.html"
    }
```

然后在background.html里引用background.js就可以了：

```html
<script type="module" src="background.js"></script>
```

> NOTE: **注意** ❗❗❗
> 
> `type="module"`是必须的！


但是，`starting with Manifest V3, you cannot use background.page`。

所以就剩最后一种方式，也是**最新的方式**： [使用最新的manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#bundle-third-party)，可以直接指定background.js和`type="module"`: 

```json
"background": {
    "service_worker": "background.js",
    "type": "module"
}
```

然后在background.js就可以引用其他依赖了:

```js
import JsStore from './jsstore.js';
```


> TIP
>
> 用[parceljs](https://parceljs.org/)单独编译也是一个不错的方法。
> 
> parcel提供的@parcel/config-webextension可以直接用manifest.json作为入口文件进行编译，其中配置的所有文件都可以追溯并递归编译。





# Ref 

- https://stackoverflow.com/questions/43684452/is-it-possible-to-require-npm-modules-in-a-chrome-extension
- https://stackoverflow.com/questions/9057292/requirejs-in-a-chrome-extension
  - `chrome.extension.getURL` to get scripts in content scripts that don't have before
- https://stackoverflow.com/questions/3695476/how-do-i-perform-a-shell-execute-in-a-chrome-extension?lq=1
    -  even NPAPI is deprecated and being phased out.
    -  turn to Native Messaging API
- https://stackoverflow.com/questions/53029697/how-to-include-library-in-extension-in-chrome
- https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#use-external-libraries
- [inline firestore sdk in order to load it without remote deps at runtime](https://gist.github.com/patrickkettner/8c1a91b1b8f9502b3b67d874e7024a7b)
- https://forum.freecodecamp.org/t/referencing-external-libraries-and-ui-components-in-vanilla-js-project/415730/5
- https://medium.com/@bosti/how-to-use-import-a-javascript-file-in-chrome-extension-files-d0755c203497


