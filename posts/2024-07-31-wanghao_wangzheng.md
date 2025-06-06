% 网号、网证为哪般？
% 王福强
% 2024-07-31

自从七月二十六日，公安部和国家互联网信息办公室发布了关于《国家网络身份认证公共服务管理办法（征求意见稿）》公开征求意见的公告，关于网号和网证的媒体内容就甚嚣尘上，好像天要塌下来似的，其实个人并没有过于过心这个东西，无奈周边太多这方面的信息，感觉贩卖焦虑者多，理性分析者少，遂决定还是自己了解一下好了。

当然，本文观点纯属个人观点，有片面或者武断的地方也请各位看官轻拍 😉

「福强私学」十二字真言最前面两个字是“先后”，所以，我们得先了解一下为什么会要规划网号和网证这个事情。

在此之前，每家互联网公司要开展业务，肯定是各自采集用户信息，至于采集的信息多寡以及采集后的信息如何存储和保证数据安全，肯定是良莠不齐，大家想得到，对吧？

后来，移动互联网来了，手机号成了用户事实上的 id （de facto Identity)， 所有用户信息也就围绕着手机号进行关联。（这是个很糟糕的设计，但无奈现实就是如此，设计在产品与技术之间做出了妥协，然后大家也就萧规曹随，从而形成今天的局面）

再后来，手机号要求实名制；

再再后来，互联网不论是 app 还是 web 网站都要去实名制，既然手机号已经实名制了，那么，之前没有用户手机号的互联网应用就要求用户增补手机号，从而借助手机号的实名制间接完成了自身应用的实名制要求。（不做实名制的最直接感受就是，很多网站或者社区你可以看，但不能发）

再再再后来，《中华人民共和国网络安全法》《中华人民共和国数据安全法》《中华人民共和国个人信息保护法》《中华人民共和国反电信网络诈骗法》等法律法规也发布了，对互联网企业的数据安全与个人信息防护有了更多的要求，企业的合规成本升高了，这些法规让手里原本是宝藏的数据和个人信息成了悬在头上的达摩克利斯之剑。尤其是，大企业技术团队也有实力，保障肯定问题不大（他们都搞不定就别指望中小企业了），但 SMB（中小企业）可就不一定了，即使有法规要求，但没有那个实力，臣妾也是做不到啊...


这个时候，《国家网络身份认证公共服务管理办法（征求意见稿）》来了。

这个意见稿的核心就两个概念：网号和网证。

那什么是网号和网证呢？ 

> 本办法所称网号，是指与自然人身份信息一一对应，由字母和数字组成、不含明文身份信息的网络身份符号；网证，是指承载网号及自然人非明文身份信息的网络身份认证凭证。网号、网证可用于在互联网服务及有关部门、行业管理、服务中非明文登记、核验自然人真实身份信息。

既然企业保障用户信息安全有难度有苦衷，那就我公安部和国家互联网信息办公室来吧，我来帮你们（企业）统一保管用户信息，你们只要在需要实名制的时候来我这里做个验证就好了，这样，用户信息就在我这里统一保证安全，你们企业也就不用担心数据泄露之类的烂事儿了。

那如何验证呢？ 那就是给每个人分一个网号，这个网号相当于每一个人的唯一 id，在全网所有应用都是唯一的，但只有网号，没法保证有人拿这个号冒名顶替，所以，就得在网号的基础上再加一层认证，从而形成一个身份证书，这个也就是网证。

就像你只有个身份证号，我也不知道你是不是你，但你拿出身份证（上面有身份证号，相当于网号），那基本上可以确定了（当然，这种类比情况下，不严格检验还是会有冒用）。

网号相对于身份证一个典型特征是，它是唯一的，而且没有规律（如果你干过技术，那么，可以认为它是一个安全哈希值，secure hash）。

有了网号和网证，各大企业和国家网络身份认证公共服务平台之间的交互就有了基准，相当于企业把用户信息相关的敏感数据管理都外移给了国家网络身份认证公共服务平台，合规成本以及违规风险都极大降低了。

从架构角度来说，其实就是单独将用户个人信息与相关数据安全管理剥离为一个单独的微服务（国家网络身份认证公共服务）。

所以，就这么个事儿。

当然，个人安装了 app 并开启了 NFC 之后，刷身份证这一步卡住了，流程走不下去，所以，这个产品还任重而道远。

至于将来能够推广落地到什么程度，也让我们拭目以待吧！

更至于，这个产品和手段会不会被用于其他目的，那就不是我们可以决定的了。




