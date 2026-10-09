# CardioFAD project page

基于 [Nerfies](https://github.com/nerfies/nerfies.github.io) 的轻量静态学术项目主页，无需 npm、构建步骤或外部 CDN。使用上游 Bulma 样式，并针对 CardioFAD 重写页面内容、排版和媒体加载逻辑。

## 预览

直接双击 `index.html` 即可预览。也可以在本目录启动本地服务器：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8765/>。本地修改后刷新页面。

## 手动加入图片、视频和链接

只需编辑 **`static/js/config.js`**。现有论文图片和视频路径已填写；Paper/arXiv 链接和 BibTeX 保留为空。空媒体路径只展示占位，不会请求不存在的文件。

1. 将图片放入 `static/images/`，视频放入 `static/videos/`。
2. 在配置中填写相对于 `index.html` 的路径，使用正斜杠。例如 `teaser: "static/images/teaser.png"`。
3. 刷新网页。图片会按原始比例显示，点击可放大，按 Esc 关闭；视频默认静音自动播放并循环，保留原生播放控件。

| 配置键 | 内容 | 建议文件名 |
| --- | --- | --- |
| `images.teaser` | Teaser / Figure 1 | `static/images/teaser.png` |
| `images.framework` | Framework / Figure 2 | `static/images/framework.png` |
| `images.table1` | 原始 Table 1 备份；网页表格不再加载此配置 | `static/images/table-1.png` |
| `images.table2` | 原始 Table 2 备份；网页表格不再加载此配置 | `static/images/table-2.png` |
| `images.fig3` | Figure 3：visual comparison | `static/images/figure-3.png` |
| `images.fig11` | Figure 11：CMR ablation | `static/images/figure-11.png` |
| `images.fig12` | Figure 12：ECHO ablation | `static/images/figure-12.png` |
| `videos.cmr[0].original` | CMR example 01：Original (GT) | `static/videos/cmr-01-gt.mp4` |
| `videos.cmr[0].synthetic` | CMR example 01：Synthetic | `static/videos/cmr-01-synthetic.mp4` |
| `videos.echo[0].original` | ECHO example 01：Original (GT) | `static/videos/echo-01-gt.mp4` |
| `videos.echo[0].synthetic` | ECHO example 01：Synthetic | `static/videos/echo-01-synthetic.mp4` |

CMR 和 ECHO 各有 6 个 examples，桌面端每种模态按 **2 列 × 3 行** 排列，共 12 个 examples、24 个视频位置。每个 example 固定左侧 Original (GT)、右侧 Synthetic；窄屏每行 1 个 example，但 GT/Synthetic 仍左右并排。数组索引 `[0]` 对应 Example 01，`[5]` 对应 Example 06；为每一行对象分别填写 `original` 和 `synthetic` 路径即可。CMR 不再分 Volume2Seq/Slice2Seq 展示。页面不显示 Example 编号，配置数组仍按原顺序对应这 6 组视频。

图片建议使用高分辨率 PNG、WebP 或 SVG。浏览器 `<img>` 不直接支持 PDF，可先自行导出 PNG。视频建议使用 H.264 编码的 MP4。无需按占位框比例裁剪论文图片，实际图片会按自身比例完整显示。Qualitative Results 使用三图轮播（Figure 3、11、12），可用左右箭头、下方圆点或键盘左右键切换图片与图注，点击当前图片可查看大图。

## Quantitative Results 网页表格

原先两张结果图已替换为可选中、复制的原生 HTML 表格。左上角 CMR / ECHO 切换模态；右上角随之显示 CMR 的 Volume2Seq / Slice2Seq，或 ECHO 的 EchoNet-Dynamic / EchoNet-Pediatric (A4C) / EchoNet-Pediatric (PSAX)。切回模态时保留各自上次选择，默认显示 CMR Volume2Seq。

- **数值与行名**：直接编辑 `index.html` 中 `#quantitative-results` 的五张表，保留原始小数位。数据来源为当前 `static/images/table-1.png` 与 `table-2.png`，两个源文件完整保留。原论文引用序号未作为网页方法名的一部分显示。
- **样式与切换**：分别位于 `static/css/quantitative-results.css` 和 `static/js/quantitative-results.js`。浅灰表头与分段按钮参考 [OneStreamer](https://mcg-nju.github.io/OneStreamer/)；ECHO 保留方法分组，CardioFAD (Ours) 以淡蓝底色突出，最优数值加粗。代码为本地实现，未引入外部依赖。
- **窄屏和键盘**：按钮自动换行；表格在自身容器内横向滚动，方法列固定。Tab 进入按钮组，左右方向键或 Home / End 切换；Enter / Space 同样可操作。JavaScript 不可用时直接显示全部五张表。
- **来源差异**：原 `table-2.png` 中 EchoNet-Synthetic 在 Pediatric (A4C) 的 SSIM 为 **0.642**，而本地 `CardioFAD_NeurIPS_2026_CR_10.05.pdf` 的文本为 **0.624**。此次按用户要求迁移现有图片，因此保留 **0.642**，未自行更正研究数值。

`paperUrl`、`arxivUrl` 填写最终网址后，顶部相应按钮自动启用。`bibtex` 支持多行模板字符串：

```javascript
// 将正式 BibTeX 粘贴到两枚反引号之间；默认保留空内容。
bibtex: ``,
```

BibTeX 采用 Nerfies 原版标题和代码块样式，内容留空时保留空白代码块；填写后可直接选中复制。需要修改文字、作者、图注或增加示例时，编辑 `index.html`；外观位于 `static/css/index.css`。

## 作者与内容依据

- 初始文案依据 `paper/Neurips2026/CardioFAD_NeurIPS_2026_CR_10.04.pdf`，Abstract 为网页用精简摘要。Focus、Align、Diffuse 的方法介绍已按用户指定的 `CardioFAD_NeurIPS_2026_CR_10.05.pdf` 第 3.2–3.4 节更新，每部分两句，不含公式；上方圆角卡片可跳转至对应介绍，布局参考 [FlexTok Overview](https://flextok.epfl.ch/)。
- 六位作者和顺序按论文第 1 页保留；机构显示大学简称。`author.txt` 中五个 Google Scholar 地址原样采用。
- `author.txt` 缺少 **Joao A. C. Lima**。未找到可验证的 Google Scholar 个人主页，当前链接明确标注为 **Google Scholar 作者检索**，不是个人主页。取得个人主页后，填写 `limaScholarUrl` 即可替换。已核查的官方参考：[Johns Hopkins research profile](https://pure.johnshopkins.edu/en/persons/joao-lima/) 和 [faculty profile](https://profiles.hopkinsmedicine.org/provider/joao-lima/2706109)。
- 用户输入的 rebuttal 路径包含多余分隔符；实际读取的是 `paper/Neurips2026/rebuttal/CardioFAD_OpenReview.pdf`，其第 2 页记录 NeurIPS 2026 接收信息。
- 图表对应论文页码：Figure 1 第 2 页；Figure 2 第 3 页；Tables 1–2 第 6 页；Figure 3 第 7 页；Figures 11–12 第 27–28 页。
- 论文中 CMR 使用配对 ECG；ECHO 使用共享、非患者特异性的相位模板。视频区域按用户要求仅保留模态名称及 Original (GT) / Synthetic 标签。
- 布局参考用户列表中的 MotionStream、MOFA-Video、TokenBridge、CausVid 和 VideoFlexTok；未使用其图片、视频或文案。

## 文件与发布

公开页面仅需 `index.html` 和 `static/`；发布时保留 `THIRD_PARTY.md` 及许可证。`.work/` 是本地 PDF 提取、原模板参考和验证材料，已在 `.gitignore` 中排除，**不要上传该目录**。没有统计跟踪脚本、外部字体请求或构建依赖。论文、rebuttal 和源研究代码均未修改，也未自动上传或发布网站。

模板来源、固定版本和许可证见 `THIRD_PARTY.md`。页脚保留 Nerfies 署名与 CC BY-SA 4.0 链接。
