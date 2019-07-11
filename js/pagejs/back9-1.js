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
$('#timeStart').val(_mydate);
timeStart = _mydate + ' 00:00:00:000';
$('#timeEnd').val(_mydate);
timeEnd = _mydate + ' 23:59:59:000';

// 图表切换
$('body').on('click','.showData li',function(){
  var _t = $(this),dataId = _t.attr('id');
  sessionStorage.tabID=dataId;
  // 清除所有波形图
  echarts_eric.clear();
  I0.clear();
  echarts_eric_xiebo.clear();
  echarts_vol.clear();
  U0.clear();
  echarts_vol_xiebo.clear();
  // 移除兄弟元素的选中状态
  _t.addClass('color_action').siblings('li').removeClass('color_action');
  // 显示对应的波形图
  $('#Statistics [data-id]').addClass('none');
  $('#Statistics [data-id='+dataId+']').removeClass('none');
  // 处理时间
  if ($('#timeStart').val()!='') {
    timeStart = $('#timeStart').val() + ' 00:00:00:000';
  } else {
    $('#timeStart').val(_mydate);
    timeStart = _mydate + ' 00:00:00:000';
  };
  if ($('#timeEnd').val()!='') {
    timeEnd = $('#timeEnd').val() + ' 23:59:59:000';
  } else {
    $('#timeEnd').val(_mydate);
    timeEnd = _mydate + ' 23:59:59:000';
  };
  var today = new Date(new Date().toLocaleDateString()+' 00:00:00').getTime();
  if(new Date(timeStart).getTime()*1>today*1){
    layer.msg('初始时间不能大于当日');return;
  };
  if(timeEnd!=''&&new Date(timeEnd).getTime()*1<new Date(timeStart).getTime()*1){
    layer.msg('结束时间应该在初始时间之后');return;
  };
  // 加载波形图
  organizationData(dataId, indexTimes, indexTimes_vol_xiebo, timeStart, timeEnd);
});

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
function organizationData(indexName, indexTimes, indexTimes_vol_xiebo, timeStart, timeEnd){
  $('.nullData').remove();
  // 保存下拉框选中状态。存公司 监测站 母线等data-id在本地
  $('.stseries select').each(function(i,item){
    sessionStorage[$(item).data('id')] = $(item).find('option:selected').data('stid');
  });
  var data = {
    deviceId: sessionStorage.deviceID,
    timeStart: timeStart,
    timeEnd: timeEnd,
    token: sessionStorage.token
  };
  var postUrl='';
  switch(indexName){
    case 'eric':postUrl = 'getEricElectric';break;// 电流
    case 'vol':postUrl = 'getEricVoltage';break;// 电压
    case 'eric_xiebo':postUrl = 'getEricElectricTHD';break;// 电流谐波
    case 'vol_xiebo':postUrl = 'getEricVoltageTHD';break;// 电压谐波
  };
  if($('#generatrix').val()!=999){
    POST(`/eric/${postUrl}.v1`, data, function (res){
      switch(indexName){
        case 'eric':xAxis_Electric_name = []; series_Electric_a = []; series_Electric_b = []; series_Electric_c = []; series_Electric_0 = [];break;// 电流;// 清空数据
        case 'vol':xAxis_voltage_name = []; series_voltage_a = []; series_voltage_b = []; series_voltage_c = []; series_voltage_0 = [];break;// 电压;// 清空数据
        case 'eric_xiebo':xAxis_Electric_name = []; series_Electric_a = []; series_Electric_b = []; series_Electric_c = []; series_Electric_0 = [];break;// 电流谐波;// 清空数据
        case 'vol_xiebo':xAxis_voltage_name = []; series_voltage_a = []; series_voltage_b = []; series_voltage_c = []; series_voltage_0 = [];break;// 电压谐波;// 清空数据
      };    
      if(res.code == '0'){
        var day_Arr = res.data;
        var timeLength = 0;
        if(day_Arr.length <= 0){
          $(`[data-id=${indexName}]`).append(nullDataDom);
          $('#select_Elec,#select_Vol').hide();
        }else{
          $('#select_Elec,#select_Vol').show();
          for(var i = 0; i < day_Arr.length; i++){
            if(indexName=='eric'){// 电流
              xAxis_Electric_name.push(day_Arr[i].time);
              series_Electric_a.push(fixNum(day_Arr[i].Electric_a));
              series_Electric_b.push(fixNum(day_Arr[i].Electric_b));
              series_Electric_c.push(fixNum(day_Arr[i].Electric_c));
              series_Electric_0.push(fixNum(day_Arr[i].Electric_0));
            }else if(indexName=='vol'){// 电压
              xAxis_voltage_name.push(day_Arr[i].time);
              series_voltage_a.push(fixNum(day_Arr[i].voltage_a));
              series_voltage_b.push(fixNum(day_Arr[i].voltage_b));
              series_voltage_c.push(fixNum(day_Arr[i].voltage_c));
              series_voltage_0.push(fixNum(day_Arr[i].voltage_0));            
            }else if(indexName=='eric_xiebo'){// 电流谐波
              if(i == 0) timeLength = day_Arr[i]['paramA'].length;
              xAxis_Electric_name.push(day_Arr[i].timestamp);
              series_Electric_a.push(fixNum(day_Arr[i]['paramA'][indexTimes]));
              series_Electric_b.push(fixNum(day_Arr[i]['paramB'][indexTimes]));
              series_Electric_c.push(fixNum(day_Arr[i]['paramC'][indexTimes]));            
            }else if(indexName=='vol_xiebo'){// 电压谐波
              if(i == 0) timeLength = day_Arr[i]['paramA'].length;
              xAxis_voltage_name.push(day_Arr[i].timestamp);
              series_voltage_a.push(fixNum(day_Arr[i]['paramA'][indexTimes_vol_xiebo]));
              series_voltage_b.push(fixNum(day_Arr[i]['paramB'][indexTimes_vol_xiebo]));
              series_voltage_c.push(fixNum(day_Arr[i]['paramC'][indexTimes_vol_xiebo]));            
            };
          };
        };
        getStatisticsElectricData_select(timeLength, indexTimes);
        getStatisticsEricVoltageData_select(timeLength, indexTimes_vol_xiebo);
        Statistics_btn(indexName); // 展示图表
      }
    },function(){
      $('.loadjy').addClass('op');
    },function(){
      $('.loadjy').removeClass('op');
    },true);
  }else{
    $('.loadjy').removeClass('op');
  };
}

