layer.config({
  skin: 'layui-layer-molv'
})
var linesOnBranchId = getPropetyVal('linesOnBranchId');
if (linesOnBranchId) {
  sessionStorage.linesOnBranchId = linesOnBranchId;
}
const breadbranch = decodeURI(getPropetyVal('breadbranch'));
if (breadbranch && breadbranch!='null') {
  sessionStorage.breadbranch = breadbranch;
};
$('[data-bread=company]').text(sessionStorage.companyName);
$('[data-bread=station]').text(sessionStorage.breadstation);
$('[data-bread=momline]').text(sessionStorage.breadmomline);
$('[data-bread=branch]').text(sessionStorage.breadbranch);

$('.back_to_MonitorBranch').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back5_LinesOnBranch.html?v=1.6.22');
})
$('.back_to_lineOnmaster').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back4_LinesOnMaster.html?v=1.6.22');
})
$('.back_to_MonitorStation').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back3_2_MonitorStation.html?v=1.6.22');
})
$('.company_info').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back2_company.html?v=1.6.22');
})


var mobile = '';
var isActive = '';
var callB = false; // 增加、删除的异步操作
var pointName_find = $("#pointName_find").val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  linesOnBranchId: sessionStorage.linesOnBranchId,
  pointName: pointName_find
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
    linesOnBranchId: sessionStorage.linesOnBranchId,
    pointName: pointName_find
  });
});
// <!--  pointName  pointAddress prePointId  relatedType monitorFlag   hitchType -->
function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/sys/monitorPoint/queryMonitorPoints.v1", data, function (res) {
    if (res.code == '0') {
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      var list = res.data.list;
      $('#tbody').empty();
      $('.ui_input_txt01').attr('max', page);
      $('.ui_input_txt01').val($(".nowpage").text());
      var html = '';
      var line = `<i class="line">离线</i>`; // 监测设备状态
      for (var i = 0; i < list.length; i++) {
        if (!list[i].pointName) {
          list[i].pointName = '';
          // }if (!list[i].pointAddress) {
          //     list[i].pointAddress = '';
          // }if (!list[i].longitudeAndlatitude) {
          //     list[i].longitudeAndlatitude = '';
        }
        if (!list[i].monitorFlag) {
          list[i].monitorFlag = '-';
        }
        if (!list[i].hitchType) {
          list[i].hitchType = '-';
        }
        if (!list[i].positionName) {
          list[i].positionName = '-';
        }
        if (list[i].online == 'online') {
          line = `<i class="line online">在线</i>`;
        }
        if (!list[i].type) {
          list[i].type = '-';
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + list[i].pointName + '</td>' +
          // '<td>'+line+'</td>'+
          // '<td>'+list[i].pointAddress+'</td>'+
          // '<td>'+list[i].longitudeAndlatitude+'</td>'+
          '<td>' + list[i].positionName + '</td>' +
          '<td>' + list[i].monitorFlag + '</td>' +
          '<td>' + list[i].hitchType + '</td>' +
          '<td>' + list[i].type + '</td>' +
          '<td class="td-manage">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataId="' + list[i].id + '" dataPointName="' + list[i].pointName + '" dataPosition="' + list[i].position +
          '" dataMonitorFlag="' + list[i].monitorFlag + '" dataHitchType="' + list[i].hitchType + '" datatype="' + list[i].type +
          '"  href="javascript:;" title="编辑" id="edit">' +
          '编辑</a>&nbsp;&nbsp;' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataid="' + list[i].id + '" href="javascript:;" title="删除" id="delete" >删除</a>' +
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
      $('#noTableData').show();$('#Member_Ratings').hide();
    }else{
      $('#noTableData').hide();$('#Member_Ratings').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
    callB = true;
  }, true);

}

// 组织查询
function manageQueryData(nowpage) {
  pointName_find = $("#pointName_find").val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    linesOnBranchId: sessionStorage.linesOnBranchId,
    pointName: pointName_find
  };
  queryData(data);
}

