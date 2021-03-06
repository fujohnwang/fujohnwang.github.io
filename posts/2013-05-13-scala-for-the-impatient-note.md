% 《Scala For The Impatient》琐碎记录
% 王福强

感谢宏江借我这本书，现在可以当“闲书”来零散时间做消遣 ：）

# 关于在REPL里粘贴多行代码的问题
书中说到，使用粘贴模式即可解决， 即在命令中先键入：
<pre>
:paste
</pre>
然后粘贴代码，完成后，键入CTRL+D即可， 这样，就可以避免REPL提前短视的来提前evaluate跨行的scala代码。


# 关于break语句
scala里面没有啦，不过有三种alternatives可供选择。 使用boolean变量+while循环那，还好，对Java开发者来说其实很自家style啦， 不过，写多了scala，除非迫不得已其实不想多声明一个变量的； 使用scala.util.control.Breaks嘛， 也用过， 肯定不爽啦，而且貌似某次偶还遇到过灵异事件，哈； 最后那，是我觉得比较好的方式， 就是单独为循环结构声明一个方法，然后通过这个单独方法+return的方式来完成同样的功能。

当然啦，“萝卜白菜各有所爱”嘛，各位看官自己定夺啦，俺只是这里多嘴几句罢了（这里读liao）～

# 变长参数的你来我往

```scala
def recur(args:Int*) : Int = if(args.length == 0) 0 else args.head + recur(args.tail:_*)
```

如果方法声明的是变长参数， 比如Int*这种类型，那么可以以recur(1,1,3,4)之类的形式来调用它，但如果原来就有一组值想作为参数来调用变长参数方法，则需要将这组值先展开，即valueSeq:_\*的形式，个人老tnd忘，遂mark下～

# getters和setters
有两种方式可供选择，第一种：

```scala
private var privateAge = 0
def age = privateAge
def age_=(newAge:Int) {
	privateAge = newAge
}
```

这种是scala独有的，不过，一般情况下不需要自己声明，直接声明一个var变量age，编译器自动回帮我们生成这些方法。

<blockquote>
age_=方法编译为字节码后，名称是age_$eq(...), 因为Java里=不能包含在方法名声明中。
</blockquote>

第二种，使用@BeanProperty这个annnotation来标注我们想为其生成setters和getters方法的变量，不过，这种方式生成的setters和getters方法则跟JavaBean中的setters和getters是一样的命名风格咯，即setAge(age:Int)和getAge()这样的形式，跟传统Java框架，比如Spring来编码的时候，通常使用这种方式更多一些。

# private与private[this]

```scala
class Counter{
  private var value = 0
  def isLess(other:Counter) = value < other.value
}
```



如果只声明为private，则同一个类所有的对象都可以访问， 而如果声明为`private[this] var value = 0`的形式，则只有当前对象可以访问，像other.value则废废了。

# 多Trait与继承的解读


```scala
class A extends B with C with D with E 
```


应做类似如下形式解读：



```scala
class A extends (B with C with D with E)
```



即还是单一继承，多个traits组合成一个复合类型作为A的父类！

# extractor - unapply

返回三种形式

1. 一种是包含了目标类型的Option
2. 一种是boolean，用于在模式匹配的时候进行test condition
3. unapplySeq[Option[T]], 用于匹配长度的值序列



```scala
object Ex{
  def unapply(input:T) : Option[S] = if(true) Some(S) else None
  def unapply(input:T) : Boolean = input.matched
}

val Ex(s) = input // == Ex.unapply(input) 
```



# @specialized注解


```scala
def methodName[T](x:T, y:T) = ...
def methodName[@specialized T](x:T, y:T) = ...
def methodName[@specialized(Long, Int) T](x:T, y:T) = ...
```


如果T是基本类型，比如Int，Long等，如果没加@specialized，则参数将被打包成java.lang.Integer等Wrapper类型， 这有些不太高效，因为需要打包解包，甚至消耗不必要的内存甚至导致不必要的gc。 使用@specialized将让编译器为我们生成一系列重载的方法，分别对应原生类型参数。


# 类型界定

## <: 与 <%的恩怨
<: 用于一般类型之间的继承关系， 但如果要界定的类型与上界类型之间没有继承关系，则可以通过implicit conversion来解决，如果存在implicit conversion，也是可以进行界定的，这个时候就使用<%， 即view bound


```scala
class Pair[T <: Comparable[T]]
class Pair[T <% Comparable[T]]
```


前者对Int类型来说不能编译通过，因为Scala里的Int不是Comparable[Int]的子类，不过RichInt是，而且有相应的从Int到RIchInt的implict conversion，所以第二种形式可以。



























