% JavaFX里如何自定义Dialog
% 王福强
% 2023-10-25

当然，主要的可选项依然是两个：

1. 基于javafx.stage.Stage
2. 基于javafx.scene.control.Dialog

第一种很简单，就是以写一个JavaFX应用那样的"套路"新开一个窗口而已，所以，不做赘述，毕竟，写JavaFX首先就得先会写一个应用不是？

重点是第二种方式，即基于javafx.scene.control.Dialog进行自定义Dialog的设计和实现。

javafx.scene.control.Dialog是个范型类：`Class Dialog<R>`

这个R代表Dialog返回结果的类型，也就是对话框关闭之后返回的结果类型，如果我们要把Dialog中各个组件的数据返回给调用程序使用，那么，就要以R类型的形式返回，最简单的就是返回一个String，复杂点儿的就是把多个组件的数据打包成一个类型，比如scala里的case class或者kotlin里的data class, java里当然就是javabeans ；）

那如何打包数据让它们以R类型的形式返回给调用者呢？ 这就得用到一个概念，叫resultConverter，在Dialog里有个属性叫resultConverterProperty，保存的就是相应的resultConverter，不过， resultConverter是概念，它对应的类型是`Callback<ButtonType,R>`, 其实就是一个函数，接收ButtonType类型数据作为参数，然后返回R类型的数据作为结果，用函数来描述就是`ButtonType => R`， 绝大多数情况下（只要我们希望Dialog关闭后给调用者返回数据），resultConverter是必须设置的。

一个常见的resultConverter实现逻辑类似于：

```
setResultConverter((buttonType) => if (buttonType == ButtonType.OK) Some(passwordF.getText) else None)
```

这里，我们只处理特定button类型对应的返回结果, 因为我们声明了一个简单的Dialog，返回值类型是`Option[String]`，所以，我们在用户点击OK按钮之后，通过Some封装对话框里text field组件的值作为结果返回，其它情况下，都返回None。

这样，当调用者获得对话框返回结果之后，就可以进行类似如下的处理：

```
val dlg = new CustomDialog[Option[String]]()
dlg.showAndWait().ifPresent(result => 
    result.foreach(password => {
        settings.updateAdminPassword(password)
    })
)
```

ifPresent是检查用户是点了OK还是Cancel，决定是否有返回结果，如果有返回结果（也就是result），那么，我们再根据返回结果类型对数据进行处理，因为这里我们的结果类型是`Option[String]`，所以，我们通过foreach（也可以通过判断或者pattern matching）对结果进行了处理。

以上是数据交换的逻辑，即对话框与调用者之间数据交换的逻辑，下面我们再来看UI逻辑。

Dialog的UI主要通过设置Dialog对应的DialogPane的内容来实现，而DialogPane则通过调用Dialog的getDialogPane()获得引用，之后就可以向其中追加UI布局和组件了。

定制Dialog的UI主要是两种思路：

1. 沿用Dialog的布局，做最简单的设置，比如直接setTitle，setContentText等等，然后再通过`getDialogPane.setExpandableContent(myLayout)`添加附加内容；
2. 直接结果Dialog的布局和内容，通过`getDialogPane.setContent(myLayout)`最大限度接管UI的布局和组件。；

除此之外，最后一个要定制的就是要显示什么按钮以及显示几个按钮，这是通过`getDialogPane.getButtonTypes.addAll(ButtonType.OK, ButtonType.CANCEL,...)`来实现的，如果要对具体哪个按钮进行进一步的设置，则需要先取得这个按钮对应的组件，然后再进行设置：

```
val okButton = getDialogPane.lookupButton(ButtonType.OK)
okButton.disableProperty().bind(Bindings.createBooleanBinding(() => StringUtils.isEmpty(passwordF.textProperty().get()), passwordF.textProperty()))
```

至此，基本上一个自定义Dialog就完成了。

小结一下就是：

1. 通过设置resultConverter对返回数据进行采集、转换和返回；
2. 通过getDialogPane()取得Dialog对应的DialogPane做UI定制；
3. 按钮按需添加、按需查找、按需设置；

就酱紫。






