# 快捷键研究依据

> 2026-11-19 更新：以下 16/10 条核查及界面描述保留为历史记录。当前 Illustrator 已扩展为 159 项分类，具体可执行／手动／保留原生输入的范围、来源冲突和未完成的实机验收见 [illustrator-coverage.md](illustrator-coverage.md)。不能将“已分类”理解为“全部自动映射成功”。

核查日期：2026-11-16。范围：项目现有 macOS 配对，Figma → Illustrator 16 条，Figma → Photoshop 10 条。以下是默认键位资料审查，不是 26 条动作的完整实机测试；保留两个数据文件的 `verified: false`。

符号：`⌘` Command，`⇧` Shift，`⌥` Option。箭头表示任务对应，不代表动作完全相同，也不代表程序已经自动转换；逗号表示依次按键。

## 如何使用这些依据

- 优先采用 Figma、Adobe 的产品文档和应用本身显示的键位。
- 同一个键位也可能作用于不同对象：Figma 图层、Illustrator 对象、Photoshop 图层或像素选区。
- 操作类型分清：选择工具、执行命令、切换状态、按顺序执行多个命令。选择工具以后通常还需要点击或拖动。
- 文档核对、界面标签核对、动作实测分别记录。用户确认过的菜单栏开关/K 提示，不作为全部映射已经完成动作的证据。
- 研究时先采用 A：提示对应按键，由用户自己执行。后续按用户的新要求加入独立的 Direct remap；Learning 仍保留 A 行为，具体实现与实测范围见 `decision-log.md`。以下逐条核查和内容优先级保留研究时的发现，不表示所列文案问题仍未处理。

## Figma → Illustrator：逐条核查

