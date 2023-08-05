% Swift极速快打
% 王福强
% 2023-08-02


让ChatGPT帮忙写的一些Swift代码看起来有些费劲，所以，简单扫了下Swift的语法：

- swift里的[protocol](https://www.hackingwithswift.com/read/0/22/protocols)类似于scala的trait或者java的interface
- [extension](https://www.hackingwithswift.com/read/0/23/extensions)可以把新功能加到已有类型上，有点儿跟scala3的extension method类似。
    - [protocol extension算是extension的一种特例](https://www.hackingwithswift.com/read/0/24/protocol-extensions)。
- throw Error（而不是像java/scala那样throw Exceptions）
- do-catch（而不是像java/scala那样try-catch）
- nil（对应java/scala里的null）
- "Your name is \(name)" （对应scala里的string interpolation `${...}`，swift里也叫string interpolation，只不过用`\(...)`，变量名或者表达式）
- if 和if let(以及guard let)是不一样的表达式，https://agrawalsuneet.github.io/blogs/if-vs-if-let-vs-guard-let-in-swift/， if let有点儿scala里option的味道，作用是unwrap [optional](https://www.hackingwithswift.com/read/0/12/optionals) binding
- functions的参数可以指定两个名称，一个是外部调用时候用，一个内部引用的时候用，https://www.hackingwithswift.com/read/0/11/functions
- `func countLettersInString(myString str: String) `
- [struct](https://www.hackingwithswift.com/read/0/15/structs)， 类似scala的case class，数据容器类数据结构， 或者kotlin的data class
- [强制类型转换](https://www.hackingwithswift.com/read/0/20/polymorphism-and-typecasting)，`as?`，比如`let studioAlbum = album as? StudioAlbum`（this will make studioAlbum have the data type `StudioAlbum?`, That is, an optional studio album）, 其实我倒是一直挺希望Scala能把那个又臭又长的asInstanceOf改掉或者有个类似的简短的形式。
- [Trailing closures](https://www.hackingwithswift.com/read/0/21/closures), 最后一个参数可以用语法糖（if the last parameters to a method are closures, you can eliminate those parameters and instead provide them as a block of code inside braces.），这个倒是跟scala的有点儿像，只不过scala是放在单独参数声明。

