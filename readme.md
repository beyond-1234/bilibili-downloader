# 写在前面

盗视频者司马

盗视频者司马

盗视频者司马

# Bilibili Downloader 

一个使用Electron搭建的bilibili视频下载器，仅供自己学习用

# 技术栈

- JS库用的是老旧的JQuery
- 发请求用的是axios，跨域需要魔改header
- CSS使用的Bulma和Awesome font
- 音视频合并使用的是ffmpeg(fluent-ffmpeg、ffmpeg-static-electron)
- 依赖管理用的是yarn

# 命令

安装依赖
```
yarn
```
运行项目
```
yarn start
```
打包
```
yarn dist
```

# 已知问题

- 音频视频合并非常慢，还不知如何解决