$(function () {


    // Card Header Filter
    $("body").on("click", ".card-header-filters a", function(){
        var $this = $(this);
        $this.closest('.card-header-filters').find("a").removeClass("active");
        $this.addClass('active');
    });
	

    
    // Login Post Screen 
    var postLoginStatus  = sessionStorage.getItem('pre-dashboard-status');
    if(postLoginStatus==='success'){
        $("body").removeClass("exchange-view-activated");
    }

    // Responsive Tabs
    if ($(window).innerWidth() < 768) { 
        $("body").on("click", ".tab-head-wrapper .tab-head-item", function(){
            $(this).closest(".tab-head-wrapper").find(".tab-head-trigger").trigger("click");
        });
    }
    $("body").on("click", ".tab-head-trigger", function(){
        var $this = $(this);
        $this.toggleClass("active");
        $this.next().slideToggle();
    });
    
    $("body").on("click", ".tab-head-wrapper .tab-head-item", function(){
        var $this = $(this);
        var activeText = $this.text();
        $this.closest(".tab-head-wrapper").find(".tab-head-trigger").text(activeText);
    });



    // Site Navigation
    $("body").on("click", ".menu-trigger", function () {
        var $this = $(this);
        var $target = $this.data("target");
        $this.toggleClass("active");
        $($target).slideToggle();
    });
    
    // Mobile Navigation
    $("body").on("click", "#mobile-navigation li:not('.has-nav-dropdown')", function(){
        $("#mobileMenuTrigger").trigger("click");
    });

    // Side Navigation Submenu
    // $("body").on("click", ".sidebar-list-item.has-submenu", function(){
    //     var $this = $(this);
    //     $this.toggleClass("active submenu-open");
    //     $this.find(".submenu").slideToggle();
    // });
    
    // Register Button click event
    $("body").on("click", "#registerbtn", function(){ 
        sessionStorage.setItem('Register',"Active");
    });

    // Show Hide Fuleex  list for mobile
    var exchangeListStatus = sessionStorage.getItem('pre-dashboard-status');
        if(exchangeListStatus==="success")
        {
            $("body").addClass("remove-exchange-list");
        }

     $("body").on("click", ".accordion-table .table-content-link", function () {
        var $this = $(this);
        var $target = $this.data("content");
        var $currentID = $this.data("id");
        var $lastID = $(".table-content-link.active").data("id");
	    var elePosition = $this.position().top;
        var contentRowHeight = $this.closest("tr").next(".content-row").outerHeight();
        var firstRowEle = $(".accordion-table > .table > tbody > tr:first-child").find(".table-content-link");
        var elePositionAdjust = elePosition - contentRowHeight;
         if ($lastID > 0) {
            $("#contentRowHolder").css("top", elePosition);
        }
 
        if ($currentID > $lastID && $lastID != null) {
            $("#contentRowHolder").css("top", elePositionAdjust);
        } else {
            $("#contentRowHolder").css("top", elePosition);
        }


        if (!$this.hasClass('active')) {
            $(".accordion-table .table-content-link").removeClass("active");
            $(".accordion-table .content-row").hide();
            $this.addClass("active");
            $this.closest("tr").next("tr").show();
            $("#contentRowHolder").find(".card").hide();
            $("#contentRowHolder").show().find($target).show();
        } else {
            $(".accordion-table .table-content-link").removeClass("active");
            $this.closest("tr").next("tr").hide();
            $("#contentRowHolder").hide().find(".card").hide();
        }
    }); 
	$("body").on("click", ".balance_menu", function () {
       $('#contentRowHolder').hide();
    });

    // Tab Wizard
    $("body").on("click",".tab-wizard-btn", function(){
        var $parent = $(this).closest(".tab-wizard");
        var $active = $parent.find(".tab-head-item.active");
        var $next = $active.next();
        var $prev = $active.prev();

        if($(this).text() !=='Previous'){
        $next.trigger("click");
        $active.addClass("visited");
        }
        else {
         $prev.trigger("click");
        }
    });

    // User Dashboard Area Chart
    if ($("#user-dashboard-chart").length > 0) {

        Chart.pluginService.register({
            beforeDraw: function (chart, easing) {
                if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                    var ctx = chart.chart.ctx;
                    var chartArea = chart.chartArea;

                    ctx.save();
                    ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                    ctx.restore();
                }
            }
        });

        var config = {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        data: ["109", "102", "105", "101", "102", "103", "109", "108", "105", "104", "100", "101"],
                        borderColor: "#006f45",
                        borderWidth: "3",
                        hoverBorderColor: "#ff7c3f",
                        fill: false
                    }]
            },
            options: {
                responsive: true,
                title: {
                    display: false,
                    text: 'Dashboard Chart'
                },
                legend: {
                    display: false,
                },
                ticks: {
                    autoSkip: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    titleFontFamily: 'Montserrat',
                    backgroundColor: 'rgba(0,0,0,0.8)'
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: false,
                            labelString: 'Month'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: false,
                            labelString: 'Value'
                        }
                        /*,
                            gridLines : {
                            display : false
                            }*/
                    }]
                }
            }
        };

        var ctx = document.getElementById("user-dashboard-chart").getContext("2d");
        new Chart(ctx, config);
    }

    if ($(".ui-slider").length > 0) {
        $(".ui-slider").slider({
            min: 0,
            max: 30000,
            step: 100,
            range: "min",
            animate: true,
            value: 20000,
            slide: function (event, ui) {
                return false;
            }
        });
    }

    // Custom Selectbox
    selectbox();

    // Click Dropdown
    clickDropdown();

    // Custom Browse File Input
   $("body").on("change , click", ".custom-input-file .inputfile", function () {
       var $this = $(this);
      // $this.closest(".custom-input-file").find(".selected-value").hide();
       var $target = $this.closest(".custom-input-file").find(".selected-value .text");
       var filename = $this.val();
       if (filename.substring(3, 11) == 'fakepath') {
           filename = filename.substring(12);
          
       }

       $target.text(filename).parent().show();    
      // alert();
      if(!$target.text()==""){
        $target.text(filename).parent().show();    
      }else{
        $target.text(filename).parent().hide();    
      }   
   
   });
   $("body").on("click", ".custom-input-file .input-close", function () {
       var $this = $(this);
       $this.closest(".custom-input-file").find(".inputfile").val('');
       $this.parent().hide();
   });

    // Card Header Filters
    /*$("body").on("click", ".card-filters-menu", function () {
        $(this).toggleClass("active").closest(".card-header-filters-wrap").find(".card-header-filters").slideToggle();
    });*/


    // Piechart
    if ($("#currentHoldingChart").length > 0) {
        var data = [{
                label: "Bitcoin",
                data: 20,
                color: "#82d13b"
        }, {
                label: "Stellar",
                data: 20,
                color: "#01c75c"
        }, {
                label: "Etherium",
                data: 20,
                color: "#604bb5"
        }, {
                label: "Ripple",
                data: 20,
                color: "#1c42af",
        },
            {
                label: "Neo",
                data: 20,
                color: "#26b3f0"
        }];

        $.plot($("#currentHoldingChart"), data, {
            series: {
                pie: {
                    show: true,
                    radius: 80,
                    innerRadius: 0.6,
                    label: {
                        show: true,
                        radius: 0.75,
                        formatter: function (label, series) {
                            return "<div style='font-size:0.6875rem; text-align:center; padding:15px; color:white;'>" + Math.round(series.percent) + "%</div>";
                        }
                    }
                }
            },
            legend: {
                show: true,
                container: $("#currentHoldingChartLegends")
            }
        });
    }


    // Calling Functions here
    TabNavigation();
    ResponsiveTable();
    Accordion();

});


