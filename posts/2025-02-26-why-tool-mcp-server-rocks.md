% 为什么只有这种MCP Server火了？
% 王福强
% 2025-02-26

随着Cursor/Windsurf/Cline/...等AI IDE和AI类研发工具对[MCP](https://jiagoubaike.com/posts/mcp)协议的集成，

让MCP这阵子可谓是大火，

但仔细观察发现，大火的MCP Server其实都属于侧重于Tool的MCP Server实现。

但其实MCP Server可以提供三种主要的资源和能力：

- Resources
- Prompt
- Tool

那为什么只有侧重于Tool的MCP Server才大火呢？

寻思起来，可能有这几个方面的原因...


## Function Calling的替代

虽然很多大模型都已经支持了Function Calling， 但相对于MCP Server提供的Tool， Function Calling在使用上明显要更为繁琐。

Function Calling至少要调用两次，而且调用和执行往往也在两个位置，这为使用者带来心智负担。

反观MCP Server提供的Tool，只要一次配置，大模型自己就会跟进上下文选择调用了，可谓使用体验上无缝丝滑，对用户来说也少有心智负担。


## 定位不同

MCP Server可以提供的三种资源和能力中，每一种其实挂接的位置都是不一样的：

- Resources是在AI应用中调用，也就是MCP架构图里的Host程序调用；
- Prompt跟Resources类似，还要根据情况在产品交互上进行设计让用户预先选择
- Tool则直接挂接给LLM/大模型，由LLM根据上下文自行调用 （不跟用户直接交互）

其中，只有Tool是大模型调用，不跟人直接交互（虽然MCP里会要求提供交互中断，但是否调用则不需要人干预和决策）。

反观前面两种，则需要在产品或者应用设计中提供人为交互的接口和选择。

相对来说，Tool更偏标准化接入，而且供应和消费分离，别人写了某个提供Tool的MCP Server，其他人也可以直接用。 Prompt也可以，但Resource的定位则肯定是内部。

## 小结

不过，我认为MCP的接受肯定是阶段性的，现阶段可能还是C端流行，后面估计会慢慢B端流行，对应到MCP的三种能力上就是，侧重Tool的MCP Server先流行， 侧重Resources/Prompt的MCP Server会稍后在B端/企业内部逐渐落地。

![](https://img.shields.io/badge/%E4%B8%80%E4%B8%AA%E6%83%B3%E6%B3%95-%E4%B8%8D%E4%B8%80%E5%AE%9A%E5%AF%B9-blue.svg?style=flat)

> 更多MCP相关内容，可以参考[架构百科](https://jiagoubaike.com)中的[MCP条目](https://jiagoubaike.com/posts/mcp)。















