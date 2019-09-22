let config = {
  wWidth: 0,
  wHeight: 0,
  datas: [],  // k线数据
  signsList: [], // 交易信号数据
  kNum: 0,  // k线数量
  yctx: null,  // y轴画布
  mainctx: null, //主内容画布
  ycWidth: 50, // y轴宽度
  ycHeight: 300, // y轴高度
  minNum: 0, // y轴最小值
  maxNum: 0, //y轴最大值
  yMargin: 50, // y轴上下边距总共 30
  yPosition: 'right', //y轴的位置，left  or  right  是屏幕左边还是屏幕右边
  yBgColor: null, //y轴画布的背景色
  xHeight: 50, // x轴的高度
  mainBgColor: null,
  mainCWidth: 300, // 主内容宽度，具体需要k线宽度和数量进行计算
  maincHeight: 300,  // 主内容高度
  kWidth: 15,  // k线宽度
  k_margin_right: 10,  // k线右边距
  main_margin_left: 15,  // 主内容左边距
  screen_show_time: 2,  // 一屏幕展示多少个时间
  optctx: null, // 操作画布，用于绘制选中的k线状态
  upcolor: '#e64340',
  downcolor: '#09bb07',
  buy_sign_bg: '#F99DA0',
  sell_sign_bg: '#84D0A1',
  curMsg: {},
  curIndex: 0, //当前选中的k线 下标
  scrollLeft: 0,
}

/**
 * @desc 初始化配置
 * @param {配置}} pconfig 
 */
function init (pconfig) {
  for (let i in pconfig) {
    config[i] = pconfig[i]
  }
  // 计算主画布宽度
  config.mainCWidth = (config.kWidth + config.k_margin_right) * config.kNum + config.main_margin_left
  config.mainCWidth < (config.wWidth - config.ycWidth) && (config.mainCWidth = config.wWidth - config.ycWidth)
  return config.mainCWidth
}

/**
 * @desc 绘制y轴
 */
function onDrawYAxis () {
  // startX 和 startY 表示的是y轴的起点坐标
  let startX = 0
  config.yPosition == 'right' ? (startX = 0) : (startX = config.ycWidth)
  const startY = config.ycHeight - config.xHeight - config.yMargin / 2
  const limit = getLimit(config.minNum, config.maxNum)
  const points = [] // y轴上的点位置
  const texts = []  // y轴上的点数值
  const contentHeight = config.ycHeight - config.xHeight - config.yMargin // y画布内容高度

  for (let i = 0; i < 5; i++) {
    points.push(startY - i * (contentHeight / 4)) // 确定位置
    texts.push(config.minNum + i * limit)  // 确定距离
  }
  if (config.yBgColor) {
    // 绘制背景区域
    config.yctx.beginPath()
    config.yctx.setFillStyle(config.yBgColor)
    config.yctx.fillRect(0, 0, config.ycWidth, config.ycHeight - config.xHeight)
    config.yctx.closePath()
    config.yctx.stroke()
  }
  // 绘制y轴
  config.yctx.beginPath()
  config.yctx.setStrokeStyle('#DFDEDE')
  config.yctx.setLineWidth(0.2)
  points.forEach(function (item, index) {
    config.yctx.moveTo(startX, item)
    config.yPosition == 'right' ? config.yctx.lineTo(startX + 5, item) : config.yctx.lineTo(startX - 5)
  })
  config.yctx.closePath()
  config.yctx.stroke()
  // 绘制轴上数值
  config.yctx.beginPath()
  config.yctx.setFontSize(12)
  config.yctx.setFillStyle('#CBCDD5')
  texts.forEach(function (item, index) {
    config.yPosition == 'right' ? config.yctx.fillText(item.toFixed(2), startX + 15, points[index] + 5) : config.yctx.fillText(item.toFixed(2), startX - 15, points[index] + 5)
  })
  config.yctx.closePath()
  config.yctx.stroke()
  config.yctx.draw()
  config.yPoints = points
}

/**
 * @desc 绘制X轴
 */
