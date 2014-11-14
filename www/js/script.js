// интерфейс и работа с ним
var i7e = {
  history: [],
  is_block_nav: 0,
	init: function() {
    $.datepicker.formatDate('dd/mm/yyyy');
		u.init();
		news.init();
		docs.init();
		va.init();
    $('[data-role="content"]')
    $(document).on('popupafteropen', '[data-role="popup"]' ,function( event, ui ) {
      $(window).scroll(function() { return false; });
      $("body").on("touchmove", false);
    }).on('popupafterclose', '[data-role="popup"]' ,function( event, ui ) {
      $(window).unbind('scroll');
      $("body").unbind("touchmove");
    });

    $('#msg').on({
      popupbeforeposition: function() {
        var maxHeight = $(window).height() - 200;
        $('#msg_contents').css('max-height', maxHeight + 'px');
      }
    });

    document.addEventListener("backbutton", i7e.goBack, false);
//    document.addEventListener("deviceready", onDeviceReady, false);
//    document.addEventListener("backbutton", function(e){
//      alert($.mobile.activePage);
//      if($.mobile.activePage.is('#news')){
//        e.preventDefault();
//        if (confirm("Закрыть приложение")) {
//          navigator.app.exitApp();
//        }
//        alert('dont close');
//      }
//      else {
//        alert('dont close');
//        navigator.app.backHistory()
//      }
//    }, false);

//    $(window).on("navigate", function (event, data) {
//      console.log(event);
//      console.log(data);
//      var direction = data.state.direction;
//      if (direction == 'back') {
//        alert('go back');
////        if (i7e.history.length == 1) return;
//        var q = i7e.history.pop();
//        console.log(q);
//        if (q == '#news_single') i7e.changePage('#news');
//        /*
//
//        if (q == '#need_auth' || q == '#msg' || q == '#auth_dialog') {
//          $(q).popup("close");
//        } else {
//          q = i7e.history.pop();
//          i7e.history.push(q);
//          console.log(q);
//          i7e.changePage(q);
//        }
//        */
//      }
//    });

    // навигация подвал
    var actions = {
      '#seminars': seminar.open,
      '#docs': docs.open,
      '#media': va.open
    };
		$('#main_menu a').on('tap', function(e) {
      if (i7e.is_block_nav) return false;
      var l = $(this).attr('href');
			if (u.token || l == '#news' || l == '#call') {
        if (actions[l]) {
          actions[l]();
        }
        i7e.changePage(l);
			}
      else
      {
        e.preventDefault();
        var popup = setInterval(function(){
          $('#need_auth').popup("open");
//          $('#need_auth a.ui-link').removeClass('ui-btn-active');
          clearInterval(popup);
        }, 10);
      }
      return false;
		});
	},

	// смена страницы, если есть второй параметр - не делать смещение
   // смещение на высоту шапки (баг jquery). Нужно делать для первой открываемой страницы
	changePage: function(p, n) {
    if (i7e.history[0] == p) return;
    i7e.history.unshift(p);

		$('div.main div.ui-content').hide();
		$(p).show();
    if (!n) {
//      $(p).css('padding-top', '62px');
      $.mobile.silentScroll(0);
    }
	},
  //  обработка нажатия бек
  goBack: function(e) {
    e.preventDefault();
    if(i7e.history.length == 1) {
      if (confirm("Закрыть приложение")) {
        navigator.app.exitApp();
        app.exitApp();
      }
    }
    else {
      var q = i7e.history.shift(); // текущая страница
      q = i7e.history.shift(); // предыдущая, которую надо открыть
      i7e.changePage(q);
      //navigator.app.backHistory()
    }
  },

  // открываем страницу из попапа
  openRegister: function() {
    $('#auth_dialog').popup("close");
    $('#reg_flag').val('reg');
    $('#register').find('input[name="org"]').closest('div').show();
    $('#register').find('input[name="tel"]').closest('div').show();
    i7e.changePage('#register');
  },
  // открыть платеж
  openPay: function() {
    $('#need_auth').popup("close");
    // за основу используется форма регистрации
    $('#reg_flag').val('payment');
    $('#register').find('input[name="org"]').closest('div').hide();
    $('#register').find('input[name="tel"]').closest('div').hide();
    i7e.changePage('#register');
  },

  //  вывод загрузочного изображения
  loader: {
    show: function() {
      $.mobile.loading( 'show', {
//        text: msgText,
//        textVisible: textVisible,
//        theme: theme,
//        textonly: textonly,
//        html: html
      });
    },
    hide: function() {
      $.mobile.loading( 'hide', {
//        text: msgText,
//        textVisible: textVisible,
//        theme: theme,
//        textonly: textonly,
//        html: html
      });
    }
  },
  // вывод сообщений
  msg: {
    current_f: '',
    show: function(t, d, f) {
      if (f) i7e.msg.current_f = f;
      $('#msg_title').text(t);
      $('#msg_content').html(d);
      $('#msg_contents').css('overflow-y', 'scroll');
      setTimeout("$('#msg').popup('open')", 400);
    },
    close: function() {
      if (i7e.msg.current_f) {
        i7e.msg.current_f();
        i7e.msg.current_f = '';
      }
      $('#msg').popup('close');
    }
  }
};
$(i7e.init);

