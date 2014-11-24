// интерфейс и работа с ним
var i7e = {
  history: [],
  is_block_nav: 0,
	init: function() {
    $.datepicker.formatDate('dd/mm/yyyy');
    $.datepicker.setDefaults({
      beforeShow: function(a, b){ $(a).blur(); }
    });
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
    ajx.checkConnection();
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


  // хранилище
  storage: {
    // сохранить
    save: function(key, val) {
      if(typeof(Storage) !== "undefined") {
        localStorage.setItem(key, JSON.stringify(val));
      }
    },
    // загрузить
    load: function(key) {
      var uuu = '';
      if(typeof(Storage) !== "undefined") {
        uuu = JSON.parse(localStorage.getItem(key));
      }
      return uuu;
    }
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
  loaders_num: 0, // семафор. сколько загрузчиков должно отработать перед выводом новости.
  init: function() {
    if (ajx.checkConnection(1))  {
      news.loaders_num = 2; // количество источников
      ajx.getNews(news.loadVk);
      ajx.getLocalNews(news.loadLocal);
    } else {
      news.dat = i7e.storage.load("news");
      if (news.dat) {
        news.show();
      }
    }

    i7e.changePage('#news', 1);
  },

  // загрузка новостей с вк
  loadVk: function(d) {
    d = d['response'];
    d.shift(); // первый элемент - количество записей

    for (var k in d) {
      var ddd = {
        'id': 'vk' + d[k]['id'],
        'text': d[k]['text'],
        'date': d[k]['date']
      };

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

      // фоточка
      var img = news._getImg(d[k]);
      if (img) {
        ddd['attachment'] = {photo: {src: d[k]['attachment']['photo']['src']}};
      }

      news.dat[ddd['id']] = ddd;
    }
    news.loadFinisher();
  },

  // загрузка локальных новостей
  loadLocal: function(d) {
    if (!d) return;
    for (var k in d) {
      var dt = new Date(d[k]['created']);
      dt.setHours(dt.getHours() - 4); // смещение на 4 часа
      news.dat[d[k]['id']] = {
        'id' : 'loc' + d[k]['id'],
        'title' : d[k]['title'],
        'desc' : d[k]['desc'],
        'date' : Math.round(dt.getTime() / 1000)
      };
    }
    news.loadFinisher();
  },

  // окончание загрузки одного из потоков
  loadFinisher: function() {
    news.loaders_num--;
    if (!news.loaders_num) {
      // сортировка новостей в нужном порядке
      var sortable = [];
      for (var k in news.dat) {
        sortable.push(news.dat[k]);
      }
      sortable.sort(function(a, b) {
        return a['date'] - b['date'];
      });
      news.dat = {};
      for (var k in sortable) {
        news.dat[sortable[k]['id']] = sortable[k];
      }
      i7e.storage.save("news", news.dat);

      news.show();
    }
  },

  // вывести полученные с сервера новости
  show: function() {
    $('#news ul').html('');

    if (news.dat) {
      d = news.dat;
    } else {
      $('#news ul').html('Отсутствуют новости для вывода');
      return;
    }

    var lngth = 150; // количество выводимых символов в анонсе новости
    for (var k in d)
    {
      // вывод
      class_name = '';
      var img = news._getImg(d[k]);
      $('#news ul').append('<li class="ui-li-has-thumb"><a href="javascript:news.open(\'' + d[k]['id']
          + '\');$(this).removeClass(\'ui-btn-active ui-focus\');" data-direction="reverse" style="padding-left:0">'
          + (img ? news._outImg(img) : '')
          + '<h2>' + d[k]['title'] + '</h2><p>' + d[k]['desc'].substr(0, lngth) + '</p></a></li>');
    }
    $('#news ul').listview( "refresh" );
  },

  // вывод одной новости
  open: function(id) {
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
    var booked = i7e.storage.load('booked_seminars');
    $('#seminars ul').html('');
    for (var k in d)
    {
      var sss = '<li><h2>' + d[k]['title'] + '</h2><p class="seminar-price">';
      sss +=  (d[k]['cost'] * 1 > 0 ? d[k]['cost'] + ' руб.' : 'Бесплатный') + '</p><p>' + d[k]['desc'];
      if (in_array(d[k]['id'], booked) || d[k]['is_applied']) {
        sss += '</p><a class="light-btn" href="javascript:void(0)" data-role="button">Вы записаны</a></li>';
      } else {
        sss += '</p><a class="light-btn" href="javascript:seminar.join(' + d[k]['id']
            + ')" data-role="button" id="sem' + d[k]['id'] + '">Записаться</a></li>';
      }
      $('#seminars ul').append(sss);
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

    // сохраняем локально запись о семинаре
    var booked = i7e.storage.load('booked_seminars');
    if (!booked) {
      booked = [n];
    } else {
      booked.push(n);
    }
    i7e.storage.save('booked_seminars', booked);

    // правим интерфейс
    $('#sem'+n).prop('href', 'javascript:void(0)').text('Вы записаны');

    // отправляем
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
      $(this).text('Заказан');
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
    for(var k in flds) {
      $('#doc_order').find('input[name="' + flds[k] + '"]').val('');
    }
    p['fl'] = 0;
    p['client'] = u.id;
    ajx.orderFormDoc(p, docs.orderCb);
  },
  // обработка ответа об отправке формы
  orderCb: function(d) {
    i7e.msg.show("Заказ документа", "Заказ осуществлен успешно");
  }
};

// объект пользователя
var u = {
	token: 0,
	id: 0,
	reg_form_id: '#register',
	init: function() {
//    $('#reg_button').on('tap', u.register);

    var uuu = i7e.storage.load('user_token');
    if (uuu) {
      u.token = uuu;
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
    if (u.token) {
      var popup = setInterval(function(){
        $('#logout').popup("open");
        i7e.is_block_nav = 1;
        clearInterval(popup);
      },1);
    }
    else
    {
      i7e.changePage('#register_tabs');
    }
  },

  logout: function() {
    u.token = u.id = 0;
    i7e.storage.save("user_token", 0);
    $('#logout').popup("close");
    i7e.is_block_nav = 0;
    ajx.doLogout();
    i7e.changePage('#news');
  },

  // авторизация пользователя
  doAuth: function() {
    var p = {
      'email': $('#auth_tab_form').find('input[name="email"]').val(),
      'uin': $('#auth_tab_form').find('input[name="uid"]').val(),
      'fio': $('#auth_tab_form').find('input[name="fio"]').val()
    };
    if (p['uin'] == 1 && p['email'] == 1) {
      u.doAuthCb(1);
      return;
    }
    if (!p['uin'] || !p['email']) {
      i7e.msg.show('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }
    ajx.doAuth(p, u.doAuthCb);
  },
  // авторизация, ответ от сервера
  doAuthCb: function(d) {
    if (!d) return;
//    $('#auth_dialog').popup("close");
    i7e.is_block_nav = 0;
    u.token = u.id = d['id'] ? d['id'] : 1;
    i7e.storage.save("user_token", u.token);
    i7e.msg.show('Успех', 'Вы успешно авторизовались');
    i7e.changePage('#news');
  },

	// регистрация временного пользования bил платеж
	register: function() {
    var flds = {
      'reg_flag': 'reg_flag',
      'email': 'email',
      'fio': 'fio',
      'org': 'org',
      'phone': 'tel'
    };
    var p = {};
    for(var k in flds) {
      p[k] = $('#register_form').find('input[name="' + flds[k] + '"]').val();
    }
    // проверка заполнения
    console.log(p);
    if (!p['email'] || !p['phone'] || !p['fio']) {
      i7e.msg.show('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }
    p['imei'] = Math.round(Math.random() * 100000000) + '';
    p['imei'] = p['imei'].repeat( 15 );
    p['imie'] = p['imei'].substr(0, 15);
    p['uuid '] = p['imei'];

    ajx.doRegister(p, u.registerCb);
	},
  // регистрация, обработка ответа сервера
  registerCb: function(d) {
    i7e.msg.show('Поздравляем', 'Регистрация прошла успешно', function(){i7e.changePage('#news');});
  }
};

var ajx = {
	base: 'http://mstyle.view.indev-group.eu/',

  checkConnection: function(dont_show)
  {
    var q = navigator.onLine;
    if (!q && !dont_show) {
      i7e.msg.show('Ошибка', 'Проверьте соединение с Интернетом и попробуйте еще раз.');
    }
    return q;
  },

  // аутентификация пользователя
  doAuth: function(p, f) {
    ajx.makeAjaxPost('api/version/1/accounts/login/', p, f);
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
  // запрос списка новостей c вк
  group_id: -54133544, // ид группы в Vk идет с минусом
	getNews: function(f) {
      $.get('https://api.vk.com/method/wall.get', {owner_id: ajx.group_id}, f, 'jsonp');
	},

  // запрос локального списка новостей
  getLocalNews: function(f) {
    ajx.makeAjaxGet('api/version/1/base/news_list/', {}, f);
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
    if (!ajx.checkConnection()) return;
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
    if (!ajx.checkConnection()) return;
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
        // ошибка с логином-паролем
        if (k == 'password' || k == 'uin') {
          $('#auth_dialog').popup("close");
          i7e.msg.show('Ошибка авторизации', 'Извините, но вы не зарегистрированы или ввели неверную пару email - UIN');
          return;
        }
        // нет прав
        if (k == 'detail' && q[k].indexOf('do not have') > 0) {
          i7e.msg.show('Ошибка', 'У Вас нет прав для просмотра данного раздела');
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
    if (!ajx.checkConnection()) return;
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

function in_array(needle, haystack, strict) {	// Checks if a value exists in an array
  //
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

  var found = false, key, strict = !!strict;

  for (key in haystack) {
    if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
      found = true;
      break;
    }
  }

  return found;
}