// 电流谐波单选
function getStatisticsElectricData_select(timeLength, indexTimes) {
  var tpl4 = '';
  $('#select_Elec').html('');
  if(timeLength > 0){
    for(var i = 1; i <= timeLength; i++){
      if((i - 1) == indexTimes){
        tpl4 += `<label for="ele${i}"><input type="radio" checked name="electricity" value="${i - 1}" id="ele${i}">${i}次</label>`;
      }else{
        tpl4 += `<label for="ele${i}"><input type="radio" name="electricity" value="${i - 1}" id="ele${i}">${i}次</label>`;
      };
      if(i == 20) tpl4 += `<br/>`;
    };
  };
  $('#select_Elec').append(tpl4);
  $('input[type=radio][name=electricity]').change(function () {
    indexTimes = $(this).val();
    organizationData('eric_xiebo', indexTimes, indexTimes_vol_xiebo, timeStart, timeEnd);
  })
}
// 电压谐波单选
function getStatisticsEricVoltageData_select(timeLength, indexTimes_vol_xiebo) {
  var tpl4 = '';
  $('#select_Vol').html('')
  if(timeLength > 0){
    for(var i = 1; i <= timeLength; i++){
      if((i - 1) == indexTimes_vol_xiebo){
        tpl4 += `<label for="vol${i}"><input type="radio" checked name="voltage" value="${i - 1}" id="vol${i}">${i}次</label>`;
      } else{
        tpl4 += `<label for="vol${i}"><input type="radio" name="voltage" value="${i - 1}" id="vol${i}">${i}次</label>`;
      };
      if(i == 20) tpl4 += `<br/>`;
    };
  };
  $('#select_Vol').append(tpl4);
  $('input[type=radio][name=voltage]').change(function () {
    indexTimes_vol_xiebo = $(this).val();
    organizationData('vol_xiebo', indexTimes, indexTimes_vol_xiebo, timeStart, timeEnd);
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
        }
      ]
    };
    echarts_vol_xiebo.clear();
    echarts_vol_xiebo.resize();
    echarts_vol_xiebo.setOption(option_one);
  }
}
// 三级联动
POST('/sys/company/queryStaticThree.v1', { createBy: sessionStorage.id }, function (res) {
  // console.log(res.data)
  // 将保存在本地的data-id读取出来，赋值给对应的下拉框
  if (res.code == 0) {
    var tpl1 = '',tpl2 = '',tpl3 = '',x,k = 0,j = 0;
    // 渲染公司
    for (var i = 0; i < res.data.length; i++) {
      tpl1 += ' <option data-stid="'+res.data[i].id+'" value="' + i + '">' + res.data[i].companyName + '</option>';// 公司
    };
    $('#company').append(tpl1);
    // ./渲染公司
    $('#generatrix').change(function () {// 母线下拉框change事件
      $('.btn_s').attr('disabled',true);
      j = 0;
      sessionStorage.deviceID = '';
      var z =  parseInt($('#generatrix option:selected').val());
      x =  parseInt($('#company option:selected').val());
      var y =  parseInt($('#site option:selected').val());
      if(z<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterDtos;
        if(a.length>0){
          $('.btn_s').removeAttr('disabled');
          for (let i of a) {
            if (j == z) {
              sessionStorage.deviceID = i.monitorFlag;
              break;
            }
            j++;
          };
        };
      };
      // $('#' + sessionStorage.tabID).click();
    });
    $('#site').change(function () {// 监测站下拉框change事件
      $('.btn_s').attr('disabled',true);
      tpl3 = ''; j = 0;
      sessionStorage.deviceID = '';
      $('#generatrix').empty().append('<option data-stid="allst" value="999">请选择</option>');
      x = parseInt($('#company option:selected').val());
      var y = parseInt($('#site option:selected').val());
      if(y<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterDtos;
        if(a.length>0){
          for (let i of a) {
            tpl3 += '<option data-stid="'+i.id+'" value="' + j + '">' + i.masterName + '</option>';
            j++;
          };
          $('#generatrix').append(tpl3);
        };
      };
    });
    $('#company').change(function () {// 公司下拉框change事件
      $('.btn_s').attr('disabled',true);
      tpl2 = ''; k = 0; j = 0;
      sessionStorage.deviceID = '';
      $('#site,#generatrix').empty().append('<option data-stid="allst" value="999">请选择</option>');
      x = parseInt($('#company option:selected').val());
      var a = res.data[x].monitorStationDtos;
      if(a.length>0){
        for (let j of a) {
          tpl2 += '<option data-stid="'+j.id+'" value="' + k + '">' + j.stationName + '</option>';
          k++;
        };
        $('#site').append(tpl2);
      };
    });
    mychange();
    $('#' + sessionStorage.tabID).click();
  }else{
    sessionStorage.deviceID='null';
    $('.loadjy').removeClass('op');
    $('#' + sessionStorage.tabID).click();
  };
}, function () {
  $('.loadjy').addClass('op');
});
function mychange(){
  // 通过保存的下拉框设置当前选中公司
  $(`#company option[data-stid=${sessionStorage.stcompany}]`).attr('selected',true);
  $('#company').change();
  // 通过保存的下拉框设置当前选中监测站
  $(`#site option[data-stid=${sessionStorage.stmonitorstation}]`).attr('selected',true);
  $('#site').change();
  // 通过保存的下拉框设置当前选中母线
  $(`#generatrix option[data-stid=${sessionStorage.stgeneratrix}]`).attr('selected',true);
  $('#generatrix').change();
}

$(function(){
  // 第一次进来执行温度波形 初始化  organizationData 由于修改了下拉框，会自动请求波形图
  // $('#' + sessionStorage.tabID).click();
  // 跳转
  $('#btn-2').on('click', function () {
    window.parent.$("#iframepage").attr("src", 'back9_2_DailyPointInfo.html?v=1.6.22');
  });
  /*用户-查询*/
  $('.btn_s').bind('click', function (e) {
    $('#' + sessionStorage.tabID).click();
  });
  // resize
  $(window).resize(function () {
    echarts_eric.resize();
    I0.resize();
    U0.resize();
    echarts_vol.resize();
    echarts_eric_xiebo.resize();
    echarts_vol_xiebo.resize();
  });
})
