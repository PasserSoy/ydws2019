var devid = getPropetyVal('devid');// 设备ID
var autoId = getPropetyVal('autoId');
var fname = decodeURI(getPropetyVal('fname'));// 故障名
var monitorStationName = decodeURI(getPropetyVal('monitorStationName'));// 监测站名
var times = decodeURI(getPropetyVal('times')) + ':000';// 结束时间
var protectorType =  decodeURI(getPropetyVal('protectorType'));// 设备类型
// 如果是从主页跳转过来，返回按钮链接改为主页
if(getPropetyVal('index')=='myIndex')$('.navigation_l #first_li .back').attr('href','myIndex.html?v=1.1.6');

var masterAddress = decodeURI(getPropetyVal('masterAddress'));
var locations = `<li><span class="tit">故障位置：</span><span class="cont" title="${masterAddress}">${masterAddress}</span></li>`;// 故障位置
if(masterAddress!=undefined){
  $('li.times').before(locations);
};
var monitorFlag = decodeURI(getPropetyVal('monitorFlag'));// 传回去
$('#first_li .back').attr('href','back13_1_line_masterFaultInfo.html?v=1.1.6&monitorFlag=' + monitorFlag);

$('#fname').text(fname);
$('#monitorStationName').text('监测站：'+monitorStationName);
/*不同的报警类型 图标*/
var type = Number(decodeURI(getPropetyVal('type')));
// alarmType=1 弧光接地、金属接地、过压、欠压、失压、PT断线   alarmType=2 系统过电压
// alarmType=3 过热    alarmType=4 保护器电量不足    alarmType=5 温度传感器电量不足    alarmType=6 过电压保护器故障
// alarmType=7 异常   alarmType=8 湿度超标   alarmType=9 泄漏
var alarmType = 1; /* 报警类型 */
// var faultUrl = '/eric/getFaultOverVoltage.v3'; // 折线图请求地址
// 由于终端数据修改，现在云电微视后台故障详情模块有如下修改：
// 获取故障详情接口统一改为：getFaultOverVoltage.v2  并去掉零序电流波形
var faultUrl = '/eric/getFaultOverVoltage.v2'; // 折线图请求地址
switch (type) {
  case 10:
    $('.alarmtype i').addClass('Metalground');
    alarmType = 1;
    faultUrl = '/eric/getFaultOverVoltage.v2';
    break; /*金属接地*/
  case 11:
    $('.alarmtype i').addClass('Systemovervoltage');
    alarmType = 2;
    faultUrl = '/eric/getFaultOverVoltage.v2';
    break; /*系统过电压*/
  case 12:
    $('.alarmtype i').addClass('Overpressure');
    alarmType = 1;
    break; /*过电压*/
  case 13:
    $('.alarmtype i').addClass('PTdisconnection');
    alarmType = 1;
    break; /*PT断线*/
  case 14:
    $('.alarmtype i').addClass('Undervoltage');
    alarmType = 1;
    break; /*欠压*/
  case 15:
    $('.alarmtype i').addClass('Systemshortcircuit');
    alarmType = 1;
    break;/*系统短路*/
  case 16:
    $('.alarmtype i').addClass('Loneground');
    alarmType = 1;
    faultUrl = '/eric/getFaultOverVoltage.v2';
    break; /*弧光接地*/
  case 20:
    $('.alarmtype i').addClass('overheat');
    alarmType = 3;
    break; /*过热*/
  case 21:
    $('.alarmtype i').addClass('sdcb');
    alarmType = 8;
    break; /*湿度超标*/
  case 22:
    $('.alarmtype i').addClass('xielou');
    alarmType = 9;
    break; /*泄漏*/
  case 23:
    $('.alarmtype i').addClass('Lowbattery');
    alarmType = 4;
    break; /*电量不足*/
  default:
    alarmType = 7;
    $('.alarmtype i').addClass('abnormal'); /*异常*/
};
var myChart_mains_one = echarts.init(document.getElementById('mains_one'));
var myChart_mains_two = echarts.init(document.getElementById('mains_two'));
var myChart_mains_one_1 = echarts.init(document.getElementById('mains_one_1'));
// var myChart_mains_two_1 = echarts.init(document.getElementById('mains_two_1'));
// 如果传过来是过热getTemper_data.v1
// 如果传过来是湿度超标gethumidityForVoltage.v1
// 否则就使用原来的处理
var twoHours = 2*60*60*1000,// 两个小时的毫秒
    endTime = new Date(times).getTime();// 传过来的结束时间毫秒