function onDrawXAxis () {
  // startX 和 startY 表示横坐标起点位置
  const startX = 0
  const startY = config.maincHeight - config.xHeight
  const endX = config.mainCWidth
  const spaceKTime = ((config.wWidth - config.main_margin_left) / (config.kWidth + config.k_margin_right) / config.screen_show_time).toFixed(0)
  const points = []
  const texts = []
  for (let i = 1, j = parseInt(config.kNum / spaceKTime); i <= j; i++) {
    points.push(config.main_margin_left + (config.kWidth + config.k_margin_right) * i * spaceKTime - config.k_margin_right - config.kWidth / 2)
    texts.push(config.datas[i * spaceKTime - 1].day)
  }
  // 绘制画布背景
  if (config.mainBgColor) {
    config.mainctx.beginPath()
    config.mainctx.setFillStyle(config.mainBgColor)
    config.mainctx.fillRect(0, 0, endX, config.maincHeight - config.xHeight)
    config.mainctx.closePath()
    config.mainctx.stroke()
  }
  // 绘制 x轴
  config.mainctx.beginPath()
  config.mainctx.setFillStyle('#DFDEDE')
  // config.mainctx.moveTo(startX, startY)
  // config.mainctx.lineTo(endX, startY)
  points.forEach(function (item, index) {
    config.mainctx.moveTo(item, startY)
    config.mainctx.lineTo(item, startY - 10)
  })
  config.mainctx.closePath()
  config.mainctx.stroke()
  // 绘制轴上数值
  config.mainctx.beginPath()
  config.mainctx.setFontSize(12)
  config.mainctx.setFillStyle('#CBCDD5')

  texts.forEach(function (item, index) {
    config.mainctx.fillText(item, points[index] - config.mainctx.measureText(item).width / 2, startY + 20)
  })
  config.mainctx.closePath()
  config.mainctx.stroke()
  // 绘制网状线
  config.mainctx.beginPath()
  // ctx.setLineDash([5, 10], 5)
  config.mainctx.setStrokeStyle('#DFDEDE')
  config.mainctx.setLineWidth(1)
  config.yPoints.forEach(function (item, index) {
    config.mainctx.moveTo(startX + 10, item)
    config.mainctx.lineTo(config.mainCWidth, item)
  })

  points.forEach(function (item, index) {
    config.mainctx.moveTo(item, startY)
    config.mainctx.lineTo(item, 0)
  })
  config.mainctx.closePath()
  config.mainctx.stroke()
}

/**
 * @desc 绘制K线
 */
function onDrawKLines (result) {
  let yNumpx = (config.maincHeight - config.xHeight - config.yMargin) / (config.maxNum - config.minNum)
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  let highpx = 0
  let lowpx = 0
  let signIndex = 0
  for (let i = 0; i < config.datas.length; i++) {
    onForDrawKLines(i, yNumpx, parseFloat(config.datas[i].open), parseFloat(config.datas[i].close), parseFloat(config.datas[i].high), parseFloat(config.datas[i].low), startX, startY, endX, endY, lowpx, highpx)
    // 绘制信号
    if (config.signsList.length > 0) {
      const kD = new Date(config.datas[i].day)
      const signD = new Date(config.signsList[signIndex].time)
      let lastD = null
      let lastTimeStamp = null
      if (i != 0) {
        lastD = new Date(config.datas[i - 1].day)
        lastTimeStamp = lastD.getTime(lastTimeStamp) / 1000
      }
      const kTimeStamp = kD.getTime(kD) / 1000
      const signTimeStamp = signD.getTime(signD) / 1000
      if (kTimeStamp == signTimeStamp) {
        onDrawTradeSign(i, signIndex)
        signIndex < config.signsList.length - 1 && (signIndex = signIndex + 1)
      } else if (i != 0 && lastTimeStamp == signTimeStamp) {
        onDrawTradeSign(i - 1, signIndex)
        signIndex < config.signsList.length - 1 && (signIndex = signIndex + 1)
      } else if (kTimeStamp > signTimeStamp && i != 0 && signTimeStamp > lastTimeStamp) {
        onDrawTradeSign(i, signIndex)
        signIndex < config.signsList.length - 1 && (signIndex = signIndex + 1)
      }
    }
  }
  if (result) {
    result()
  } else {
    config.mainctx.draw()
  }
}