// On Scroll Function
$(window).on("scroll", function () {
    var scrollTop = $(window).scrollTop();

    if (scrollTop >= 20) {
        $("#header").addClass("scrolled").find(".primary-btn").addClass('has-shadow');

    } else {
        $("#header").removeClass("scrolled");
    }

});

// On Load Function
$(window).on("load", function () {

});

function selectbox() {

    if ($(".theme-selectbox").length > 0) {
        $(".theme-selectbox").select2({
            minimumResultsForSearch: Infinity
        });
    }

}

function clickDropdown() {
    $("body").on("click", ".has-nav-dropdown.click-dropdown .trigger", function () {
        
                var $target = $(this).closest(".has-nav-dropdown");
        
                if (!$target.hasClass('active')) {
                    $(".has-nav-dropdown").removeClass("active");
                    $target.addClass("active");
                } else {
                    $target.removeClass("active");
                }
                
            });
        
            $("body").on("click", ".has-nav-dropdown.click-dropdown .nav-dropdown-list a[href]", function () {
                $(this).closest(".has-nav-dropdown").removeClass("active");
            });

            $("body").on("click", function (e) {
        var $targetDropdown = $(".has-nav-dropdown");
        if (!$targetDropdown.is(e.target) && $targetDropdown.has(e.target).length === 0 )
        {
            $(".has-nav-dropdown.active").removeClass("active");
        }
    });
}

