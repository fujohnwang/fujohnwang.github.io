% 初识Graal
% 王福强 著
% 2018-08-15

Java程序员应该很羡慕Go语言程序员能够编译出一个one-in-all的二进制可执行文件，然后本地直接执行， 而自己却要-cp指定一堆jar和路径，虽然可以打包成一个onejar，但依然要本地安装java运行环境，然后`java -jar x.jar`， 加上如果想赶时髦， 使用docker进行发布和部署， 还得忍受基础镜像几百兆的size， 实在不能称得上`多快好省`而且轻...

GraalVM虽然还没有发布正式版，但已经发布了几版RC，从它的发展历程中，让很多Java程序员看到了一条康庄大道， `多快好省`不再是梦。

GraalVM提供的native image工具可以帮助我们将java程序编译成一个本地可执行的二进制文件，这个特性可以让我们有很大的想象空间：

1. 用java写工具， portable不是梦；
2. 用docker封装发布， ADD一个几十兆的二进制可执行文件就行了；
3. 微服务？更轻量， 启动更快，运行期内存更小...

光说不练假把式， 让我们先从简单的一个工具入手看看native image的魅力吧~

# native image快速上手

GraalVM基于Java8，你可以理解成另一个SDK， 所以首先要跟JDK似的，下载安装并配置PATH， <http://www.graalvm.org/downloads/>， 怎么搞我就不细说了， 暂时只有Mac和Linux版本可用。

我们创建一个Java项目，还是典型的HelloWorld： 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>demo</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.7</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>

                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer
                                        implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>com.example.demo.DemoApplication</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>


