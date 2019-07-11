layer.config({
  skin: 'layui-layer-molv'
})

$('#companyName,[data-bread=company]').text(sessionStorage.companyName);
$('#btn-1').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back3_2_MonitorStation.html?v=1.6.22');
})

$('#back_to_company').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back2_company.html?v=1.6.22');
})
var callB = false; // 增加、删除的异步操作

var mobile_find = $("#mobile_find").val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  companyId: sessionStorage.companyId,
  mobile: mobile_find
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
    companyId: sessionStorage.companyId,
    mobile: mobile_find
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/api/member/queryMembers.v1", data, function (res) {
    if (res.code == '0') {
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      $('#memberCount').text(allnum);
      var list = res.data.list;
      $('#tbody').empty();
      $('.ui_input_txt01').attr('max', page);
      $('.ui_input_txt01').val($(".nowpage").text());
      var html = '';
      for (var i = 0; i < list.length; i++) { //<!--  stationName  stationAddress longitudeAndlatitude  companyDto 母线条数 支线条数  监测设备数 -->
        if (!list[i].userName) {
          list[i].userName = '-';
        }
        if (!list[i].account) {
          list[i].account = '-';
        }
        if (!list[i].mobile) {
          list[i].mobile = '-';
        }
        if (!list[i].email) {
          list[i].email = '-';
        }
        // if(!list[i].linesOnBranchName){
        //     list[i].linesOnBranchName=',';
        // }
        if (!list[i].monitorStationName) {
          list[i].monitorStationName = '-';
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + list[i].userName + '</td>' +
          //                            '<td>'+list[i].account+'</td>'+
          //                            '<td>'+list[i].password+'</td>'+
          '<td>' + list[i].mobile + '</td>' +
          '<td>' + list[i].email + '</td>' +
          '<td>' + list[i].monitorStationName + '</td>' +
          '<td class="td-manage">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataId="' + list[i].id + '" dataUserName="' + list[i].userName + '" dataPassword="' + list[i].password +
          '" dataMobile="' + list[i].mobile + '" dataEmail="' + list[i].email + '" dataMonitorStationName="' + list[i].monitorStationName + '" dataMonitorStationId="' + list[i].monitorStationId +
          '"  href="javascript:;" title="编辑" id="edit">' +
          '编辑</a> &nbsp;&nbsp;' +
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
    if(allCount==0){// 是否有数据
      $('#noTableData').show();$('.data_show,#Member_Ratings').hide();
    }else{
      $('#noTableData').hide();$('.data_show,#Member_Ratings').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
    callB = true;
  }, true);
}


// 左边下拉框初始化
function initSelectOnRoles(memberId) {
  $('#select1').empty(); // 清空下拉框
  var data = {
    companyId: sessionStorage.companyId,
    memberId: memberId
  };
  POST("/sys/monitorStation/queryMonitorStation.v1", data, function (res) {
    if (res.code == '0') {
      var resultList = res.data.list;
      var selected_dataName = '';
      for (var i = 0; i < resultList.length; i++) {
        selected_dataName += '<option  value="' + resultList[i].id + '">' + resultList[i].stationName + '</option>';
      }
      $('#select1').append(selected_dataName);
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
  }, false);
}

// 组织查询
function manageQueryData(nowpage) {
  mobile_find = $("#mobile_find").val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    companyId: sessionStorage.companyId,
    mobile: mobile_find
  };
  queryData(data);
}

/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataid");
  var data = {
    memberIds: dataid
  };
  layer.open({
    title: "提示",
    content: '确认要删除该巡检员吗？',
    area: ['350px', '170px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      member_del_detail(data, nowpage)
      // $(obj).parents("tr").remove();
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}
//删除信息:被引用
function member_del_detail(data, nowpage) {
  callB = false;
  POST("/api/member/deleteMembers.v1", data, function (res) {
    // console.log(res)
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
          //location.reload()
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      };
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  },'', true);
}

/*用户-添加*/
$('#monitorStation_add').on('click', function () {
  if (sessionStorage.permission.indexOf("授权") >= 0 || sessionStorage.permission.indexOf("admin") >= 0) {
    $('.selected_role').css('display', 'block')
  } else {
    $('.selected_role').css('display', 'none')
  }
  initSelectOnRoles(); //初始化下拉框
  $('#select2').empty(); // 清空右边下拉框
  $('#userName').val('');
  $('#password').val('');
  $('#mobile').val('');
  $('#email').val('');

  //        $("#linesOnBranch_selected").prop("selected", 'selected');
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '添加巡检员',
    // maxmin: true,
    // shadeClose: true, //点击遮罩关闭层
    area: ['470px'],
    content: $('#add_monitorStation_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {

      var userName_add = $('#userName').val();
      var password_add = $('#password').val();
      var mobile_add = $('#mobile').val();
      var email_add = $('#email').val();

      var monitorStationId_add = ''; // 角色Id
      $('#select2 option').each(function () {
        monitorStationId_add += $(this).attr("value") + ",";
      });

      //                    var linesOnBranchId_add  =  $('select[name="linesOnBranch"]').val();
      // var psd = /^[a-zA-Z]\w{5,13}$/;// 字母开头6-14位
      var psd = /\S{6,14}$/;// 字母开头6-14位
      var sj = /^1[3-9]\d{9}$/;// 电话号码
      if (!userName_add) {
        layer.msg("请填写巡检员姓名！");$('#userName').focus(); return;
      };
      if (!password_add) {
        layer.msg("请填写密码！");$('#password').focus(); return;
      }else{
        if(!psd.test(password_add)){
          layer.msg('只能输入6-14位英文、数字、符号！');$('#password').focus(); return;
        };
      };
      if (!mobile_add) {
        layer.msg("请填写电话号码！");$('#mobile').focus(); return;
      }else{
        if(!sj.test(mobile_add)){
          layer.msg('请输入正确的号码！');$('#mobile').focus(); return;
        };
      };
      if (!email_add) {
        layer.msg("请填写邮箱！");$('#email').focus(); return;
      };
      var data = {
        companyId: sessionStorage.companyId,
        userName: userName_add,
        password: hex_md5(password_add),
        // password:password_add,
        mobile: mobile_add,
        email: email_add,
        monitorStationId: monitorStationId_add
      };
      $('.nowpage').text('1');
      addOrUpdateAPPUser(data, 1);
      // layer.close(index);
      // manageQueryData(1);
    }
  });
});