//  -==========================================
function clickOne_0() {
  var allChecked = true;
  $(".checkOne_0").each(function () {
    if ($(this).prop("checked") == false) {
      allChecked = false;
    };
  });
}
/*用户-添加*/
$('#member_add').on('click', function () {
  //        initPointList();
  $("#pointName").val('');
  // $("#pointAddress").val('');
  // $("#longitudeAndlatitude").val('');
  //        $("#prePointId_selected").prop("selected", 'selected');
  //        $("#relatedType_selected").prop("selected", 'selected');
  $("#monitorFlag").val('');
  $("#hitchType_selected").prop("selected", 'selected');
  $("#position_selected").prop("selected", 'selected');
  $('tr.type').hide();

  //        $("input[type = 'checkbox']:checkbox").attr("checked", false);
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '添加监测设备',
    // maxmin: true,
    // shadeClose: true, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var pointName_add = $('#pointName').val();
      // var pointAddress_add=$('#pointAddress').val();
      // var longitudeAndlatitude_add=$('#longitudeAndlatitude').val();
      //                var prePointId_add  =  $('select[name="prePointId"]').val();
      //                var relatedType_add  =  $('select[name="relatedType"]').val();
      var monitorFlag_add = $('#monitorFlag').val();
      var hitchType_add = $('select[name="hitchType"]').val();
      var position_add = $('select[name="position"]').val();
      var type_add = $('select[name="type"]').val();

      if (!pointName_add) {
        layer.msg("请填写监测设备名称！");$('#pointName').focus(); return;
      };
      if (!position_add) {
        layer.msg("请选择所属位置！");return;
      };
      if (!monitorFlag_add) {
        layer.msg("请填写监测设备标识！");$('#monitorFlag').focus(); return;
      };
      if (!hitchType_add) {
        layer.msg("请选择所属分类！");return;
      };
      if (!type_add) {
        layer.msg("请选择保护器类型！");return;
      };
      /// 设备标识验证 只能输入英文加数字
      if (/^[a-zA-Z]\w*$/gi.test(monitorFlag_add) == false) {
        layer.msg("设备标识只能输入英文开头加数字！");$('#monitorFlag').focus(); return;
      };


      var data = {
        position: position_add,

        pointName: pointName_add,
        // pointAddress:pointAddress_add,
        // longitudeAndlatitude:longitudeAndlatitude_add,
        //                    preMasterId:prePointId_add,
        monitorFlag: monitorFlag_add,
        //                    relatedType:relatedType_add,
        hitchType: hitchType_add,
        type: type_add,
        linesOnBranchId: sessionStorage.linesOnBranchId
      };
      // console.log(data);
      $('.nowpage').text('1');
      addOrUpdateMonitorPoint(data, 1);
      // layer.close(index);
      // manageQueryData(1);

    }
  });
});

//保存
function addOrUpdateMonitorPoint(data, nowpage) {
  callB = false;
  POST("/sys/monitorPoint/addOrUpdateMonitorPoint.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          // console.log(res)
          layer.alert('成功！', { title: '提示框', icon: 1},function(){
            layer.closeAll();
          });
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      };
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}



