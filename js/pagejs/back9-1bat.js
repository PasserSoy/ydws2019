// 默认点击第一个
sessionStorage.tabID = 'eric';
// 波形图初始化
var echarts_eric = echarts.init(document.getElementById('echarts_eric'));
var echarts_eric_xiebo = echarts.init(document.getElementById('echarts_eric_xiebo'));
var echarts_vol = echarts.init(document.getElementById('echarts_vol'));
var echarts_vol_xiebo = echarts.init(document.getElementById('echarts_vol_xiebo'));
var I0 = echarts.init(document.getElementById('I0'));
var U0 = echarts.init(document.getElementById('U0'));
echarts.connect([echarts_eric,I0]);
echarts.connect([echarts_vol,U0]);

var nullDataDom = '<p class="nullData"><i>查询数据为空...</i></p>'; /*查询数据为空时的dom结构*/
var indexTimes = 0;
var indexTimes_vol_xiebo = 0;
var timeStart = $("#timeStart").val();
var timeEnd = $("#timeEnd").val();

var mydate = new Date(); //通过new方法创建对象
// 初始化时间赋值
var _year = mydate.getFullYear();
var _month = (mydate.getMonth() + 1) < 10 ? '0' + (mydate.getMonth() + 1) : mydate.getMonth() + 1;
var _date = mydate.getDate() < 10 ? '0' + mydate.getDate() : mydate.getDate();
var _mydate = _year + '-' + _month + '-' + _date;
if ($('#timeStart').val()) {
  timeStart = $('#timeStart').val() + ' 00:00:00:000';
} else {
  //            timeStart = '1970-01-01 00:00:00:000';
  $('#timeStart').val(_mydate);
  timeStart = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 00:00:00:000';
}
if ($('#timeEnd').val()) {
  timeEnd = $('#timeEnd').val() + ' 23:59:59:000';
} else {
  //            timeEnd = '2018-06-26 01:00:00:000';
  $('#timeEnd').val(_mydate);
  timeEnd = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 23:59:59:000';
}


$('#btn-2').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back9_2_DailyPointInfo.html?v=1.6.22');
})
/*用户-查询*/
$('.btn_search').bind('click', function (e) {
  init(sessionStorage.deviceID);
});
// 图表切换
$('#eric').click(function () {
  echarts_eric.clear();
  // sessionStorage.tabID = 'eric';
  $('#eric').addClass('color_action');
  $('#eric_xiebo').removeClass('color_action');
  $('#vol').removeClass('color_action');
  $('#vol_xiebo').removeClass('color_action');

  /*隐藏div图表*/
  $('#echarts_eric,#I0').removeClass('none');
  $('#echarts_eric_xieboI').addClass('none');
  $('#echarts_eric_xiebo').addClass('none');
  $('#echarts_vol,#U0').addClass('none');
  $('#echarts_vol_xieboI').addClass('none');
  $('#echarts_vol_xiebo').addClass('none');
  // echarts_eric.showLoading();
  organizationData('eric', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd); //  获取过电压保护器的温度波形
});
$('#eric_xiebo').click(function () {
  echarts_eric_xiebo.clear();
  // sessionStorage.tabID = 'eric_xiebo';
  // Statistics_btn('eric_xiebo');// 展示图表
  $('#eric_xiebo').addClass('color_action');
  $('#eric').removeClass('color_action');
  $('#vol').removeClass('color_action');
  $('#vol_xiebo').removeClass('color_action');

  /*隐藏div图表*/
  $('#echarts_eric,#I0').addClass('none');

  $('#echarts_eric_xieboI').removeClass('none');
  $('#echarts_eric_xiebo').removeClass('none');

  $('#echarts_vol,#U0').addClass('none');
  $('#echarts_vol_xieboI').addClass('none');
  $('#echarts_vol_xiebo').addClass('none');
  // echarts_eric_xiebo.showLoading();
  organizationData('eric_xiebo', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd); // 获取过电压保护器的湿度波形
});
$('#vol').click(function () {
  echarts_vol.clear();
  // sessionStorage.tabID = 'vol';
  // Statistics_btn('vol');// 展示图表
  $('#vol').addClass('color_action');
  $('#eric').removeClass('color_action');
  $('#eric_xiebo').removeClass('color_action');
  $('#vol_xiebo').removeClass('color_action');

  /*隐藏div图表*/
  $('#echarts_eric_xieboI').addClass('none');
  $('#echarts_eric_xiebo').addClass('none');

  $('#echarts_eric,#I0').addClass('none');
  $('#echarts_vol,#U0').removeClass('none');
  $('#echarts_vol_xieboI').addClass('none');
  $('#echarts_vol_xiebo').addClass('none');
  // echarts_vol.showLoading();
  organizationData('vol', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd); // 查询保护器泄漏电流波形

});
$('#vol_xiebo').click(function () {
  echarts_vol_xiebo.clear();
  // sessionStorage.tabID = 'vol_xiebo';
  // Statistics_btn('vol_xiebo');// 展示图表
  $('#vol_xiebo').addClass('color_action');
  $('#eric').removeClass('color_action');
  $('#eric_xiebo').removeClass('color_action');
  $('#vol').removeClass('color_action');

  /*隐藏div图表*/
  $('#echarts_eric,#I0').addClass('none');

  $('#echarts_eric_xieboI').addClass('none');
  $('#echarts_eric_xiebo').addClass('none');

  $('#echarts_vol,#U0').addClass('none');
  $('#echarts_vol_xieboI').removeClass('none');
  $('#echarts_vol_xiebo').removeClass('none');
  // echarts_vol_xiebo.showLoading();
  organizationData('vol_xiebo', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd); // 查询保护器漏电流波形
});


