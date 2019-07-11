// 渲染母线 柜号信息
const momcabin = JSON.parse(sessionStorage.momcabin);
$('.tab').append(`监测站：[${sessionStorage.stationName}] - 母线：[${momcabin.momline}] - 柜号：[${momcabin.cabin}号柜]`);
// $('.eqid').text(`监测设备标识：[${momcabin.monitor}]`);
var layform = layui.form;
var goEasy = new GoEasy({
  appkey: "BC-81a7696478cf412c807a296be95f5357"
});
// 波形图初始化
var myChart_mains_temp = echarts.init(document.getElementById('mains_temp'));
var myChart_mains_humidity = echarts.init(document.getElementById('mains_humidity'));
var myChart_mains_leakElec = echarts.init(document.getElementById('mains_leakElec'));
var myChart_mains_acionCount = echarts.init(document.getElementById('mains_acionCount'));
var myChart_mains_newtemper = echarts.init(document.getElementById('mains_newtemper'));

var mydate = new Date(); //通过new方法创建对象
var timeStart;
var timeEnd;
var _year = mydate.getFullYear();
var _month = (mydate.getMonth() + 1) < 10 ? '0' + (mydate.getMonth() + 1) : mydate.getMonth() + 1;
var _date = mydate.getDate() < 10 ? '0' + mydate.getDate() : mydate.getDate();
var _mydate = _year + '-' + _month + '-' + _date;
timeStart = _mydate + ' 00:00:00:000';
// timeStart ='2018-03-22 00:00:00:000';// 测试
timeEnd = _mydate + ' 23:59:59:000';
// 图表切换
$('body').on('click','.showData li',function(){
  var _t = $(this),dataId = _t.attr('id'),dataCtype = _t.data('ctype');
  sessionStorage.tabID=dataId;
  // 清除所有波形图
  myChart_mains_temp.clear();
  myChart_mains_humidity.clear();
  myChart_mains_leakElec.clear();
  myChart_mains_acionCount.clear();
  myChart_mains_newtemper.clear();
  // 不同保护器类型的菜单要隐藏
  $('.showData [data-ctype]').addClass('none');
  $('.showData [data-ctype='+dataCtype+']').removeClass('none');
  // 移除兄弟元素的选中状态
  _t.addClass('color_action').siblings('li').removeClass('color_action');
  // 显示对应的波形图
  $('#Statistics [data-id]').addClass('none');
  $('#Statistics [data-id='+dataId+']').removeClass('none');
  // 加载波形图
  organizationData(dataId, sessionStorage.monitorFlag, timeStart, timeEnd);
});

// 获取过电压保护器的湿度
var xAxis_time_name = []; // 时间戳

var series_temper_a = []; // A相温度；
var series_temper_b = []; // B相温度
var series_temper_c = []; // C相温度

var series_humidity_a = []; // A相湿度；
var series_humidity_b = []; // B相湿度
var series_humidity_c = []; // C相湿度

// 保护器泄漏电流
var series_leakElec_value = [];
// 所有相位动作次数
var series_acionCount_value = [];
// 温度
var series_newtemper_value = [];

