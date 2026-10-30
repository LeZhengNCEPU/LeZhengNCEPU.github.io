# 学生地图维护

网站继续使用 Jekyll / Minimal Mistakes。地图是可离线运行的静态 HTML，无数据库。

## 文件与唯一主数据

| 文件 | 用途 |
| --- | --- |
| `tools/student-map/assets/student_data.json` | **唯一构建主数据**：全体学生、稳定 ID、照片、取景、状态及简介是否就绪 |
| `tools/student-map/editor_template.html` | 编辑器、SVG 渲染器、展示页导出器的正式源模板 |
| `tools/student-map/assets/map_geometry.json` | 地理几何及核验过的省内计数锚点；年度维护不改此文件 |
| `assets/maps/学生分布地图_编辑器.html` | 生成的完整编辑器；下载后可直接在浏览器打开 |
| `assets/maps/学生分布地图_数据.json` | 生成的完整 JSON 备份，内容来自唯一主数据 |
| `assets/maps/students-map.html`、`alumni-map.html` | 网站使用的两个展示页 |
| `students.md`、`alumni.md` | 本人简介、荣誉、研究方向及稳定锚点 |
| `assets/less/student-pages.less` | 宽正文及地图布局，构建时同步到实际加载的 `main.css` |

`build.cjs` 与编辑器的导出按钮调用模板里同一个 `buildViewerHTML()`，不对成品打临时补丁。`tools/` 被 Jekyll 排除，不进入公开站点页面。

## 每年更新

1. 从仓库下载最新版完整编辑器，备份一份。打开后点“编辑学生资料”；也可以导入最新完整 JSON。浏览器草稿仅用于恢复，不能代替主数据。
2. **新增学生**：输入姓名、省份、入学年、学位和在读状态，上传照片并调整取景。打开表单时会生成稳定 ID，以后不要删除重建或重新编号。表单显示该 ID。
3. 在 `students.md` 对应分届下添加真实简介，格式如下。资料暂缺时只写已知事实；不要杜撰研究方向或荣誉。

   ```html
   <span id="这里填写表单显示的ID" class="student-anchor" tabindex="-1"></span>
   ```

   锚点后空一行，再按照现有格式写 `> **姓名**：…` 和个人照片。完成后在编辑器勾选“已在对应栏目添加个人简介及上述锚点”。未勾选时头像仍显示，提示“简介待补充”，不生成断链。
4. **毕业更新**：编辑原记录，改为“已毕业”，填写毕业年份。原 ID、头像和取景保留。状态变化会取消“简介已就绪”；把对应简介移至 `alumni.md` 正确分届，保留全部真实内容、稳定 ID 和旧别名，再勾选就绪。编辑器不会自动移动 Markdown。
5. 如果旧 Students 地址已被引用，在原位置保留兼容入口，例如：

   ```html
   <span id="原ID" class="student-anchor" tabindex="-1"></span>
   <a id="原有别名"></a>
   ```

   后面写一条指向 `/alumni/#原ID` 的毕业生简介链接。Alumni 正文也保留原别名，方便旧引用迁移。
6. 点“保存可编辑文件”和“备份学生数据 JSON”，保留**全体**数据。把下载的 JSON 更新到 `tools/student-map/assets/student_data.json`，不要只替换展示页，否则下次构建会恢复旧主表。
7. 在仓库根目录用 Node.js 运行：

   ```sh
   node tools/student-map/build.cjs
   node tools/student-map/test.cjs
   ```

   生成器同时更新完整编辑器、JSON 和两类展示页，并检查已启用的头像链接确实存在且对应正确姓名。若提示缺简介，补好正文或先取消该记录的就绪勾选。
8. 同时提交主数据、必要的 Markdown、所有生成文件。等待 GitHub Pages 构建成功，检查两页人数、头像链接、江苏徽章和手机布局。

也可用编辑器的“导出 Students”“导出 Alumni”得到相同的展示页；这两个按钮忽略当前省份、入学年、页码筛选，始终导出完整类别。PNG/SVG 只导出当前画面，JSON/编辑器保存完整名单。每页最多 16 人，超过才出现翻页。

仅在本地保存不会自动更新网站。已有资料冲突时，以有依据的最新人工修订为准，不拿旧 Excel 覆盖新照片或取景。

## 布局与构建说明

Students / Alumni 的 `wide_content: true` 启用正常 CSS Grid：桌面 184px 侧栏、40px 间隔，正文占剩余空间，整体最大 1440px；小屏单列。地图与 article 同宽，始终为 16:9。长简介另有可读行宽约束。

`main.less` 最后引入 `student-pages.less`。当前网站直接加载已经存在人工调整的 `assets/css/main.css`，因此 Node 构建只同步明确标记的新增样式区块，保留其他旧 CSS。不要为了本次改动直接重新编译并覆盖整份旧 CSS。

正常 Jekyll 环境可运行 `jekyll build` 或 `jekyll serve`，GitHub Pages 仍使用原来的原生构建流程。本次验证使用 Jekyll 3.10.0 的真实 Liquid、Kramdown 和静态资源构建，并未用简化 Markdown 预览替代。Windows 时区已规范为 `Asia/Shanghai`。

## 2026-10-30 基线

起点为提交 `02f8b5cb1a2e5b290858edd33416f31690e3dce7`。先对比最新仓库编辑器与实施包，26 人的所有原始字段完全一致；实施时没有改动任何原有照片、取景、研究方向、荣誉、论文或去向。只为每人添加 `bioReady: true`，连接已经存在的 26 个简介。

- 在读 16 人，毕业 10 人，26 张照片；人数由数据计算，程序不写死。
- 孙苑毓：缩放 `1.05`，取景 `0.5 / 0.5`。
- 王泯瑾：缩放 `1.35`，取景 `0.49 / 0.41`，保留原资料的 2027 年博士在读。
- 鞠雨希、刘书豪等近期研究方向修订保持原文。
- 江苏 `320000` 的 `countLabel` 保留 `x: 822.67, y: 442.33`，省界、文字与徽章使用同一变换。
- 两张原顶部合影移到 Activities“课题组合影”，未添加未经证实的日期地点，青岛活动图片和视频保留。

底图来源及 CC0 说明见 [map_source_and_license.txt](assets/map_source_and_license.txt)。完整来源记录留在仓库，不占用展示画面。
