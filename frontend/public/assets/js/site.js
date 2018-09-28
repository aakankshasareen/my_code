! function(window, document, $) { "use strict";
$.extend(window.site, {
	init: function () {
		// Init site.menubar
		if (typeof site.menubar !== "undefined") {
			site.menubar.init(), $(document).on('click', '.hamburger', function(e){
				$(this).toggleClass('is-active');
			}), $(document).on('click', '[data-toggle="menubar-fold"]', function(e) {
				site.menubar.toggleFold(), e.preventDefault();
			}), $(document).on('click', '[data-toggle="menubar"]', function(e) {
				site.menubar.toggle(), e.preventDefault();
			}), $(window).on('resize orientationchange', function(){
				site.menubar.scroll.update();
			}), $(document).on('click', '.submenu-toggle', function(e) {
				site.menubar.menu.toggleOnClick($(this)), e.preventDefault();
			}), $(document).on('mouseenter mouseleave', 'body.menubar-fold .site-menu > li', function(e){
				site.menubar.menu.toggleOnHover($(this)), e.preventDefault();
			}), $(document).on("click", '[data-toggle="collapse"]', function(e) {
				var $trigger = $(e.target);
				$trigger.is('[data-toggle="collapse"]') || ($trigger = $trigger.parents('[data-toggle="collapse"]'));
				var $target = $($trigger.attr('data-target'));
				$target.attr('id') === 'site-navbar-collapse' && $('body').toggleClass('navbar-collapse-in'), e.preventDefault();
			}), Breakpoints.on('change', function() {
				site.menubar.change(),
				$('[data-toggle="menubar"]').toggleClass('is-active', site.menubar.opened),
				$('[data-toggle="menubar-fold"]').toggleClass('is-active', !site.menubar.folded);
			});
		}
		// init scroll containers
		!/xs|sm/.test(Breakpoints.current().name) && $('.scroll-container').perfectScrollbar();
		// init other plugins
		this.initPlugins();
	}
});
}(window, document, jQuery);


