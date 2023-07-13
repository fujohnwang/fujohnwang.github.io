% Rsync报错Permission denied
% 王福强
% 2023-03-13

早上备份视频的时候，发现rsync报错：

```
rsync: connection unexpectedly closed (0 bytes received so far) [sender]
rsync error: error in rsync protocol data stream (code 12) at io.c(231) [sender=3.2.7]
Permission denied, please try again.
```

本地和NAS环境也没咋动过啊，平常一直没问题啊，搞得扶墙老师丈二和尚摸不着头脑，遂Google之，嗯，还没有养成习惯直接去问ChatGPT，最后在stackoverflow上找了个tip试了一下，运行平稳，就是多加了一个`--rsync-path`参数，指明远程服务器上的rsync安装位置就可以了， 比如：

```
rsync -zahuv --rsync-path="/bin/rsync" --exclude-from=${HOME}/FuqiangWorks/templates/config/rsync/excludes ${HOME}/Movies/ {DEST}
```

留存于此，希望对其他人也有帮助。