function member_edit(obj, id) {
  //        initPointList();
  $("#pointName").val('');
  // $("#pointAddress").val('');
  // $("#longitudeAndlatitude").val('');
  //        $("#prePointId_selected").prop("selected", 'selected');
  //        $("#relatedType_selected").prop("selected", 'selected');
  $("#monitorFlag").val('');
  $("#hitchType_selected").prop("selected", 'selected');
  $("#position_selected").prop("selected", 'selected');

  var monitorPointId = $(obj).attr('dataId');
  var dataPointName = $(obj).attr('dataPointName');
  // var dataPointAddress=$(obj).attr('dataPointAddress');
  // var dataLongitudeAndlatitude=$(obj).attr('dataLongitudeAndlatitude');
  var dataPrePointId = $(obj).attr('dataPrePointId');
  var dataMonitorFlag = $(obj).attr('dataMonitorFlag');

  //        var dataRelatedType=$(obj).attr('dataRelatedType');
  var dataHitchType = $(obj).attr('dataHitchType');
  var dataPosition = $(obj).attr('dataPosition');
  // 保护器类型
  var datatype = $(obj).attr('datatype');
  var gdy = `<option value="">请选择保护器类型</option> <option value="电站型Z">电站型Z</option> <option value="电机型D">电机型D</option> <option value="电容型R">电容型R</option>`;
  var wd = `<option value="">请选择保护器类型</option> <option value="有源表带式B">有源表带式B</option> <option value="无源表带式G">无源表带式G</option> <option value="红外式H">红外式H</option><option value="微型W">微型W</option><option value="磁吸附式C">磁吸附式C</option><option value="RFID射频R">RFID射频R</option><option value="矩阵式红外成像测温终端">矩阵式红外成像测温终端</option>`;
  if (dataHitchType == '过电压保护器') {
    $('select[name=type]').empty().append(gdy);
    $('tr.type').show();
    $('select[name="type"]').val(datatype);
  } else if (dataHitchType == '温度采集器') {
    $('select[name=type]').empty().append(wd);
    $('tr.type').show();
    $('select[name="type"]').val(datatype);
  } else {
    $('tr.type').hide();
  }

  $('select[name="hitchType"]').val(dataHitchType)
  $('select[name="position"]').val(dataPosition)
  $("#pointName").val(dataPointName);
  // $("#pointAddress").val(dataPointAddress);
  // $("#longitudeAndlatitude").val(dataLongitudeAndlatitude);
  $("#monitorFlag").val(dataMonitorFlag);

  layer.open({
    type: 1,
    closeBtn: 1,
    title: '编辑监测设备',
    // maxmin: true,
    // shadeClose:false, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var pointName_edit = $("#pointName").val();
      // var pointAddress_edit = $("#pointAddress").val();
      // var longitudeAndlatitude_edit = $("#longitudeAndlatitude").val();
      //                var prePointId_add  =  $('select[name="preMasterId"]').val();
      var monitorFlag_edit = $("#monitorFlag").val();
      //                var relatedType_edit  =  $('select[name="relatedType"]').val();
      var hitchType_edit = $('select[name="hitchType"]').val();
      var position_edit = $('select[name="position"]').val();
      var type_edit = $('select[name="type"]').val();

      if (!pointName_edit) {
        layer.msg("请填写监测设备名称！");$('#pointName').focus(); return;
      };
      if (!position_edit) {
        layer.msg("请选择所属位置！");return;
      };
      if (!monitorFlag_edit) {
        layer.msg("请填写监测设备标识！");$('#monitorFlag').focus(); return;
      };
      if (!hitchType_edit) {
        layer.msg("请选择所属分类！");return;
      };
      if (!type_edit) {
        layer.msg("请选择保护器类型！");return;
      };
      /// 设备标识验证 只能输入英文加数字
      if (/^[a-zA-Z]\w*$/gi.test(monitorFlag_edit) == false) {
        layer.msg("设备标识只能输入英文开头加数字！");$('#monitorFlag').focus(); return;
      };

      var data = {
        position: position_edit,
        monitorPointId: monitorPointId,
        pointName: pointName_edit,
        // pointAddress:pointAddress_edit,
        // longitudeAndlatitude:longitudeAndlatitude_edit,
        //                    preMasterId:prePointId_add,
        monitorFlag: monitorFlag_edit,
        //                    relatedType:relatedType_edit,
        hitchType: hitchType_edit,
        type: type_edit,
        linesOnBranchId: sessionStorage.linesOnBranchId
      };
      nowpage = $('.nowpage').text();
      addOrUpdateMonitorPoint(data, nowpage);
      // layer.close(index);
      // manageQueryData(nowpage);
    }
  });
}


/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataId");
  var data = {
    monitorPointIds: dataid
  };
  layer.open({
    title: "提示",
    content: '确认要该监测设备吗？',
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      monitorPoint_del_Info(data, nowpage)
      // $(obj).parents("tr").remove();
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}

//删除信息:被引用
function monitorPoint_del_Info(data,nowpage) {
  callB = false;
  POST("/sys/monitorPoint/deleteMonitorPoint.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    // console.log(res)
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      };
    });
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}
$(function () {
  /////过电压保护器类型
  $('select[name=hitchType]').change(function () {
    var val = $(this).find('option:checked').val();
    var gdy = `<option value="">请选择保护器类型</option> <option value="电站型Z">电站型Z</option> <option value="电机型D">电机型D</option> <option value="电容型R">电容型R</option>`;
    var wd = `<option value="">请选择温度采集器类型</option> <option value="有源表带式B">有源表带式B</option> <option value="无源表带式G">无源表带式G</option> <option value="红外式H">红外式H</option><option value="微型W">微型W</option><option value="磁吸附式C">磁吸附式C</option><option value="RFID射频R">RFID射频R</option><option value="矩阵式红外成像测温终端">矩阵式红外成像测温终端</option>`;
    $('tr.type').find('select').val('');
    if (val == '过电压保护器') {
      $('select[name=type]').empty().append(gdy);
      $('tr.type').show().find('td:first-child').text('保护器类型：');
    } else if (val == '温度采集器') {
      $('select[name=type]').empty().append(wd);
      $('tr.type').show().find('td:first-child').text('温度采集器类型：');
    } else {
      $('tr.type').hide();
    }
  });
})