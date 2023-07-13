% 如何构建OpenAI API代理？
% 王福强
% 2023-03-06

扶墙老师为大家提供两种方式，相对来说都比较简单，可以最大限度利用好现有技术和基础设施，流程和细节有可能不展开，但关键代码和配置，我这里都会给你。

至于为什么要搞API代理，那就不展开说了...

# 使用Cloudflare Workers构建OpenAI API代理

如果你没有自己的海外服务器，那么，利用Cloudflare workers是个比较好的构建Open AI代理的选择。

你的cloudflare worker实现代码很简单：

```js
export default {
  async fetch(request, env) {
    try {
      const { pathname } = new URL(request.url);
      return fetch(new Request("https://api.openai.com" + pathname, {headers: request.headers, body: request.body}));
    } catch(e) {
      return new Response(e.stack, { status: 500 })
    }
  }
}
```

关键就两行代码（也可以简化成一行）。

直接到Cloudflare worker的web页面点击创建，然后贴进去就行了。（当然，要想成功使用，你还得配个自定义的domain，否则，也不行，因为cloudflare worker的默认域名也“莫名其妙”访问不了了）。

# 使用Nginx构建OpenAI API代理

假如自己有海外服务器，那只需要简单配置一下nginx就可以了：

```pre
location ^~/chat/ {
	rewrite ^/chat/(.*)$ /$1 break; 
	proxy_pass https://api.openai.com/;
}
```

Easy and elegant，Right？

