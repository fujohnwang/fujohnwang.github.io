% Java Web框架历史演化: 看这一篇就够了 (Java web frameworks in different ages)
% 王福强
% 2025-09-17

今天看到一海外老哥发了这么条短文字：

> You can learn 100 JavaScript frameworks…
> or you can learn Java and Spring once, and it’ll pay you back for years. 💚

虽然JavaScript作为前端事实上的语言带动了前端JS框架的蓬勃发展，包括但不限于Jquery，React，Vue，Svelte [^1]， Angular，HTMX[^2]， etc

[^1]: Simple Svelte，<https://afoo.me/books.html>
[^2]: HTMX揭秘, <https://afoo.me/books.html>

但Java其实也不是只有Spring一家，只不过，Spring确实一家独大了20十多年，哈哈哈哈

今天帮大家梳理下Java这片国土上的Web frameworks的发展与演化...

早在2003年之前笔者还没本科毕业那会儿，J2EE一家独大，笨重的EJB/EJB2还得依托JBuilder才能省点儿开发的劲儿，那时候最流行的web framework叫webwork，struts那时候还是1.x时代。

后来（此时想起刘若英的歌声）...

除了几个怪咖， Google 的 GWT 和 Sun 自己搞的JSF， GWT还好， Gmail就是用它搞出来的，当年也是轰动一时， 这JSF嘛，就雷声大雨点儿小了...

再后来， 咚咚咚咚，Spring开始风风火火了，SpringMVC也一并跃入Web开发主流...

（这时候有没有想起哥的传说？🤣）

Spring称霸Java开发界20多年之后，出来了新生代Web frameworks

他们的代表是：

1. Quarkus
2. Micronaut

他们的主要特征是利用了Java语言以及Java虚拟机的新特性，比如[GraalVM以及Project Layden的AoT特性](https://afoo.me/posts/2025-09-17-java25.html)。

而且，除了Java主航道，Scala/Groovy/Clojure/Kotlin等旁支也有自己的web frameworks演化，其中比较有名的有：

1. play framework (scala)
2. grails (groovy)

所以，综合来看，Java平台上的web frameworks也不少，但也不得不承认，Spring依然是主流🤣

最后，作者自己还写了个自己用的小web framework叫 [Kate](https://github.com/fujohnwang/kate)以及基于上扩展的keewebx， 当然，纯粹玩票性质，只是个人项目用用。





