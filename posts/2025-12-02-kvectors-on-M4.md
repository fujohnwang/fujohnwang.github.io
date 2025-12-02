% M4芯片上跑了下KVectors向量数据库的性能测试，没想到...
% 王福强
% 2025-12-02

正好前阵子有哥们儿给了我台M4，就用它来跑下KVectors向量数据库的性能测试，预期肯定比我这老Intel款MBP强，但强到我看到这个结果还是好好数了下数字的个数🤣

![](https://files.catbox.moe/gw1rcf.jpg)

```
search 10000 vectors in 4399 milli
press any key to exit...
```

平均0.4毫秒 😆

不过这个性能结果还算符合预期啦，毕竟之前在老款Intel芯片的MBP上跑IVF_FLAT索引测试，结果也是1.1毫秒 ～ 1.3毫秒这个区间， M4再怎么样硬件性能上要好的多得多。

不过M4在IVF_RABITQ索引的向量集合测试上折戟了，我还不确定是为啥：

```bash
=> M4 上kvectors IVF_RABITQ性能测试

search 10000 vectors in 381487 milli // without indexing 
press any key to start to build index
...
search 10000 vectors in 206182 milli
press any key to exit...
```

为啥感觉性能还不如intel款的老MBP测试的性能？！ 我记得之前是13毫秒左右，这个直接干到了20毫秒左右。

向量压缩后做ANNS反而慢了？！

可能百万级别不值得搞向量压缩和ANNS？

又或者我的RABITQ压缩算法还有很大的改进空间？

Anyway，埋头拉磨的模式该休一休了，后面得多想想怎么让KVectors这款产品给客户创造价值，让客户愿意埋单 🤣


