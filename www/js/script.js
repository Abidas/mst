var i7e = {
	init: function() {
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
		$('#news').show();
		$('#media #video').show();
		$('#main_menu a').on('tap', function() {
			$('div.main div.ui-content').hide();
			console.log($(this).attr('href'));
			$($(this).attr('href')).show();
		});
/*
		$('div.main div.ui-content a').on('tap', function() {
			$(this).closest('div.ui-content').hide();
			$($(this).attr('href')).show();
		});

		*/
	}
}
$(i7e.init);