// работа с новостями
var news = {
  dat: {}, // массив данных на сохранение на устройстве

  init: function() {
    ajx.getNews(news.show);
    i7e.changePage('#news', 1);
  },

  // вывести полученные с сервера новости
  show: function(d) {
    $('#news ul').html('');

    var do_save = 1;
    if (d) {
      d = d['response'];
      d.shift(); // первый элемент - количество записей
      news.dat = {};
    } else {
      if(typeof(Storage) !== "undefined") {
        news.dat = JSON.parse(localStorage.getItem("news"));
        do_save = 0;
        if (news.dat) {
          d = news.dat;
        } else {
          $('#news ul').html('Отсутствуют новости для вывода');
        }
      }

    }

    var lngth = 150; // количество выводимых символов в анонсе новости
    for (var k in d)
    {
      var ddd = {
         'id': d[k]['id'],
         'text': d[k]['text'],
         'date': d[k]['date']
      };
      // фоточка
      var img = news._getImg(d[k]);
      if (img) {
        ddd['attachment'] = {photo: {src: d[k]['attachment']['photo']['src']}};
      }

      // заголовок - содержание
      var qq = d[k]['text'].split('<br><br>'); // 0 - title, 1 - desc
      if (qq.length == 1) {
        var date = new Date(d[k]['date'] * 1000);
        qq.unshift('Новость от ' + date.getDate() + '.'
            + ((date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1)) + '.'
            + date.getFullYear());
      }
      ddd['title'] = qq[0];
      ddd['desc'] = qq[1];

      if (do_save) news.dat[d[k]['id']] = ddd;
      // вывод
      class_name = '';
      $('#news ul').append('<li class="ui-li-has-thumb"><a href="javascript:news.open(' + d[k]['id']
          + ');$(this).removeClass(\'ui-btn-active ui-focus\');" data-direction="reverse" style="padding-left:0">'
          + (img ? news._outImg(img) : '')
          + '<h2>' + qq[0] + '</h2><p>' + qq[1].substr(0, lngth) + '</p></a></li>');
    }
    $('#news ul').listview( "refresh" );

    // сохранение переданных новостей
    if(typeof(Storage) !== "undefined" && do_save) {
      localStorage.setItem("news", JSON.stringify(news.dat));
    }
  },

  // вывод одной новости
  open: function(id) {
    console.log(1);
    $('#news_single div.inside').html('<h1>' + news.dat[id]['title'] + '</h1>');
    $('#news_single div.inside').append(news._getImg(news.dat[id]));
    $('#news_single div.inside').append('<p>' + news.dat[id]['desc'].replace("\n", '</p><p>') + '</p>');
    i7e.changePage('#news_single');
  },

//  оформить html блок для картинки
  _outImg: function(img) {
    // получить ссылку для картинки
    var q = img.replace('<img src="', '');
    q = q.replace('">', '');
    var qq = '<div class="center-cropped" style="background-image: url(\'' + q + '\');">';
    qq += img + '</div>';
    return qq;
  },
  // получить фоточку
  _getImg: function(dd) {
    var img = '';
    if (dd['attachment'] && dd['attachment']['photo']) {
      img = '<img src="'+ dd['attachment']['photo']['src'] + '">';
    }
    return img;
  }
};


