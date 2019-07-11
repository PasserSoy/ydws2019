layer.config({
  skin: 'layui-layer-molv'
})

var monitorStationId = getPropetyVal('monitorStationId');
if (monitorStationId) {
  sessionStorage.monitorStationId = monitorStationId; //登录帐号名
}
const breadstation = decodeURI(getPropetyVal('breadstation'));
if (breadstation && breadstation!='null') {
  sessionStorage.breadstation = breadstation;
};
$('[data-bread=company]').text(sessionStorage.companyName);
$('[data-bread=station]').text(sessionStorage.breadstation);
// 如果是从主页跳转过来，返回按钮链接改为主页
if(sessionStorage.myIndex=='myIndex')$('#first_li .back').attr('href','myIndex.html?v=1.6.22');


$('.back_to_MonitorStation').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back3_2_MonitorStation.html?v=1.6.22');
})
$('.company_info').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back2_company.html?v=1.6.22');
})

var mobile = '';
var isActive = '';
var callB = false; // 增加、删除的异步操作

var masterName_find = $("#masterName_find").val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  monitorStationId: sessionStorage.monitorStationId,
  masterName: masterName_find
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
    monitorStationId: sessionStorage.monitorStationId,
    masterName: masterName_find
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/sys/linesOnMaster/queryLinesOnMaster.v1", data, function (res) {
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
      for (var i = 0; i < list.length; i++) {
        var line = `<i class="line">离线</i>`;
        if (!list[i].masterName) {
          list[i].masterName = '-';
        }
        if (!list[i].preMasterName) {
          list[i].preMasterName = '-';
        }
        // if(!list[i].relatedType){
        //     list[i].relatedType = '-';
        // }
        if (!list[i].monitorFlag) {
          list[i].monitorFlag = '';
        }
        if (!list[i].hitchType) {
          list[i].hitchType = '-';
        }
        if (!list[i].createTime) {
          list[i].createTime = '-';
        }
        if (list[i].isOnline == true) {
          line = `<i class="line online">在线</i>`;
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + list[i].masterName + '</td>' +
          '<td>' + list[i].preMasterName + '</td>' +
          '<td><a href="back5_LinesOnBranch.html?v=1.6.22&linesOnMasterId=' + list[i].id +'&breadmomline=' + encodeURI(list[i].masterName) + '" class="liveA" data-pow="' + list[i].hitchType + '" data-name="' + list[i].masterName + '">' + list[i].linesOnBranchDtos.length + '</a></td>' +
          '<td>' + list[i].monitorFlag + '</td>' +
          '<td>'+line+'</td>'+
          '<td>' + list[i].hitchType + ' kV</td>' +
          '<td>' + list[i].createTime + '</td>' +
          '<td class="td-manage">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataId ="' + list[i].id + '" dataMasterName="' + list[i].masterName + '" dataPreMasterId="' + list[i].preMasterId + '"' +
          ' dataMonitorFlag="' + list[i].monitorFlag + '" dataHitchType="' + list[i].hitchType + '" dataCreateTime="' + list[i].createTime +
          '"  href="javascript:;" title="编辑" id="edit">' +
          '编辑</a> &nbsp;' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataid="' + list[i].id + '" href="javascript:;" title="删除" id="delete" >删除</a> &nbsp;' +
          '<a onClick=' + 'sync800Config(this,"1")' + ' dataId="' + list[i].id + '" dataMonitorFlag="' + list[i].monitorFlag + '" href="javascript:;" title="设置" id="delete">同步</a>' +
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
      //实时预览
      // livepreview(res.data.list);
    }; /*./res.code*/
    if(allCount==0){// 是否有数据
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
  masterName_find = $("#masterName_find").val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    monitorStationId: sessionStorage.monitorStationId,
    masterName: masterName_find
  };
  queryData(data);
}