function organizationData(indexName, monitorFlag, timeStart, timeEnd) {
  var data = {
    sensorId: monitorFlag,
    timeStart: timeStart,
    timeEnd: timeEnd
  };
  var postUrl='';
  switch(indexName){
    case 'temp':postUrl = 'getTemperatureForVoltage';break;// 温度
    case 'humidity':postUrl = 'gethumidityForVoltage';break;// 湿度
    case 'leakElec':postUrl = 'getLeakElecForId';break;// 泄漏电流
    case 'acionCount':postUrl = 'getAcionCountForValue';break;// 动作次数
    case 'newtemper':postUrl = 'getTemper_data';delete data.sensorId;data.monitorFlag=monitorFlag;;break;// 温度采集器
  };
  POST(`/eric/${postUrl}.v1`, data, function (res){
    switch(indexName){
      case 'temp':xAxis_time_name = []; series_temper_a = []; series_temper_b = []; series_temper_c = [];break;// 温度;// 清空数据
      case 'humidity':xAxis_time_name = []; series_humidity_a = []; series_humidity_b = []; series_humidity_c = [];break;// 湿度;// 清空数据
      case 'leakElec':xAxis_time_name = []; series_leakElec_value = [];break;// 泄漏电流;// 清空数据
      case 'acionCount':xAxis_time_name = []; series_acionCount_value = [];break;// 动作次数;// 清空数据
      case 'newtemper':xAxis_time_name = []; series_newtemper_value = [];break;// 温度采集器;// 清空数据
    };    
    if(res.code == '0'){
      var day_Arr = res.data;
      if(day_Arr.length <= 0){
        // $(`[data-id=${indexName}]`).append(nullDataDom);
      }else{
        for(var i = 0; i < day_Arr.length; i++){
          if(indexName=='temp'){// 温度
            xAxis_time_name.push(day_Arr[i].time);
            series_temper_a.push(fixNum(day_Arr[i].temper_a));
            series_temper_b.push(fixNum(day_Arr[i].temper_b));
            series_temper_c.push(fixNum(day_Arr[i].temper_c));
          }else if(indexName=='humidity'){// 湿度
            xAxis_time_name.push(day_Arr[i].time);
            series_humidity_a.push(fixNum(day_Arr[i].humidity_a));
            series_humidity_b.push(fixNum(day_Arr[i].humidity_b));
            series_humidity_c.push(fixNum(day_Arr[i].humidity_c));        
          }else if(indexName=='leakElec'){// 泄漏电流 
            xAxis_time_name.push(day_Arr[i].time);
            series_leakElec_value.push(fixNum(day_Arr[i].electric));           
          }else if(indexName=='acionCount'){// 动作次数 
            xAxis_time_name.push(day_Arr[i].valueflag_value);
            series_acionCount_value.push(day_Arr[i].count);          
          }else if(indexName=='newtemper'){// 温度采集器 
            var _time = new Date(parseInt(day_Arr[i].timestamp)).toLocaleString('chinese', {
              hour12: false
            }).replace(/\//g, '-');
            var _val = day_Arr[i].temper;
            xAxis_time_name.push(_time);
            series_newtemper_value.push(fixNum(_val));         
          };
        };
      };
      Statistics_btn(indexName); // 展示图表
    }
  },function(){
    $('.loadjy').addClass('op');
  },function(){
    $('.loadjy').removeClass('op');
  },true);
}
// 波形图
function Statistics_btn(index) {
  if (index == 'temp') {
    option_one = {
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
    myChart_mains_temp.clear();
    myChart_mains_temp.resize();
    myChart_mains_temp.setOption(option_one);
  } else if (index == 'humidity') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '湿度',
        x: '20',
        y: '0'
      },
      tooltip: {
        show: true,
        trigger: 'axis',
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
    myChart_mains_humidity.clear();
    myChart_mains_humidity.resize();
    myChart_mains_humidity.setOption(option_one);
  } else if (index == 'leakElec') {
    option_one = {
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
        axisTick: {
          alignWithLabel: true
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
    myChart_mains_leakElec.clear();
    myChart_mains_leakElec.resize();
    myChart_mains_leakElec.setOption(option_one);
  } else if (index == 'acionCount') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '相位动作次数',
        x: '20',
        y: '0'
      },
      tooltip: {
        trigger: 'axis'
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
        name: '动作次数',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: '{value} 次数'
        }
      },
      series: [{
        name: '动作次数',
        type: 'bar',
        barMaxWidth: '50',
        data: series_acionCount_value,
        //设置柱体颜色
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = ['#FB1734', '#14AE68', '#FFCD2D'];
              return colorList[params.dataIndex]
            },
          }
        },
      }]
    };
    myChart_mains_acionCount.clear();
    myChart_mains_acionCount.resize();
    myChart_mains_acionCount.setOption(option_one);
  } else if (index == 'newtemper') {
    option_one = {
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
    myChart_mains_newtemper.clear();
    myChart_mains_newtemper.resize();
    myChart_mains_newtemper.setOption(option_one);
  };
}
// 矩阵式红外成像测温终端的处理
function infrared(){
  $('[name=infrared]').removeAttr('checked');
  layform.render('checkbox');
  $('.hidinf').hide();
  $('.infrared').show();
  $('.infres').empty();
  $('.loadjy').removeClass('op');
}
// 矩阵式红外成像测温终端的处理
layform.on('switch(switchinfrared)', function(data){
  if(data.elem.checked){//开关是否开启，true或者false
    $('.infres').empty().append(`正在请求数据...`);
    POST('/eric/startCamera.v1',{devid:sessionStorage.monitorFlag},function(res){
      if(res.code == 0){
        goEasy.subscribe({
          channel: sessionStorage.monitorFlag,
          onMessage: function (message) {
            const res = JSON.parse(message.content);
            // console.log(res)
            // averageTemper 平均温度   maxTemper 最高温度    maxTemperX  X坐标最高温度   maxTemperY  Y坐标最高温度
            const results = `
            <p><img src="${res.pathBitmap}" alt="矩阵式红外图像" class="resImg"></p>
            <p>最高温度: ${res.maxTemper} ℃</p>
            <p>最低温度: ${res.minTemper} ℃</p>
            <p>平均温度: ${res.averageTemper} ℃</p>
            <p>X坐标最高温度: ${res.maxTemperX} ℃</p>
            <p>X坐标最低温度: ${res.minTemperX} ℃</p>
            <p>Y坐标最高温度: ${res.maxTemperY} ℃</p>
            <p>Y坐标最低温度: ${res.minTemperY} ℃</p>
            `;
            $('.infres').empty().append(results);
            var _h = $('html').height(); /*编辑时同步iframe高度*/
            window.parent.$('#iframepage').css({
              'min-height': _h + 30 + 'px'
            });
          }
        });
      }else{
        layer.msg(res.msg);
      };
    })
  }; 
}); 

