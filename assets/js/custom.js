(function ($) {

	"use strict";

	// Owl Carousel
	$('.owl-carousel').owlCarousel({
		loop: true,
		margin: 30,
		nav: true,
		pagination: true,
		responsive: {
			0: { items: 1 },
			600: { items: 1 },
			1000: { items: 2 }
		}
	});

	// Header background on scroll
	$(window).scroll(function () {
		var scroll = $(window).scrollTop();
		var box = $('.header-text').height();
		var header = $('header').height();

		if (scroll >= box - header) {
			$("header").addClass("background-header");
		} else {
			$("header").removeClass("background-header");
		}
	});

	// Window Resize Mobile Menu Fix
	mobileNav();

	// Scroll animation init
	window.sr = new scrollReveal();

	// Menu Dropdown Toggle
	if ($('.menu-trigger').length) {
		$(".menu-trigger").on('click', function () {
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}

	$(document).ready(function () {
		// marca "Início" (#welcome) como ativo ao carregar
		$('a[href^="#welcome"]').addClass('active');

		// ===== Smooth scroll global (links âncora e botões) =====
		const getHeaderOffset = () => $('header').outerHeight() || 0;

		// Links âncora: qualquer <a href="#alguma-coisa">, exceto href="#" vazio
		$(document).on('click', 'a[href^="#"]:not([href="#"]):not([data-no-scroll])', function (e) {
			const href = this.getAttribute('href');
			const $target = $(href);
			if (!$target.length) return;

			e.preventDefault();

			// fecha menu mobile se o clique veio do menu
			if ($(this).closest('.header-area .nav').length && $(window).width() < 991) {
				$('.menu-trigger').removeClass('active');
				$('.header-area .nav').slideUp(200);
			}

			const y = $target.offset().top - getHeaderOffset();
			$('html, body').stop().animate({ scrollTop: y }, 600, 'swing', () => {
				if (history.replaceState) {
					history.replaceState(null, '', href);
				} else {
					window.location.hash = href;
				}
				$('.menu-item').removeClass('active');
				$('.menu-item[href="' + href + '"]').addClass('active');
			});
		});

		// Botões/elementos com data-scroll-target="#id"
		$(document).on('click', '[data-scroll-target]', function (e) {
			const sel = $(this).data('scroll-target');
			const $target = $(sel);
			if (!$target.length) return;

			e.preventDefault();

			if ($(this).closest('.header-area .nav').length && $(window).width() < 991) {
				$('.menu-trigger').removeClass('active');
				$('.header-area .nav').slideUp(200);
			}

			const y = $target.offset().top - getHeaderOffset();
			$('html, body').stop().animate({ scrollTop: y }, 600, 'swing', () => {
				if (history.replaceState) history.replaceState(null, '', sel);
			});
		});

		// Corrige posicionamento ao carregar página com hash na URL
		if (window.location.hash) {
			const $initial = $(window.location.hash);
			if ($initial.length) {
				setTimeout(() => {
					const y0 = $initial.offset().top - getHeaderOffset();
					$('html, body').scrollTop(y0);
				}, 0);
			}
		}

		// Scroll spy: ativa item conforme a rolagem
		$(window).scroll(function () {
			const scrollPos = $(document).scrollTop() + getHeaderOffset() + 1;

			if ($(document).scrollTop() === 0) {
				$('.menu-item').removeClass('active');
				$('a[href^="#welcome"]').addClass('active');
				return;
			}

			$('.menu-item[href^="#"]').each(function () {
				const $ref = $($(this).attr('href'));
				if (!$ref.length) return;

				const top = $ref.offset().top - getHeaderOffset();
				const bottom = top + $ref.outerHeight();

				if (top <= scrollPos && bottom > scrollPos) {
					$('.menu-item').removeClass("active");
					$(this).addClass("active");
				} else {
					$(this).removeClass("active");
				}
			});
		});
	});

	// Accordion component
	const Accordion = {
		settings: { first_expanded: false, toggle: false },

		openAccordion: function (toggle, content) {
			if (content.children.length) {
				toggle.classList.add("is-open");
				let final_height = Math.floor(content.children[0].offsetHeight);
				content.style.height = final_height + "px";
			}
		},

		closeAccordion: function (toggle, content) {
			toggle.classList.remove("is-open");
			content.style.height = 0;
		},

		init: function (el) {
			const _this = this;
			let is_first_expanded = _this.settings.first_expanded;
			if (el.classList.contains("is-first-expanded")) is_first_expanded = true;
			let is_toggle = _this.settings.toggle;
			if (el.classList.contains("is-toggle")) is_toggle = true;

			const sections = el.getElementsByClassName("accordion");
			const all_toggles = el.getElementsByClassName("accordion-head");
			const all_contents = el.getElementsByClassName("accordion-body");

			for (let i = 0; i < sections.length; i++) {
				const toggle = all_toggles[i];
				const content = all_contents[i];

				toggle.addEventListener("click", function () {
					if (!is_toggle) {
						for (let a = 0; a < all_contents.length; a++) {
							_this.closeAccordion(all_toggles[a], all_contents[a]);
						}
						_this.openAccordion(toggle, content);
					} else {
						if (toggle.classList.contains("is-open")) {
							_this.closeAccordion(toggle, content);
						} else {
							_this.openAccordion(toggle, content);
						}
					}
				});

				if (i === 0 && is_first_expanded) {
					_this.openAccordion(toggle, content);
				}
			}
		}
	};

	(function () {
		const accordions = document.getElementsByClassName("accordions");
		for (let i = 0; i < accordions.length; i++) {
			Accordion.init(accordions[i]);
		}
	})();

	// Home separator
	if ($('.home-seperator').length) {
		$('.home-seperator .left-item, .home-seperator .right-item').imgfix();
	}

	// Number counterup
	if ($('.count-item').length) {
		$('.count-item strong').counterUp({
			delay: 10,
			time: 1000
		});
	}

	// Page loading animation
	$(window).on('load', function () {
		if ($('.cover').length) {
			$('.cover').parallax({
				imageSrc: $('.cover').data('image'),
				zIndex: '1'
			});
		}

		$("#preloader").animate({ 'opacity': '0' }, 600, function () {
			setTimeout(function () {
				$("#preloader").css("visibility", "hidden").fadeOut();
			}, 300);
		});
	});

	// Window Resize Mobile Menu Fix
	$(window).on('resize', function () {
		mobileNav();
	});

	// Window Resize Mobile Menu Fix
	function mobileNav() {
		var width = $(window).width();
		$('.submenu').on('click', function () {
			if (width < 992) {
				$('.submenu ul').removeClass('active');
				$(this).find('ul').toggleClass('active');
			}
		});
	}

})(window.jQuery);
