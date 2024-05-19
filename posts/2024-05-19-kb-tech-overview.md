% 分享几个数据...
% 王福强
% 2024-05-19

昨天参加腾讯云TVP活动茶歇的时候，跟怀叔介绍了下在做的事情，怀叔惊叹“这都是你一个人做的？”， 哈，不才，确实是我一个人做的。

借着这个机会跟大家分享下[「福强私学」](https://afoo.me/kb.html)的一些技术栈数据和使用场景，就是不知道大家是否感兴趣 😃

- 14 个（子）域名
- 10 个Cloudflare workers
- 3 个Cloudflare pages（两个open，一个close）
- 21 个Cloudflare KV
- 11 个Cloudflare Queues
- 4 个Cloudflare D1数据库
- 1 个Scala项目+3个sqlite数据库（跑在腾讯云VPS上）
- 72 个TODO（21 open/51 close），本地notes中的TODO不包括在内。
- 2 个Cloudflare R2 buckets
    - R2主要三个目标场景：
        1. 分享到私学内的资料
        2. Sqlite数据库实时备份（CDC）
        3. logs
- 2 个AI
  - 一个AI copilot， 主要是通过WorkerAI在私学内部提供一个copilot，底层模型基于千问1.5-14B
  - 一个AI专栏


情况基本是这么个情况，至于架构和具体设计，在[「福强私学」](https://afoo.me/kb.html)的KnowHow专栏里反正也都有介绍，感兴趣的同学可以去瞅一眼。






