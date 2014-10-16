// интерфейс и работа с ним
var i7e = {
  history: [],
	init: function() {
		u.init();
		news.init();
		docs.init();
		va.init();

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
      console.log(e);
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
          clearInterval(popup);
        }, 10);
      }
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
      $(p).css('padding-top', '62px');
      $.mobile.silentScroll(0);
    }
	},
  //  обработка нажатия бек
  goBack: function(e) {
    e.preventDefault();
    alert(i7e.history.length);
    if(i7e.history.length == 1) {
      if (confirm("Закрыть приложение")) {
        navigator.app.exitApp();
      }
    }
    else {
      alert(JSON.stringify(i7e.history));
      var q = i7e.history.unshift(); // текущая страница
      alert(q + ' : ' + JSON.stringify(i7e.history));
      q = i7e.history.unshift(); // предыдущая, которую надо открыть
      alert(q + ' : ' + JSON.stringify(i7e.history));
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

  // вывод сообщений
  msg: {
    current_f: '',
    show: function(t, d, f) {
      if (f) i7e.msg.current_f = f;
      $('#msg_title').text(t);
      $('#msg_content').text(d);
      $('#msg').popup('open');
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
//    открыть новость полностью
//    $('#news').on('tap', 'a', function() {
//      console.log($(this).attr('href'));
//      $('#news').hide();
//      $($(this).attr('href')).show();
//    });
    ajx.getNews(news.show);
//    news.show();
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

      if (do_save) news.dat[k] = ddd;
      // вывод
      $('#news ul').append('<li><a href="javascript:news.open(' + d[k]['id']
          + ')" data-ajax="false" data-rel="page" data-direction="reverse">'
          + img
          + '<h2>' + qq[0] + '</h2><p>' + qq[1].substr(0, lngth) + '</p></a></li>');
    }

    // сохранение переданных новостей
    if(typeof(Storage) !== "undefined" && do_save) {
      localStorage.setItem("news", JSON.stringify(news.dat));
    }
  },

  // вывод одной новости
  open: function(id) {
    $('#news_single').find('h1')
        .text(news.dat[id]['title'])
        .append(news._getImg(news.dat[id]))
        .append('<p>' + news.dat[id]['desc'].replace("\n", '</p><p>') + '</p>');
    i7e.changePage('#news_single');
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
          + ')" data-role="button">Записаться</a></li>');
    }
  },
  //  запись на семинар
  join: function(n) {
//    console.log(n);
    var p = {
       'client': u.id,
       'seminar': n
    };
    ajx.joinSeminars(p, seminar.joinCb);
  },
  // обработка ответа о записи на семинар
  joinCb: function(d) {
    console.log(d);
  }
};

// работа с видео и аудио
var va = {
  youtube_channel_name: 'feevaev', // имя канала на ютубе с кторого получать список видео
  init: function() {
    // 2do - клик на вкладку видео
    $('#media #video').show();
  },
  open: function() {
    $('#video ul').html('<li>... загрузка ...</li>');
    $('#audio ul').html('<li>... загрузка ...</li>');
    ajx.getMedia(va.showVideo, {author:  va.youtube_channel_name}, va.showAudio, {fl_type: 0});
  },
  // вывести полученные с сервера данные по аудио
  showAudio: function(d) {
    console.log(d);
    $('#video ul').html('');

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
      $('#video ul').append('<li><a href="' + d[k]['player']['mobile']
          + '"><img src="' + d[k]['thumbnail']['sqDefault']
          + '"><h2>' + d[k]['title']
          + '</h2></a></li>');
    }
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
  },

  //  заказ документа из списка
  order: function(n) {
//    console.log(n);
    var p = {
       'client': u.id,
       'fl': n
    };
    ajx.orderDoc(p, docs.orderCb);
  },
  // отправка формы заказа документов
  orderForm: function()
  {
    var flds = {
      'name': 'name',
      'num': 'num',
      'date': 'date',
      'org': 'org'
    };
    var p = {};
    var n = 0;
    for(var k in flds) {
      p[k] = $('#doc_order').find('input[name="' + flds[k] + '"]').val();
      if (!p[k]) n++;
    }
    // количество незаполненных полей формы
    if (n == 4) {
      i7e.msg.show('Ошибка', 'Пожалуйста, заполните все поля корректно');
      return;
    }

    ajx.orderFormDoc(p, docs.registerCb);
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
    u.id = 4; // uin = 11111, pwd = 1
	},

  // вывод авторизационного окна
  show: function() {
    var wnm = u.token ? '#logout' : '#auth_dialog'
    var popup = setInterval(function(){
      $(wnm).popup("open");
      clearInterval(popup);
    },1);
  },

  logout: function() {
    u.token = 0;
    ajx.doLogout();
    $('#logout').popup("close");
    u.token = 0;
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
    $('#auth_dialog').popup("close");
    u.token = 1;
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
    ajx.doRegister(p, u.registerCb);
	},
  // регистрация, обработка ответа сервера
  registerCb: function(d) {
    u.token = 1;
    i7e.msg.show('Поздравляем', 'Регистрация прошла успешно', function(){i7e.changePage('#news');});
    console.log(d);
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
    ajx.makeAjaxGet('api/version/1/accounts/logout');
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
    ajx.makeAjaxGet('api/version/1/base/simple_gallery_list/', {}, f);
  },
  // заказ доки
  orderDoc: function(p, f) {
    ajx.makeAjaxPost('api/version/1/base/file_order_create/', p, f);
  },
  // заказ доки из формы
  orderFormDoc: function(p, f) {
    ajx.makeAjaxPost('api/version/1/base/file_order_create/', p, f);
  },

  // - медиа -
  // запрос списка медиа
  getMedia: function(fv, pv, fa, pa) {
    // список видео
    $.get('https://gdata.youtube.com/feeds/api/videos?v=2&orderby=updated&alt=jsonc', pv, fv);
    //  список аудио
    ajx.makeAjaxPost('api/version/1/base/media_files_list/', pa, fa);
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
      cache: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      error: function(a, txt, err) {
        i7e.msg.show('SERVER ERROR: ' + txt + ' : ' + err, a.responseText);
      },
      success: f
    });
  },
  //  отправка post запроса c кукой на сервер
  makeAjaxPost: function(url, p, f){
    p['rand'] = Math.random();
    $.ajax({
      type: "POST",
      data: p,
      cache: false,
      url: ajx.base + url,
      cache: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      error: function(a, txt, err) {
        i7e.msg.show('SERVER ERROR: ' + txt + ' : ' + err, a.responseText);
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