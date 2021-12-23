% PreferencesFX自定义Setting的实现案例
% 王福强
% 2021-01-17

PreferencesFX其实对常见类型的Setting有默认支持，比如字符串，数字，选择列表等， 甚至于也支持File/Directory类型的Setting， 允许我们使用FileChooser来选择和设定对应的Setting状态与展示， 但是，这几天想添加一个字体的Setting配置项， 发现默认的搞不定，但还想继续沿用PreferencesFX的基础设施，所以研究了下如何自定义PreferencesFX的Setting。

PreferencesFX其实提供了两种自定义Setting的扩展机制：

1. `Setting.of(Node)`, 即直接简单粗暴地提供JavaFX Node组件， 但太原始，除非不需要状态交互，否则不建议使用。
2. `Setting.of(description, Field, Property)`, 使用Field的render方法提供自定义的组件渲染/组装逻辑， 并关联组件和Property之间的关系， 我们使用这种方式来实现Font类型的自定义Setting。

首先，我们的Font类型的自定义Setting在展示的时候， 预期的展示是这样的： 一个TextField作为字体类型， 大小和风格的选择结果展示， 一个Button， 当点击的时候，则打开一个字体选择对话框（我们使用ControlsFX的DialogSeletorDialog）， 用户选择了相应字体之后， 则将所选择的字体信息格式化之后设置给TextField并更新对应的Property， 至于Setting的显示名称，则直接使用传入的description即可。

在这个前提下，我们首先得先定义一个SimpleControl， 下面是我们的实现：

```scala
package com.keevol.keenotes.desk.settings

import com.dlsc.formsfx.model.structure.StringField
import com.dlsc.preferencesfx.formsfx.view.controls.SimpleControl
import com.keevol.keenotes.desk.utils.FontStringConverter
import javafx.geometry.Insets
import javafx.scene.control.{Button, TextField}
import javafx.scene.layout.{HBox, Priority, StackPane}
import javafx.scene.text.Font
import org.controlsfx.dialog.FontSelectorDialog

/**
 * a custom simple control for font with foot chooser
 *
 * @author fq@keevol.com
 */
class SimpleFontControl extends SimpleControl[StringField, StackPane] {

  var textField: TextField = _
  var fontChooseButton: Button = _

  val fontStringConverter = new FontStringConverter()

  override def initializeParts(): Unit = {
    super.initializeParts()

    node = new StackPane()

    textField = new TextField()
    textField.setEditable(false)
    fontChooseButton = new Button("Choose Font")
    fontChooseButton.setOnAction(e => {
      val dialog = new FontSelectorDialog(Font.getDefault)
      val p = dialog.showAndWait()
      if (p.isPresent) {
        val font = p.get()
        println("font.toString: " + font.toString)
        textField.setText(fontStringConverter.toString(font))
        field.valueProperty().set(fontStringConverter.toString(font)) 
        field.persist()  // 更新persistentValue（persistentValue和value是两个property）
      }
    })
    textField.setText(field.getValue)
    val hbox = new HBox(10)
    hbox.setPadding(new Insets(3))
    hbox.getChildren.addAll(textField, fontChooseButton)
    HBox.setHgrow(textField, Priority.ALWAYS)

    node.getChildren.add(hbox)
  }

  override def layoutParts(): Unit = {

  }
}
```

SimpleControl的几个override的方法，原则上`layoutParts()`是必需的， 但我们图省事，直接把逻辑合并到了initializeParts()方法中（即组件的初始化和layout以及状态管理都放一起了），而且，我们的SimpleFontControl实际上是单向的数据状态更新（使用FontSelectorDialog单向选择并更新设置项），所以实现上就更加简单粗暴了。

因为Font和String类型差异，我们将Font到String的格式化逻辑以及从String创建Font的逻辑抽象封装到了FontStringConverter（一个StringConverter实现）： 

```scala
package com.keevol.keenotes.desk.utils

import javafx.scene.text.{Font, FontWeight}
import javafx.util.StringConverter
import org.apache.commons.lang3.StringUtils

class FontStringConverter extends StringConverter[Font] {
  override def toString(font: Font): String = s"${font.getFamily}, ${font.getSize}, ${font.getStyle}"

  override def fromString(fontString: String): Font = {
    val fontFamily = StringUtils.substringBefore(fontString, ",")
    val fontSize = StringUtils.substringBetween(fontString, ", ", ", ")
    val fontStyle = StringUtils.substringAfterLast(fontString, ", ")

    val f = if (StringUtils.contains(fontStyle.toLowerCase, "bold")) {
      Font.font(fontFamily, FontWeight.BOLD, fontSize.toDouble)
    } else {
      Font.font(fontFamily, fontSize.toDouble)
    }
    f
  }
}
```

有了这些之后， 我们就可以添加Font类型的自定义Setting到PreferencesFX了：

```scala
val fontProperty = new SimpleStringProperty("Serif")
...
Setting.of("Font", Field.ofStringType(fontProperty).render(new SimpleFontControl()), fontProperty)
```

现在， 我们的主程序就可以基于这个Setting做初始化了：

```scala
  val conv = new FontStringConverter()
  ...
  def tile(channel: String, content: String, dt: Date = new Date()) = {
    val card = new KeeNoteCard
    card.title.setText(channel + s"@${DateFormatUtils.format(dt, "yyyy-MM-dd HH:mm:ss")}")
    card.content.setText(content)
    card.content.setFont(conv.fromString(settings.fontProperty.get())) // for init
    Bindings.bindBidirectional(settings.fontProperty, card.content.fontProperty(), conv) // for latter update
    card
  }
```

card.content是一个Label，所以它的fontProperty()就是Font类型的ObjectProperty, 因为与Settings中的fontProperty（SimpleStringProperty类型）类型不同，所以我们使用了Bindings.bindBidirectional配合FontStringConverter完成了设定与应用组件之间的状态绑定。

当然，这种方法不一定是最好或者最符合PreferencesFX设计哲学的方式， 但却是最符合我编码胃口的方式，起码SimpleFontControl和FontStringConverter把通用逻辑都封装的差不多了。






