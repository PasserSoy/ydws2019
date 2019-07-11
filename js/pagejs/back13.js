var deviceId;
$('.stationName').text(sessionStorage.stationName);
var Electric_type = 1;
var myChart_line_bottom_electricity = echarts.init(document.getElementById('line_bottom_electricity'));
var myChart_line_bottom_voltage = echarts.init(document.getElementById('line_bottom_voltage'));
var I0 = echarts.init(document.getElementById('I0'));
var U0 = echarts.init(document.getElementById('U0'));
echarts.connect([myChart_line_bottom_electricity, myChart_line_bottom_voltage,I0,U0]);
// 电流
var xAxis_Electric_name = [];
var series_Electric_a = [];
var series_Electric_b = [];
var series_Electric_c = [];
var series_Electric_0 = [];
// 电压
var xAxis_voltage_name = [];
var series_voltage_a = [];
var series_voltage_b = [];
var series_voltage_c = [];
var series_voltage_0 = [];

// 电流
function getStatisticsElectricData(deviceId) {
  var mydate = new Date(); //通过new方法创建对象
  timeStart = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 00:00:00:000';
  timeEnd = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 23:59:59:000';
  var data = {
    deviceId: deviceId,
    timeStart: timeStart,
    timeEnd: timeEnd
  };
  xAxis_Electric_name = [];
  series_Electric_a = [];
  series_Electric_b = [];
  series_Electric_c = [];
  series_Electric_0 = [];

  POST("/eric/getEricElectric.v1", data, function (res) {
    if (res.code == '0') {
      var day_Arr = res.data;
      for (var i = 0; i < day_Arr.length; i++) {
        xAxis_Electric_name.push(day_Arr[i].time);
        series_Electric_0.push(fixNum(day_Arr[i].Electric_0));
        series_Electric_a.push(fixNum(day_Arr[i].Electric_a));
        series_Electric_b.push(fixNum(day_Arr[i].Electric_b));
        series_Electric_c.push(fixNum(day_Arr[i].Electric_c));
      };
      option_one = {
        color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
        title: {
          text: '电流波形',
          x: '20',
          y: '0'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['A相电流', 'B相电流', 'C相电流'],
          x: '20px',
          y: '30px'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: function (value, index) {
              return value.slice(10, -3);
            }
          },
          data: xAxis_Electric_name
        },
        yAxis: {
          name: '电流(A)',
          nameLocation: 'end',
          type: 'value',
          position: 'right',
          axisLabel: {
            formatter: '{value} A'
          }
        },
        series: [{
            name: 'A相电流',
            type: 'line',
            symbol:'none',
            data: series_Electric_a
          },
          {
            name: 'B相电流',
            type: 'line',
            symbol:'none',
            data: series_Electric_b
          },
          {
            name: 'C相电流',
            type: 'line',
            symbol:'none',
            data: series_Electric_c
          }
        ]
      };
      myChart_line_bottom_electricity.clear();
      myChart_line_bottom_electricity.resize();
      myChart_line_bottom_electricity.setOption(option_one);

      option_one1 = {
        color: ['#333'],
        title: {
          text: '零序电流',
          x: '20',
          y: '0'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['3I0电流'],
          x: '20px',
          y: '30px'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: function (value, index) {
              return value.slice(10, -3);
            }
          },
          data: xAxis_Electric_name
        },
        yAxis: {
          name: '电流(A)',
          nameLocation: 'end',
          type: 'value',
          position: 'right',
          axisLabel: {
            formatter: '{value} A'
          }
        },
        series: [{
            name: '零序电流',
            type: 'line',
            symbol:'none',
            data: series_Electric_0
          }
        ]
      };
      I0.clear();
      I0.resize();
      I0.setOption(option_one1);
    }else{
      $('#line_bottom_electricity,#I0').hide();
    };
  });
}

// 电压
function getStatisticsEricVoltageData(deviceId) {
  var mydate = new Date(); //通过new方法创建对象
  timeStart = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 00:00:00:000';
  timeEnd = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 23:59:59:000';
  var data = {
    deviceId: deviceId,
    timeStart: timeStart,
    timeEnd: timeEnd
  };
  xAxis_voltage_name = [];
  series_voltage_a = [];
  series_voltage_b = [];
  series_voltage_c = [];
  series_voltage_0 = [];

  POST("/eric/getEricVoltage.v1", data, function (res) {
    if (res.code == '0') {
      var day_Arr = res.data;
      for (var i = 0; i < day_Arr.length; i++) {
        xAxis_voltage_name.push(day_Arr[i].time);
        series_voltage_0.push(fixNum(day_Arr[i].voltage_0));
        series_voltage_a.push(fixNum(day_Arr[i].voltage_a));
        series_voltage_b.push(fixNum(day_Arr[i].voltage_b));
        series_voltage_c.push(fixNum(day_Arr[i].voltage_c));
      };
      option_two = {
        color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
        title: {
          text: '电压波形',
          x: '20',
          y: '0'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['A相电压', 'B相电压', 'C相电压'],
          x: '20px',
          y: '30px'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: function (value, index) {
              return value.slice(10, -3);
            }
          },
          data: xAxis_voltage_name
        },
        yAxis: {
          name: '电压(kV)',
          type: 'value',
          position: 'right',
          show: true,
          axisLabel: {
            formatter: '{value} kV'
          }
        },
        series: [{
            name: 'A相电压',
            type: 'line',
            symbol:'none',
            data: series_voltage_a
          },
          {
            name: 'B相电压',
            type: 'line',
            symbol:'none',
            data: series_voltage_b
          },
          {
            name: 'C相电压',
            type: 'line',
            stack: '总量',
            symbol:'none',
            data: series_voltage_c
          }    
        ]
      };
      myChart_line_bottom_voltage.clear();
      myChart_line_bottom_voltage.resize();
      myChart_line_bottom_voltage.setOption(option_two);
      
      option_two1 = {
        color: ['#333'],
        title: {
          text: '零序电压',
          x: '20',
          y: '0'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['3U0电压'],
          x: '20px',
          y: '30px'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: function (value, index) {
              return value.slice(10, -3);
            }
          },
          data: xAxis_voltage_name
        },
        yAxis: {
          name: '电压(kV)',
          type: 'value',
          position: 'right',
          show: true,
          axisLabel: {
            formatter: '{value} kV'
          }
        },
        series: [{
            name: '零序电压',
            type: 'line',
            symbol:'none',
            data: series_voltage_0
          }    
        ]
      };
      U0.clear();
      U0.resize();
      U0.setOption(option_two1);
    }else{
      $('#line_bottom_voltage,#U0').hide();
    };
  });
}


$('#node').change(function () {
  deviceId = $('#node option:selected').val()
  getStatisticsElectricData(deviceId); // 电流
  getStatisticsEricVoltageData(deviceId); // 电压
  // Statistics_btn();
  //      alert('deviceId更改后的值为:'+deviceId)
})


function Statistics_btn() {

}
$(function () {
  $(window).resize(function () {
    myChart_line_bottom_electricity.resize();
    myChart_line_bottom_voltage.resize();
    I0.resize();
    U0.resize();
  })
})
