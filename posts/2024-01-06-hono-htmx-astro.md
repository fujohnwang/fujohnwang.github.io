% 2023三大前端技术新秀
% 王福强
% 2024-01-06

2023年过去了，介绍三个前端技术新秀，希望对大家有帮助、有启发...

# [hono](https://hono.dev/)

honojs是一个新的前端框架，很轻量也很快，你当然可以用它来开发传统的web应用，比如原来用expressjs的场景，但我更喜欢hono的一点是，我可以用它来写cloudflare的workers。 

对于简单的cloudflare worker实现，我们当然更习惯直接在cloudflare的后台web上直接快速编辑（quick edit），甚至于别人实现的worker我们想自己部署一个，在后台操作是最简单直接的方式。

但是，当我们想要处理各种通用关注点（比如CORS处理）的是，当我们想要实现复杂点儿逻辑的时候，当我们想要引用前端生态丰富的资源的时候，在本地编写测试显然更高效。

honojs提供了对cloudflare worker的直接支持，无论是从API层面，还是从工程的代码脚手架（scaffolding）层面。 

现在对于非简单做做重定向的cloudflare worker实现，我都习惯在本地通过honojs开启一个新项目并完成最终部署的闭环。


# [htmx](https://htmx.org/)

HTMX是一个前端的“异类”，确切的说，它不是一个前端框架（framework），它更贴近前端类库（library）的范畴，因为它可以跟其他前端框架或者类库共存。但这都不是它区别于其他前端框架和类库的关键特点，它的关键特点是，在SPA体验的表面下隐藏了一个服务器端组件的本质。

其它前端框架一旦编译部署，甚至可以在本地运行而不与服务器端交互（不是不能，而是非必需），但用HTMX开发的应用原则上都需要与后端/服务器端进行远程交互。而且，交互之后获得的数据格式是标准的HTML片段，而不像今天大多数前端框架和类库那样，它们与后端交互的时候交换的数据格式大多数JSON数据对象。

从这两个点上来说，HTMX确实是前端的异类。

但HTMX之所以好玩就在于，它让原来的遗留技术栈（比如django admin， 比如各种后端语言写的前端项目）都可以实现今天SPA一样的体验。 

所以，HTMX相当于让n多后端语言、后端生态、甚至后端程序员都可以拥抱SPA，而且开发体验还不错，不信你可以试试 ；）

BTW. 福强老师也写了本HTMX的电子书[《HTMX揭秘》](https://afoo.me/books.html)，感兴趣的同学可以弄本看看。

# [astro](https://astro.build/)

这是个静态站前端项目，也就是Static Site Generator（简称SSG）， 在此之前有jekyll和hugo这些同类产品，当然，像我这种自己打造一个也是有的（https://afoo.me 就是自己写的SSG生成的）。

但Astro为什么可以快速崛起呢？ 与其它SSG方案相比，又有什么优势呢？

首先就是它的快速迭代，短短一年时间那从1.x到4.x，2024年伊始又刚刚发布了4.1版本，可见它的社区和支持是很活跃的。

其次，它有很强的扩展能力，它兼容各大前端框架的组件化集成，你可以将React/Vue/Svelte等框架的组件一并纳入Astro进行统一编译和使用，可谓兼收并蓄；

再有就是，Astro对前端的各项技术极速跟进和支持，比如hydrtion（水合效应）和[Island](https://jiagoubaike.com/posts/Islands/)架构， 比如View Transition等等，比如Prefetch等等；

另外，astro也提供了强类型或者说强schema的content collection支持，配合各种headless CMS，也可以打造一个强大的内容创作/协作平台。

BTW. [架构百科](https://jiagoubaike.com)文字站就是用astro搭建的。







