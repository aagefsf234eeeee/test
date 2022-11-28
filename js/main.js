jQuery(function($) {
	
	// Fix fixed bg's jump
	/MSIE [6-8]|Mac/i.test(navigator.userAgent)||$("header, article, footer").each(function(){if("fixed"==$(this).css("backgroundAttachment")){var i=$(this),a=/WebKit/i.test(navigator.userAgent)?9:8;i.addClass("froid-fixed-bg").data({bgX:i.css("backgroundPosition").slice(0,i.css("backgroundPosition").indexOf(" ")),bgY:i.css("backgroundPosition").slice(i.css("backgroundPosition").indexOf(" ")),margin:a})}}),$(window).bind("SIModal.modalShow",function(){$(".froid-fixed-bg").each(function(){var i=$(this);i.css("backgroundPosition","calc("+i.data("bgX")+" - "+i.data("margin")+"px) "+i.data("bgY"))})}),$(window).bind("SIModal.modalClose",function(){$(".froid-fixed-bg").each(function(){var i=$(this);i.css("backgroundPosition",i.data("bgX")+" "+i.data("bgY"))})});
	
	// Mobile full-width && disable animation
	if(is_mobile()) {
		
		$('html').css('width', window.innerWidth + 'px');
		
		$('.cre-animate').css({'visibility' : 'visible', 'top' : 0, 'left' : 0, 'transform': 'none', '-webkit-transform': 'none', '-moz-transform': 'none', '-ms-transform': 'none', '-o-transform': 'none', 'scale' : 1, 'opacity' : 1}).removeClass('.cre-animate');
		
		$('#reviews, #micro').css('backgroundAttachment', 'scroll');
		
	}
	
	// Init all plugins and scripts
	$.fn.SIInit = function() {
	
		// Modal photos
		$('a[data-rel]').each(function() {$(this).attr('rel', $(this).data('rel'));});
		$('a[rel^=fancybox]').fancybox({
			helpers : {
				thumbs : true
			}
		});
			
		// Mask phone
		$('.client-phone').mask('+ 9() 99-99-99');

		// IE placeholders
		$('input[placeholder], textarea[placeholder]').placeholder();
		
		// Form validate 
		$('.send-form').unbind('submit').bind('submit', function() {
			
			var name = $(this).find('.client-name');
			var mail = $(this).find('.client-mail');
			var phone = $(this).find('.client-phone');
			var mess = $(this).find('.client-message');
			var button = $(this).find('input[type=submit], button');
			
			if (button.hasClass('disabled')) return false;
			
			button.addClass('disabled');
			
			send = 1;
			
			if (name.val() == '') {
				name.si_show_message('Укажите Ваше имя');
				send = 0;
			}
					
			if (phone.size() > 0 && phone.val() == '') {
				phone.si_show_message('Укажите Ваш телефон');
				send = 0;
			}
							
			if (mail.size() > 0 && mail.val() == '') {
				mail.si_show_message('Укажите Ваш E-mail');
				send = 0;
			}
									
			if (mess.size() > 0 && mess.val() == '') {
				mess.si_show_message('Укажите Ваше сообщение');
				send = 0;
			}
			
			if (send == 0) {
				button.removeClass('disabled');
				return false;
			}
			
			$.post($(this).prop('action'), $(this).serialize(), function(res) {
			
				if (res.success == 1) {
		
					$('.si-modal').fadeOut(500);
					
					setTimeout(function() {
					
						$('.si-modals-wrapper, .si-success-modal').fadeIn(500);
						$('.si-overlay').css({'height': $(document).height(), 'width' : $(document).width()}).fadeIn(500);
					
					},510)

					
					name.val('');
					if (phone.size() > 0) phone.val('');
					if (mail.size() > 0) mail.val('');
					if (mess.size() > 0) mess.val('');
					
					yaCounter29573445.reachGoal('target' + res.id);
					
					/*	
						switch (res.id) {
						
							case 1: ga('send', 'event', '', ''); break;
						
						}
						
					*/
					
				}else{
					alert(res.text);
				}
				
				button.removeClass('disabled');
				
			}, 'json');
			
			return false;
		
		});
	
	};
	
	$.fn.SIInit();

	// Perfection
	$('.perfection-title').click(function(){
		
		if ($(this).hasClass('active')) return false;
		
		var index = $('.perfection-title').index($(this));
		$('.perfection-title').removeClass('active');
		$(this).addClass('active');
		
		$('.perfection-description-wrapper').fadeOut(300);
		setTimeout(function(){$('.perfection-description-wrapper').eq(index).fadeIn(300);},300);
		
		return false;
		
	});
	
	// View
	$('.view').owlCarousel({items:1,nav:true,loop:true,navText:['<span class="si-arrow-left"></span><span class="si-arrow-left hovered"></span>', '<span class="si-arrow-right"></span><span class="si-arrow-right hovered"></span>']});
	
	// SMI
	$('.show-extra-smi a span').text($('.extra-smi .smi-item').size());
	
	$('.show-extra-smi a').click(function(){
		$(this).parent().slideUp(500);
		$('.extra-smi').slideDown(500);
		return false;
	})
	
	// Jump links
	$('.si-jump').si_jump();

	
	// Modals
	SIModal.init();
		
		// Init modals
		SIModal.attachModal('.open-phone-modal', '.phone-modal', {'.send-extra' : 'extra'});
		SIModal.attachModal('.open-more-modal', '.more-modal', {'.send-extra' : 'extra'});

		// Modal controls
		SIModal.attachClose('.si-close');
		
})

