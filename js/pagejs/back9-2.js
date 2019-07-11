// 默认点击第一个
sessionStorage.tabID = 'temp';
// 波形图初始化
var myChart_mains_temp = echarts.init(document.getElementById('mains_temp'));
var myChart_mains_humidity = echarts.init(document.getElementById('mains_humidity'));
var myChart_mains_leakElec = echarts.init(document.getElementById('mains_leakElec'));
var myChart_mains_acionCount = echarts.init(document.getElementById('mains_acionCount'));
var myChart_mains_newtemper = echarts.init(document.getElementById('mains_newtemper'));

var nullDataDom = '<p class="nullData"><i>查询数据为空...</i></p>'; /*查询数据为空时的dom结构*/
var mydate = new Date(); //通过new方法创建对象
var timeStart;
var timeEnd;
var _year = mydate.getFullYear();
var _month = (mydate.getMonth() + 1) < 10 ? '0' + (mydate.getMonth() + 1) : mydate.getMonth() + 1;
var _date = mydate.getDate() < 10 ? '0' + mydate.getDate() : mydate.getDate();
var _mydate = _year + '-' + _month + '-' + _date;
$('#timeStart').val(_mydate);
timeStart = _mydate + ' 00:00:00:000';
$('#timeEnd').val(_mydate);
timeEnd = _mydate + ' 23:59:59:000';

var layform = layui.form;
var goEasy = new GoEasy({
  appkey: "BC-81a7696478cf412c807a296be95f5357"
});

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
  organizationData(dataId, sessionStorage.monitorFlag, timeStart, timeEnd);
});

// 获取过电压保护器的湿度波形
var xAxis_time_name = []; // 时间戳
var series_temper_a = []; // A相温度；
var series_temper_b = []; // B相温度
var series_temper_c = []; // C相温度

var series_humidity_a = []; // A相湿度；
var series_humidity_b = []; // B相湿度
var series_humidity_c = []; // C相湿度

