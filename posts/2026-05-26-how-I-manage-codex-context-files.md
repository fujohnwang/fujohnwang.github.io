% How I manage Codex context files 
% 王福强
% 2026-05-26


## 前序

像CLAUDE.md或者AGENTS.md这种文件，在专业术语里叫Context Files，也就是上下文文件。

它们的目的就是自动注入到 AI 智能体的会话提示词中，通常是作为system prompt注入。

现在大部分AI智能体或者更确切的说Coding Agent（编码智能体）都支持AGENTS.md， Claude Code因为是头部，所以，它始终用自己名字的上下文文件，也就是CLAUDE.md。（不过据说现在也支持自动读取AGENTS.md了）

我这阵子用Codex比较多，所以，就说说我是怎么组织Codex的上下文文件的吧！

## 上下文的两级组织层级

这两级是：

1. 全局级别
2. 项目级别

全局级别是在`~/.codex/AGENTS.md`, 写在这个上下文文件里的内容是任何Codex进程都会读取并加载的（任何用的不太严谨，后面会说）， 内容不能太多，只应该放全局约束，像项目特定、模块特定的内容，不建议放这里面。 

我的全局AGNETS.md的内容如下，大家感兴趣可以参考：

```
LuckyJon💫scarface.local ➜  .codex git:(master) ✗ cat AGENTS.md
- ✅ Always respond in 中文 ， 即使我用English跟你沟通。
- ✅ Always search in English
- ✅ **每次开始新任务前，如果有不清楚或者不明确的问题点，通过 AskUserQuestion tool 向用户提问，搞清楚、搞明确之后，再执行后续操作。** (that's, always come up with a plan, confirm with me before making changes.)
- 回答用户的任何问题，都要以现有codebase为唯一事实，不可以编造。 文档只做为参考，因为文档有可能过时，但代码不会。
- keep a note in implementation_note.md on tradeoffs you had to make or anything else I should know. Keep it short and written in Chinese(jargons in english is ok)
- 🙋 要使用git相关工具（包括但不限于git, gh），每次操作必须征得同意！(git status、gh view这类READ-ONLY的操作除外)
```

项目级别的上下文通常放在项目的根目录下，一般添加只跟这个项目相关的上下文信息，避免占用不必要的上下文窗口，毕竟，大模型的上下文窗口就算声称是百万tokens，但上下文内容一多，效果还是会大大折扣，所以，能简约就简约。 

像我现在手头上的 [fscloud](https://keevol.cn/#fscloud) 项目的AGNETS.md， 内容如下供大家参考：

```
LuckyJon💫scarface.local ➜  fscloud git:(master) cat AGENTS.md
开始前先阅读 ./README.md

## 要求

- **验收测试的时候，单独另起测试用的docker容器，不要用现在make dev-up启动的容器**。 了解这个点后，每次开始前重复“✌️ 测试的时候，我会单独启测试用的数据库/minio/redis实例。”

## 技术实践

- 对于最终发布的docker image，使用multi-stage build进行构建以减少最终image的文件大小。
```

这里最值得关注的是`开始前先阅读 ./README.md`这句，因为大多数时候，我是直接编写和更新项目的README.md，这个才是项目描述的 **Single Source of Truth**。

这个技巧我还用在了CLAUDE.md和AGENTS.md的内容同步上，当你要使用claude code和codex同时开发同一个项目的时候，为了避免codex知道的上下文但claude codex不知道，就得让它们的上下文文件内容相同，过去在多个coding agent之间同步全局上下文的时候，走软连接（ln -s）有些coding agent不认，所以， 早期我为了保障效果，都是用笨办法，就是在一个AGENTS.md或者CLAUDE.md更新之后，拷贝粘贴（Copy & Paste）， 后来，就只更新一个，然后在另一个里要求它开始前先读前面的那个上下文文件。

比如，我现在只更新AGENTS.md，那么我的CLAUDE.md里就只有一句：

```
先看 @README.md 了解项目概况，再看 ./AGENTS.md 了解必要上下文。
```

这样， AGNETS.md 就成了唯一的 **Single Source of Truth**， 只更新  AGNETS.md 一个文件就可以了。

## 上下文的四级组织层级

除了前面提到的两级组织层级，我们还可以将Codex上下文文件扩展到四级进行管理。

另外的两级分别是：

1. 多Profile层级管理
2. 项目内嵌套层级管理

也就是，一个往更宏观的方向上扩展，一个往更细粒度的方向扩展。


### 多Profile层级管理

Codex其实是可以起多个账号进程的，只要你在启动的时候通过环境变量 `CODEX_HOME` 将codex的目录指向一个新的profile目录，那么， codex就会基于这个新目录创建新的配置和状态。

默认情况下，`CODEX_HOME ` 指向的就是`~/.codex`，也就是用户的`$HOME`目录下的`.codex`目录， 但我们也可以：

```
C​⁣⁣⁣‌‌⁣⁣⁣⁣‌⁣‌‌⁣⁣‌⁣‌‌‌⁣⁣⁣⁣⁣⁣⁣‌‌⁣‌⁣⁣‌⁣⁣⁣⁣‌‌⁣‌⁣⁣⁣‌⁣‌‍ODEX_HOME={profile 目录} open Codex.app
CODEX_HOME={profile 目录} codex
```

这样，就可以启动多个不同账号、不同profile目录的codex了（不管是GUI版的，还是CLI版的）

这些不同的Profile目录下，就可以创建各自的AGENTS.md上下文文件，实现不同Profile的上下文管理。

### 项目内嵌套层级管理

跟Claude Code类似， Codex里其实也支持项目层级以下的目录层级的上下文文件。

比如，在 [fscloud](https://keevol.cn/#fscloud) 项目中，我就采用了多层级、多模块的上下文文件管理：

```
LuckyJon💫scarface.local ➜  fscloud git:(master) tree -L 2
.
├── admin
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── dist
│   ├── Dockerfile
│   ├── HowToStart.md
│   ├── index.html
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
├── AGENTS.md
├── CLAUDE.md
├── client
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── macos
│   └── windows
...
```

这样的好处就是， 分别针对不同的子项目、子模块编写特定的上下文约束（更确切地说应该叫“建议”，因为大模型有可能不听🤣）

比如， 对于所有的native客户端（macos/windows/...），我们可能会约束通用模块； 

再比如， 对于native客户端里的macOS客户端项目，我再进一步要求和约束视觉规范、线程模型、UI视觉等。

主打一个上下文管理的单元化与confinement， 听起来是不是跟架构规范有点儿像？🤪 

## 小结

Coding Agent的上下文文件管理是Harness Engineering的重要一环，理解并合理利用，是让Vibe Coding和SDD能够稳定产出的基础。

也欢迎各位老铁评论区说说自己有啥比较好 context files 最佳实践 😎