var id = getPropetyVal('id');

POST('/sys/linesOnBranch/queryLinesOnBranchBySelect.v1', { linesOnBranchId: id }, function (res) {
  // console.log(res.data)
  if (res.code == 0) {
    var tpl = ''
    for (let i = 0; i < res.data.length; i++) {
      if (i == 0) {
        var a = res.data[i].monitorFlag;
        sessionStorage.monitorFlag = a;
        $('.eqid').text(`监测设备标识：[${a}]`);
        // init(a);
        /* 判断监测设备类型
        hitchType=温度采集器||过电压保护器
        */
        const equiptype = res.data[i].type;
        if (equiptype == '矩阵式红外成像测温终端') {
          infrared();
        } else {
          $('.hidinf').show();
          $('.infrared').hide();
          var _t = res.data[i].hitchType;
          if (_t == '温度采集器') {
            // alert('这是温度采集器')
            $('.showData #newtemper').click();
            $('.eqtype').text(`设备类型：[温度采集器]`);
          } else {
            // alert('这是过电压保护器')
            $('.showData #temp').click();
            $('.eqtype').text(`设备类型：[过电压保护器]`);
          };
        };
      }
      tpl += '<option data-type="' + res.data[i].hitchType +'" data-equiptype="'+res.data[i].type+ '" value="' + res.data[i].monitorFlag + '">' + res.data[i].pointName + '</option>';
    }
    $('#monitorPoint').append(tpl);

    $('#monitorPoint').change(function () {
      var a = $('#monitorPoint option:selected').val();
      sessionStorage.monitorFlag = a;
      //            alert(a);
      // init(a);
      /* 判断监测设备类型
      hitchType=温度采集器||过电压保护器
      */
      $('.eqid').text(`监测设备标识：[${a}]`);
      const equiptype = $('#monitorPoint option:selected').data('equiptype');
      if(equiptype=='矩阵式红外成像测温终端'){
        infrared();
      }else{
        $('.hidinf').show();
        $('.infrared').hide();
        var _t = $('#monitorPoint  option:selected').data('type');
        if (_t == '温度采集器') {
          // alert('这是温度采集器')
          $('.showData #newtemper').click();
          $('.eqtype').text(`设备类型：[温度采集器]`);
        } else {
          // alert('这是过电压保护器')
          $('.showData #temp').click();
          $('.eqtype').text(`设备类型：[过电压保护器]`);
        };
      };
    })
  }else{
    sessionStorage.monitorFlag='null';
    $('.loadjy').removeClass('op');
    $('.showData #temp').click();
  };
}, function () {
  $('.loadjy').addClass('op');
});

$(function(){
  // resize
  $(window).resize(function () {
    myChart_mains_temp.resize();
    myChart_mains_humidity.resize();
    myChart_mains_leakElec.resize();
    myChart_mains_acionCount.resize();
    myChart_mains_newtemper.resize();
  })
})