// 保护器泄漏电流波形
var series_leakElec_value = [];
// 所有相位动作次数
var series_acionCount_value = [];
// 请求数据
function organizationData(indexName, monitorFlag, timeStart, timeEnd) {
  $('.nullData').remove();
  // 保存下拉框选中状态
  $('.stseries select').each(function(i,item){
    sessionStorage[$(item).data('id')] = $(item).find('option:selected').data('stid');
  });
  var data = {
    sensorId: monitorFlag,
    timeStart: timeStart,
    timeEnd: timeEnd,
    token: sessionStorage.token
  };
  var postUrl='';
  switch(indexName){
    case 'temp':postUrl = 'getTemperatureForVoltage';break;// 温度
    case 'humidity':postUrl = 'gethumidityForVoltage';break;// 湿度
    case 'leakElec':postUrl = 'getLeakElecForId';break;// 泄漏电流
    case 'acionCount':postUrl = 'getAcionCountForValue';break;// 动作次数
    case 'newtemper':postUrl = 'getTemper_data';delete data.sensorId;data.monitorFlag=monitorFlag;;break;// 温度采集器
  };
  if($('#monitorPoint').val()!=999){
    $('.myprint').removeAttr('disabled');
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
          $(`[data-id=${indexName}]`).append(nullDataDom);
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
  }else{
    $('.loadjy').removeClass('op');
  };  
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

// 五级联动
function searchType(){
  //  init(sessionStorage.monitorFlag);
  /* 判断监测设备类型
  hitchType=温度采集器||过电压保护器
  */
 // 后面由于增加了矩阵式红外成像测温终端，需要增加一层判断
 const equiptype = $('#monitorPoint option:selected').data('equiptype');
 if(equiptype=='矩阵式红外成像测温终端'){
   infrared();
 }else{// 判断是温度采集器 或是过电压保护器
   $('.hidinf').show();
   $('.infrared').hide();
   var _t = $('#monitorPoint option:selected').data('type');
   if (_t == '温度采集器') {
     // alert('这是温度采集器')
     $('.showData #newtemper').click();
   } else {
     // alert('这是过电压保护器')
     $('.showData #temp').click();
   };
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
    // 保存下拉框选中状态
    $('.stseries select').each(function(i,item){
      sessionStorage[$(item).data('id')] = $(item).find('option:selected').data('stid');
    });
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
POST('/sys/company/queryStaticThree.v1', { type: '5', createBy: sessionStorage.id }, function (res) {
  //    console.log(res.data)
  if (res.code == 0) {
    var tpl1 = '',tpl2 = '',tpl3 = '',tpl4 = '',tpl5 = '',x, y, z, m, n,k = 0,j = 0,l = 0,h = 0;
    sessionStorage.monitorFlag = '';
    for (var i = 0; i < res.data.length; i++) {
      tpl1 += '<option data-stid="'+res.data[i].id+'" value="' + i + '">' + res.data[i].companyName + '</option>';
    };
    $('#company').append(tpl1);

    $('#monitorPoint').change(function () {
      $('.btn_s,.myprint').attr('disabled',true);
      l = 0,j = 0,h = 0;
      sessionStorage.monitorFlag = '';
      n = parseInt($('#monitorPoint  option:selected').val());
      m = parseInt($('#linesOnBranch  option:selected').val());
      z = parseInt($('#generatrix  option:selected').val());
      x = parseInt($('#company  option:selected').val());
      y = parseInt($('#site  option:selected').val());
      if(n<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterSortList[z].linesOnBranchDtos[m].monitorPointDtos;
        if(a.length>0){
          $('.btn_s').removeAttr('disabled');
          for (let i of a) {
            if (h == n) {
              sessionStorage.monitorFlag = i.monitorFlag;
            };
            h++;
          };
          const equiptype = $('#monitorPoint option:selected').data('equiptype');
          if(equiptype=='矩阵式红外成像测温终端'){
            infrared();
          }else{
            $('.hidinf').show();
            $('.infrared').hide();
            $('#monitorPoint option:selected').data('type')=='温度采集器'?sessionStorage.tabID='newtemper':sessionStorage.tabID='temp';
            $('#monitorPoint option:selected').data('type')=='温度采集器'?sessionStorage.protectorType='温度采集器':sessionStorage.protectorType='过电压保护器';
          };
        };
      };
    });
    $('#linesOnBranch').change(function () {
      $('.btn_s,.myprint').attr('disabled',true);
      tpl5 = '',l = 0,j = 0,h = 0;
      sessionStorage.monitorFlag = '';
      $('#monitorPoint').empty().append('<option data-stid="allst" value="999">请选择</option>');
      m = parseInt($('#linesOnBranch  option:selected').val());
      z = parseInt($('#generatrix  option:selected').val());
      x = parseInt($('#company  option:selected').val());
      y = parseInt($('#site  option:selected').val());
      if(m<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterSortList[z].linesOnBranchDtos[m].monitorPointDtos;
        if(a.length>0){
          for (let i of a) {
            tpl5 += '<option data-stid="'+i.id+'" data-type="' + i.hitchType+'" data-equiptype="' + i.type + '" value="' + h + '">' + i.pointName + '</option>';
            h++;
          };
          $('#monitorPoint').append(tpl5);
        };
      };
    });
    $('#generatrix').change(function () {
      $('.btn_s,.myprint').attr('disabled',true);
      tpl4 = '',l = 0,j = 0,h = 0;
      sessionStorage.monitorFlag = '';
      $('#linesOnBranch,#monitorPoint').empty().append('<option data-stid="allst" value="999">请选择</option>');
      z =  parseInt($('#generatrix  option:selected').val());
      x =  parseInt($('#company  option:selected').val());
      y =  parseInt($('#site  option:selected').val());
      if(z<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterSortList[z].linesOnBranchDtos;
        if(a.length>0){
          for (let i of a) {
            tpl4 += '<option data-stid="'+i.id+'" value="' + l + '">' + i.branchName + '</option>';
            l++;
          };
          $('#linesOnBranch').append(tpl4);
        };
      };
    });
    $('#site').change(function () {
      $('.btn_s,.myprint').attr('disabled',true);
      tpl3 = '',j = 0;
      sessionStorage.monitorFlag = '';
      $('#generatrix,#linesOnBranch,#monitorPoint').empty().append('<option data-stid="allst" value="999">请选择</option>');
      x = parseInt($('#company option:selected').val());
      y = parseInt($('#site option:selected').val());
      if(y<999){
        var a = res.data[x].monitorStationDtos[y].linesOnMasterSortList;
        if(a.length>0){
          for (let i of a) {
            tpl3 += '<option data-stid="'+i.id+'" value="' + j + '">' + i.masterName + '</option>';
            j++;
          };
          $('#generatrix').append(tpl3);
        };
      };
    });
    $('#company').change(function () {
      $('.btn_s,.myprint').attr('disabled',true);
      tpl2 = '',k = 0,j = 0;
      sessionStorage.monitorFlag = '';
      $('#site,#generatrix,#linesOnBranch,#monitorPoint').empty().append('<option data-stid="allst" value="999">请选择</option>');
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
    searchType();//判断监测设备类型
  } else {
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
  // 通过保存的下拉框设置当前选中支线
  $(`#linesOnBranch option[data-stid=${sessionStorage.stbranch}]`).attr('selected',true);
  $('#linesOnBranch').change();
  // 通过保存的下拉框设置当前选中监测设备
  $(`#monitorPoint option[data-stid=${sessionStorage.stcheckout}]`).attr('selected',true);
  $('#monitorPoint').change();
}

$(function(){
  // 第一次进来执行温度波形 初始化  organizationData 由于修改了下拉框，会自动请求波形图
  // $('#' + sessionStorage.tabID).click();
  // 跳转
  $('#btn-1').on('click', function () {
    window.parent.$("#iframepage").attr("src", 'back9_1_DailyMasterInfo.html?v=1.6.22');
  });
  /*用户-查询*/
  $('.btn_s').bind('click', function (e) {
    $('#' + sessionStorage.tabID).click();
  });
  // resize
  $(window).resize(function () {
    myChart_mains_temp.resize();
    myChart_mains_humidity.resize();
    myChart_mains_leakElec.resize();
    myChart_mains_acionCount.resize();
    myChart_mains_newtemper.resize();
  });
  // 打印
  $('.myprint').click(function(){
    const _c = $('#company option:selected').text(),//公司：
          _s = $('#site option:selected').text(),//监测站：
          _g = $('#generatrix option:selected').text(),//母线：
          _l = $('#linesOnBranch option:selected').text(),//支线：
          _m = $('#monitorPoint option:selected').text(),//监测设备：
          _stc = sessionStorage.monitorFlag,//设备标识
          _prt = sessionStorage.protectorType,//保护器类型
          _ts = $('#timeStart').val()+' 00:00:00',//开始时间
          _te = $('#timeEnd').val()+' 23:59:59';//结束时间
    const myData = {companyName:_c,moritorStationName:_s,masterName:_g,branchName:_l,pointName:_m,sensorId:_stc,protectorType:_prt,timeStart:_ts,timeEnd:_te};
    POST('/daily/statement/pointExportExcel',myData,function(res){
      console.log(res)
      if(res.code==119){
        layer.msg(res.msg)
      };
    },function(){
      $('.loadjy').addClass('op');
    },function(){
      $('.loadjy').removeClass('op');
    },true,function(){
      var downloadUrl = `${rooturl}/daily/statement/pointExportExcel?token=${sessionStorage.token}&companyName=${encodeURIComponent(_c)}&moritorStationName=${encodeURIComponent(_s)}&masterName=${encodeURIComponent(_g)}
      &branchName=${encodeURIComponent(_l)}&pointName=${encodeURIComponent(_m)}&sensorId=${encodeURIComponent(_stc)}&protectorType=${encodeURIComponent(_prt)}&timeStart=${encodeURIComponent(_ts)}&timeEnd=${encodeURIComponent(_te)}`;
      $('.myprinta').attr('href', downloadUrl);
      $('.myprinta')[0].click();
    });
  });
})