/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataid");
  var data = {
    monitorStationIds: dataid
  };
  layer.open({
    title: "提示",
    content: '删除此母线，包含的支线将一起删除，确定要继续吗？',
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
      $(".nowpage").text(parseInt(nowpage));
      manageQueryData(nowpage); // 组织条件查询
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      linesOnMaster_del_Info(data, nowpage)
      // $(obj).parents("tr").remove();
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}

//删除信息:被引用
function linesOnMaster_del_Info(data, nowpage) {
  callB = false;
  POST("/sys/linesOnMaster/deleteLinesOnMaster.v1", data, function (res) {
    // console.log(res)
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
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


function initMasterList(linesOnMasterId_edit) {
  var data = {
    monitorStationId: sessionStorage.monitorStationId,
    type: "pc",
    linesOnMasterId_edit: linesOnMasterId_edit
  };
  $('select[name="preMasterId"]').empty();
  POST("/sys/linesOnMaster/queryLinesOnMasterIds.v1", data, function (res) {
    if (res.code == '0') {
      var resultList = res.data;
      var selected_dataName = '<option  id="preMasterId_selected" value="">请选择</option>';
      for (var i = 0; i < resultList.length; i++) {
        selected_dataName += '<option  value="' + resultList[i].id + '">' + resultList[i].masterName + '</option>';
      }
      $('select[name="preMasterId"]').append(selected_dataName);
    }

  });
}




/*用户-添加*/
$('#member_add').on('click', function () {
  initMasterList();
  $("#masterName").val('');
  $("#preMasterId_selected").prop("selected", 'selected');
  // $("#relatedType_selected").prop("selected", 'selected');
  $("#monitorFlag").val('');
  $("#hitchType_selected").prop("selected", 'selected');

  layer.open({
    type: 1,
    closeBtn: 1,
    title: '添加母线',
    // maxmin: true,
    // shadeClose: true, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var masterName_add = $('#masterName').val();
      var preMasterId_add = $('select[name="preMasterId"]').val();
      // var relatedType_add  =  $('select[name="relatedType"]').val();
      var monitorFlag_add = $('#monitorFlag').val();
      var hitchType_add = $('select[name="hitchType"]').val();

      if (!masterName_add) {
        layer.msg("请填写母线名称！");$('#masterName').focus(); return;
      };
      if (!monitorFlag_add) {
        layer.msg("请填写设备标识！");$('#monitorFlag').focus(); return;
      };
      if (!hitchType_add) {
        layer.msg("请选择电压等级！"); return;
      };
      /// 设备标识验证 只能输入英文加数字
      if (/^[a-zA-Z]\w*$/gi.test(monitorFlag_add) == false) {
        layer.msg("设备标识只能输入英文开头加数字！");$('#monitorFlag').focus(); return;
      };
      // if(!preMasterId_add){
      //     layer.alert("请填写上一段母线！\r\n",{title: '提示框',  icon:0,});
      //     return;
      // }

      // if(!relatedType_add){
      //     layer.alert("请填写关联方式！\r\n",{title: '提示框',  icon:0,});
      //     return;
      // }

      /* if(!relatedType_add){
           layer.alert("请填写关联方式！\r\n",{title: '提示框',  icon:0,});
           return;
       }else{
           if((preMasterId_add && relatedType_add == '无关联') || (!preMasterId_add && relatedType_add == '母线关联') ){
               layer.alert("上一段母线和关联方式保持一致！\r\n",{title: '提示框',  icon:0,});
               return;
           }s
       }
       */

      var data1 = {
        masterName: masterName_add,
        preMasterId: preMasterId_add,
        monitorFlag: monitorFlag_add,
        // relatedType:relatedType_add,
        hitchType: hitchType_add,
        monitorStationId: sessionStorage.monitorStationId
      };
      $('.nowpage').text('1');
      addOrUpdateLinesOnMaster(data1, 1);
      // layer.close(index);
      // manageQueryData(1);
    }
  });
});

//保存
function addOrUpdateLinesOnMaster(data, nowpage) {
  callB = false;
  POST("/sys/linesOnMaster/addOrUpdateLinesOnMaster.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          console.log(res)
          layer.alert('成功！', { title: '提示框', icon: 1, },function(){
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


//  -==========================================

/*用户-编辑*/
function member_edit(obj, id) {
  var linesOnMasterId = $(obj).attr('dataId');
  initMasterList(linesOnMasterId);
  $("#masterName").val('');
  $("#preMasterId_selected").prop("selected", 'selected');
  // $("#relatedType_selected").prop("selected", 'selected');
  $("#monitorFlag").val('');
  $("#hitchType_selected").prop("selected", 'selected');

  var data_ = {
    monitorStationId: sessionStorage.monitorStationId,
    linesOnMasterId: linesOnMasterId
  };
  POST("/sys/linesOnMaster/queryLinesOnMasterIds.v1", data_, function (res) {
    if (res.code == '0') {
      var resultList = res.data[0];
      // $('select[name="relatedType"]').val(resultList.relatedType)
      $('select[name="preMasterId"]').val(resultList.preMasterId)
      $('select[name="hitchType"]').val(resultList.hitchType)

      $("#masterName").val(resultList.masterName);
      $("#monitorFlag").val(resultList.monitorFlag);
    }
  });


  layer.open({
    type: 1,
    closeBtn: 1,
    title: '编辑母线',
    // maxmin: true,
    // shadeClose:false, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var masterName_edit = $("#masterName").val();
      var preMasterId_add = $('select[name="preMasterId"]').val();
      var monitorFlag_edit = $("#monitorFlag").val();
      // var relatedType_edit  =  $('select[name="relatedType"]').val();
      var hitchType_edit = $('select[name="hitchType"]').val();

      if (!masterName_edit) {
        layer.msg("请填写母线名称！");$('#masterName').focus(); return;
      };
      if (!monitorFlag_edit) {
        layer.msg("请填写设备标识！");$('#monitorFlag').focus(); return;
      };
      if (!hitchType_edit) {
        layer.msg("请选择电压等级！"); return;
      };
      /// 设备标识验证 只能输入英文加数字
      if (/^[a-zA-Z]\w*$/gi.test(monitorFlag_edit) == false) {
        layer.msg("设备标识只能输入英文开头加数字！");$('#monitorFlag').focus(); return;
      };

      var data = {
        linesOnMasterId: linesOnMasterId,
        masterName: masterName_edit,
        preMasterId: preMasterId_add,
        monitorFlag: monitorFlag_edit,
        // relatedType:relatedType_edit,
        hitchType: hitchType_edit,
        monitorStationId: sessionStorage.monitorStationId
      };
      addOrUpdateLinesOnMaster(data);
      // layer.close(index);
      nowpage = $('.nowpage').text();
      manageQueryData(nowpage);
    },
    btn2: function (index) {
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      manageQueryData(nowpage); // 组织条件查询
    }
  });
}


/* 设置 */
function sync800Config(obj, id) {
  $("#tempMax_Line").val('');
  $("#tempMin_Line").val('');
  $("#tempMax_Pro").val('');
  $("#tempMin_Pro").val('');
  $("#humdityMax").val('');
  $("#humdityMin").val('');
  $("#leakageCurMax").val('');
  $("#modulus").val('');
  $("#maxRateValue").val('');
  $("#ratioPT").val('');
  $("#ratioCT").val('');
  $("#batteryMin").val('');
  $("#undervoltage").val('');
  $('select[name="driveTestFlag_state"]').val('1');/* 传动实验 */
  $('select[name="distanceFlag_state"]').val('1');

  var linesOnMasterId = $(obj).attr('dataId');
  var devId = $(obj).attr('dataMonitorFlag'); //设备id就是设备标识
  //        alert(devId)
  if (!devId) {
    layer.msg('同步前请设置母线设备号!');
    return;
  };
  POST("/eric/getConfig800", {devid:devId}, function (res) {// 初始化数据
    if (res.code == '0') {
      $("#tempMax_Line").val(res.data.tempMax_Line);/* 电气节点温度上限 */
      $("#tempMin_Line").val(res.data.tempMin_Line);/* 电气节点温度下限 */
      $("#tempMax_Pro").val(res.data.tempMax_Pro);/* 保护器腔体温度上限 */
      $("#tempMin_Pro").val(res.data.tempMin_Pro);/* 保护器腔体温度下限 */
      $("#humdityMax").val(res.data.humdityMax);/* 保护器腔体湿度上限 */
      $("#humdityMin").val(res.data.humdityMin);/* 保护器腔体湿度下限 */
      $("#leakageCurMax").val(res.data.leakageCurMax);/* 泄漏电流上限 */
      $("#modulus").val(res.data.modulus);/* 过压门限系数 */
      $("#maxRateValue").val(res.data.maxRateValue);/* 一次额定电压 */
      $("#ratioPT").val(res.data.ratioPT);/* PT变比 */
      $("#ratioCT").val(res.data.ratioCT);/* CT变比 */
      $("#batteryMin").val(res.data.batteryMin);/* 电池电量报警下限 */
      $("#undervoltage").val(res.data.voltageMin);/* 欠压门限系数 */
      $('select[name="driveTestFlag_state"]').val(res.data.driveTestFlag);/* 传动实验 */
      $('select[name="distanceFlag_state"]').val(res.data.distanceFlag);/* 就地和远方 */
      layer.open({
        type: 1,
        closeBtn: 1,
        title: '同步设置数据到终端',
        // maxmin: true,
        // shadeClose:false, //点击遮罩关闭层
        area: ['500px'],
        content: $('#Sync800Config'),
        btn: ['提交', '取消'],
        yes: function (index, layero) {
          var tempMax_Line = $("#tempMax_Line").val();
          var tempMin_Line = $("#tempMin_Line").val();
          var tempMax_Pro = $("#tempMax_Pro").val();
          var tempMin_Pro = $("#tempMin_Pro").val();
          var humdityMax = $("#humdityMax").val();
          var humdityMin = $("#humdityMin").val();
          var leakageCurMax = $("#leakageCurMax").val();
          var modulus = $("#modulus").val();
          var maxRateValue = $("#maxRateValue").val();
          var ratioPT = $("#ratioPT").val();
          var ratioCT = $("#ratioCT").val();
          var batteryMin = $("#batteryMin").val();
          var undervoltage = $("#undervoltage").val();
    
          var driveTestFlag_state = $('select[name="driveTestFlag_state"]').val();
          var distanceFlag_state = $('select[name="distanceFlag_state"]').val();
          var data = {
            tempMax_Line: tempMax_Line,
            tempMin_Line: tempMin_Line,
            tempMax_Pro: tempMax_Pro,
            tempMin_Pro: tempMin_Pro,
            humdityMax: humdityMax,
            humdityMin: humdityMin,
            leakageCurMax: leakageCurMax,
            modulus: modulus,
            maxRateValue: maxRateValue,
            ratioPT: ratioPT,
            batteryMin: batteryMin,
            ratioCT: ratioCT,
            undervoltage: undervoltage,
            driveTestFlag: driveTestFlag_state,
            distanceFlag: distanceFlag_state,
            monitorFlag: devId,
            sync_By_linesOnMasterId: linesOnMasterId
          };
          nowpage = $('.nowpage').text();
          addOrUpdateSync800Config(data, nowpage);
          // layer.close(index);
          // manageQueryData(nowpage);
        }
      });
    }else{
      layer.msg(res.msg);
    };
  });
}

//保存
function addOrUpdateSync800Config(data) {
  POST("/eric/Sync800Config.v1", data, function (res) {
    if (res.code == '0') {
      console.log(res)
      layer.alert('同步成功！', { title: '提示框', icon: 1, },function(){
        layer.closeAll();
      });
    }else{
      layer.msg(res.msg);
    };
  });
}

$(function () {
  // livepreview
  $('body').on('click', '.liveA', function () {
    sessionStorage.pow_ = $(this).data('pow');
    sessionStorage.name_ = $(this).data('name');
  });
})
/** 实时预览 */
function livepreview(x) {
  var _liDom = '';
  x.forEach(y => {
    // 分级
    var kv = '';
    switch (y.hitchType) {
      case '6':
        kv = 'kv6';
        break;
      case '35':
        kv = 'kv35';
        break;
      default:
        kv = 'kv10';
    }
    _liDom += `<li class="momline" data-pre="${y.preMasterName}" data-self="${y.masterName}">
        <span class="pow">${y.hitchType} kV</span><span class="name">${y.masterName}</span><div class="linep ${kv}"></div>
      </li>`;
  });
  $('.live-preview').empty().append(_liDom);
  $('.momline').each(function () {
    // 排序
    var _t = $(this),
      _pre = _t.data('pre');
    _t.before($('.momline[data-self=' + _pre + ']'));
  });
}