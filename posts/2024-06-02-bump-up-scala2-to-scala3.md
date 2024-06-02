% 升级Scala2.12到Scala3
% 王福强
% 2024-06-02

今天尝试把自己的Scala2.12的一个项目UtilitiesFX升级成Scala3，看看有多大难度。

升级思路大体上是：

1. 整体复制项目目录到新的目的，并将目录重新命名（以视觉上区分）；
2. 将新项目的artifact名称改掉，追加`-scala3`，以从依赖管理层面区分；
3. 更改maven中scala相关依赖与配置，主要是scala版本号更改以及scala-library依赖的更改。

```xml
            <plugin>
                <!--http://davidb.github.io/scala-maven-plugin/usage.html-->
                <groupId>net.alchim31.maven</groupId>
                <artifactId>scala-maven-plugin</artifactId>
                <version>${scala.plugin.version}</version>
            </plugin>

            ...
		        <!-- https://mvnrepository.com/artifact/org.scala-lang/scala3-library -->
							<dependency>
							    <groupId>org.scala-lang</groupId>
							    <artifactId>scala3-library_3</artifactId>
							    <version>3.4.2</version>
							</dependency>
					 ...
```

另外就是，把所有`_2.12`到依赖也都要改成`_3`，比如：

```xml
        <dependency>
            <groupId>com.lihaoyi</groupId>
            <artifactId>requests_3</artifactId>
            <version>0.8.3</version>
        </dependency>
```

下面是遇到的一些错误与警告，看起来broken的地方不多，大部分是warnings

# Brokens

## Unit方法也必须=

```
[ERROR] [Error] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/utils/CartesianProduct.scala:84:62: '=' expected, but '{' found
[ERROR] [Error] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/utils/CartesianProduct.scala:92:32: '=' expected, but '{' found
```

## 类型转换更严格

```
[ERROR] [Error] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/utils/AnchorPanes.scala:35:36: Found:    (gap : Int)
Required: Double
```

## 方法调用更严格

```
[ERROR] [Error] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/utils/Images.scala:141:154: method pasteFromClipboard in object Images must be called with () argument
```

`() => pasteFromClipboard.foreach(imageProperty.set(_))` -> ` () => pasteFromClipboard().foreach(imageProperty.set(_))`  



# WARNINGS

## var args展开

从`var:_*` -> `var*`

## 类型定义与约束中的通配符_

从`_`变成`?`，比如

- `T[ _<:S ]` 变成 `T[ ?<:S ]`
- `task: Worker[_]` -> `task: Worker[?]`
-  `() => pasteFromClipboard.foreach(imageProperty.set(_))` -> ` () => pasteFromClipboard().foreach(imageProperty.set(_))`  // 这里是方法调用的括号不能省略（否则认为是方法引用了，相当于加强了约束）, 通配符反而可以继续用


## 变量通配符

从`var splashScreen: Stage = _`变成`var splashScreen: Stage = uninitialized`（而且还得import scala.compiletime.uninitialized）

我觉得tmd这是倒退，我宁愿null

## 集合类型转换

```
[WARNING] [Warn] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/controls/launchctl/LaunchControlBlocks.scala:19:24: object JavaConverters in package scala.collection is deprecated since 2.13.0: Use `scala.jdk.CollectionConverters` instead
```

## 数据类型转换

```
[WARNING] [Warn] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/javafx/utils/TextInputControlTyper.scala:11:41: method long2double in object Long is deprecated since 2.13.1: Implicit conversion from Long to Double is dangerous because it loses precision. Write `.toDouble` instead.
```

## linestream到lazylines

```
[WARNING] [Warn] /Users/fq/workspace.scala3/UtilitiesFX-scala3/src/main/scala/com/keevol/utils/CommandRunner.scala:50:49: method lineStream_! in trait ProcessBuilder is deprecated since 2.13.0: use lazyLines_!
```
