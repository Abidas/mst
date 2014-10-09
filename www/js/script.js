// интерфейс и работа с ним
var i7e = {
  history: [],
	init: function() {
		u.init();
		news.init();
		docs.init();

//    $(window).on("navigate", function (event, data) {
//      var direction = data.state.direction;
//      if (direction == 'back') {
//        if (i7e.history.length == 1) return;
//        var q = i7e.history.pop();
//        console.log(q);
//        if (q == '#need_auth' || q == '#msg' || q == '#auth_dialog') {
//          $(q).popup("close");
//        } else {
//          q = i7e.history.pop();
//          i7e.history.push(q);
//          console.log(q);
//          i7e.changePage(q);
//        }
//      }
//    });

    // 2do - клик на вкладку видео
		$('#media #video').show();

    // навигация подвал
    var actions = {
      '#seminars': seminar.open,
      '#docs': docs.open,
      '#media': i7e.openMedia
    };
		$('#main_menu a').on('tap', function(e) {
      var l = $(this).attr('href');
			if (u.token || l == '#news' || l == '#call') {
        if (actions[l]) {
          actions[l]();
        }
        i7e.changePage(l);
			}
      else
      {
        event.preventDefault();
        i7e.history.push('#need_auth');
        var popup = setInterval(function(){
          $('#need_auth').popup("open");
          clearInterval(popup);
        },1);

      }
		});
	},

	// смена страницы
	changePage: function(p) {
    i7e.history.push(p);
		$('div.main div.ui-content').hide();
		$(p).show();
	},

  // открываем страницу из попапа
  openRegister: function() {
    $('#auth_dialog').popup("close");
    i7e.history.pop();
    $('#reg_flag').val('reg');
    $('#register').find('input[name="org"]').closest('div').show();
    $('#register').find('input[name="tel"]').closest('div').show();
    i7e.changePage('#register');
  },
  // открыть платеж
  openPay: function() {
    $('#need_auth').popup("close");
    i7e.history.pop();
    // за основу используется форма регистрации
    $('#reg_flag').val('payment');
    $('#register').find('input[name="org"]').closest('div').hide();
    $('#register').find('input[name="tel"]').closest('div').hide();
    i7e.changePage('#register');
  },

  // открыть окно семинаров
  openMedia: function() {
      ajx.getMedia(i7e.showMedia);
  },
  // вывести полученные с сервера семинары
  showMedia: function(d) {
    console.log(d);
  },

  // вывод сообщений
  msg: {
    current_f: '',
    show: function(t, d, f) {
      if (f) i7e.msg.current_f = f;
      $('#msg_title').text(t);
      $('#msg_content').text(d);
      $('#msg').popup('open');
      i7e.history.push('#msg');
    },
    close: function() {
      if (i7e.msg.current_f) {
        i7e.msg.current_f();
        i7e.msg.current_f = '';
      }
      $('#msg').popup('close');
      i7e.history.pop();
    }
  }
};
$(i7e.init);

// работас новостями
var news = {
  init: function() {
    // открыть новость полностью
    $('#news').on('tap', 'a', function() {
      console.log($(this).attr('href'));
      $('#news').hide();
      $($(this).attr('href')).show();
    });
    ajx.getNews(news.show);
    i7e.changePage('#news');
  },
  // вывести полученные с сервера документы
  show: function(d) {
    $('#news ul').html('');

    for (var k in d)
    {
      $('#news ul').append('<li><a href="#news_' + d[k]['id']
          + '">' + (d[k]['img'] ? '<img src="./img/album-bb.jpg">' : '')
          + '<h2>' + d[k]['title'] + '</h2><p>' + d[k]['desc'] + '</p></a></li>');
    }
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
	token: '',
	id: 0,
	reg_form_id: '#register',
	init: function() {
    $('#reg_button').on('tap', u.register);
    u.id = 4; // uin = 11111, pwd = 1
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
    $.post(ajx.base + 'api/version/1/accounts/login/', {'uin': uu, 'password': p}, f, "json");
  },
  // регистрация пользователя
  doRegister: function(p, f) {
    var url = 'api/version/1/accounts/pay_order/';
    if (p['reg_flag'] == 'reg') {
      url = 'api/version/1/accounts/registration/';
    }
    $.post(ajx.base + url, p, f, "json");
  },

  // - новости -
  // запрос списка новостей
	getNews: function(f) {
		$.get(ajx.base + 'api/version/1/base/news_list/', {}, f, "json");
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


  // запрос списка медиа
  getMedia: function(f) {
		$.get(ajx.base + 'api/version/1/base/media_files_list/', {'fl_type': 0}, f, "json");
	},

	getAjxCb: function(d) {
		console.log(d);
	},
  //  отправка get запроса c кукой на сервер
  makeAjaxGet: function(url, p, f){
    $.ajax({
      type: "GET",
      data: p,
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
    $.ajax({
      type: "POST",
      data: p,
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
  }
};