var Hoursdata = {
  timeStart: dealTime(endTime-twoHours)+':000',
  timeEnd: dealTime(endTime+twoHours)+':000'
};
if(type==20){// 过热处理 分为过电压保护器、温度采集器
  if(protectorType=='温度采集器'){
    var xAxis_time_name = [],
    series_newtemper_value = [];
    Hoursdata.monitorFlag=devid;
    POST('/eric/getTemper_data.v1', Hoursdata, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        if (day_Arr.length <= 0) {
          $('#noTableData').show();
        } else {
          for (var i = 0; i < day_Arr.length; i++) {
            var _time = new Date(parseInt(day_Arr[i].timestamp)).toLocaleString('chinese', {
              hour12: false
            }).replace(/\//g, '-');
            var _val = day_Arr[i].temper;
            xAxis_time_name.push(_time);
            series_newtemper_value.push(fixNum(_val));
          };
          // 绘图
          var option_one = {
            color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
            title: {
              text: '温度',
              x: '20',
              y: '0'
            },
            tooltip: {
              show: true,
              trigger: 'axis',
            },
            grid: grids,
            dataZoom: dataZooms,
            xAxis: {
              type: 'category',
              boundaryGap: true,
              axisLabel: {
                formatter: function (val) {
                  return val.replace(/\s/gi, '\n');
                }
              },
              axisTick: {
                alignWithLabel: true
              },
              data: xAxis_time_name
            },
            yAxis: {
              show: true,
              name: '温度(℃)',
              nameLocation: 'end',
              type: 'value',
              position: 'right',
              axisLabel: {
                formatter: '{value} ℃'
              }
            },
            series: [{
              name: '温度',
              type: 'line',
              symbol:'none',
              data: series_newtemper_value
            }]
          };
          myChart_mains_one.clear();
          myChart_mains_one.resize();
          myChart_mains_one.setOption(option_one);
        };
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  }else{
    var xAxis_time_name = [],
    series_temper_a = [],
    series_temper_b = [],
    series_temper_c = [];
    Hoursdata.sensorId=devid;
    POST('/eric/getTemperatureForVoltage.v1', Hoursdata, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        if (day_Arr.length <= 0) {
          $('#noTableData').show();
        } else {
          for (var i = 0; i < day_Arr.length; i++) {
            xAxis_time_name.push(day_Arr[i].time);
            series_temper_a.push(fixNum(day_Arr[i].temper_a));
            series_temper_b.push(fixNum(day_Arr[i].temper_b));
            series_temper_c.push(fixNum(day_Arr[i].temper_c));
          };
          // 绘图
          var option_one = {
            color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
            title: {
              text: '温度',
              x: '20',
              y: '0'
            },
            tooltip: {
              trigger: 'axis'
            },
            grid: grids,
            legend: legends,
            dataZoom: dataZooms,
            xAxis: {
              type: 'category',
              boundaryGap: true,
              axisLabel: {
                formatter: function (val) {
                  return val.replace(/\s/gi, '\n');
                }
              },
              axisTick: {
                alignWithLabel: true
              },
              data: xAxis_time_name
            },
            yAxis: {
              show: true,
              name: '温度(℃)',
              nameLocation: 'end',
              type: 'value',
              position: 'right',
              axisLabel: {
                formatter: '{value} ℃'
              }
            },
            series: [{
                name: 'A相温度',
                type: 'line',
                symbol:'none',
                data: series_temper_a
              },
              {
                name: 'B相温度',
                type: 'line',
                symbol:'none',
                data: series_temper_b
              },
              {
                name: 'C相温度',
                type: 'line',
                symbol:'none',
                data: series_temper_c
              }

            ]
          };
          myChart_mains_one.clear();
          myChart_mains_one.resize();
          myChart_mains_one.setOption(option_one);
        };
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  };
}else if(type==21){// 湿度超标
  var xAxis_time_name = [],
  series_humidity_a = [],
  series_humidity_b = [],
  series_humidity_c = [];
  Hoursdata.sensorId=devid;
  POST('/eric/gethumidityForVoltage.v1', Hoursdata, function (res) {
    if (res.code == '0') {
      var day_Arr = res.data;
      if (day_Arr.length <= 0) {
        $('#noTableData').show();
      } else {
        for (var i = 0; i < day_Arr.length; i++) {
          xAxis_time_name.push(day_Arr[i].time);
          series_humidity_a.push(fixNum(day_Arr[i].humidity_a));
          series_humidity_b.push(fixNum(day_Arr[i].humidity_b));
          series_humidity_c.push(fixNum(day_Arr[i].humidity_c));
        };
        // 绘图
        var option_one = {
          color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
          title: {
            text: '湿度',
            x: '20',
            y: '0'
          },
          grid: grids,
          legend: legends,
          dataZoom: dataZooms,
          tooltip: {
            show: true,
            trigger: 'axis',
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            axisLabel: {
              formatter: function (val) {
                return val.replace(/\s/gi, '\n');
              }
            },
            axisTick: {
              alignWithLabel: true
            },
            data: xAxis_time_name
          },
          yAxis: {
            show: true,
            name: '湿度(%RH)',
            nameLocation: 'end',
            type: 'value',
            position: 'right',
            axisLabel: {
              formatter: '{value} %RH'
            }
          },
          series: [{
              name: 'A相湿度',
              type: 'line',
              symbol:'none',
              data: series_humidity_a
            },
            {
              name: 'B相湿度',
              type: 'line',
              symbol:'none',
              data: series_humidity_b
            },
            {
              name: 'C相湿度',
              type: 'line',
              symbol:'none',
              data: series_humidity_c
            }

          ]
        };
        myChart_mains_one.clear();
        myChart_mains_one.resize();
        myChart_mains_one.setOption(option_one);
      };
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, true);
}else if(type==22){// 泄漏
  var xAxis_time_name = [],
  series_leakElec_value = [];
  Hoursdata.sensorId=devid;
  POST('/eric/getLeakElecForId.v1', Hoursdata, function (res) {
    if (res.code == '0') {
      var day_Arr = res.data;
      if (day_Arr.length <= 0) {
        $('#noTableData').show();
      } else {
        for (var i = 0; i < day_Arr.length; i++) {
          xAxis_time_name.push(day_Arr[i].time);
          series_leakElec_value.push(fixNum(day_Arr[i].electric));
        };
        // 绘图
        var option_one = {
          color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
          title: {
            text: '泄漏电流',
            x: '20',
            y: '0'
          },
          tooltip: {
            show: true,
            trigger: 'axis',
          },
          grid: grids,
          dataZoom: dataZooms,
          xAxis: {
            type: 'category',
            boundaryGap: true,
            axisLabel: {
              formatter: function (val) {
                return val.replace(/\s/gi, '\n');
              }
            },
            data: xAxis_time_name
          },
          yAxis: {
            show: true,
            name: '电流(μA)',
            nameLocation: 'end',
            type: 'value',
            position: 'right',
            axisLabel: {
              formatter: '{value} μA'
            }
          },
          series: [{
            name: '电流值',
            type: 'line',
            symbol:'none',
            data: series_leakElec_value
          }]
        };
        myChart_mains_one.clear();
        myChart_mains_one.resize();
        myChart_mains_one.setOption(option_one);
      };
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, true);
}else if(type==23){// 电量不足
  var xAxis_time_name = [],
  series_newtemper_value = [];
  Hoursdata.devid=devid;
  POST('/eric/getBatteryForVoltage.v1', Hoursdata, function (res) {
    if (res.code == '0') {
      var day_Arr = res.data;
      if (day_Arr.length <= 0) {
        $('#noTableData').show();
      } else {
        for (var i = 0; i < day_Arr.length; i++) {
          var _time = new Date(parseInt(day_Arr[i].timestamp)).toLocaleString('chinese', {
            hour12: false
          }).replace(/\//g, '-');
          var _val = day_Arr[i].battery;
          xAxis_time_name.push(_time);
          series_newtemper_value.push(fixNum(_val));
        };
        // 绘图
        var option_one = {
          color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
          title: {
            text: '电量',
            x: '20',
            y: '0'
          },
          tooltip: {
            show: true,
            trigger: 'axis',
          },
          grid: grids,
          dataZoom: dataZooms,
          xAxis: {
            type: 'category',
            boundaryGap: true,
            axisLabel: {
              formatter: function (val) {
                return val.replace(/\s/gi, '\n');
              }
            },
            axisTick: {
              alignWithLabel: true
            },
            data: xAxis_time_name
          },
          yAxis: {
            show: true,
            name: '电量(V)',
            nameLocation: 'end',
            type: 'value',
            position: 'right',
            axisLabel: {
              formatter: '{value} V'
            }
          },
          series: [{
            name: '电量',
            type: 'line',
            symbol:'none',
            data: series_newtemper_value
          }]
        };
        myChart_mains_one.clear();
        myChart_mains_one.resize();
        myChart_mains_one.setOption(option_one);
      };
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, true);
}else{// 其他
  // 年月日统计表格
  // 横坐标
  var _xAxis = [],
    i = 0;
  while (i <= 5120) {
    var no = fixNum3(-200 + (i * 400 / 5120));
    _xAxis.push(no);
    // i = i + 16;
    i = i + 1;
  };
  // var xAxis_voltage_name=[-200,-180,-160,-140,-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120,140,160,180,200];
  var xAxis_voltage_name = _xAxis;
  var xAxis_Wave_UA = [];
  var xAxis_Wave_UB = [];
  var xAxis_Wave_UC = [];
  var xAxis_Wave_U0 = [];
  
  // var xAxis_Electric_name=[-200,-180,-160,-140,-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120,140,160,180,200];
  var xAxis_Electric_name = _xAxis;
  var xAxis_Wave_IA = [];
  var xAxis_Wave_IB = [];
  var xAxis_Wave_IC = [];
  var xAxis_Wave_IX = [];
  function getStatisticsData() {
    var data = {
      devid: devid,
      time: times
    };
    xAxis_Wave_UA = [];
    xAxis_Wave_UB = [];
    xAxis_Wave_UC = [];
    xAxis_Wave_U0 = [];
  
    xAxis_Wave_IA = [];
    xAxis_Wave_IB = [];
    xAxis_Wave_IC = [];
    xAxis_Wave_IX = [];
    POST(faultUrl, data, function (res) { // 故障波形
      if (res.code == '0') {
        var day_Arr = res.data;
        // 绑定有效值
        for (var i in day_Arr) {
          if (i.indexOf('val') > -1) {
            var val = 0;
            if (Array.isArray(day_Arr[i])) {
              var val = fixNum(day_Arr[i][1]);
            } else {
              var val = fixNum(day_Arr[i]);
            }
            $(`.valid span.${i}`).text(val);
          }
        }
        if (day_Arr != null) { // 数组存在
          var j = 0;
          while (j < 5120) {
            var _UA = day_Arr.wave_UA[j];
            xAxis_Wave_UA.push(_UA); // A相电压
            var _UB = day_Arr.wave_UB[j];
            xAxis_Wave_UB.push(_UB); // B相电压
            var _UC = day_Arr.wave_UC[j];
            xAxis_Wave_UC.push(_UC); // C相电压
            var _U0 = day_Arr.wave_U0[j];
            xAxis_Wave_U0.push(_U0); // U相电压
  
            var _IA = day_Arr.wave_IA[j];
            xAxis_Wave_IA.push(_IA); // A相电流
            var _IB = day_Arr.wave_IB[j];
            xAxis_Wave_IB.push(_IB); // B相电流
            var _IC = day_Arr.wave_IC[j];
            xAxis_Wave_IC.push(_IC); // C相电流
            var _IX = day_Arr.wave_IX[j];
            xAxis_Wave_IX.push(_IX); // I相电流
            // j = j + 16;
            j = j + 1;
          };
          Statistics_btn(xAxis_Wave_UA, xAxis_Wave_UB, xAxis_Wave_UC, xAxis_Wave_U0, xAxis_Wave_IA, xAxis_Wave_IB, xAxis_Wave_IC, xAxis_Wave_IX);
        }
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  }
  getStatisticsData();  
  function Statistics_btn(xAxis_Wave_UA, xAxis_Wave_UB, xAxis_Wave_UC, xAxis_Wave_U0, xAxis_Wave_IA, xAxis_Wave_IB, xAxis_Wave_IC, xAxis_Wave_IX) {
    // 电压波形
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电压波形',
        x: '20',
        y: '0'
      },
      tooltip: {
        trigger: 'axis',
        padding:0,
        formatter: function (params) {
          var text = `<p class="date"><i>时间: </i><em>${params[0].name} ms</em></p>`;
          for (var x of params) {
            text += `<p><span style="background-color:${x.color}"></span><i>${x.seriesName}: </i><em>${fixNum(x.value / 1000)} kV</em></p>`
          };
          text = `<div class="echartData">${text}</div>`;
          return text;
        },
        axisPointer:{
          type:'line',
          lineStyle:{
            width:0
          },
        },
        position:function (point) {// 判断鼠标停止
          sessionStorage.point = point;
          setTimeout(() => {
            if(sessionStorage.point==point){// 停止时显示悬浮框、更新数据
              $('.echartData').show();
            };            
          }, times);
          return [point[0]+8, 61];
        }
      },
      legend: legends,
      grid: grids,
      xAxis: {
        type: 'category',
        name: ' 时间(ms)',
        nameLocation: 'start',
        boundaryGap: false,
        axisLabel: {
          interval: 255,
          showMaxLabel: true
        },
        data: xAxis_voltage_name
      },
      yAxis: {
        show: true,
        name: ' 电压(kV)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function (v) {
            return v / 1000 + ' kV'
          }
        }
      },
      dataZoom: dataZooms,
      series: [{
          name: 'A相电压',
          type: 'line',
          //                    clickable:true,
          symbol:'none',
          data: xAxis_Wave_UA,
          smooth: true
        },
        {
          name: 'B相电压',
          type: 'line',
          symbol:'none',
          data: xAxis_Wave_UB,
          smooth: true
        },
        {
          name: 'C相电压',
          type: 'line',
          symbol:'none',
          data: xAxis_Wave_UC,
          smooth: true
        }
      ]
    };
    myChart_mains_one.setOption(option_one);
    // 零序电压
    option_one_1 = {
      color: ['#333'],
      title: {
        text: '零序电压',
        x: '20',
        y: '0'
      },
      tooltip: {
        trigger: 'axis',
        padding:0,
        formatter: function (params) {
          var text = `<p class="date"><i>时间: </i><em>${params[0].name} ms</em></p>`;
          for (var x of params) {
            text += `<p><span style="background-color:${x.color}"></span><i>${x.seriesName}: </i><em>${fixNum(x.value)} V</em></p>`
          };
          text = `<div class="echartData">${text}</div>`;
          return text;
        },
        axisPointer:{
          type:'line',
          lineStyle:{
            width:0
          },
        },
        position:function (point) {// 判断鼠标停止
          sessionStorage.point = point;
          setTimeout(() => {
            if(sessionStorage.point==point){// 停止时显示悬浮框、更新数据
              $('.echartData').show();
            };            
          }, times);
          return [point[0]+8, 61];
        }
      },
      legend: legends,
      grid: grids,
      xAxis: {
        type: 'category',
        name: ' 时间(ms)',
        nameLocation: 'start',
        boundaryGap: false,
        axisLabel: {
          interval: 255,
          showMaxLabel: true
        },
        data: xAxis_voltage_name
      },
      yAxis: {
        show: true,
        name: ' 电压(V)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        max:function(v){
          if(v.max<5){
            return 20;
          }else{
            return Math.floor(v.max)-(Math.floor(v.max)%5)+5;
          };
        },
        minInterval: 5,
        axisLabel: {
          formatter: function (v) {
            return v + ' V'
          }
        }
      },
      dataZoom: dataZooms,
      series: [{
        name: '零序电压',
        type: 'line',
        symbol:'none',
        data: xAxis_Wave_U0,
        smooth: true
      }]
    };
    myChart_mains_one_1.setOption(option_one_1);
    // 电流波形
    option_two = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电流波形',
        x: '20',
        y: '0'
      },
      tooltip: {
        trigger: 'axis',
        padding:0,
        formatter: function (params) {
          var text = `<p class="date"><i>时间: </i><em>${params[0].name} ms</em></p>`;
          for (var x of params) {
            text += `<p><span style="background-color:${x.color}"></span><i>${x.seriesName}: </i><em>${fixNum(x.value)} A</em></p>`
          };
          text = `<div class="echartData">${text}</div>`;
          return text;
        },
        axisPointer:{
          type:'line',
          lineStyle:{
            width:0
          },
        },
        position:function (point) {// 判断鼠标停止
          sessionStorage.point = point;
          setTimeout(() => {
            if(sessionStorage.point==point){// 停止时显示悬浮框、更新数据
              $('.echartData').show();
            };            
          }, times);
          return [point[0]+8, 61];
        }
      },
      legend: legends,
      grid: grids,
      xAxis: {
        type: 'category',
        name: ' 时间(ms)',
        nameLocation: 'start',
        boundaryGap: false,
        axisLabel: {
          interval: 255,
          showMaxLabel: true
        },
        data: xAxis_Electric_name
      },
      yAxis: {
        show: true,
        name: ' 电流(A)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        max:function(v){
          if(v.max<5){
            return 20;
          }else{
            return Math.floor(v.max)-(Math.floor(v.max)%5)+5;
          };
        },
        minInterval: 5,
        axisLabel: {
          formatter: '{value} A'
        }
      },
      dataZoom: dataZooms,
      series: [{
          name: 'A相电流',
          type: 'line',
          smooth: true,
          symbol:'none',
          data: xAxis_Wave_IA
        },
        {
          name: 'B相电流',
          type: 'line',
          smooth: true,
          symbol:'none',
          data: xAxis_Wave_IB
        },
        {
          name: 'C相电流',
          type: 'line',
          smooth: true,
          symbol:'none',
          data: xAxis_Wave_IC
        }
      ]
    };
    myChart_mains_two.setOption(option_two);
    // 零序电流
    option_two_1 = {
      color: ['#333'],
      title: {
        text: '零序电流',
        x: '20',
        y: '0'
      },
      tooltip: {
        trigger: 'axis',
        padding:0,
        formatter: function (params) {
          var text = `<p class="date"><i>时间: </i><em>${params[0].name} ms</em></p>`;
          for (var x of params) {
            text += `<p><span style="background-color:${x.color}"></span><i>${x.seriesName}: </i><em>${fixNum(x.value)} A</em></p>`
          };
          text = `<div class="echartData">${text}</div>`;
          return text;
        },
        axisPointer:{
          type:'line',
          lineStyle:{
            width:0
          },
        },
        position:function (point) {// 判断鼠标停止
          sessionStorage.point = point;
          setTimeout(() => {
            if(sessionStorage.point==point){// 停止时显示悬浮框、更新数据
              $('.echartData').show();
            };            
          }, times);
          return [point[0]+8, 61];
        }
      },
      legend: legends,
      grid: grids,
      xAxis: {
        type: 'category',
        name: ' 时间(ms)',
        nameLocation: 'start',
        boundaryGap: false,
        axisLabel: {
          interval: 255,
          showMaxLabel: true
        },
        data: xAxis_Electric_name
      },
      yAxis: {
        show: true,
        name: ' 电流(A)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: '{value} A'
        }
      },
      dataZoom: dataZooms,
      series: [{
        name: '零序电流',
        type: 'line',
        symbol:'none',
        smooth: true,
        data: xAxis_Wave_IX
      }]
    };
    // myChart_mains_two_1.setOption(option_two_1);
    echarts.connect([myChart_mains_one, myChart_mains_one_1,myChart_mains_two]);
  }
};
//
/*故障信息详情*/
$('.fdetail li.devid .cont').text(getPropetyVal('devid')); /* 设备标识 */
$('.fdetail li.masterName .cont').text(decodeURI(getPropetyVal('masterName'))); /* 母线名称 */
$('.fdetail li.phase .cont').text(decodeURI(getPropetyVal('phase'))); /* 报警–相别 */
$('.fdetail li.times .cont').text(decodeURI(getPropetyVal('times'))); /* 故障时间 */
$('.fdetail li.protectorType .cont').text(decodeURI(getPropetyVal('protectorType'))); /* 设备类型 */

// 显示故障信息详情
$('.fdetail li').css({
  'visibility': 'visible'
});

/*不同的报警类型对应不同的显示内容 分为6大类*/
$(`[data-atype]:not([data-atype*=${alarmType}])`).hide();

var data = {
  autoId: autoId,
  deviceId: devid
}
queryFaultGroundInfoList(data);

function queryFaultGroundInfoList(data) {
  POST("/eric/queryFaultGroundInfoList.v1", data, function (res) {
    if (res.code == '0') {
      var dataList = res.data.list;
      var html = '';
      for (var i = 0; i < dataList.length; i++) {
        html += '<li class="details">' +
          '<span></span>' +
          '<label>' + dataList[i].recordMessage + '</label>' +
          '<label>' + dataList[i].createByName + '&nbsp;&nbsp;&nbsp;' + dataList[i].createTime + '</label>' +
          // '<label>'+dataList[i].createTime+'</label>'+
          '</li>';
      }
      $('#FaultGroundInfoList').append(html);
    }
  });
}
$(function () {
  myChart_mains_one.resize();
  myChart_mains_one_1.resize();
  myChart_mains_two.resize();
  // myChart_mains_two_1.resize();
  $(window).resize(function () {
    myChart_mains_one.resize();
    myChart_mains_one_1.resize();
    myChart_mains_two.resize();
    // myChart_mains_two_1.resize();
  })
})