// работа с семинарами
var seminar = {
  // открыть окно семинаров
  open: function() {
    ajx.getSeminars(seminar.show);
  },
  // вывести полученные с сервера семинары
  show: function(d) {
    console.log(d);
    $('#seminars ul').html('');
    for (var k in d)
    {
      $('#seminars ul').append('<li><h2>' + d[k]['title'] + '</h2><p>' + d[k]['desc']
          + '</p><a class="light-btn" href="javascript:seminar.join(' + d[k]['id']
          + ')" data-role="button" id="sem' + d[k]['id'] + '">Записаться</a></li>');
    }
    $('#seminars ul').listview( "refresh" );
  },
  //  запись на семинар
  join: function(n) {
//    console.log(n);
    var p = {
       'client': u.id,
       'seminar': n
    };
    $('#sem'+n).prop('href', 'javascript:void(0)').text('Вы записаны');
    ajx.joinSeminars(p, seminar.joinCb);
  },
  // обработка ответа о записи на семинар
  joinCb: function(d) {
    i7e.msg.show('Успешно', 'Вы были успешно записаны на семинар.');
  }
};

// работа с видео и аудио
var va = {
  youtube_channel_name: 'feevaev', // имя канала на ютубе с кторого получать список видео
  init: function() {
    // 2do - клик на вкладку видео
    $('#media #video').show();
    $('#media #video').click();
  },
  open: function() {
    $('#video ul').html('<li>... загрузка ...</li>');
    $('#audio ul').html('<li>... загрузка ...</li>');
    ajx.getMedia(va.showVideo, {author:  va.youtube_channel_name}, va.showAudio, {fl_type: 0});
  },
  // вывести полученные с сервера данные по аудио
  showAudio: function(d) {
    $('#audio ul').html('');

    if (!d.length) {
      $('#audio ul').html('<li>... аудио записей не найдено (' + d + ') ...</li>');
      return;
    }

    for (var k in d) {
      $('#audio ul').append('<li class="audio-item">'
          + '<span class="playaudio audio-control-btn"><i class="fa fa-play"></i></span>'
          + '<span class="audio-name">' + d[k]['title']
          + '</span>'
          + '<div class="progress-bar"><span class="progress-bg"></span><span class="progress-current"></span>'
          + '<span class="progress-marker"></span></div>'
          + '<audio src="' + ajx.base + d[k]['file_url'].substr(1)
          + '">Your browser does not support the <code>audio</code> element.</audio></li>');
    }
    $('#audio ul').listview( "refresh" );
  },
  // вывести полученные с сервера данные по видео
  showVideo: function(d) {
    console.log(d);
    $('#video ul').html('');

    if (!d['data'] || d['data']['totalItems'] < 1) {
      $('#video ul').html('<li>... записей на канале не найдено (' + d + ') ...</li>');
      return;
    }
    d = d['data']['items'];
    for (var k in d) {
      $('#video ul').append('<li><a href="javascript:window.open(\'' + d[k]['player']['default']
          + '\',\'_system\',\'location=yes\');return false;"><img src="' + d[k]['thumbnail']['sqDefault']
          + '"><h2>' + d[k]['title']
          + '</h2></a></li>');
    }
    $('#video ul').listview( "refresh" );
  },
  openVideo: function(url) {
    $('#popupVideo iframe').prop('src', 'http://www.youtube.com/embed/' + url);
    $('#popupVideo').popup('open');
  }
};

// работа с документами
var docs = {
  init: function() {
    $('#doc_button').on('tap', docs.orderForm);
    $('#docs ul').delegate('button', 'tap', function(){
      var id = $(this).attr('data-id');
      docs.order(id);
    });
  },
  // открыть окно документоы
  open: function() {
    ajx.getDocs(docs.show);
  },
  // вывести полученные с сервера документы
  show: function(d) {
    $('#docs ul').html('');

    for (var k in d)
    {
      $('#docs ul').append('<li><button data-id="' + d[k]['id']
          + '" class="grey-btn right-doc-btn">Заказать</button><h2>' + d[k]['title']
          + '</h2><p>' + d[k]['desc']
          + '</p></li>');
    }
    $('#docs ul').listview( "refresh" );
  },

  //  заказ документа из списка
  order: function(n) {
//    console.log(n);
    var p = {
       'client': u.id,
       'gallery': n
    };
    ajx.orderDoc(p, docs.orderCb);
  },
  // отправка формы заказа документов
  orderForm: function()
  {
    var flds = {
      'name': 'name',
      'number': 'num',
      'date': 'date',
      'org': 'org'
    };
    var p = {};
    for(var k in flds) {
      p[k] = $('#doc_order').find('input[name="' + flds[k] + '"]').val();
    }
    // количество незаполненных полей формы
    if (!p['name']) {
      i7e.msg.show('Ошибка', 'Пожалуйста, заполните обязательное поле');
      return;
    }
    p['fl'] = 0;
    p['client'] = u.id;
    ajx.orderFormDoc(p, docs.orderCb);
  },
  // обработка ответа об отправке формы
  orderCb: function(d) {
    console.log(d);
    i7e.msg.show("Заказ документа", "Заказ осуществлен успешно");
  }
};

