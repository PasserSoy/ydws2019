$('.layui-layer-btn0').html("确定");

layer.config({
  skin: 'layui-layer-molv'
});
var callB = false; // 增加、删除的异步操作
var mobilePhone = $("#mobilePhone_find").val();
var account = $("#account_find").val();
var isAdmin = $('select[name="isAdmin"]').val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  mobilePhone: mobilePhone,
  account: account,
  isAdmin: isAdmin
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
    mobilePhone: mobilePhone,
    account: account,
    isAdmin: isAdmin
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/back/sysUser/querySysUser.v1", data, function (res) {
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
        if (!list[i].position) {
          list[i].position = '-'
        }
        if (!list[i].account) {
          list[i].account = '-'
        }
        if (!list[i].mobilePhone) {
          list[i].mobilePhone = '-'
        }
        if (!list[i].permission) {
          list[i].permission = '-'
        }
        if (!list[i].createTime) {
          list[i].createTime = '-'
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + list[i].position + '</td>' +
          '<td>' + list[i].account + '</td>' +
          // '<td>' + list[i].password + '</td>' +
          '<td>' + '******' + '</td>' +
          '<td>' + list[i].mobilePhone + '</td>' +
          // '<td>'+list[i].permission+'</td>'+
          '<td>' + list[i].createTime + '</td>' +
          '<td class="td-manage none">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataid = ' + list[i].id + '  href="javascript:;" title="管理员编辑" id="edit">' +
          '编辑</a>&nbsp;&nbsp;' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataid = ' + list[i].id + ' href="javascript:;" title="管理员删除" id="delete" >删除</a>' +
          '</td>' +
          '</tr>';
      }
      $('#tbody').append(html);
      // 控制页面显示和隐藏

      if (sessionStorage.account == "admin") {
        $(".td-manage").removeClass('none');
        $(".td-manage_I").removeClass('none');
        $(".d_Confirm_Order_div").removeClass('none');
      }
      //分页图标展示
      var allow = { background: '#2494f9', cursor: 'pointer' },
          noAllow = { background: '#ccc', cursor: 'default' };
      if ($('.numtotal').text() == '1') {
        $('.beforPage').css(noAllow);
        $('.laterPage').css(noAllow);
      } else {
        if ($('.nowpage').text() == '1') {
          $('.beforPage').css(noAllow);
          $('.laterPage').css(allow);
        } else if ($('.nowpage').text() == $('.numtotal').text()) {
          $('.beforPage').css(allow);
          $('.laterPage').css(noAllow);
        } else {
          $('.beforPage').css(allow);
          $('.laterPage').css(allow);
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
    callB = true;
  }, true);
}

// 组织查询
function manageQueryData(nowpage) {
  mobilePhone = $("#mobilePhone_find").val();
  account = $("#account_find").val();
  isAdmin = $('select[name="isAdmin"]').val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    mobilePhone: mobilePhone,
    account: account,
    isAdmin: isAdmin
  };
  queryData(data);
}

