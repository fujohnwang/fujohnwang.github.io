% How To Homebrew KeeNotes 
% 王福强
% 2021-02-04


# 手动作业过程说明

我是先在本地创建一个项目， 目录结构参考：

```
homebrew-keenotes/
    Casks/
        keenotes.rb
    Formula/
        keenotes.rb
    README.md
```

然后拷贝一个Formula的定义模板并修改相应值。

比如`sha256 "xxxx"`的配置行， 其值我们使用如下命令获得并更换：

```bash
(base) ➜  KeeNotes git:(master) > shasum -a 256 "KeeNotes Desktop-1.2.2.dmg"
e3731d376958ba68e927f876b27ade5a9d049461d59af2c4c32dc0df6db12a75  KeeNotes Desktop-1.2.2.dmg
```

比如url指向的安装文件位置，我们直接用github上的releases里的下载文件地址：

```ruby
url "https://github.com/keevol/keenotes-desktop/releases/download/v1.2.2/KeeNotes.Desktop-1.2.2.dmg"
```

> NOTE
> 
> 虽然现在安装文件都是习惯性的放在Github，但其实url可以指向任何地址， 比如`url "https://cdn.electronic.us/products/commander/mac/download/commander.dmg"`, 所以，鉴于国内从github下载东西很慢的现状， 可以将体积大的安装文件放在国内的服务器上配合CDN加快下载与安装过程。

所有这些本地编辑完成后， 在gibhub上新建一个项目[homebrew-keenotes](https://github.com/keevol/homebrew-keenotes), 项目名称需要遵循`homebrew-<appname>`的规则， 之后把本地项目push上去就可以了。


所有这些做完之后，就可以：

```bash
brew cask install keenotes
brew install --cask keenotes
```

> TIPS
> 
> 当然， 以上手动过程可以通过`brew create`命令简化，比如`brew create https://github.com/keevol/keenotes-desktop/releases/download/v1.2.2/KeeNotes.Desktop-1.2.2.dmg`会自动计算hash并生成一个Formula脚手架配置文件，稍后只要根据情况手动调整就好了(`brew edit <formula>`)。


# 术语

## Formula

A formula is a package definition written in Ruby. 

其实就是安装说明配置文件。

## Tap

A Git repository of Formulae and/or commands

告诉homebrew去哪儿找新的或者默认没有的安装说明配置文件(Formula)。

## Bottle

Homebrew can distribute **precompiled binaries** of your software, called **bottles**. By default, everything in the main Homebrew repository (Homebrew/homebrew-core) is bottled. This provides a superior user experience and saves time when installing software that takes a long time to compile (e.g., GCC).

其实就是编译好的可安装文件， 省却很多麻烦，否则要加入从源码本地编译的逻辑， Formula会比较tricky，需要很多时间去debug。

## Cask

An extension of Homebrew to install macOS native apps

其实就是安装有界面的App， 默认homebrew的Formula安装的都是命令行程序(Command Line Executable)。



# 本地作业不分享(Local Workout Only)

如果只是本地开发和使用， 可以不用跟github打交道：

```
brew tap-new keevol/keenotes
cd $(brew --repo keevol/keenotes)
pwd

brew create --tap=keevol/keenotes <URL> 
    where `<URL>` is a zip or tarball, installed with `brew install <formula>`, and debugged with `brew install --debug --verbose <formula>`.
然后根据需求手动改动一些必要信息即可。
```


# 其它需要注意的点(Attentions)

## cask file name and cask token in the file 

The first non-comment line in a Cask follows the form:

```
cask "<cask-token>" do
    ...
```

`<cask-token>` should match the Cask filename, without the .rb extension, enclosed in single quotes.




# 参考资料(Ref)
- https://docs.brew.sh/Formula-Cookbook
- [Homebrew: Publish Your First Formula](https://speakerdeck.com/defeated/homebrew-publish-your-first-formula)
- <https://github.com/Homebrew/homebrew-cask/blob/master/doc/cask_language_reference/readme.md>