function TabNavigation() {

    $("body").on('click', ".tab-navigation .tab-head-item", function (e) {
        var $this = $(this);
        var $tabHead = $this.closest(".tab-head");
        var $target = $this.data("tab");
        var $targetWrapper = $($target).parent(".tab-content");
        $tabHead.find(".tab-head-item").removeClass('active');
        $targetWrapper.find("> .tab-pane:visible").removeClass('active').hide();
		$('.common-banner').removeClass('active');
        $($target).addClass('active').show();
        $this.addClass('active');
        e.preventDefault();
		
    });

    $(".tab-navigation.has-memory").on("click", ".tab-head-item", function () {
        var tabText = $(this).text();
        localStorage.setItem('Current Active Tab', tabText);
    });

    var tabtoActive = localStorage.getItem("Current Active Tab");
    $(".tab-navigation .tab-head-item").each(function () {
        var $this = $(this);

        var textToMatch = $this.text();

        if (textToMatch === tabtoActive) {
            $this.trigger("click");
        }
    });
    
    $("body").on("change", ".tab-navigation-select", function(){
        var $this = $(this);
        var $target = $this.val();
        console.log($target);
        var $targetContainer = $this.closest(".tab-navigation");
        $targetContainer.find(".tab-pane:visible").hide();
        $targetContainer.find($target).show();
    });

}

function ResponsiveTable() {
    if ($(".responsive-table").length > 0) {
        $(".responsive-table tbody td").each(function (index) {
            cell = this.cellIndex;

            var ThValue = $(this).closest('table').find('th:eq(' + cell + ')').text();
            var dataLabelValue = "";

            if (ThValue !== "")
                dataLabelValue = ThValue;

            $(this).attr("data-label", dataLabelValue);
        });
    }
}

function Accordion() {
        $('body').on("click", ".accordion-block-heading", function () {
            var $trigger = $(this);

            if (!$trigger.hasClass('active')) {
                $('.site-accordion .accordion-block-heading').removeClass("active");

                $trigger.closest(".site-accordion").find(".accordion-block-content").stop(0, 0).slideUp("fast");
                $trigger.addClass("active").next().stop(0, 0).slideDown("fast");
                $trigger.next(".accordion-block-content").addClass("active");
            } else {
                $trigger.removeClass("active").next().stop(0, 0).slideUp("fast");
                $trigger.next(".accordion-block-content").removeClass("active");
            }

            return false;
        });

        if ($(".accordion-block-heading").hasClass("active-on-load")) {
            $(".accordion-block-heading.active-on-load").trigger("click");
        }
}

function removeTabMemory() {
    localStorage.removeItem("Current Active Tab");
}

  $(window).on('scroll',function() {
        if ($(this).scrollTop() > 600) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });
	 $('body').on("click", ".scrollup", function () {  
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });
	
