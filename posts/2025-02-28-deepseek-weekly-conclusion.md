% DeepSeek这一周都开源了什么？
% 王福强
% 2025-02-28

首先说明下，DeepSeek这一周开源出来的所有项目，对于绝大多数公司来说没有意义，唯一的意义就是你会间接的享受到它们提供的好处，但不需要真正了解他们是怎么回事。
尤其是对于应用开发公司或者SaaS公司，更不要说传统企业。

DeepSeek开源的这些项目只对两类公司有深入了解的必要：

1. 做AI技术基础设施的公司，包括各家云厂商
2. 做ToB交付的方案或者项目公司，因为你家甲方大多数情况下会要求你给他私有部署，这个时候你就得有方案对接并有实施能力

该说的说完了，如果你还想往下看，那说明你属于这两类公司的一员 ；）

## 第一天开源了 FlashMLA

MLA是多头注意力的缩写（Multihead Latent Attention）， FlashMLA就是服务于AI计算的一种内存/显存优化方法。

说简单点儿就是怎么省内存，花小钱办大事儿， 硬件烂点儿没关系，咱可以用FlashMLA来优化硬件的使用，让小马拉大车。

谁让咱禁运前就有万张老款GPU呢，得好好压榨下呀，😉

## 第二天开源了 DeepEP

> DeepEP is a communication library tailored for Mixture-of-Experts (MoE) and **expert parallelism** (EP). It provides high-throughput and low-latency all-to-all GPU kernels, which are also as known as MoE dispatch and combine. The library also supports low-precision operations, including FP8.

有些时候觉得吧，干计算机跟tmd种地没啥区别，都是地块跟路的问题。（嘿嘿，开玩笑啦）

- 内存是地，内存与内存之间通信的bus是路；
- （单台）计算机是地，连接计算机的网线是路；

要让庄稼长得好就得优化土质， 这就是第一天开源的FlashMLA干的事儿；

要让庄稼收获了能快速流通，就得路宽路好跑， 这就是DeepEP干的事儿；

DeepEP就是个优化通信效率的库

## 第三天开源了 DeepGEMM

> “DeepGEMM”是与矩阵运算（GEMM 通常代表“General Matrix Multiply”，即通用矩阵乘法）相关的高效算法或工具，专门用于加速深度学习模型的训练或推理过程。矩阵乘法是深度学习中的核心操作，尤其是在 Transformer 模型（像 DeepSeek 的 V3 或 R1 这样的 LLM）中占据了大量的计算开销。

纯AI领域的核心库，优化矩阵计算，太高深，略过 🤣

## 第四天开源了 DualPipe 和 EPLB

DualPipe 是 a bidirectional pipeline parallelism algorithm for computation-communication overlap in V3/R1 training.

简单来说就是，AI底层计算通常前者两个关键指标：

1. Pipeline
2. Parallelism

Pipeline管串行， 但一个个排着走效率不行，所以，一般会错峰出行，通过多条Pipeline编排来提高效率，我估计DualPipe就干这事儿（非专业领域，不保证准确）

至于EPLB则是 an expert-parallel load balancer for V3/R1.

说得挺清楚了，R1是MoE模型， 专家模型之间并行运行的负载均衡器（load balancer， 简称LB）

## 第五天开源了 3FS

Fire-Flyer File System (3FS) - a parallel file system that utilizes the full bandwidth of modern SSDs and RDMA networks.

模型训练和推理需要很多数据存储， 估计原来传统的分布式文件系统不能满足需求？ 所以自己重新搞了套分布式文件系统3FS， 专门为AI场景优化的。

据说单节点基于DuckDB？ 这个我喜欢，单机分析神器，之前我也介绍过。

## 小结

看文章开头🤣
