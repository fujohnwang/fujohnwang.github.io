% KVectors向量数据库完成IVF_RABITQ索引的支持啦～
% 王福强
% 2025-11-11

有点儿意想不到

写完代码直接跑测试

居然直接过了

没有任何运行期异常 🤪

测试结果跟个人的预期算是相符合吧

将SiftSmall一百万条向量数据灌入KVectors向量数据库之后

在没有构建索引之前先跑了一遍检索

作为对比指标

结果是这样的：

> search 10000 vectors in 2280907 milli 

然后花了7、8分钟构建索引：

> 完成 向量集合:ivf-rabitq-test-collection 总共 999999 向量的全量索引构建， 耗时： 0 天 0 小时 7 分钟 25 秒，索引名称：1762832256798

索引构建完成之后

重新跑一遍检索

结果是这样的：

> search 10000 vectors in 342093 milli 

跟之前纯粹的IVF_FLAT（或者叫IVF_LITE）索引相比

性能劣化了，从个位数毫秒到现在三十几毫秒

但也是合理的

因为**IVF_RABITQ索引面向的是1亿～10亿这个规模的向量数据集**

百万向量可能很多时候一个是clusters数量不多，另外一个就是很多计算都耗费在计算上了（跑的时候忘了加`--add-modules jdk.incubator.vector`虚拟机参数了）

但也只是猜测哈

因为后半段基于IVF_RABITQ索引的检索在跑的时候

金总跑过来要看看我新搬的办公室

就陪他溜达了会儿

也就没看到JConsole里CPU的消耗

在没有构建索引之前，纯粹full-scan的时候，CPU消耗其实不大：

![](https://files.catbox.moe/c35e9g.jpg)

Anyway

至此， 2025年双十一之际

KVectors向量数据库已经正式支持了如下几种业界主流的向量索引：

1. FLAT
2. HNSW
3. HNSW+PQ
3. IVF
4. IVF_RABITQ
5. LSH

软著申请提交后处于待审查状态

等再打磨打磨就可以开卖了🤪

当然，有对产品背后机理感兴趣的企业

也有系列企业培训哟（橙子科技已经连续采买了3期）

更多关于KVectors向量数据库的信息，欢迎访问福强科技官网了解「https://keevol.cn/#kvectors」