/**
 * @desc for 循环绘制k线
 * @param {} i 
 * @param {*} yNumpx 
 * @param {*} open 
 * @param {*} close 
 * @param {*} high 
 * @param {*} low 
 * @param {*} startX 
 * @param {*} startY 
 * @param {*} endX 
 * @param {*} endY 
 * @param {*} lowpx 
 * @param {*} highpx 
 */
function onForDrawKLines (i, yNumpx, open, close, high, low, startX, startY, endX, endY, lowpx, highpx) {
  config.mainctx.beginPath()
  if (open < close) {
    // 上涨
    config.mainctx.setFillStyle(config.upcolor)
    config.mainctx.setStrokeStyle(config.upcolor)
    startY = config.maincHeight - config.xHeight - (close - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (open - config.minNum) * yNumpx - config.yMargin / 2
  } else if (open > close) {
    // 下跌
    config.mainctx.setFillStyle(config.downcolor)
    config.mainctx.setStrokeStyle(config.downcolor)
    startY = config.maincHeight - config.xHeight - (open - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (close - config.minNum) * yNumpx - config.yMargin / 2
  } else {
    // 平
    config.mainctx.setFillStyle('#666')
    config.mainctx.setStrokeStyle('#666')
    startY = config.maincHeight - config.xHeight - (open - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (open - config.minNum) * yNumpx - config.yMargin / 2
  }
  startX = config.main_margin_left + (config.kWidth + config.k_margin_right) * i
  endX = startX + config.kWidth
  highpx = config.maincHeight - config.xHeight - config.yMargin / 2 - (high - config.minNum) * yNumpx
  lowpx = config.maincHeight - config.xHeight - config.yMargin / 2 - (low - config.minNum) * yNumpx
  config.mainctx.fillRect(startX, startY, endX - startX, endY - startY)
  // config.mainctx.setLineDash(0)
  config.mainctx.setLineWidth(0.5)
  config.mainctx.moveTo(startX + config.kWidth / 2, highpx)
  config.mainctx.lineTo(startX + config.kWidth / 2, lowpx)
  config.mainctx.closePath()
  config.mainctx.stroke()
}

/**
 * 绘制选中的k线边框
 * @param {scroll-view是否滚动，滚动的话不绘制选中k线的时间状态} isScroll 
 */
function onDrawKLineBorder (isScroll = false) {
  let yNumpx = (config.maincHeight - config.xHeight - config.yMargin) / (config.maxNum - config.minNum)
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  let curMsg = config.curMsg
  console.log('curMsg==', curMsg)
  if (curMsg.open < curMsg.close) {
    startY = config.maincHeight - config.xHeight - (curMsg.close - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (curMsg.open - config.minNum) * yNumpx - config.yMargin / 2
  } else if (curMsg.open > curMsg.close) {
    startY = config.maincHeight - config.xHeight - (curMsg.open - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (curMsg.close - config.minNum) * yNumpx - config.yMargin / 2
  } else {
    startY = config.maincHeight - config.xHeight - (curMsg.close - config.minNum) * yNumpx - config.yMargin / 2
    endY = config.maincHeight - config.xHeight - (curMsg.close - config.minNum) * yNumpx - config.yMargin / 2
  }
  startX = config.main_margin_left + (config.kWidth + config.k_margin_right) * config.curIndex
  endX = startX + config.kWidth
  // 绘制border
  config.optctx.beginPath()
  config.optctx.setStrokeStyle('#333')
  config.optctx.setLineWidth(2)
  config.optctx.strokeRect(startX, startY, (endX - startX), (endY - startY))
  config.optctx.closePath()
  config.optctx.stroke()
  // 绘制直线
  config.optctx.beginPath()
  config.optctx.setStrokeStyle('#333')
  config.optctx.setLineWidth(0.5)
  config.optctx.moveTo(startX + config.kWidth / 2, config.maincHeight - config.xHeight)
  config.optctx.lineTo(startX + config.kWidth / 2, 0)
  config.optctx.closePath()
  config.optctx.stroke()
  // 绘制时间
  if (!isScroll) {
    const tw = config.optctx.measureText(curMsg.day).width
    config.optctx.beginPath()
    config.optctx.setFillStyle('#333')
    config.optctx.fillRect(startX + config.kWidth / 2 - 12.5 - tw / 2, config.maincHeight - config.xHeight + 5, tw + 25, 15)
    config.optctx.closePath()
    config.optctx.stroke()

    config.optctx.beginPath()
    config.optctx.setFontSize(12)
    config.optctx.setFillStyle('#ffffff')
    config.optctx.fillText(curMsg.day, startX + config.kWidth / 2 - tw / 2, config.maincHeight - config.xHeight + 17)
    config.optctx.closePath()
    config.optctx.stroke()
  }
  config.optctx.draw()
}

function onDrawTradeSign (kIndex, i) {
  let curMsg = config.datas[kIndex]
  let yNumpx = (config.maincHeight - config.xHeight - config.yMargin) / (config.maxNum - config.minNum)
  let centerX = config.main_margin_left + (config.kWidth + config.k_margin_right) * kIndex + (config.kWidth / 2)
  let centerY = 0
  let r = (config.kWidth + config.k_margin_right) / 2
  let signType
  if (config.signsList[i].type == 'buy') {
    signType = '买'
    centerY = config.maincHeight - config.xHeight - config.yMargin / 2 - (curMsg.low - config.minNum) * yNumpx + r
    config.mainctx.setFillStyle(config.buy_sign_bg)
  } else {
    signType = '卖'
    centerY = config.maincHeight - config.xHeight - config.yMargin / 2 - (curMsg.high - config.minNum) * yNumpx - r
    config.mainctx.setFillStyle(config.sell_sign_bg)
  }
  config.mainctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
  config.mainctx.fill()

  config.mainctx.beginPath()
  config.mainctx.setFontSize(12)
  config.mainctx.setFillStyle('#fff')
  config.mainctx.fillText(signType, (centerX - r / 2), centerY + r / 3)
  config.mainctx.stroke()

  config.mainctx.beginPath()
  config.mainctx.setFontSize(13)
  config.mainctx.setFillStyle('#333')
  config.mainctx.fillText(config.signsList[i].price, centerX + r + 5, centerY + r / 2)
  config.mainctx.stroke()
}

/**
 * @desc 求y轴每间隔距离是多大
 * @param {y轴最小值} min 
 * @param {y轴最大值} max 
 */
function getLimit (min, max) {
  return (max - min) / 4
}

/**
 * @desc 保存当前滚动的位置，和k线数据，并绘制选中态，默认最左边的k线为当前选中k线
 * @param {scrollView 滚动的位置} scrollLeft 
 */
function onScroll (scrollLeft) {
  const kn = Math.ceil(
    (scrollLeft + config.wWidth - config.ycWidth - config.main_margin_left) /
    (config.kWidth + config.k_margin_right)
  );
  config.curIndex = kn - 1
  config.scrollLeft = scrollLeft
  config.curMsg = config.datas[kn - 1]
  onDrawKLineBorder(true)
  return config.curMsg
}

/**
 * @desc 触摸画布，调用该方法，保存当前触摸的k线数据，并绘制选中态
 * @param {触摸的位置的PageX} touchX 
 */
function onTouch (touchX) {
  const kn = Math.ceil(
    (config.scrollLeft +
      touchX -
      config.main_margin_left) /
    (config.kWidth + config.k_margin_right)
  );
  config.curIndex = kn - 1
  config.curMsg = config.datas[kn - 1]
  console.log(config.curIndex)
  onDrawKLineBorder()
  return config.curMsg
}


module.exports = {
  config,
  init,
  onScroll,
  onTouch,
  onDrawYAxis,
  onDrawXAxis,
  onDrawKLines,
  onDrawKLineBorder,
  onDrawTradeSign
}