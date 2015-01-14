$(document).ready(function(){
	$('.video-control-btn').click(function(event){
		if($(this).hasClass('playvideo')){
			$('#videoclip').trigger('play');
			$(this).removeClass('playvideo').addClass('pausevideo').html('<i class="fa fa-pause"></i>');
			}
		else{
			$('#videoclip').trigger('pause');
			$(this).removeClass('pausevideo').addClass('playvideo').html('<i class="fa fa-play"></i>');
			}
		return false;
		});
	$('#videoclip').on('timeupdate',function(){
		var video = document.getElementById('videoclip');
		var currentPos = video.currentTime;
		var maxduration = video.duration;
		var percentage = 100 * currentPos / maxduration; //in %
		$('.progress-current').css('width',percentage+'%');
		$('.progress-marker').css('left',percentage+'%');
		});
	$('#videoclip').on('ended',function(){
		$('.video-control-btn').removeClass('pausevideo').addClass('playvideo').html('<i class="fa fa-play"></i>');
		$('.progress-current').css('width',0);
		$('.progress-marker').css('left',0);
		});
});

function initAudio() {
  $( "#audio" ).delegate( '.audio-control-btn', 'tap', function(event){
    var audio = $(this).siblings('audio');
    if($(this).hasClass('playaudio')){
      audio.trigger('play');
      audio.trigger('continue');
      $(this).removeClass('playaudio').addClass('pauseaudio').html('<i class="fa fa-pause"></i>');
    }
    else{
      audio.trigger('pause');
      $(this).removeClass('pauseaudio').addClass('playaudio').html('<i class="fa fa-play"></i>');
    }
    return false;
  });
  $("#audio").delegate('.progress-bar', 'mouseup', function(e){
    var duration, offset, percent, seekTo, _ref, audio;
    if (offset = e.offsetX || ((_ref = e.originalEvent) != null ? _ref.layerX : void 0)) {
      audio = $(this).closest('li').find('audio')[0];
      percent = 100 * offset / $(this).width();
      seekTo = audio.duration * offset / $(this).width();
      audio.currentTime = parseInt(seekTo, 10);
      $(this).find('.progress-current').css('width',percent+'%');
      $(this).find('.progress-marker').css('left',percent+'%');

//      console.log('offset: ' + offset + " .. " + percent + " .. " +  audio.currentTime + " .. " + seekTo);
    }
  });
  $('audio').on('timeupdate',function(){
    var audio = this;
    var currentPos = audio.currentTime;
    var maxduration = audio.duration;
    var percentage = 100 * currentPos / maxduration; //in %
//    console.log('prc: ' + currentPos + ' : ' + maxduration  + ' = ' + percentage);
    changePos(this, percentage);
  });
  $('audio').on('ended',function(){
//    console.log('ended');
    $(this).siblings('.audio-control-btn').removeClass('pauseaudio').addClass('playaudio').html('<i class="fa fa-play"></i>');
    changePos(this, 0);
  });
}

function changePos(context, val) {
  $(context).siblings('.progress-bar').find('.progress-current').css('width',val+'%');
  $(context).siblings('.progress-bar').find('.progress-marker').css('left',val+'%');
}