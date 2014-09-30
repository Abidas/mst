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
		$('#main_menu a').on('tap', function(e) {
			if (!u.token) {
				event.preventDefault();
				$('#need_auth').popup("open");
				return;
			}
			i7e.changePage($(this).attr('href'));
		});
/*
		$('div.main div.ui-content a').on('tap', function() {
			$(this).closest('div.ui-content').hide();
			$($(this).attr('href')).show();
		});

		*/
	},

	// открвываем страницу из попапа
	openRegister: function() {
		$('#auth_dialog').popup("close");
		i7e.changePage('#register');
	},
	// смена страницы
	changePage: function(p) {
		$('div.main div.ui-content').hide();
		console.log(p);
		$(p).show();
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
    if (!uu || !p) return;
    ajx.doAuth(uu, p, u.doAuthCb);
  },
  // авторизация, ответ от сервера
  doAuthCb: function(d) {
    $('#auth_dialog').popup("close");
    u.token = 1;
  },

	// регистрация временного пользования
	register: function() {
		// проверка заполнения
    var flds = {
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
    $.post(ajx.base + 'api-auth/login/', {'username': uu, 'password': p}, f, "json");
  },
  // регистрация пользователя
  doRegister: function(p, f) {
    $.post(ajx.base + 'api/version/1/accounts/registration/', p, f, "json");
  },
  // запрос списка новостей
	getNews: function() {
		$.get(ajx.base + 'api/version/1/base/news_list/', {}, ajx.getAjxCb, "json");
	},

	getAjxCb: function(d) {
		console.log(d);
	}
};

function mycallback(data)
{
  console.log(data);
}