/*用户-编辑*/
function member_edit(obj, id) {
  if (sessionStorage.permission.indexOf("授权") >= 0 || sessionStorage.permission.indexOf("admin") >= 0) {
    $('.selected_role').css('display', 'block')
  } else {
    $('.selected_role').css('display', 'none')
  }
  var memberId = $(obj).attr('dataId');

  initSelectOnRoles(memberId); //初始化下拉框
  $("#userName").val('');
  $("#password").val('');
  $("#mobile").val('');
  $("#email").val('');
  //        $("#linesOnBranch_selected").prop("selected", 'selected');
  $("#select2").empty();


  var dataUserName = $(obj).attr('dataUserName');
  var dataPassword = $(obj).attr('dataPassword');
  var dataMobile = $(obj).attr('dataMobile');
  var dataEmail = $(obj).attr('dataEmail');
  var dataMonitorStationName = $(obj).attr('dataMonitorStationName');



  $("#userName").val(dataUserName);
  //    $("#password").val(dataPassword);
  $("#password").val('******'); // 密码这里需要设置空，如果有参数才会更新
  $("#mobile").val(dataMobile);
  $("#email").val(dataEmail);

  // 获取角色列表来回显数据
  if (dataMonitorStationName.indexOf(',') != -1) {
    var rolesArr = dataMonitorStationName.split(',');
    console.log(rolesArr)
    $.each(rolesArr, function (i, item) { // 遍历数组查询
      $("#select1 option").each(function () {
        var txt = $(this).text(); // 获取中间的文字
        var id = $(this).val(); // 获取中间的文字
        console.log("txt" + txt + "---->id" + id)
        console.log("item" + item)
        console.log(txt.indexOf(item))
        console.log("type" + typeof (txt.indexOf(item) >= 0))
        if (item && txt.indexOf(item) >= 0) { // 如果存在则
          var $remove = $(this).remove(); //删除下拉列表中选中的项
          $remove.appendTo('#select2'); //追加给对方
        }
      });
    });
  }


  layer.open({
    type: 1,
    closeBtn: 1,
    title: '编辑巡检员',
    // maxmin: true,
    // shadeClose:false, //点击遮罩关闭层
    area: ['470px'],
    content: $('#add_monitorStation_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var userName_edit = $('#userName').val();
      var password_edit = $('#password').val();
      var mobile_edit = $('#mobile').val();
      var email_edit = $('#email').val();

      var monitorStationId_edit = ''; // 角色Id
      $('#select2 option').each(function () {
        monitorStationId_edit += $(this).attr("value") + ",";
      });

      // var psd = /^[a-zA-Z]\w{5,13}$/;// 字母开头6-14位
      var psd = /\S{6,14}$/;// 字母开头6-14位
      var sj = /^1[3-9]\d{9}$/;// 电话号码
      if (!userName_edit) {
        layer.msg("请填写巡检员姓名！");$('#userName').focus(); return;
      };
      if (!password_edit) {
        layer.msg("请填写密码！");$('#password').focus(); return;
      };
      if (!mobile_edit) {
        layer.msg("请填写电话号码！");$('#mobile').focus(); return;
      }else{
        if(!sj.test(mobile_edit)){
          layer.msg('请输入正确的号码！');$('#mobile').focus(); return;
        };
      };
      if (!email_edit) {
        layer.msg("请填写邮箱！");$('#email').focus(); return;
      };
      var data = {};
      if (password_edit && password_edit != '******') {
        if(!psd.test(password_edit)){
          layer.msg('只能输入6-14位英文、数字、符号！');$('#password').focus(); return;
        };
        data = {
          companyId: sessionStorage.companyId,
          memberId: memberId,
          userName: userName_edit,
          password: hex_md5(password_edit),
          mobile: mobile_edit,
          email: email_edit,
          monitorStationId: monitorStationId_edit
        };
      } else {
        data = {
          companyId: sessionStorage.companyId,
          memberId: memberId,
          userName: userName_edit,
          mobile: mobile_edit,
          email: email_edit,
          monitorStationId: monitorStationId_edit
        };
      }
      // console.log("data:"+JSON.stringify(data))
      nowpage = $('.nowpage').text();
      addOrUpdateAPPUser(data, nowpage);
      // layer.close(index);
      // manageQueryData(nowpage);

    }
  });
}

// 功能函数  巡检员保存和更新
function addOrUpdateAPPUser(data, nowpage) {
  callB = false;
  POST("/api/member/addOrUpdateAPPUser.v1", data, function (res) {
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


//下拉框交换JQuery
$(function () {
  //移到右边
  $('#add').click(function () {
    //获取选中的选项，删除并追加给对方
    $('#select1 option:selected').appendTo('#select2');
  });
  //移到左边
  $('#remove').click(function () {
    $('#select2 option:selected').appendTo('#select1');
  });
  //全部移到右边
  $('#add_all').click(function () {
    //获取全部的选项,删除并追加给对方
    $('#select1 option').appendTo('#select2');
  });
  //全部移到左边
  $('#remove_all').click(function () {
    $('#select2 option').appendTo('#select1');
  });
  //双击选项
  $('#select1').dblclick(function () { //绑定双击事件
    //获取全部的选项,删除并追加给对方
    $("option:selected", this).appendTo('#select2'); //追加给对方
  });
  //双击选项
  $('#select2').dblclick(function () {
    $("option:selected", this).appendTo('#select1');
  });
});