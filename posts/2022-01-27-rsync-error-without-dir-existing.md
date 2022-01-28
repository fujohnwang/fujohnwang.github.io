% rsync: [sender] opendir ... failed: Operation not permitted (1)
% 王福强
% 2022-01-27


备份本地mac资料到NAS，频繁报这个错误：

```
rsync: [sender] opendir "/Users/fq/Pictures/Photos Library.photoslibrary" failed: Operation not permitted (1)`
```

开始以为是权限问题，本来这个目录也不重要，所以，我就添加了rule到exclude文件里，执行之后还是报同样的错误， WTF？

然后怀疑是rule写错了？ 加了引号quotes，还是不行，而且发现之前exclude里最前面已经配置过对应的规则，What？

请教Google吧，是有一堆类似的问题，但肯定不是我这种情况，最后我发狠了，丫的本来就不同步你的内容，我删掉你还不行吗？ 然后发现这个目录不存在...

难道是在exclude文件里加了不存在的目录导致的？ 从exclude文件里把对应的rule去掉，重新执行rsync， 执行第一次OK，执行第二次还是报同样的错误， WTF！？

我服了你了， 直接这样吧：

```
*.photoslibrary
```

终于清净了...