$(function() {
	site.init();

    $("body").on("click", ".site-select", function(){
        $(this).toggleClass("active");
        $(this).find(".site-select-dropdown").slideToggle();
    });

    $("body").on("click",".select-dropdown-item", function(){
        var $this = $(this);
        var val = $this.text();
        var container = $this.closest(".site-select");
        container.find(".site-select-value").text(val);
    });

    // Menu Item Trigger
    $("body").on("click", ".menu-link-trigger", function(){
        var $target = $(this).data("nav");
        $(".site-menubar").find("."+$target+" a").trigger("click");
    });
    
    // Custom Browse Btn
    
    $("body").on("change", ".custom-input-file .inputfile", function() {
            var $this = $(this);
            var $target = $this.closest(".custom-input-file").find(".selected-value");
            var filename = $this.val();
            if (filename.substring(3, 11) == 'fakepath') {
                filename = filename.substring(12);
            }
            $target.text(filename);
        });


    // Theme Scrollbar
   // $('.theme-scrollbar').scrollbar();
    
   // Select Currency Form
    $("body").on("click", ".select-currency-form .form-dropdown", function(){
        var $this = $(this);
        var $target = $this.find(".form-dropdown-tabs");
        $this.toggleClass("active");
        $target.slideToggle();
       
        $target.on("click", ".nav-link", function(){
            var $targetText = $(this).text();
            $this.find(".form-dropdown-value").text($targetText);
        });
    });
    // Responsive Table
    if($(".responsive-table").length > 0 ){
       $(".responsive-table tbody td").each(function () {
        cell = this.cellIndex;
        var n = $(this).closest("table").find("th:eq(" + cell + ")").text(),
            t = "";
        n !== "" && (t = n);
        $(this).attr("data-label", t)
       });
       }
    
    // Responsive Tabs
        if ($(".nav-tabs").hasClass("responsive-tabs")) {
            var newWindowWidth = $(window).width();
            if (newWindowWidth < 767) {
            
                $(".nav-tabs").each(function (index) {
                    var $this = $(this);

                    $this.addClass("responsive-tabs-active");
                    var ActiveVal = $this.find(".nav-link.active").text();
                    if ($(".nav-trigger").length < 1) {
                        $this.after("<div class='nav-trigger'><span class='nav-trigger-text'>" + ActiveVal + "</span><span class='fa fa-chevron-down nav-trigger-icon'></span></div>");
                    }
                    $this.off("click").on("click", ".nav-link", function () {
                        var TabText = $(this).text();
                        $this.next(".nav-trigger").find(".nav-trigger-text").html(TabText);
                        $this.slideUp();
                    });
                    $(".nav-trigger").on("click", function () {
                        $(this).toggleClass("active").prev(".nav-tabs").slideToggle();
                    });
                });
            }
            }
    
    // Carousel on Header
    $('.exchange-rates-carousel').owlCarousel({
    loop:true,
    items: 4,
    navigation:true,
    navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
    pagination: false
});
    
    // Adding active on Menu using Localstorage
    // $("body").on("click", ".site-menu li", function(){
    //     $(".site-menu li").removeClass("active");
    // });

    // $("body").on("click", ".settings-nav .dropdown-item", function(){
    //    $(".site-menu li").removeClass("active"); 
    // });


    // $("body").on("click", ".site-menu li", function(){
    //     var menuText = $(this).find(".menu-text").text();
    //     localStorage.setItem('Current Menu', menuText);
    // });
    
    // var menutoActive = localStorage.getItem("Current Menu");
    
    // $(".site-menu li").each(function(){
    //     var $this = $(this);
        
    //     var textToMatch = $this.find(".menu-text").text();
        
    //     if(textToMatch===menutoActive)
    //         {
    //             $this.addClass("active");
    //         }
        
    // });


    /*var menutoActive = sessionStorage.getItem("Current Menu");
    
     $("body").on("click", ".site-menu li", function(){
        var menuText = $(this).find(".menu-text").text();
        $(".site-menu li").removeClass("active");
        $(this).addClass("active");
        sessionStorage.setItem('Current Menu', menuText);
    });
    
    
    setTimeout(function(){
    if(menutoActive!==null) {
    $(".site-menu li").removeClass("active");
    $(".site-menu li." + menutoActive).addClass("active");
    }
     }, 300);*/
        

        // Tab Navigation
       $("body").on('click', ".tab-navigation .nav-link", function (e) {
           var $this = $(this);
           var $target = $this.data("tab");
           $this.closest(".nav-tabs").find(".nav-link").removeClass('active');
           $this.closest(".tab-navigation").find(".tab-pane:visible").hide();
           $($target).show();
           $(this).addClass('active');
           e.preventDefault();
       });

       // Accordion 
       $('body').on("click", ".accordion-block-heading", function () {
            var $trigger = $(this).closest(".accordion-block");
            if (!$trigger.hasClass('active')) {
                $trigger.closest(".site-accordion").find(".accordion-block").removeClass("active");

                $trigger.closest(".site-accordion").find(".accordion-block-content").stop(0, 0).slideUp();
                $trigger.addClass("active").find(".accordion-block-content").stop(0, 0).slideDown();
            } else {
                $trigger.removeClass("active").find(".accordion-block-content").stop(0, 0).slideUp();
            }

            return false;
        });



//        function Tradepage000(){
//        var currencyFrom  = sessionStorage.getItem("CurFrom");
//        var currencyTo  = sessionStorage.getItem("CurTo");
//        sessionStorage.setItem("Current Trade Link", currencyFrom+"/"+currencyTo);
//        var activeTrade = sessionStorage.getItem("Current Trade Link");
//        $("body").on("click", ".trade-tabs .nav-link", function(){
//         var $activeTab = $(this);
//         sessionStorage.setItem('Current Trade Link', $(this).text());
        
//         $(".trade-tabs .nav-link").removeClass("active");
//         $activeTab.addClass("active");
//        });

//        setTimeout(function(){
//     $(".trade-tabs .nav-link").each(function(){
        
//         var $this = $(this);

//         if (sessionStorage.getItem("Current Trade Link") === null) {
//             $(".trade-tabs .nav-item:first-child .nav-link").addClass("active");
// }
        
//         var textToMatch = $this.text();

        
//         if(textToMatch===activeTrade)
//             {
//                 $this.addClass("active");
//             }


        
//     });
//      }, 1000);
//    }
    
});