/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataid");
  var data = {
    ids: dataid
  };
  $('.layui-layer-btn1').css('display', 'inline-block'); // 显示按钮
  $('.layui-layer-btn0').css('width', '50px !important'); // 按钮 btn1

  layer.open({
    title: "提示",
    content: '确认要删除此管理员吗？',
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      // $(obj).parents("tr").remove();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      member_del_Info(data, nowpage);
      layer.close(index); //如果设定了yes回调，需进行手工关闭
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}

//删除信息:被引用
function member_del_Info(data, nowpage) {
  callB = false;
  POST("/back/sysUser/deleteSysUser.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      }
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}

//单选框
$('input:radio').click(function () {
  $(this).attr('checked', true);
});

/*用户-添加*/
$('#member_add').on('click', function () {
  //        document.getElementsByClassName('layui-layer-btn0')[0].style.width=200+'px';
  //        $('.layui-layer-btn0').width(200);// 按钮 btn1
  // $('.layui-layer-btn0').css('width', 200 + 'px !important'); // 按钮 btn1
  //initSelectOnRoles();//初始化下拉框
  //        $('#select2').empty();// 清空右边下拉框
  $('#account_add').val('');
  $('#position_add').val('');
  $('#password_add').val('');
  $('#mobilePhone_add').val('');
  $("#permission_selected").prop("selected", 'selected');
  layer.open({
    type: 1,
    closeBtn: 1,
    offset: ['40px'],
    title: '添加管理员',
    // shadeClose: true, //点击遮罩关闭层
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['确定'],
    yes: function (index, layero) {
      document.getElementsByClassName('layui-layer-btn0')[0];
      var position = $('#position_add').val();
      var account = $('#account_add').val();
      var password = $('#password_add').val();
      var mobilePhone = $('#mobilePhone_add').val();
      var permission_add = $('select[name="permission"]').val();
      //
      var zys = /[^\w\u4e00-\u9fa5]/ig;// 中文英文数字无空格
      // var psd = /^[a-zA-Z]\w{5,13}$/;// 字母开头6-14位
      var psd = /\S{6,14}$/;// 字母开头6-14位
      var sj = /^1[3-9]\d{9}$/;// 电话号码
      if(!position) {
        layer.msg("请填写职位！");$('#position_add').focus(); return;
      }else{
        if(zys.test(position)){
          layer.msg('只能输入中文、英文、数字，不能包含空格！');$('#position_add').focus(); return;
        };
      };
      if(!account) {
        layer.msg("请填写用户名！");$('#account_add').focus(); return;
      }else{
        if(zys.test(account)){
          layer.msg('只能输入中文、英文、数字，不能包含空格！');$('#account_add').focus(); return;
        };
      };
      if(!password) {
        layer.msg("请填写密码！");$('#password_add').focus(); return;
      }else{
        if(!psd.test(password)){
          layer.msg('只能输入6-14位英文、数字、符号！');$('#password_add').focus(); return;
        };
      };
      if(!mobilePhone) {
        layer.msg("请填写电话号码！");$('#mobilePhone_add').focus(); return;
      }else{
        if(!sj.test(mobilePhone)){
          layer.msg('请输入正确的号码！');$('#mobilePhone_add').focus(); return;
        };
      };
      var data = {
        account: account,
        position: position,
        password: password,
        mobilePhone: mobilePhone,
        permission: permission_add
      };
      if (!account && typeof (account) != 'undefined') {
        layer.msg("用户名不能为空！");
      }
      $('.nowpage').text('1');
      saveOrUpDateInfo(data, 1);
      // layer.close(index);
      // manageQueryData(1);
    }
  });
});

function saveOrUpDateInfo(data,nowpage) {
  callB = false;
  POST("/back/sysUser/addOrUpdateSysUser.v1", data, function (res) {
    manageQueryData(nowpage);
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
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



//  -==========================================
/*用户-编辑*/
function member_edit(obj, id) {
  var dataid = $(obj).attr('dataid');
  $("#account_add").val('');
  $("#position_add").val('');
  $("#password_add").val('');
  $("#mobilePhone_add").val('');

  showingData({
    sysUserId: dataid
  });
  layer.open({
    type: 1,
    closeBtn: 1,
    offset: ['40px'],
    title: '编辑管理员',
    // shadeClose:false, //点击遮罩关闭层
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['确定'],
    yes: function (index, layero) {
      var account = $('#account_add').val();
      var position = $('#position_add').val();
      var password = $('#password_add').val();
      var mobilePhone = $('#mobilePhone_add').val();
      var permission_edit = $('select[name="permission"]').val();
      var zys = /[^\w\u4e00-\u9fa5]/ig;// 中文英文数字无空格
      // var psd = /^[a-zA-Z]\w{5,13}$/;// 字母开头6-14位
      var psd = /\S{6,14}$/;// 字母开头6-14位
      var sj = /^1[3-9]\d{9}$/;// 电话号码
      if(!position) {
        layer.msg("请填写职位！");$('#position_add').focus(); return;
      }else{
        if(zys.test(position)){
          layer.msg('只能输入中文、英文、数字，不能包含空格！');$('#position_add').focus(); return;
        };
      };
      if(!account) {
        layer.msg("请填写用户名！");$('#account_add').focus(); return;
      }else{
        if(zys.test(account)){
          layer.msg('只能输入中文、英文、数字，不能包含空格！');$('#account_add').focus(); return;
        };
      };
      if(!password) {
        layer.msg("请填写密码！");$('#password_add').focus(); return;
      }else{
        if(!psd.test(password)){
          layer.msg('只能输入6-14位英文、数字、符号！');$('#password_add').focus(); return;
        };
      };
      if(!mobilePhone) {
        layer.msg("请填写电话号码！");$('#mobilePhone_add').focus(); return;
      }else{
        if(!sj.test(mobilePhone)){
          layer.msg('请输入正确的号码！');$('#mobilePhone_add').focus(); return;
        };
      };
      var data = {
        id: dataid,
        account: account,
        position: position,
        password: password,
        mobilePhone: mobilePhone,
        permission: permission_edit
      };
      nowpage = $('.nowpage').text();
      saveOrUpDateInfo(data, nowpage);
      // layer.close(index);
      // manageQueryData(nowpage);
    }
  });
}

// 回显数据 http://hechuanzhen.iteye.com/blog/1878886
function showingData(data) {
  POST("/back/sysUser/querySysUser.v1", data, function (res) {
    if (res.code == '0') {
      var dataList = res.data.list[0];
      $("#account_add").val(dataList.account);
      $("#position_add").val(dataList.position);
      $("#password_add").val(dataList.password);
      $("#mobilePhone_add").val(dataList.mobilePhone);
      $('select[name="permission"] option').each(function () {
        if ($(this).val() == dataList.permission) {
          $(this).attr("selected", true);
        }
      });
    }
  });
}

// 左边下拉框初始化
function initSelectOnRoles() {
  $('#select1').empty(); // 清空下拉框
  POST("/sys/role/queryRoles.v1", data, function (res) {
    if (res.code == '0') {
      var list = res.data.list;
      var selected_type = ''
      for (var i = 0; i < list.length; i++) {
        selected_type += '<option ' + ' value="' + list[i].id + '">' + list[i].name + '</option>';
      }
      $('#select1').append(selected_type);
    }
  });
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
$(function () {
  // if (sessionStorage.navId != 'back1_manager') {
  //   window.location.href = '404.html';
  // }
})