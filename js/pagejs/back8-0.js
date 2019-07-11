// 初始化监测站下拉框
var station = {
  stationName: '',
  stationAddress: '',
  rows: 10000,
  createBy: sessionStorage.id
};
POST("/sys/monitorStation/queryMonitorStation.v1", station, function (res) {
  var options = '<option value="">请选择</option>';
  if (res.data.list[0]!==null) {
    res.data.list.forEach(x => {
      options += `<option value="${x.id}">${x.stationName}</option>`;
    });
  };
  $('select[name=station]').append(options);
}, function () {
  $('.loadjy').addClass('op');
}, '', true);
// 初始化故障类型下拉框
// var faultTypeArr = [
//     {val:10,name:'金属接地'},
//     {val:11,name:'系统过电压'},
//     {val:12,name:'过电压'},
//     {val:13,name:'PT断线'},
//     {val:14,name:'欠压'},
//     {val:15,name:'系统短路'},
//     {val:16,name:'弧光接地 '}
// ];
// var faultTypeOption='<option value="0">请选择</option>';
// faultTypeArr.forEach(x=>{
//     faultTypeOption +=`<option value="${x.val}">${x.name}</option>`;
// })
// $('select[name=faulttype]').append(faultTypeOption);
// 初始化时间赋值
// var timeStart = $("#timeStart").val();
// var timeEnd = $("#timeEnd").val();
// var mydate=new Date();//通过new方法创建对象
// var _year = mydate.getFullYear();
// var _month = (mydate.getMonth()+1)<10?'0'+(mydate.getMonth()+1):mydate.getMonth()+1;
// var _date = mydate.getDate()<10?'0'+mydate.getDate():mydate.getDate();
// var _mydate = _year+'-'+_month+'-'+_date;
// if($('#timeStart').val()){
//     timeStart = $('#timeStart').val()+' 00:00:00:000';
// }else{
//     $('#timeStart').val(_mydate);
//     timeStart = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' 00:00:00:000';
// }
// if($('#timeEnd').val()){
//     timeEnd = $('#timeEnd').val()+' 23:59:59:000';
// }else{
//     $('#timeEnd').val(_mydate);
//     timeEnd = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' 23:59:59:000';
// }
// 初始化时间赋值

$('#btn-2').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back8_2_FaultServerFault.html?v=1.6.22&deviceIds=' + sessionStorage.queryServerFaultIds);
})

layer.config({
  skin: 'layui-layer-molv'
})
var isSolve = $('select[name="isSolve"]').val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  isSolve: isSolve,
  alarmLeve: 0
};
queryData(data);

$('#pagechange').on('change',function(){
  const totalpage = $('.numtotalpp').text()*1,// 总条数
        curpage = $('.nowpage').text()*1,// 当前页
        mypagec = $(this).val();// 每页数
  const respage = Math.ceil(totalpage/mypagec);// 切换后的总页数
  $('.numtotal').text(respage);
  // 总页数 = Math.ceil(总条数/每页数)
  // 当总页数 < 当前页时，将当前页设置为最后一页
  if(curpage!=1 &&　respage<curpage){
    $('.nowpage').text(respage);
  };
  manageQueryData($('.nowpage').text());
});

