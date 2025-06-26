% Gemini CLI 快速上手
% 王福强
% 2025-06-26

Claude Code又添一个竞品

## 安装

```
ni -g @google/gemini-cli
```

## 使用

命令行直接输入gemini

## 步骤

第一步会让你选择用什么theme（风格），按Enter键选择默认就挺好

第二步会让你选择Auth方式，也就是使用什么认证和授权方式， 我有用Google账号的方式、有用API Key的方式，甚至还有Vertex AI （google云）的方式， 我选择的API Key方式，因为原来就有从AI Studio获得的API Key。

但有个小卡点是，我之前把这个API Key 以 `export GOOGLE_API_KEY=...`的方式设置了环境变量，但Gemini-CLI从环境变量里提取API Key用的却是GEMINI_API_KEY， 所以，我在$HOME/.zshrc中又添加了一行：`export GEMINI_API_KEY=...`

现在就可以愉快的跟gemini玩耍了。

> NOTE
> 
> 如果第二步你没有提前设置 GEMINI_API_KEY，那么CTRL+C退出之后，设置完GEMINI_API_KEY再次运行gemini，它就会自己捕捉到这个环境变量了（当然，你也得source $HOME/.zshrc一下或者重开命令行窗口）。 如果没有识别到，可以在输入框输入/auth重新认证。

GL&HF