function manageQueryData() {}

var Electric_type = 1;

// 电流
var xAxis_Electric_name = [];
var series_Electric_a = [];
var series_Electric_b = [];
var series_Electric_c = [];
var series_Electric_0 = [];
var deviceID;
// 电压
var xAxis_voltage_name = [];
var series_voltage_a = [];
var series_voltage_b = [];
var series_voltage_c = [];
var series_voltage_0 = [];

// 请求数据
function organizationData(indexName, indexTimes, indexTimes_vol_xiebo, monitorFlag, timeStart, timeEnd) {
  $('.nullData').remove();
  //        var data = {deviceId:monitorFlag,timeStart:timeStart,timeEnd:timeEnd};
  var data = {
    deviceId: sessionStorage.deviceID,
    timeStart: timeStart,
    timeEnd: timeEnd
  };
  data.token = sessionStorage.token;
  if (indexName == 'eric') { // 电流
    xAxis_Electric_name = [];
    series_Electric_a = [];
    series_Electric_b = [];
    series_Electric_c = [];
    series_Electric_0 = [];
    POST('/eric/getEricElectric.v1', data, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        if (day_Arr.length <= 0) {
          $('#echarts_eric').append(nullDataDom);
        } else {
          for (var i = 0; i < day_Arr.length; i++) {
            xAxis_Electric_name.push(day_Arr[i].time);
            series_Electric_a.push(fixNum(day_Arr[i].Electric_a));
            series_Electric_b.push(fixNum(day_Arr[i].Electric_b));
            series_Electric_c.push(fixNum(day_Arr[i].Electric_c));
            series_Electric_0.push(fixNum(day_Arr[i].Electric_0));
          }
        };
        Statistics_btn('eric'); // 展示图表
        echarts_eric.hideLoading();
      }
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);

  } else if (indexName == 'vol') { // 电压
    xAxis_voltage_name = [];
    series_voltage_a = [];
    series_voltage_b = [];
    series_voltage_c = [];
    series_voltage_0 = [];
    POST('/eric/getEricVoltage.v1', data, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        if (day_Arr.length <= 0) {
          $('#echarts_vol').append(nullDataDom);
        } else {
          for (var i = 0; i < day_Arr.length; i++) {
            xAxis_voltage_name.push(day_Arr[i].time);
            series_voltage_a.push(fixNum(day_Arr[i].voltage_a));
            series_voltage_b.push(fixNum(day_Arr[i].voltage_b));
            series_voltage_c.push(fixNum(day_Arr[i].voltage_c));
            series_voltage_0.push(fixNum(day_Arr[i].voltage_0));
          }
        };
        Statistics_btn('vol'); // 展示图表
        echarts_vol.hideLoading();
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  } else if (indexName == 'eric_xiebo') { // 电流谐波
    xAxis_Electric_name = [];
    series_Electric_a = [];
    series_Electric_b = [];
    series_Electric_c = [];
    series_Electric_0 = [];
    POST('/eric/getEricElectricTHD.v1', data, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        var timeLength = 0;
        if (day_Arr.length <= 0) {
          $('#echarts_eric_xiebo').append(nullDataDom);
          $('#select_Elec').hide();
        } else {
          $('#select_Elec').show();
          for (var i = 0; i < day_Arr.length; i++) {
            if (i == 0) {
              timeLength = day_Arr[i]['paramA'].length;
            }
            xAxis_Electric_name.push(day_Arr[i].timestamp);
            series_Electric_a.push(fixNum(day_Arr[i]['paramA'][indexTimes]));
            series_Electric_b.push(fixNum(day_Arr[i]['paramB'][indexTimes]));
            series_Electric_c.push(fixNum(day_Arr[i]['paramC'][indexTimes]));
          }
        };
        getStatisticsElectricData_select(timeLength, indexTimes);
        Statistics_btn('eric_xiebo'); // 展示图表
        echarts_eric_xiebo.hideLoading();
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  } else if (indexName == 'vol_xiebo') { // 电压谐波
    xAxis_voltage_name = [];
    series_voltage_a = [];
    series_voltage_b = [];
    series_voltage_c = [];
    series_voltage_0 = [];
    POST('/eric/getEricVoltageTHD.v1', data, function (res) {
      if (res.code == '0') {
        var day_Arr = res.data;
        var timeLength = 0;
        if (day_Arr.length <= 0) {
          $('#echarts_vol_xiebo').append(nullDataDom);
          $('#select_Vol').hide();
        } else {
          $('#select_Vol').show();
          for (var i = 0; i < day_Arr.length; i++) {
            if (i == 0) {
              timeLength = day_Arr[i]['paramA'].length;
            }
            console.log("indexVol:" + 2);
            xAxis_voltage_name.push(day_Arr[i].timestamp);
            series_voltage_a.push(fixNum(day_Arr[i]['paramA'][indexTimes_vol_xiebo]));
            series_voltage_b.push(fixNum(day_Arr[i]['paramB'][indexTimes_vol_xiebo]));
            series_voltage_c.push(fixNum(day_Arr[i]['paramC'][indexTimes_vol_xiebo]));
          }
        };
        getStatisticsEricVoltageData_select(timeLength, indexTimes_vol_xiebo);
        Statistics_btn('vol_xiebo'); // 展示图表
        echarts_vol_xiebo.hideLoading();
      };
    }, function () {
      $('.loadjy').addClass('op');
    }, function () {
      $('.loadjy').removeClass('op');
    }, true);
  }
}

// 电流谐波单选
function getStatisticsElectricData_select(timeLength, indexTimes) {
  var tpl4 = '';
  $('#select_Elec').html('')
  if (timeLength > 0) {
    for (var i = 1; i <= timeLength; i++) {
      if ((i - 1) == indexTimes) {
        tpl4 += `<label for="ele${i}"><input type="radio" checked name="electricity" value="${i - 1}" id="ele${i}">${i}次</label>`;
      } else {
        tpl4 += `<label for="ele${i}"><input type="radio" name="electricity" value="${i - 1}" id="ele${i}">${i}次</label>`;
      }
      if (i == 20) {
        tpl4 += `<br/>`
      }
    }
  }
  $('#select_Elec').append(tpl4);

  $('input[type=radio][name=electricity]').change(function () {
    indexTimes = $(this).val();
    /* if($('#timeStart').val()){
         timeStart = $('#timeStart').val()+' 00:00:00:000';
     }else{
         timeStart = '1970-01-01 00:00:00:000';
     }
     if($('#timeEnd').val()){
         timeEnd = $('#timeEnd').val()+' 00:00:00:000';
     }else{
         timeEnd = '2018-06-26 01:00:00:000';
     }*/
    organizationData('eric_xiebo', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd);
    Statistics_btn('eric_xiebo'); // 展示图表
  })
}
// 电压谐波单选
function getStatisticsEricVoltageData_select(timeLength, indexTimes_vol_xiebo) {
  var tpl4 = '';
  $('#select_Vol').html('')
  if (timeLength > 0) {
    for (var i = 1; i <= timeLength; i++) {
      if ((i - 1) == indexTimes_vol_xiebo) {
        tpl4 += `<label for="vol${i}"><input type="radio" checked name="voltage" value="${i - 1}" id="vol${i}">${i}次</label>`;
      } else {
        tpl4 += `<label for="vol${i}"><input type="radio" name="voltage" value="${i - 1}" id="vol${i}">${i}次</label>`;
      }
      if (i == 20) {
        tpl4 += `<br/>`
      }
    }
  }
  $('#select_Vol').append(tpl4);

  $('input[type=radio][name=voltage]').change(function () {
    indexTimes_vol_xiebo = $(this).val();
    /*if($('#timeStart').val()){
        timeStart = $('#timeStart').val()+' 00:00:00:000';
    }else{
        timeStart = '1970-01-01 00:00:00:000';
    }
    if($('#timeEnd').val()){
        timeEnd = $('#timeEnd').val()+' 00:00:00:000';
    }else{
        timeEnd = '2018-06-26 01:00:00:000';
    }*/
    organizationData('vol_xiebo', indexTimes, indexTimes_vol_xiebo, sessionStorage.deviceID, timeStart, timeEnd);
    Statistics_btn('vol_xiebo'); // 展示图表
  })
}


// 波形图
function Statistics_btn(indexName) {
  if (indexName == 'eric') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电流',
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
        data: xAxis_Electric_name
      },
      yAxis: {
        show: true,
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
    echarts_eric.clear();
    echarts_eric.resize();
    echarts_eric.setOption(option_one);
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
        data: xAxis_Electric_name
      },
      yAxis: {
        show: true,
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
  } else if (indexName == 'vol') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电压',
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
        data: xAxis_voltage_name
      },
      yAxis: {
        show: true,
        name: ' 电压(V)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: '{value} V'
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
          symbol:'none',
          data: series_voltage_c
        }
      ]
    };
    echarts_vol.clear();
    echarts_vol.resize();
    echarts_vol.setOption(option_one);
    option_one1 = {
      color: ['#333'],
      title: {
        text: '零序电压',
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
        data: xAxis_voltage_name
      },
      yAxis: {
        show: true,
        name: ' 电压(V)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: '{value} V'
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
    U0.setOption(option_one1);
  } else if (indexName == 'eric_xiebo') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电流谐波',
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
        data: xAxis_Electric_name
      },
      yAxis: {
        show: true,
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
        },
        // {
        //     name: '3I0电流',
        //     type: 'line',
        //     data: series_Electric_0
        // }

      ]
    };
    echarts_eric_xiebo.clear();
    echarts_eric_xiebo.resize();
    echarts_eric_xiebo.setOption(option_one);
  } else if (indexName == 'vol_xiebo') {
    option_one = {
      color: ['#FFCD2D', '#14AE68', '#FB1734', '#333'],
      title: {
        text: '电压谐波',
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
        data: xAxis_voltage_name
      },
      yAxis: {
        show: true,
        name: ' 电压(V)',
        nameLocation: 'end',
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: '{value} V'
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
          symbol:'none',
          data: series_voltage_c
        },
        // {
        //     name: '3U0电压',
        //     type: 'line',
        //     data: series_voltage_0
        // }
      ]
    };
    echarts_vol_xiebo.clear();
    echarts_vol_xiebo.resize();
    echarts_vol_xiebo.setOption(option_one);
  }
}
// 三级联动
POST('/sys/company/queryStaticThree.v1', {
  createBy: sessionStorage.id
}, function (res) {
  // console.log(res.data)
  if (res.code == 0) {
    var tpl1 = '';
    var tpl2 = '';
    var tpl3 = '';
    var x;
    var k = 0;
    var j = 0;

    for (var i = 0; i < res.data.length; i++) {
      tpl1 += ' <option value="' + i + '">' + res.data[i].companyName + '</option>';

    }
    if (res.data[0] != undefined) {
      for (let i of res.data[0].monitorStationDtos) {
        tpl2 += '<option value="' + k + '">' + i.stationName + '</option>';
        k++;
      };
      if (res.data[0].monitorStationDtos[0] != undefined) {
        for (let i of res.data[0].monitorStationDtos[0].linesOnMasterDtos) {
          if (j == 0) {
            sessionStorage.deviceID = i.monitorFlag;
          }
          tpl3 += '<option value="' + j + '">' + i.masterName + '</option>';
          j++

        }
      };
    }
    $('#company').append(tpl1);
    $('#site').append(tpl2);
    $('#generatrix').append(tpl3);

    init(sessionStorage.deviceID);

    $('#company').change(function () {
      deviceID = '';
      tpl2 = '';
      tpl3 = '';
      k = 0;
      j = 0;
      $('#site').empty();
      $('#generatrix').empty();
      x = $('#company  option:selected').val();
      parseInt(x);
      for (let j of res.data[x].monitorStationDtos) {
        tpl2 += '<option value="' + k + '">' + j.stationName + '</option>';
        k++;
      }
      for (let i of res.data[x].monitorStationDtos[0].linesOnMasterDtos) {
        if (j == 0) {
          sessionStorage.deviceID = i.monitorFlag;
        }
        tpl3 += '<option value="' + j + '">' + i.masterName + '</option>';
        // deviceID=i.monitorFlag;
        j++;
      }
      $('#site').append(tpl2);
      $('#generatrix').append(tpl3);

      init(sessionStorage.deviceID);
    })
    $('#site').change(function () {
      tpl3 = '';
      j = 0;
      deviceID = '';
      $('#generatrix').empty();
      x = $('#company  option:selected').val();
      parseInt(x);
      var y = $('#site  option:selected').val();
      parseInt(y);
      for (let i of res.data[x].monitorStationDtos[y].linesOnMasterDtos) {
        if (j == 0) {
          sessionStorage.deviceID = i.monitorFlag;
        }
        tpl3 += '<option value="' + j + '">' + i.masterName + '</option>';

        j++
      }
      $('#generatrix').append(tpl3);
      init(sessionStorage.deviceID);
    })
    $('#generatrix').change(function () {
      deviceID = '';
      j = 0;
      var z = $('#generatrix  option:selected').val();
      parseInt(z);
      x = $('#company  option:selected').val();
      parseInt(x);
      var y = $('#site  option:selected').val();
      parseInt(y);
      for (let i of res.data[x].monitorStationDtos[y].linesOnMasterDtos) {
        if (j == z) {
          sessionStorage.deviceID = i.monitorFlag;
          break;
        }
        j++
      };
      init(sessionStorage.deviceID);
    })
  }else{
    sessionStorage.deviceID='null';
    $('.loadjy').removeClass('op');
    init(sessionStorage.deviceID);
  };
}, function () {
  $('.loadjy').addClass('op');
});

function init(monitorFlag) {
  var mydate = new Date(); //通过new方法创建对象
  if ($('#timeStart').val()) {
    timeStart = $('#timeStart').val() + ' 00:00:00:000';
  } else {
    //            timeStart = '1970-01-01 00:00:00:000';
    $('#timeStart').val(mydate.getFullYear() + '/' + (mydate.getMonth() + 1) + '/' + mydate.getDate());
    timeStart = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 00:00:00:000';
  }
  if ($('#timeEnd').val()) {
    timeEnd = $('#timeEnd').val() + ' 23:59:59:000';
  } else {
    //            timeEnd = '2018-06-26 01:00:00:000';
    $('#timeEnd').val(mydate.getFullYear() + '/' + (mydate.getMonth() + 1) + '/' + mydate.getDate());
    timeEnd = mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' 23:59:59:000';
  }
  // 第一次进来执行温度波形 初始化  organizationData
  $('#' + sessionStorage.tabID).click();
}
$(function(){
  // resize
  $(window).resize(function () {
    echarts_eric.resize();
    I0.resize();
    U0.resize();
    echarts_vol.resize();
    echarts_eric_xiebo.resize();
    echarts_vol_xiebo.resize();
  })
})