function queryData(data) {
  // var _url = search==true?'/eric/getFaultGroundInfoForPageByConditions':'/eric/getFaultGroundInfoForPage.v3';//为true是查询
  var _url = '/eric/getFaultGroundInfoForPageByConditions';
  var allCount=0;// 是否有数据
  POST(_url, data, function (res) {
    if (res.code == '0') {
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      var dataList = res.data.list;
      $('#tbody').empty();
      $('.ui_input_txt01').attr('max', page);
      $('.ui_input_txt01').val($(".nowpage").text());
      var html = '';
      for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].phase == '0') {
          dataList[i].phase = "没有相位";
        } else if (dataList[i].phase == '1') {
          dataList[i].phase = "A相";
        } else if (dataList[i].phase == '2') {
          dataList[i].phase = "B相";
        }else if (dataList[i].phase == '3') {
          dataList[i].phase = "AB相";
        } else if (dataList[i].phase == '4') {
          dataList[i].phase = "C相";
        }else if (dataList[i].phase == '5') {
          dataList[i].phase = "AC相";
        }else if (dataList[i].phase == '6') {
          dataList[i].phase = "BC相";
        }else if (dataList[i].phase == '7') {
          dataList[i].phase = "ABC相";
        } else {
          dataList[i].phase = "未知相位";
        };
        if (dataList[i].type == '1') {
          dataList[i].type = "保护器异常";
        } else if (dataList[i].type == '2') {
          dataList[i].type = "过压故障";
        } else if (dataList[i].type == '3') {
          dataList[i].type = "接地故障";
        };
        /*故障类型*/
        var ftype = Number(dataList[i].faultType);
        var fname = '异常';
        switch (ftype) {
          case 10: fname = '金属接地'; break;
          case 11: fname = '系统过电压'; break;
          case 12: fname = '过压'; break;
          case 13: fname = 'PT断线'; break;
          case 14: fname = '欠压'; break;
          case 15: fname = '系统短路'; break;
          case 16: fname = '弧光接地'; break;
          case 20: fname = '过热'; break;
          case 21: fname = '湿度超标'; break;
          case 22: fname = '泄漏'; break;
          case 23: fname = '电量不足'; break;
          default: fname = '异常';
        };
        /*报警级别*/
        var aname = '未知级别';
        // if(ftype==10||ftype==11||ftype==12||ftype==13||ftype==14||ftype==15||ftype==16){
        //     aname='高级报警';
        // }else{
        //     aname='异常';
        // }
        aname = dataList[i].alarmLeve;
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        // console.log(isSolve)
        var disposeState = isSolve == 'true' ? dataList[i].distimes.slice(0, -4) : '未处理'; // 故障解除时间
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + dataList[i].monitorStationName + '</td>' +
          '<td>' + aname + '</td>' +
          '<td>' + dataList[i].masterName + '</td>' +
          '<td>' + fname + '</td>' +
          '<td>' + dataList[i].protectorType + '</td>' +
          '<td style="white-space: nowrap;">' + dataList[i].times.slice(0, -4) + '</td>' +
          '<td style="white-space: nowrap;">' + disposeState + '</td>' +
          //                            '<td><a href="back24_reportYearDetail.html?projectName='+encodeURI(dataList[i].itemName)+'&nowpage='+$(".nowpage").text()+'&limit='+limit+'&sumMoney='+dataList[i].sumMoney+'">'+dataList[i].sumUser+'人</a></td>'+
          '<td class="td-manage">' +
          '<a dataid = ' + dataList[i].id + ' href="back8_1_FaultGroundInfo.html?v=1.6.22&autoId=' + dataList[i].autoId + '&monitorStationName=' + encodeURI(dataList[i].monitorStationName) + '&masterName=' + encodeURI(dataList[i].masterName) +
          '&protectorType=' + dataList[i].protectorType +'&aname=' + encodeURI(aname) + '&fname=' + encodeURI(fname) + '&type=' + ftype + '&times=' + dataList[i].times.slice(0, -4) + '&devid=' + dataList[i].devid + '&phase=' + dataList[i].phase +
          '" ' + '>查看</a>' +
          '</td>' +
          '</tr>';
      }
      $('#tbody').append(html);

      if ($('.numtotal').text() == '1') {
        $('.beforPage').css({
          background: '#ccc',
          cursor: 'default'
        })
        $('.laterPage').css({
          background: '#ccc',
          cursor: 'default'
        })
      } else {
        if ($('.nowpage').text() == '1') {
          $('.beforPage').css({
            background: '#ccc',
            cursor: 'default'
          })
          $('.laterPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
        } else if ($('.nowpage').text() == $('.numtotal').text()) {
          $('.beforPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
          $('.laterPage').css({
            background: '#ccc',
            cursor: 'default'
          })
        } else {
          $('.beforPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
          $('.laterPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
        }
      }
    };    
    if(allCount==0){// 没有数据
      $('#noTableData').show();$('.table_menu_list').hide();
    }else{
      $('#noTableData').hide();$('.table_menu_list').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, true);
}

// 组织查询
function manageQueryData(nowpage) {
  isSolve = $('select[name="isSolve"]').val();
  monitorStationId = $('select[name="station"]').val();
  beginTime = $('#timeStart').val() == '' ? '' : new Date($('#timeStart').val() + ' 00:00:00:000').getTime();
  endTime = $('#timeEnd').val() == '' ? '' : new Date($('#timeEnd').val() + ' 23:59:59:000').getTime();
  faultType = $('select[name="faulttype"]').val();
  alarmLeve = $('select[name="alarmLeve"]').val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    isSolve: isSolve,
    monitorStationId: monitorStationId,
    beginTime: beginTime,
    endTime: endTime,
    faultType: faultType,
    alarmLeve: alarmLeve
  };
  var today = new Date(new Date().toLocaleDateString()+' 00:00:00').getTime();
  if(beginTime*1>today*1){
    layer.msg('初始时间不能大于当日');return;
  };
  if(endTime!=''&&endTime*1<beginTime*1){
    layer.msg('结束时间应该在初始时间之后');return;
  };
  queryData(data);
}
$(function () {
  // 报警-故障级联
  $('select[name=alarmLeve]').change(function () {
    var val = $(this).val();
    // $('select[name=faulttype]').val('');
    $('select[name=faulttype] option[data-type]').hide();
    $(`select[name=faulttype] option[data-type=${val}]`).show();
    // $(`select[name=faulttype] option[data-type=0]`).show();
    // $('select[name=faulttype]').val('');
    if(val==1){/* 中级报警 */
      $('select[name=faulttype]').val(11);
    }else if(val==2){/* 高级报警 */
      $('select[name=faulttype]').val(10);
    }else{
      $('select[name=faulttype]').val('');
    }
  });
  // 点击下拉框后立即查询
  // $('.search_content li select').change(function(){
  //   $('.btn_search').click();
  // });
  // 重置
  $('.btn_reset').on('click',function(){
    $('[name=isSolve]').val('false');
    $('[name=station]').val('');
    $('[name=alarmLeve]').val('0');
    $('[name=faulttype]').val('');
    $('[name=start]').val('');
    $('[name=end]').val('');
    $('.btn_search').click();
  });
});