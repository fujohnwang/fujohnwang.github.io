% Google Gemini CLI extensions是个什么东西？
% 王福强
% 2025-10-16

上周的[福强的本周AI热点回顾与简评](https://mp.weixin.qq.com/s/fV0c4slLfYWQqYiSAmehSQ)已经提到Gemini CLI发布的新版v0.8.0支持extensions这个特性了，那什么是Gemini CLI的extensions呢？

> Bundle MCP servers, context files, and custom commands into one package. Allowing users and companies to package and share Gemini CLI customizations.
> 
> With extensions, you can expand the capabilities of Gemini CLI and share those capabilities with others. 

关键词大概就是：

1. 模块化
2. 插件化
2. 市场化

除了可以在`Hosted Extension Marketplace with already over 100 extensions`使用`/extensions install`命令安装别人发布的extensions，还可以：

> Install extensions directly via GitHub URLs or local file paths.

基本上就是为“自己动手吃自己狗粮”设计的fallback，当然也包含开发和测试支持。

e.g. `gemini extensions install https://github.com/gemini-cli-extensions/security`



现在大多还是国外公司的一些产品和服务集成:

![](https://pbs.twimg.com/media/G3R7kGPXwAEth31?format=png&name=900x900)

更多参考信息：

- https://geminicli.com/docs/extensions/
	- https://geminicli.com/docs/extensions/getting-started-extensions/
- extensions市场地址： [https://geminicli.com/extensions/](https://geminicli.com/extensions/)





