% 2021年几个值得关注的小众前端技术趋势
% 王福强
% 2021-03-10

这些前端技术已经早就展露头角，但与当前大规模应用的前端技术相比，则还处于相对小众阶段， 有望继续发扬光大，所以才在这里跟大家分享一下...

#  Svelte3

Svelte3的小众是相对于现在前端技术的三大巨头React、Vue和Angular来说的，但从我们对Svelte3的调研和实践上看，Svelte3将有可能跻身前三，成为更多前端技术人员的最爱。

Svelte3拥有现代前端开发的必要支持， 比如：

1. 基于组件化的前端开发；
2. 数据绑定；
3. 状态管理
4. 客户端和服务器端路由支持（当然，需要第三方或者官方推荐框架或者类库）

但我们认为更有意思的特色在于：

1. 更轻量更快捷；
2. 近乎直觉性的使用原生HTML/CSS/Javascript(ES6);
3. 更具灵活与扩展性的基础设施，比如动画， 比如Actions， 比如生命周期关注点等；

我们用200多行代码即开发了一个完备可用的Reactive Web Application，并把TailwindCSS以及扩展动画一并包含到了项目中， 所以，2021年我们重点推荐前端框架或者说compiler-Svelte3， 后端程序员也不例外哦， 快快动手试一下吧！

![![keenotes with svelte3](images/keenotes-with-svelte3.jpg)](images/keenotes-svelte.mov)

# TailwindCSS

是的， TailWindCSS， 现在提可能算是“起个大早赶了个晚集”， 但我们认为TailwindCSS将在2021年继续扩大战场，就好像后端的Vertx将逐步蚕食传统的Spring/SpringBoot的市场， TailwindCSS的出现应该会逐步蚕食Bootstrap的市场以及其它CSS实践。

TailwindCSS既有预设的classes，也可以自定义扩展，更可以与现有框架和前端开发工具集成，比如postcss。

svelte3也可以与TailwindCSS很好的集成，深度集成可以通过postcss， 如果初步尝试，则可以直接：

```html
<svelte:head>
	<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/tailwindcss@2.0.3/dist/tailwind.min.css'>
</svelte:head>
```

这种方式依然可以获得按需大小的bundles，如果不介意这些，你当然也可以更加快糙猛地直接在index.html里直接引用tailwind.min.css，只不过2M+的大小，使用的时候还是得掂量掂量。

# WASM（Web Assembly）

我们在介绍前端开发史的时候，有同学提到他们在使用wasm开发应用并且也开发了自己的wasm框架，所以，我觉得wasm也确实可以提及一下，毕竟也确实有很多应用已经迁移到wasm并且成功运行，比如传统的pc游戏doom、diablo等。

![](images/diablo.png)

wasm的好处是，各个语言生态只要提供了相应的transpiler基本上都可以让相应语言生态的开发人员更高效地开发基于wasm技术的前端应用。

鉴于wasm的特点， 估计会在游戏、工具等场合发挥更大的作用， 但我们依然认为wasm还是处于比较小众的位置，只不过将来有可能会有更大的发展。

# 小结

以上就是我们为大家介绍的2021年几个小众但值得大家关注的前端技术方向，也欢迎大家留言分享自己认为优秀但还比较小众的前端技术。




