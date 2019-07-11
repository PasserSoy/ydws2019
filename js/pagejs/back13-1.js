layer.config({
  skin: 'layui-layer-molv'
})

var monitorFlag = getPropetyVal('monitorFlag');
var isSolve_ = getPropetyVal('isSolve');
var masterName_ = decodeURI(getPropetyVal('masterName'));
//    alert(masterName_)
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  isSolve: isSolve_,
  monitorFlag: monitorFlag,
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
  queryData({
    page: $('.nowpage').text(),
    rows: mypagec,
    isSolve: isSolve_,
    monitorFlag: monitorFlag,
    alarmLeve: 0
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/eric/getFaultGroundInfoForPageByConditions", data, function (res) {
    if (res.code == '0') {
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      var dataList = res.data.list;
      // console.log(dataList)
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
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + dataList[i].masterName + '</td>' +
          '<td>' + dataList[i].masterAddress + '</td>' +
          '<td>' + fname + '</td>' +
          '<td>' + dataList[i].protectorType + '</td>' +
          '<td>' + dataList[i].phase + '</td>' +
          '<td>' + dataList[i].times.slice(0, -4) + '</td>' +
          '<td class="td-manage">' +
          '<a dataid = ' + dataList[i].id + ' href="back13_3_FaultEcharts.html?v=1.6.22&autoId=' + dataList[i].autoId+ '&monitorStationName=' + encodeURI(dataList[i].monitorStationName) +
          '&fname=' + encodeURI(fname)+ '&type=' + ftype  + '&masterName=' + encodeURI(dataList[i].masterName) +'&aname=' + encodeURI(aname) +
          '&protectorType=' + dataList[i].protectorType+'&masterAddress=' + encodeURI(dataList[i].masterAddress) + '&times=' + dataList[i].times.slice(0, -4) + '&devid=' + dataList[
            i].devid + '&monitorFlag=' + monitorFlag + '&isSolve_=' + dataList[i].isSolve_ + '&phase=' + dataList[i].phase +
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
    if(allCount==0){// 是否有数据
      $('#noTableData').show();$('#Member_Ratings').hide();
    }else{
      $('#noTableData').hide();$('#Member_Ratings').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, true);
}

// 组织查询
function manageQueryData(nowpage) {
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    isSolve: isSolve_,
    monitorFlag: monitorFlag,
    alarmLeve: 0
  };
  queryData(data);
}