1. `copy`：`⌘C → ⌘C`。默认复制键一致；只复制当前选中的内容。来源：[Figma 复制说明][f-copy]、[Illustrator 键位表][ai-keys]。
2. `scale`：`K → S`。选择缩放工具，然后操作对象。**需要修正文案**：Illustrator 的描边与效果是否随对象缩放由 Scale Strokes & Effects 设置决定，不能说一定包含。Figma Scale 会同比例缩放相关描边/模糊。来源：[Figma Scale][f-scale]、[Illustrator Scale][ai-scale]、[键位表][ai-keys]。
3. `rectangle`：`R → M`。矩形工具；之后拖动绘制。来源：[Figma 形状][f-shapes]、[Illustrator 键位表][ai-keys]。
4. `ellipse`：`O → L`。椭圆工具；提示之后的 `L` 必须交给 Illustrator。来源同上。
5. `line`：`L → \`。直线段工具；Illustrator 原生 `L` 是椭圆。来源同上。
6. `frame`：`F → ⇧O`。**近似对应**：Frame 的一部分用途可借用 Artboard，但不能承诺它拥有 Figma Frame 的容器、嵌套和自动布局行为。当前“不能嵌套”等绝对文案应进一步实测，后续提示优先解释这是工作区域对应。来源：[Figma Frame][f-frame]、[Illustrator 键位表][ai-keys]。
7. `hide`：`⌘⇧H → ⌘3`。Figma 是可反复切换的图层可见性；Illustrator 这里是 Hide Selection，恢复使用 Show All（`⌘⌥3`），不是同一键再次切回。来源：[Figma 可见性][f-hide]、[Illustrator 键位表][ai-keys]。
8. `lock`：`⌘⇧L → ⌘2`。Figma 是 Lock/Unlock 切换；Illustrator 的解锁使用 Unlock All（`⌘⌥2`）。不能给用户“再按一次即可解锁”的暗示。来源：[Figma 锁定][f-lock]、[Illustrator 键位表][ai-keys]。
9. `duplicate`：`⌘D → ⌘C, ⌘F`。这是 Copy 然后 Paste in Front 的两步替代，会更新剪贴板；不应显示成同时按下。Illustrator `⌘D` 重复上一次变换，不是通用 Duplicate。现有 “repeats your last move” 应改成“重复上一次变换”。来源：[Figma 复制][f-copy]、[Illustrator 键位表][ai-keys]。
10. `rulers`：当前 `⇧R → ⌘R`。Figma 官方菜单截图明确显示 `⇧R`。**Adobe 来源存在差异**：旧版官方 macOS 图写 `⌘R`，现行网页的 artboard rulers 行写 `⌘⌥R`。需要在本机文档打开时核对 View → Rulers 的显示键位，区分显示标尺与切换全局/画板标尺；不凭冲突资料自动改键。来源：[Figma 标尺文章及截图][f-rulers]、[Adobe 旧版图][ai-sheet]、[现行键位表][ai-keys]、[标尺说明][ai-rulers]。
11. `zoom-fit`：当前 `⇧1 → ⌘0`。**近似对应且待核对**：Figma Zoom to fit 显示当前页面内容；Illustrator 区分当前画板与全部画板。新版网页明确全部画板为 `⌘⌥0`，旧官方图把 `⌘0` 标成全部画板，存在标注差异。后续用本机两个画板核对命令和范围；轻提示必须写清当前画板/全部画板。来源：[Figma 缩放视图][f-zoom]、[Illustrator 查看画稿][ai-view]、[现行键位表][ai-keys]、[旧版图][ai-sheet]。
12. `move`：`V → V`。键位一致，保持通过；不要额外弹提示。来源：[Figma 图标教程][f-move]、[Illustrator 键位表][ai-keys]。
13. `pen`：`P → P`。键位一致，保持通过；Figma 的 vector network 与 Illustrator 的路径编辑不能因同键而假定细节一致。来源：[Figma Vector networks][f-pen]、[Illustrator 键位表][ai-keys]。
14. `text`：`T → T`。键位一致，保持通过；开始输入文字后停止识别普通字母查询。来源：[Figma 工具栏][f-toolbar]、[Illustrator 键位表][ai-keys]。
15. `group`：`⌘G → ⌘G`。键位一致，保持通过。来源：[Figma 图层类型][f-layers]、[Illustrator 键位表][ai-keys]。
16. `auto-layout`：`⇧A → 无直接对应`。现有研究没有建立与 Figma 持续响应内容变化的 Auto layout 等价的 Illustrator 命令。Align/Distribute 是可用的手动任务替代，不应标成同一功能或假造快捷键。来源：[Figma Auto layout][f-auto]、[Illustrator 对齐][ai-align]。这是产品映射判断，不是关于所有插件/未来版本的绝对断言。

本轮本机只读核对：Illustrator 2026 的工具栏确实显示 Selection V、Pen P、Type T、Line Segment \、Rectangle M、Scale S、Artboard ⇧O。没有打开文档执行动作；视图菜单的无障碍文本没有返回快捷键，截图不可用，因此不能用这次检查消除标尺/缩放争议。检查后恢复首页。

### 后续本机核对：默认键位与视图命令

后续在新建的临时文档中检查 Illustrator 2026。Edit → Keyboard Shortcuts 显示当前键集为「Illustrator 默认值」；通过该窗口的 Export Text 导出临时参考后，使用 Cancel 退出，没有保存键位设置更改。导出文本明确列出：

- 「画板适合窗口大小 Cmd+0」（第 550 行）。
- 「显示标尺 Cmd+R」（第 567 行）。
- 「更改为画板标尺 Opt+Cmd+R」（第 568 行）。

本机视图菜单也将显示标尺与更改为画板标尺分成两项。向 Illustrator 直接发送 Cmd+R 后，菜单从「显示标尺」变为「隐藏标尺」，随后再次按键恢复。直接发送 Cmd+0 后，临时文档从 30.41% 变为 44.61%。因此当前采用的 Cmd+R、Cmd+0 与本机命令名称一致；这里的 Cmd+0 对应画板适合窗口，不应写成全部画板。导出文本未包含「全部适合窗口大小」这一行，不能用这份导出独立核实它的键位或多画板行为。

这些是本机目标命令的核对，不是 Shift+R／Shift+1 穿过 Shortcut 全局过滤器的完整实测；多画板范围仍待检查，保留数据文件的 `verified: false`。上述较早的“截图不可用、争议待核对”描述是当时的研究状态，以本次补充为准。

## Figma → Photoshop：逐条核查

1. `photoshop-copy`：`⌘C → ⌘C`。键位一致。**需要补充文案**：Photoshop 也支持完整图层复制；复制结果受图层、像素选区和路径/文字编辑状态影响，不应笼统写成只复制像素。来源：[Figma 复制][f-copy]、[Photoshop 复制图层][ps-copy]。
2. `photoshop-scale`：`K → ⌘T`。Free Transform 是缩放任务的替代，不是与 Figma Scale 完全相同的工具。先选图层，进入变换后拖动，Return 应用；比例行为依赖 Maintain Aspect Ratio/Legacy Free Transform，图层效果也不会自动随变换缩放。来源：[Figma Scale][f-scale]、[Photoshop Scale][ps-scale]。
3. `photoshop-duplicate`：`⌘D → ⌘J`。Layer via Copy；活动像素选区可能限制复制范围。原生 `⌘D` 是 Deselect。来源：[Figma 复制][f-copy]、[Photoshop 图层][ps-layers]、[选择工具][ps-selections]、[官方 PDF 第 3、27 页][ps-pdf]。
4. `photoshop-move`：`V → V`。同键通过；PDF 把 Move 和 Artboard 放在同一工具组。工具组/当前工具设置须纳入实测，不能承诺任意状态按 V 都得到完全相同的工具。来源：[官方 PDF 第 4 页][ps-pdf]。
5. `photoshop-text`：`T → T`。同键通过；Type 工具组，切换组内工具的 Shift 行为取决于 Use Shift Key for Tool Switch 设置。来源：[Figma 工具栏][f-toolbar]、[官方 PDF 第 4-5 页][ps-pdf]。
6. `photoshop-pen`：`P → P`。同键通过；Pen 工具组，不假定当前组内工具与 Path/Shape 输出模式。来源：[Figma Vector networks][f-pen]、[官方 PDF 第 5 页][ps-pdf]。本轮未核实每种输出模式的操作结果。
7. `photoshop-group`：`⌘G → ⌘G`。对选中图层建立分组；同键通过。来源：[Figma 图层类型][f-layers]、[官方 PDF 第 27 页][ps-pdf]。
8. `photoshop-zoom-fit`：当前 `⇧1 → ⌘0`。目标任务为 View → Fit on Screen，范围是文档。现行官方说明确认菜单任务，但正文没有直接列出该快捷键；旧 PDF 中可搜索到的 `⌘0` 还出现在特定滤镜上下文，不能据此当作主窗口键位的完整验证。保留现有配置，待在本机主窗口菜单进一步确认。来源：[Figma 缩放视图][f-zoom]、[Photoshop 缩放视图][ps-zoom]。
9. `photoshop-rulers`：`⇧R → ⌘R`。显示/隐藏标尺。来源：[Figma 标尺菜单截图][f-rulers]、[Photoshop 标尺][ps-rulers]。
10. `photoshop-auto-layout`：`⇧A → 无直接对应`。未建立直接等价命令；对齐/分布仅作为手动替代，不标成自动布局。来源：[Figma Auto layout][f-auto]。目标侧仍需进一步检查本机支持范围，不能用“没查到”证明软件绝无类似能力。

## 给下一步轻提示实现的约束

- 内容分两层：收起时只给任务与下一步目标键；展开后说明操作步骤、前提和行为差异。
- `O → L` 后的 L 应执行 Illustrator 椭圆，不能被当作新的 Figma Line 查询。现有最近提示目标键优先机制应保留，并在新通知流程复测。
- 重复操作是一串命令（`⌘C, ⌘F`），提示内容必须明确顺序。识别到按键只代表尝试，不能自动记录成动作成功或掌握。
- 同键（V/P/T/⌘C/⌘G）默认通过；需要了解差异时从手动搜索/回看入口查看。
- 文字输入时，字母键和段落对齐等组合应给编辑器。例如 Illustrator 的 `⌘⇧L` 在文字上下文还可能是段落左对齐，不能一律拦截成锁定查询。[官方键位表][ai-keys]
- `Esc` 同时可能是目标软件取消操作的键。研究时发现旧代码在卡片可见时吞掉 Esc 的风险；当前通知实现已改为关闭提示并将 Esc 原样交给目标应用，原生策略检查覆盖了可见提示下的按下/释放。目标软件中取消具体操作的完整实测仍需单独记录。
- 提示模式只支持明确列出的键位。不能写成“完全像 Figma 一样使用 Illustrator”。
- 当前键位解析器仅建模 Command/Shift；文案中的 Option 解锁/显示全部是补充说明，不能未经扩展和测试就声称已纳入目标键跟踪。
- 自定义快捷键、非 US/ANSI 布局、中文输入和工具组状态分别实测；官方默认表不代表用户当前设置。

## 下一轮内容优先级

1. 修正 Illustrator Scale 的“描边/效果一定随缩放”文案，以及 Duplicate 的“last move”表述。
2. 轻提示先用 Scale、Rectangle、Ellipse/Line、Duplicate 这些差异明确的任务完成真实流程；其中 Ellipse/Line 专门检查目标键冲突。
3. 把 Hide/Lock 的单向命令与 Figma 的切换行为区别写进详情。
4. 文档有歧义的 Rulers/Zoom，以及 Frame 近似对应，先保留明确的待验证记录，再核对本机命令。
5. 更新 Photoshop Copy 的上下文说明；不扩大 Photoshop 的形状映射，避免用同一个 U 工具组假装多个形状已经可准确选择。

## 官方依据

[f-copy]: https://help.figma.com/hc/en-us/articles/4409078832791-Copy-and-paste-objects
[f-scale]: https://help.figma.com/hc/en-us/articles/360040451453-Scale-layers-while-maintaining-proportions
[f-shapes]: https://help.figma.com/hc/en-us/articles/360040450133-Shape-tools
[f-frame]: https://help.figma.com/hc/en-us/articles/360041539473-Frames-in-Figma-Design
[f-hide]: https://help.figma.com/hc/en-us/articles/360041112614-Toggle-visibility-to-hide-layers
[f-lock]: https://help.figma.com/hc/en-us/articles/360041596573-Lock-and-unlock-layers
[f-rulers]: https://help.figma.com/hc/en-us/articles/360040449713-Add-guides-to-the-canvas-or-frames
[f-zoom]: https://help.figma.com/hc/en-us/articles/360041065034-Adjust-your-zoom-and-view-options
[f-move]: https://help.figma.com/hc/en-us/articles/18770195788951-Create-a-reusable-icon-grid
[f-pen]: https://help.figma.com/hc/en-us/articles/360040450213-Vector-networks
[f-toolbar]: https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar
[f-layers]: https://help.figma.com/hc/en-us/articles/15297425105303-Explore-design-files
[f-auto]: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma
[ai-keys]: https://helpx.adobe.com/illustrator/desktop/get-started/preferences-and-settings/default-keyboard-shortcuts-for-illustrator.html
[ai-scale]: https://helpx.adobe.com/illustrator/desktop/manage-objects/reshape-transform-objects/scale-objects.html
[ai-rulers]: https://helpx.adobe.com/illustrator/desktop/measure-and-align/grids-and-guides/use-rulers.html
[ai-view]: https://helpx.adobe.com/illustrator/using/viewing-artwork.html
[ai-align]: https://helpx.adobe.com/illustrator/desktop/manage-objects/arrange-objects/align-and-distribute-objects.html
[ai-sheet]: https://helpx.adobe.com/content/dam/help/en/illustrator/pdf/Ai_cheat-sheet_macOS.jpg
[ps-copy]: https://helpx.adobe.com/photoshop/desktop/create-manage-layers/create-layer-compositions/copy-and-paste-layers.html
[ps-scale]: https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/scale-layers-in-photoshop.html
[ps-layers]: https://helpx.adobe.com/photoshop/desktop/create-manage-layers/create-layer-compositions/create-layers-and-layer-groups.html
[ps-selections]: https://helpx.adobe.com/photoshop/desktop/make-selections/get-started-selections/selection-tools-overview.html
[ps-zoom]: https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/zoom-images.html
[ps-rulers]: https://helpx.adobe.com/photoshop/desktop/use-grids-measurement-guides/measure-scale/use-rulers-in-photoshop.html
[ps-pdf]: https://helpx.adobe.com/content/dam/help/en/photoshop/using/default-keyboard-shortcuts/photoshop-keyboard-shortcuts.pdf

Figma 官方标尺文章中的菜单图片也已查看，显示 Rulers 为 ⇧R。Adobe macOS JPG 底部署名年份为 2017；这份旧图只作为交叉核查线索，不压过当前应用设置。

校验用户实际设置的官方入口：[Figma 键盘布局][f-layout]与[快捷键面板][f-keyboard]；Adobe 在 Edit → Keyboard Shortcuts 中查看当前快捷键（[Photoshop 说明][ps-current]）。

[f-layout]: https://help.figma.com/hc/en-us/articles/5665442977431-Select-keyboard-layout
[f-keyboard]: https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard
[ps-current]: https://helpx.adobe.com/photoshop/desktop/get-started/settings-and-preferences/view-keyboard-shortcuts.html