</project>
```

HelloWorld嘛， 你懂得：

```java
public class DemoApplication {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

执行`mvn package`之后我们就获得一个可执行的jar包（因为我们用了shade插件），我们针对这个可执行jar包执行native image命令：

```
➜  one_jar_native_image_starter git:(master) ✗ $HOME/bin/graalvm-ce-1.0.0-rc5/Contents/Home/bin/native-image -jar target/demo-0.0.1-SNAPSHOT.jar
Build on Server(pid: 99502, port: 64944)
   classlist:     616.43 ms
       (cap):   5,338.88 ms
       setup:   6,753.34 ms
  (typeflow):   6,509.05 ms
   (objects):   2,937.12 ms
  (features):      62.18 ms
    analysis:   9,645.27 ms
    universe:     400.46 ms
     (parse):   2,275.13 ms
    (inline):   1,730.84 ms
   (compile):   8,492.76 ms
     compile:  13,170.85 ms
       image:   1,541.81 ms
       write:   1,703.71 ms
     [total]:  33,919.21 ms
```

查看当前项目目录：

```
➜  one_jar_native_image_starter git:(master) ✗ ll
total 11432
drwxr-xr-x@ 4 afuluo  staff      128 Apr 29 08:31 src
-rw-r--r--@ 1 afuluo  staff     2282 Apr 29 08:38 pom.xml
-rw-r--r--  1 afuluo  staff      931 Apr 29 08:38 demo.iml
drwxr-xr-x  8 afuluo  staff      256 Aug 15 16:25 target
-rw-r--r--  1 afuluo  staff     1507 Aug 15 16:25 dependency-reduced-pom.xml
-rwxr-xr-x  1 afuluo  staff  5840784 Aug 15 16:26 demo-0.0.1-SNAPSHOT
```

可以看大， demo-0.0.1-SNAPSHOT就是生成的可执行二进制文件，可以直接执行： `./demo-0.0.1-SNAPSHOT`，不过默认生成的名字实在丑陋，所以，我们可以通过`-H:Name=<自定义名称>`命令行选项自己指定：

```
➜  one_jar_native_image_starter git:(master) ✗ $HOME/bin/graalvm-ce-1.0.0-rc5/Contents/Home/bin/native-image -jar target/demo-0.0.1-SNAPSHOT.jar -H:Name=hello
Build on Server(pid: 99502, port: 64944)
   classlist:     464.16 ms
       (cap):   3,179.86 ms
       setup:   3,587.10 ms
  (typeflow):   4,150.58 ms
   (objects):   1,641.23 ms
  (features):      40.68 ms
    analysis:   5,951.36 ms
    universe:     330.50 ms
     (parse):   1,210.82 ms
    (inline):   2,054.93 ms
   (compile):   7,206.31 ms
     compile:  11,043.39 ms
       image:     968.90 ms
       write:   1,257.79 ms
     [total]:  23,640.19 ms
```

这样我们获得的二进制可执行文件名称就是hello：

```
➜  one_jar_native_image_starter git:(master) ✗ ll
total 22840
drwxr-xr-x@ 4 afuluo  staff      128 Apr 29 08:31 src
-rw-r--r--@ 1 afuluo  staff     2282 Apr 29 08:38 pom.xml
-rw-r--r--  1 afuluo  staff      931 Apr 29 08:38 demo.iml
drwxr-xr-x  8 afuluo  staff      256 Aug 15 16:25 target
-rw-r--r--  1 afuluo  staff     1507 Aug 15 16:25 dependency-reduced-pom.xml
-rwxr-xr-x  1 afuluo  staff  5840784 Aug 15 16:26 demo-0.0.1-SNAPSHOT
-rwxr-xr-x  1 afuluo  staff  5840856 Aug 15 16:27 hello
```

直接执行: `./hello`， Aha~


> NOTE
> 
> Mac版的native image编译完获得的二进制文件不能在linux上运行， 因为二进制文件都是编译后的本地machine code， 所以，要在哪个目标平台执行，需要用哪个平台的GraalVM编译哦~


# 深入native image

写写小工具， 前面的快速上手的知识基本就够了，但是要想构建稳健运行在生产环境的服务或者系统， 我们就得对Graal或者说native image有更深入的了解了。

为了简化，我们使用[KeeWeb(https://www.keevol.com)](https://www.keevol.com)框架 ^[KeeWeb框架是福强科技构建的一个**async、reactive、strong-typed**的Web API框架] 构建一个简单的Web API，只提供一个GET的Endpoint，返回"HelloWorld"作为结果：

```scala
package com.keevol.demo.hello.webapinative

import com.keevol.keeweb.{KeeWeb, Kontroller}
import io.vertx.core.Vertx
import io.vertx.core.http.HttpMethod
import io.vertx.ext.web.RoutingContext

class HelloController extends Kontroller{
  override val path: String = "/"
  override val method: HttpMethod = HttpMethod.GET

  override def apply(rc: RoutingContext): Unit = {
    rc.response().end("Hello, there")
  }
}


object Hello{
  val helloController = new HelloController

  def main(args: Array[String]): Unit = {

    val vertx = Vertx.vertx()

    KeeWeb.start(vertx, Seq(helloController))
    System.in.read()  // block server

    vertx.close()
  }
}
```

生成onejar之后，用native-image编译成本地可执行文件：

```
$HOME/bin/graalvm-ce-1.0.0-rc5/Contents/Home/bin/native-image -H:+ReportUnsupportedElementsAtRuntime -H:Name=hello-server -jar build/libs/hello-webapi-native-1.0.0-SNAPSHOT-all.jar
```

然后执行： ``, 现在，我们就可以访问我们的web api了：

```
➜  ~ http http://localhost:1979
HTTP/1.1 200 OK
Content-Length: 12

Hello, there
```

好吧，我其实把过程简化了，请注意`-H:+ReportUnsupportedElementsAtRuntime`这个参数，其实第一次编译，我们是编译不过的，通过这个参数，编译的结果就可以呈现给我们一些错误提示， 比如：

```
Caused by: java.lang.ClassNotFoundException: com.jcraft.jzlib.Inflater
	at java.net.URLClassLoader.findClass(URLClassLoader.java:381)
	...
```

实际上， Graal native-image在有些方面是有功能限制的，比如java reflection， native-image干的事情是一种AOT（Ahead Of Time Compiling），要AOT，就需要提前知道程序依赖的Class有哪些， 所以，一些运行期（Runtime）加载的类在AOT的时候是无法知道的， 但我们可以通过一些手段预先知会native-image有哪些类需要用到：

1. 通过`-H:ReflectionConfigurationFiles=reflection.json`参数， 在reflection.json这样的配置文件中提供依赖信息；
2. 通过提供一个Feature类，配合RuntimeReflection工具类提供相应的依赖信息；

我们选择第一种方式， 所以， 最终的native-image命令如下所示:

```
$HOME/bin/graalvm-ce-1.0.0-rc5/Contents/Home/bin/native-image --no-server -Djava.net.preferIPv4Stack=true -Dvertx.disableDnsResolver=true -jar build/libs/hello-webapi-native-1.0.0-SNAPSHOT-all.jar -H:Name=helloserver -H:+ReportUnsupportedElementsAtRuntime -H:ReflectionConfigurationFiles=reflection.json
```

当然， 很不幸的是， 我用的graalvm-1.0.0-rc5版本还是有bug和不支持的特性，导致执行`./helloserver`的时候会抛出segment fault，或许等graal 1.0.0正式发布之后， 对各类库和框架的支持会更稳定些吧~


```
➜  hello-webapi-native git:(master) ✗ ./helloserver
19:03:47.562 [main] INFO com.keevol.keeweb.KeeHttpServer - start http server...
[1]    7111 segmentation fault  ./helloserver
```

# 限制与局限性

当然，除了反射之类的限制，将Java程序编译成native image还其他的限制，像JMX这种平台相关的特性就不要想了， 需要借助GraalVM Enterprise版提供的一些Profiler或者Debugger等商业特性， 或者自己加一些外围的监控支持，因为我们拿不到Truffle框架EST中添加的一些附加信息。

更多限制可以参考官方的文档： <https://github.com/oracle/graal/blob/master/substratevm/LIMITATIONS.md>

# 参考文档

- <http://www.graalvm.org/docs/> 官方文档
- [Top 10 Things To Do With GraalVM](https://medium.com/graalvm/graalvm-ten-things-12d9111f307d)
- [Bringing Fibers to TruffleRuby](https://medium.com/graalvm/bringing-fibers-to-truffleruby-1b5d2e258953)
	- <https://dzone.com/articles/natively-compile-java-code-for-better-startup-time>
	- <https://www.jetdrone.xyz/2018/08/10/Vertx-native-image-10mb.html>

# 小结

GraalVM无论是从性能上，还是理念上，都对Java生态产生了很大的促进作用， 虽然它还只是基于Java8， 也没有发布正式版，但我相信即使Java11发布了， GraalVM也将是Java基础设施中很重要的一员， 跟[福强科技(https://www.keevol.com)](https://www.keevol.com)同为Scala重度用户的**Twitter**， 已经在生产环境使用GraalVM很长时间了， 这也充分证明了GrralVM的核心价值所在。

对于Java社区或者重度Java技术体系的公司来说， GraalVM将是值得投入的一个技术域， 使用得当，可以为公司节省大量的研发和基础设施费用。



 