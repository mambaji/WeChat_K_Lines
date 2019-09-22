# 微信小程序K线图表
demo使用的是wepy框架，如使用其他框架可直接将 utils 中的 drawKLinesUtil.js 复制到自己的项目中。
## demo运行图
![image]('https://github.com/ManbasJi/WeChat_K_Lines/blob/master/src/images/k1.png')
![image]('https://github.com/ManbasJi/WeChat_K_Lines/blob/master/src/images/k2.png')
## Demo 使用
``` js
  1. npm install  // npm安装
  2. wepy build --watch // 编译
  3. 将项目生成的 dist 文件导入 微信开发者工具中运行
```

## 功能说明
1. 将canvas嵌入scroll-view 中，可实现 k线图 横向滚动
2. 绘制K线图点击态；选中K线图实现k线边框黑色加粗，显示该K线时间
3. 绘制买卖点及买卖价格；

## API
1. 初始化
``` js
// 下面参数为必传参数，其他参数可以重写
let config = {
        wWidth  // 屏幕宽度
        wHeight // 屏幕高度
        datas  // K线数据集
        signsList // 信号数据集，不传则不绘制买卖信号
        yctx  // y 轴画布实例
        mainctx // K线画布与X轴画布实例
        optctx // K线选中态 画布实例
        minNum // y轴最小值
        maxNum // y轴最大值
}
// 参数初始化
// 返回K线画布宽度，需要将返回的  maincWidth 设置上 K线画布的 宽度 样式
let maincWidth = drawKLinesUtil.init(config)
```
2. 绘制Y轴
``` js
drawKLinesUtil.onDrawYAxis()
```
3. 绘制X轴与K线
``` js
drawKLinesUtil.onDrawXAxis()
drawKLinesUtil.onDrawKLines()
```
4. 传入触摸点的pageX，实现K线选中态需要用到；该函数返回当前选中的K线数据
``` js
drawKLinesUtil.onTouch(pageX)
```
5. 传入scrollLeft，实现K线选中态需要用到；该函数返回当前滚动到K线数据
``` js
drawKLinesUtil.onScroll(scrollLeft)
```

## 使用方式
1.视图
- scroll-view 组件位于最外层；
- yCanvas 与 scroll-view 同级别，因为yCanvas 不需要实现滚动；
- mainCanvas 用于绘制k线图和x轴；optCanvas 用于绘制k线选中态；二者是同级别，optCanvas 覆盖 mainCanvas 之上；

![image]('https://github.com/ManbasJi/WeChat_K_Lines/blob/master/src/images/klines.png')

``` html

<!-- wWidth:屏幕宽度； wHeight:屏幕高度； yWidth:y轴画布宽度；  cHeight:k线图表高度； maincWidth: k线画布宽度（根据K线大小和边距进行计算）；scrollToRight：设置scrollview滚动索引   -->
 <scroll-view class="scroll_box"
                 style="width:{{wWidth-yWidth}}px;height:{{cHeight}}px;position:absolute;"
                 scroll-x
                 scroll-left="{{scrollToRight}}"
                 bindscroll="onScroll"
                 bindtouchend="onTouchEnd"
                 bindtouchstart="onTouchStart">
      <canvas style="width:{{maincWidth}}px;height:{{cHeight}}px;position:absolute;background:#fff;"
              canvas-id="mainContent"></canvas>
      <canvas class="canvas"
              style="width:{{maincWidth}}px;height:{{cHeight}}px;"
              canvas-id="select-k-canvas"></canvas>
      </image>
    </scroll-view>
  </view>
  <canvas class="y-axis"
          style="width:{{yWidth}}px;height:{{cHeight}}px;margin-left:{{wWidth-yWidth}}px;background:#fff;"
          canvas-id="yAxis"></canvas>
```
2. 初始化
``` js
    //drawKLinesUtil 为引入的绘制 K线图的 js 文件
    const datas = this.kDatas   // k线数据
    const yctx = wx.createCanvasContext('yAxis')// Y轴画布
    const mainctx = wx.createCanvasContext('mainContent') // k线图与x轴 画布
    const optctx = wx.createCanvasContext('select-k-canvas')// k线选中态画布
    // 求Y轴最小值
    const minData = Math.min.apply(
      Math,
      datas.map(function (o) {
        return o.low;
      })
    );
    // 求Y轴最大值
    const maxData = Math.max.apply(
      Math,
      datas.map(function (o) {
        return o.high;
      })
    );
    // 参数配置
    let config = {
      wWidth: this.wWidth,
      wHeight: this.wHeight,
      datas: datas,
      signsList: this.tradeSignList,    // k线图上的买卖信号，不需要可不传
      kNum: datas.length,
      yctx: yctx,
      mainctx: mainctx,
      optctx: optctx,
      minNum: minData,
      maxNum: maxData,
      ycWidth: this.yWidth,
      ycHeight: this.cHeight,
      maincHeight: this.cHeight,
      kWidth: 15,
      k_margin_right: 10,
      main_margin_left: 15,
      screen_show_time: 2,
      mainBgColor: '#fff'
    }
    // 参数初始化，返回 maincWidth 为K线画布的具体宽度
    this.maincWidth = drawKLinesUtil.init(config)
```
3. 绘制
``` js
    // 绘制Y轴
    drawKLinesUtil.onDrawYAxis()
    // 绘制X轴
    drawKLinesUtil.onDrawXAxis()
    // 绘制K线图
    // scrollview 中嵌套canvas，scroll-left 必须在draw回调里面去实现，否则不起作用
    // 如果不需要用到 scroll-left 则直接调用K线绘制即可，不需要重现回调： drawKLinesUtil.onDrawKLines（）
    drawKLinesUtil.onDrawKLines(res => {
      drawKLinesUtil.config.mainctx.draw(false, function (res) {
        _t.scrollToRight = _t.maincWidth
        _t.$apply()
      })
    })
```
4. 滚动监听
``` js
  // 监听 scrollView 的滚动，监听当前滚动到的 K线为哪一根
  onScroll (e) {
    this.curMsg = drawKLinesUtil.onScroll(e.detail.scrollLeft)
    // 用于 scroll view 的 touch 事件，不需要绘制K线点击态可不写
    this.isScroll = true;
  }
```
5. Touch监听，实现K线选中态
``` js
  onTouchStart (e) {
    this.isScroll = false;
  }

  onTouchEnd (e) {
    // 如果是触摸滚动，则不需要绘制选中态
    if (this.isScroll) {
      return;
    }
    // 绘制选中态，该函数返回当前选中的K线数据
    this.curMsg = drawKLinesUtil.onTouch(e.changedTouches[0].pageX)
  }
```
6. 实现全屏
重新建一个页面，将页面的 pageOrientation  设置为 landscape;
K线图是根据屏幕来进行适配的，其他不变。
```js
    // 横向屏幕
    pageOrientation: 'landscape'
```

## 注意
1. scroll-view里面嵌入canvas会出现滑动的时候小许卡顿，可以将canvas生成图片放置在scroll-view中，这样可以解决卡顿的问题，但是无法实现K线点击态，也就是无法进行交互操作，只能进行滑动；