// объект пользователя
var u = {
	token: 0,
	id: 0,
	reg_form_id: '#register',
	init: function() {
    $('#reg_button').on('tap', u.register);
    if(typeof(Storage) !== "undefined") {
      var uuu = JSON.parse(localStorage.getItem("user_token"));
      if (uuu) {
        u.token = uuu;
      }
    }

    u.id = u.token; // uin = 11111, pwd = 1
    $('#auth_dialog').bind({
      popupafterclose: function(event, ui) {
        i7e.is_block_nav = 0;
      }
    });
    $('#logout').bind({
      popupafterclose: function(event, ui) {
        i7e.is_block_nav = 0;
      }
    });
	},

  // вывод авторизационного окна
  show: function() {
    var wnm = u.token ? '#logout' : '#auth_dialog'
    var popup = setInterval(function(){
      $(wnm).popup("open");
      i7e.is_block_nav = 1;
      clearInterval(popup);
    },1);
  },

  logout: function() {
    u.token = u.id = 0;
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("user_token", 0);
    }
    $('#logout').popup("close");
    i7e.is_block_nav = 0;
    ajx.doLogout();
  },

  // авторизация пользователя
  doAuth: function() {
    var uu = $('#auth_dialog').find('input[name="uin"]').val();
    var p = $('#auth_dialog').find('input[name="pwd"]').val();
    if (uu == 1 && p == 1) {
      u.doAuthCb(1);
      return;
    }
    if (!uu || !p) {
      return;
    }
    ajx.doAuth(uu, p, u.doAuthCb);
  },
  // авторизация, ответ от сервера
  doAuthCb: function(d) {
    if (!d) return;
    console.log(d);
    $('#auth_dialog').popup("close");
    i7e.is_block_nav = 0;
    u.token = u.id = d['id'] ? d['id'] : 1;
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("user_token", u.token);
    }
    i7e.msg.show('Успех', 'Вы успешно авторизовались');
  },

	// регистрация временного пользования bил платеж
	register: function() {
    var flds = {
      'reg_flag': 'reg_flag',
      'email': 'email',
      'password': 'pwd',
      'fio': 'fio',
      'org': 'org',
      'phone': 'tel'
    };
    var p = {};
    for(var k in flds) {
      p[k] = $('#register').find('input[name="' + flds[k] + '"]').val();
    }
    // проверка заполнения
    if (!p['email'] || !p['password'] || !p['fio']) {
      i7e.msg.show('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }
    p['imei'] = Math.round(Math.random() * 100000000) + '';
    p['imei'] = p['imei'].repeat( 15 );
    p['imei'] = p['imei'].substr(0, 15);
      /*
      try {
        p['imei'] = device.uuid;
      } catch(e) {
        p['imei'] = Math.round(Math.random() * 10000) + '';
      }
      if (p['imei'].length < 15) {
        p['imei'] += '0'.repeat( 15 - p['imei'].length );
      } else if (p['imei'].length > 15) {
        p['imei'] = p['imei'].substr(0, 15);
      }
      */
    ajx.doRegister(p, u.registerCb);
	},
  // регистрация, обработка ответа сервера
  registerCb: function(d) {
    i7e.msg.show('Поздравляем', 'Регистрация прошла успешно', function(){i7e.changePage('#news');});
  }
};

var ajx = {
	base: 'http://mstyle.view.indev-group.eu/',

  // аутентификация пользователя
  doAuth: function(uu, p, f) {
    ajx.makeAjaxPost('api/version/1/accounts/login/', {'uin': uu, 'password': p}, f);
  },
  // регистрация пользователя
  doRegister: function(p, f) {
    var url = 'api/version/1/accounts/pay_order/';
    if (p['reg_flag'] == 'reg') {
      url = 'api/version/1/accounts/registration/';
    }
    ajx.makeAjaxPost(url, p, f);
  },
  // выход пользователем
  doLogout: function() {
    $.get(ajx.base + 'api/version/1/accounts/logout');
  },

  // - новости -
  // запрос списка новостей
  group_id: -54133544, // ид группы в Vk идет с минусом
	getNews: function(f) {
    $.get('https://api.vk.com/method/wall.get', {owner_id: ajx.group_id}, f, 'jsonp');
//    ajx.makeAjaxGet('api/version/1/base/news_list/', {}, f);
	},

  // - семинары -
  // запрос списка семинаров
  getSeminars: function(f) {
      ajx.makeAjaxGet('api/version/1/base/seminar_list/', {}, f);
	},
  // запись на семинар
  joinSeminars: function(p, f) {
    ajx.makeAjaxPost('api/version/1/base/seminar_order_create/', p, f);
  },

  // - доки -
  // запрос списка документоы
  getDocs: function(f) {
    ajx.makeAjaxGet('api/version/1/base/media_gallery_list/', {}, f);
  },
  // заказ доки
  orderDoc: function(p, f) {
    ajx.makeAjaxPost('api/version/1/base/gallery_order_create/', p, f);
  },
  // заказ доки из формы
  orderFormDoc: function(p, f) {
    ajx.makeAjaxPost('api/version/1/base/email_file_order_create/', p, f);
  },

  // - медиа -
  // запрос списка медиа
  getMedia: function(fv, pv, fa, pa) {
    // список видео
    $.get('https://gdata.youtube.com/feeds/api/videos?v=2&orderby=updated&alt=jsonc', pv, fv);
    //  список аудио
    ajx.makeAjaxGet('api/version/1/base/media_files_list/', pa, fa);
	},

	getAjxCb: function(d) {
		console.log(d);
	},
  //  отправка get запроса c кукой на сервер
  makeAjaxGet: function(url, p, f){
    p['rand'] = Math.random();
    $.ajax({
      type: "GET",
      data: p,
      cache: false,
      url: ajx.base + url,
      beforeSend: i7e.loader.show,
      complete: i7e.loader.hide,
      cache: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      error: function(a, txt, err) {
        ajx.drawError(a.responseText, txt, err);
      },
      success: function(d) {
        if (f) {
          f(d);
        } else {
          ajx.getAjxCb(d);
        }
      }
    });
  },
  drawError: function(response, txt, err) {
	  var msg = response;
	  try {
      var q = JSON.parse(response);
      msg = '';
      for (var k in q){
        if (k == 'password' || k == 'uin') {
          $('#auth_dialog').popup("close");
          i7e.msg.show('Ошибка авторизации', 'Данные введены некорректно!');
          return;
        }
        msg += k + ' : ' + q[k] + '<br>';
      }
	  } catch (e) {
	  }
	  i7e.msg.show('Ошибка', msg);
  },
  //  отправка post запроса c кукой на сервер
  makeAjaxPost: function(url, p, f){
    p['rand'] = Math.random();
    $.ajax({
      type: "POST",
      data: p,
      cache: false,
      url: ajx.base + url,
      beforeSend: i7e.loader.show,
      complete: i7e.loader.hide,
      cache: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      error: function(a, txt, err) {
        ajx.drawError(a.responseText, txt, err);
      },
      success: f
    }).done(function() {
          f();
        })
        .fail(function(a, txt, err) {
          //alert('SERVER ERROR: ' + txt + ' : ' + err + ' : ' + a.responseText);
        })
        .always(function() {
        });
  }
};

String.prototype.repeat = function( num )
{
  return new Array( num + 1 ).join( this );
}
//
//function onDeviceReady(){
//  document.addEventListener("backbutton", function(e){
//    if($.mobile.activePage.is('#news')){
//      alert('exit');
//      e.preventDefault();
//      //navigator.app.exitApp();
//    }
//    else {
//      alert('back');
//      navigator.app.backHistory()
//    }
//  }, false);
//}