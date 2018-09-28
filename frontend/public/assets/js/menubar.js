! function(window, document, $) {
	"use strict";
	var $body 			= $(document.body);
	var $menu 			= $('.site-menu');
	var $menubar 		= $('.site-menubar');
	var $foldToggler 	= $('[data-toggle="menubar-fold"]');
	/*
	* menubar module
	*/
	site.menubar = {
		opened: !1,
		folded: !1,
		init: function() {
			var breakpoint = Breakpoints.current().name;

			$body.is('.menubar-fold') && (this.folded = !0),
			/xs|sm/.test(breakpoint)  && this.folded === !0 && $body.removeClass('menubar-fold'),
			!/xs|sm/.test(breakpoint) && this.folded === !1 && this.scroll.init(),
			/md|lg/.test(breakpoint)  && this.fold(),
			!/xs|sm/.test(breakpoint) && this.menu.addMenuName(),
			$('[data-toggle="menubar"]').toggleClass('is-active', this.opened),
			$foldToggler.toggleClass('is-active', !this.folded);
		},
		fold: function() {
			$body.addClass('menubar-fold'), this.scroll.disable(), this.folded = !0;
			$foldToggler.toggleClass('is-active', !this.folded);
		},
		unFold: function() {
			this.scroll.initialized === !1 && this.scroll.init(),
			$body.removeClass('menubar-fold'), this.scroll.enable().update(), this.folded = !1;
			$foldToggler.toggleClass('is-active', !this.folded);
		},
		toggleFold: function() {
			this.folded === !0 ? this.unFold() : this.fold();
			$foldToggler.toggleClass('is-active', !this.folded);
		},
		hide: function() {
			$body.removeClass('menubar-open'), this.opened = !1;
		},
		open: function() {
			$body.addClass('menubar-open'), this.opened = !0;
		},
		toggle: function() {
			this.opened === !0 ? this.hide() : this.open();
		},
		change: function() {
			var breakpoint = Breakpoints.current().name;

			if (/xl/.test(breakpoint)) {
				this.unFold();
			} else if (/md|lg/.test(breakpoint)) {
				this.fold();
			} else {
				this.hide(), this.folded === !0 && this.unFold(), this.scroll.disable();
			}

			if (/xs|sm/.test(breakpoint)) {
				this.menu.removeMenuName();
			} else {
				this.menu.addMenuName();
			}
		},
		scroll: {
			initialized: !1,
			enabled: !1,
			$scrollContainer: $('body.menubar-left .site-menubar-inner'),
			init: function() {
				this.initialized === !1 && this.$scrollContainer.slimScroll({
					height: 'auto',
					position: 'right',
					size: "5px",
					color: '#98a6ad',
					wheelStep: 10,
					touchScrollStep: 50
				}) && (this.initialized = !0, this.enabled = !0);
			},
			update: function() {
				var menubarHeight = $menubar.height();
				this.enabled === !0 && this.$scrollContainer.height(menubarHeight).parent().height(menubarHeight);
			},
			enable: function() {
				return this.initialized === !0 && this.enabled === !1 && this.$scrollContainer.parent().removeClass('disabled').find('.slimScrollBar').css('visibility', 'visible'), this.enabled = !0, this;
			},
			disable: function() {
				this.enabled === !0
				&& this.$scrollContainer.parent().addClass('disabled').find('.slimScrollBar').css('visibility', 'hidden')
				&& (this.enabled = !1);
			}
		},
		menu: {
			slideSpeed: 500,
			addMenuName: function() {
				if ($menu.find('.submenu-fake').length > 0) return;
				$menu.children('li:not(.menu-section-heading)').each(function() {
					var $this = $(this),
					$anchore = $this.find('> a'),
					link = $anchore.attr('href'),
					text = $anchore.find('> .menu-text').text();
					$this.find('> .submenu').length > 0 || $this.append('<ul class="submenu submenu-fake"></ul>');
					$this.find('> .submenu').prepend('<li class="menu-heading"><a href="'+link+'">'+text+'</a></li>');
				});
			},
			removeMenuName: function() {
				$menu.find('.submenu-fake').remove();
			},
			toggleOnClick: function($toggle) {
				$toggle.parent().toggleClass('open').find('> .submenu').slideToggle(this.slideSpeed).end().siblings().removeClass('open').find('> .submenu').slideUp(this.slideSpeed);
			},
			toggleOnHover: function($toggle) {
				/md|lg|xl/.test(Breakpoints.current().name) &&
				$toggle.toggleClass('open').siblings('li').removeClass('open');
			}
		}
	};
}(window, document, jQuery);