<h1 align="center"><span style="color: #0398fa;">Pixiv</span>Collection</h1>

![preview](docs/screenshot.jpg)


## 简介

[示例站点](https://pixiv.orilight.top/)

将个人的P站收藏夹数据爬取到本地并部署为在线网站

无后端设计，图片数据一次性全部加载，图片较多时可能需要较长的时间

## 功能

- 图片浏览
  - 瀑布流布局，可自定义瀑布流列数与间隔
  - 简易的图片浏览器，支持PC端和移动端的图片缩放与拖动
- 图片筛选
  - 通过发布年份、形状、尺寸、不健全度、R18、作者、标签、收藏数筛选图片
- 图片搜索
  - 通过图片id、图片标题、作者id、作者昵称、标签、标签翻译搜索图片
- 夜间模式
- 全屏模式

## 部署

1.构建前端

> [!NOTE]
> 构建前端需要安装 NodeJS 环境及 PNPM 包管理器

```bash
# 安装依赖
pnpm i

# 构建前端
pnpm build
```

构建后的前端文件位于 `dist` 目录下，将其上传至服务器即可

2.爬取数据

[数据爬取脚本及使用](https://github.com/orilights/python_scripts/tree/main/pixiv_collection)

使用上述脚本将收藏夹图片和图片信息爬取到本地

3.上传数据

将脚本生成的 `images.json` 上传至服务器 `./` 目录

(可选) 将爬取到的原图上传至服务器 `./image/original` 目录

将脚本生成的预览图上传至服务器 `./image/preview` 目录

将脚本生成的缩略图上传至服务器 `./image/thumbnail` 目录
