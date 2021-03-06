%  HA狭义与广义论



HA概念本身平淡无奇， HA者， High Availability的简称嘛！不过， 或许真的是自身愚笨， HA， HA的听多了， 还真没把它当回事。 很多年之后才真正“吃”出点儿味儿来。
 
我得说， 大家通常挂在嘴边的HA应该属于狭义概念上的HA， 它通常指代某种Active+Standby的Pair Service， 最长见的当然就是数据库的主备结构。反正大家天天这么招呼， 在狭义的HA层面上也能达成一定的共识， 不过， HA概念本身其实简单背后蕴含着更多的玄机。

从更广义的角度来说， HA就是HA（这可能听着有点儿绕）， 为了让我们的系统可以高可用(High Availability), 我们有许多手段或者说方式来达成这个目的， 而我们常常挂在嘴边的HA， 实际上只是其中的一个手段或者几个手段的代称而已。

为了保证系统的高可用， 我们有许多种手段和方式， 下面是几种较为常见的手段和方式（不限于）：

* **复制与备份（Replication And Backup)**. 这主要是从存储的角度保证状态的可用性， 比如采用RAID（冗余磁盘阵列）通过冗余的数据备份存储保证数据的高可用性； 比如， 异地数据中心之间的数据备份与灾难恢复； 又比如当下KV engine实现中采用的 R+W > N 的原则等都可以属于这个范畴。

* **Failover**. 为了保证系统的高可用性， 我们还可以引入Failover机制， 比如应用程序运行期间的hot swap， 或者Virtual IP之间的切换等，都属于Failover的范畴。

* **Cluster**. 集群也是通过冗余来保证系统的高可用性， 只不过， 它侧重的是服务的冗余， 而不是状态的冗余（虽然也包含）。 集群内部可以存在交互，也可以不存在交互， 存在交互的集群内部各个结点通常是不对等的， 而不存在交互的集群内部各个结点通常则是对等的。 集群内部的交互， 简单的机制当然是Heart Beat， 复杂的机制可能有组播， 广播等。总之就是， 挂了我一个， 还有后来人， 预备役多着那。

* **Load balance**. 负载均衡扔这里可能会感觉牵强附会，不过， 从其所起的作用来看， 把它看作保证系统高可用的一种手段也不为过。负载均衡可以减轻单一或者多个结点的负载压力， 将整体负载均衡的分配到多个结点上去，你想啊， 如果没有负载均衡， 将整个的负载都压到一个结点上去， 那这个结点不废废才怪那， 还谈啥高可用性啊， 连用都用不了了。

其它的手段和方式欢迎补充， 不多扯了。

另外， 如果实在不能达成系统某种程度的高可用性， 我们还可以选择某些妥协方案， 比如， 考虑系统的“优雅降级”（又是一个长挂嘴边的词儿）， 或者允许系统小部分的不可用等。

总之那， HA就是HA（还是那么绕）， 简单又不简单。为了这么个简单的概念， 诸君却需要付出不简单的努力。