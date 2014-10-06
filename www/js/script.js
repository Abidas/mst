// интерфейс и работа с ним
var i7e = {
	init: function() {
		u.init();

		$('#news a').on('tap', function() {
			$('#news').hide();
			$($(this).attr('href')).show();
		});
		//$('#main_menu').
		/*

		$('#seminars a').on('tap', function() {
			$('#seminars').hide();
			$($(this).attr('href')).show();
		});
		*/
		ajx.getNews();
		$('#news').show();
		$('#media #video').show();
    var actions = {
      '#seminars': i7e.openSeminar,
      '#media': i7e.openMedia
    };
		$('#main_menu a').on('tap', function(e) {
      var l = $(this).attr('href');
			if (!u.token && l != '#news') {
				event.preventDefault();
				$('#need_auth').popup("open");
				return;
			}
      if (actions[l]) {
        actions[l]();
      }
			i7e.changePage(l);
		});
/*
		$('div.main div.ui-content a').on('tap', function() {
			$(this).closest('div.ui-content').hide();
			$($(this).attr('href')).show();
		});

		*/
	},

	// смена страницы
	changePage: function(p) {
		$('div.main div.ui-content').hide();
		console.log(p);
		$(p).show();
	},

  // открываем страницу из попапа
  openRegister: function() {
    $('#auth_dialog').popup("close");
    $('#reg_flag').val('reg');
    $('#register').find('input[name="org"]').show();
    $('#register').find('input[name="tel"]').show();
    i7e.changePage('#register');
  },
  // открыть платеж
  openPay: function() {
    $('#need_auth').popup("close");
    // за основу используется форма регистрации
    $('#reg_flag').val('payment');
    $('#register').find('input[name="org"]').hide();
    $('#register').find('input[name="tel"]').hide();
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

  // открыть окно семинаров
  openSeminar: function() {
      ajx.getSeminars(i7e.showSeminar);
  },
  // вывести полученные с сервера семинары
  showSeminar: function(d) {
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
    },
    close: function() {
      console.log(i7e.msg.current_f);
      if (i7e.msg.current_f) {
        i7e.msg.current_f();
        i7e.msg.current_f = '';
      }
      $('#msg').popup('close');
    }
  }
}
$(i7e.init);

// объект пользователя
var u = {
	token: '',
	reg_form_id: '#register',
	init: function() {
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
		// проверка заполнения
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
    if (!p['email'] || !p['password'] || !p['fio']) return;
    ajx.doRegister(p, u.registerCb);
	},
  // регистрация, обработка ответа сервера
  registerCb: function(d) {
    u.token = 1;
    i7e.msg.show('Поздравляем', 'Регистрация прошла успешно', function(){i7e.changePage('#news');});
    console.log(d);
  }
}

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
  // запрос списка новостей
	getNews: function() {
		$.get(ajx.base + 'api/version/1/base/news_list/', {}, ajx.getAjxCb, "json");
	},

  // запрос списка семинаров
  getSeminars: function(f) {
		$.get(ajx.base + 'api/version/1/base/seminar_list/', {}, f, "json");
	},
  // запрос списка медиа
  getMedia: function(f) {
		$.get(ajx.base + 'api/version/1/base/media_files_list/', {'fl_type': 0}, f, "json");
	},

	getAjxCb: function(d) {
		console.log(d);
	}
};

function mycallback(data)
{
  console.log(data);
}