dashboard.controller("DashboardController", ['$rootScope', '$scope', '$state', 'toastr', '$stateParams', 'dashboardService', 'loginService','AuthService', '$interval', 'socket', function($rootScope, $scope, $state, toastr, $stateParams, dashboardService,loginService ,AuthService, $interval, socket) {

    var vm = this;

    $scope.$state = $state;
    $rootScope.reminder = 0;

    var exchangeRate = function() {
    $rootScope.showSpinner = true;
        dashboardService.getExchangeRate().then(function(response) {
            vm.getCurrency = response.value;
            $rootScope.showSpinner = false;
        }, function(err) {
            $rootScope.showSpinner = false;
        });
    };
    exchangeRate();
    $interval(exchangeRate, 3660000);

    if (AuthService.isAuthenticated()) {
        vm.getAllCustomerNotification = function() {
            //var cust_id = $stateParams.id;
            dashboardService.getAllCustomerNotification().then(function(response) {
                if (response.success) {
                    vm.allNotifications = response.data;
                    vm.notify_counter = response.notify_data;
                }
            });
        }
        vm.getAllCustomerNotification();

        socket.on('new_customer_notification', function(message) {
            vm.notify_counter = parseInt(vm.notify_counter) + 1;
            toastr.success('You got new notification, please check.');
            vm.getAllCustomerNotification();
        })

    }

    vm.resetCustomerNotification = function(data) {
        if (vm.notify_counter > 0) {
            vm.notify_counter = 0;
            dashboardService.resetCustomerNotification().then(function(response) {
                if (response.success) {

                }
            });
        }

    };

    vm.markNotificationRead = function(notify_id, index) {
        if (vm.allNotifications[index].is_read == 0) {
            vm.allNotifications[index].is_read = 1;
            var data = {
                "notify_id": notify_id,
            }
            dashboardService.markNotificationRead(data).then(function(response) {
                if (response.success) {

                }
            });
        }
    };


    vm.highlightMenuSelection = function() {


        $("body").on("click", ".sidebar-list-item", function() {
            var menuText = $(this).text();
            $(".sidebar-list-item").removeClass("active");
            sessionStorage.setItem('Current Menu', menuText);
        });

        $("body").on("click", ".remove-menu-active", function(){
            sessionStorage.setItem('Current Menu',"none");
            $(".sidebar-navigation .sidebar-list-item").removeClass("active");
        });

        // Calling Function
        menuActiveFn();

        $("body").on("click", ".add-menu-active", function(){
                var $targetMenuItem = $(this).data("target-menu");
                var $targetMenuClass = $(this).data("target-class");
                sessionStorage.setItem('Current Menu',$targetMenuItem);
                $(".sidebar-navigation .sidebar-list-item").removeClass("active");
                $($targetMenuClass).addClass("active");
                // menuActiveFn();
            });

        function menuActiveFn() {
            var menutoActive = sessionStorage.getItem("Current Menu");
            menutoActive = $.trim(menutoActive);

           $(".sidebar-navigation .sidebar-list-item").each(function() {
               var $this = $(this);

               var textToMatch = $this.text();
               textToMatch = $.trim(textToMatch);

               if (textToMatch === menutoActive) {
                   $(".sidebar-navigation .sidebar-list-item").removeClass("active");
                   $this.addClass("active");
               }

               if (menutoActive === "none" || menutoActive === "Logout") {
                   $(".sidebar-navigation .sidebar-list-item").removeClass("active");
               }
           });
        }
    }

    vm.highlightSelectedPair = function() {
		var curFrom = sessionStorage.getItem("curFrom");
        var curTo = sessionStorage.getItem("curTo");
        $rootScope.fromPair = sessionStorage.getItem("curFrom");
        $rootScope.toPair = sessionStorage.getItem("curTo");
		//alert(curTo);
        var curPair = curFrom + "/" + curTo;
			
		 $(".header-exchange-list li").each(function() {
			
			var $this = $(this);
			//var span_text =	;

			if($this.find('.find-active').text() == curPair){
				$(".header-exchange-list li").removeClass('active_pair');
				$this.addClass('active_pair');
			}
			
			
	});
		if($(".header-exchange-list").length > 0 ){
			$(".header-exchange-list,.scroll-tab").niceScroll({
						cursorcolor: "rgba(255,255,255,0.2)",
						cursoropacitymin: 0.1,
						background: "rgba(255,255,255,0.0)",
						cursorborder: "0",
						cursorminheight: 60,
						autohidemode: true,
						railpadding:{ top: 00, right: 0, left: 0, bottom:10 },
						cursorwidth:5,
						touchbehaviour: true,
			});
		}
		else{
				$(".header-exchange-list,.scroll-tab").getNiceScroll().remove();
				
		}
    }
	

    //tell server that this token is live
    socket.on('connect', function() {
        socket.emit('live_user_token', sessionStorage.getItem('globals'));
        //donot delete this code
        if (socket.pairId)
            socket.emit('pair_id', socket.pairId);
    })

    socket.on('tickerTradePrice', function(priceUpdate) {
      var pairId = Number(priceUpdate.pairId);
      var price = priceUpdate.price;
      var index = vm.pairList.findIndex((pair) => {
        return pair.id === pairId;
      })
      vm.pairList[index].last_trade_price = price;
    })
    // to get username
    dashboardService.userProfile().then(function(response) {
        if (response.success) {
            $rootScope.userName = response.data.fullname;
            $rootScope.customer_id = response.data.id;
            vm.lastlogin = response.data.lastlogin;
            if(response.data.profileImage){
              dashboardService.getImageFile({path: response.data.profileImage}).then(function(response){
                if(response.success){
                  vm.profileImage = response.data;
                }
              })
            }
        }
    });

    dashboardService.getKycStatus().then(function(response) {
        $rootScope.kycStatus = response.completeinfo;
        $rootScope.kycComment = response.comment;
    }, function(err) {});
    //to get default pair id and display trade page based on default pair id
    dashboardService.getTradePairList().then(function(response) {
        if (response.success) {
            var data = response.result;
            vm.pairList = response.result;

            var isDefault = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].default == 'true') {
                    vm.default = data[i];
                    isDefault = true;
                    break;
                }
            }
            if (!isDefault) {
                vm.default = data[0];
            }
        } else {
            toastr.error('Cannot get default pair. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Cannot get default pair. Please try again later.'
            // });
        }
    }, function(err) {
        toastr.error('Something went wrong. Please try again later.');
        // ngToast.create({
        //     className: 'danger',
        //     content: 'Something went wrong. Please try again later.'
        // });
    });

    dashboardService.getDateFormat().then(function(response) {
        if (response.success && response.data.length != 0) {
            var formats = response.data;
            if (angular.isDefined(formats[0].date_format) && formats[0].date_format !== null && formats[0].date_format !== '') $rootScope.format = formats[0].date_format; // date format for datepickers
            else {
                var formats = ['dd-MM-yyyy'];
                $rootScope.format = formats[0];
            }
            if (angular.isDefined(formats[0].display_date_format) && formats[0].display_date_format !== null && formats[0].display_date_format !== '') $rootScope.displayDate = formats[0].display_date_format; //date format for displaying on application everywhere
            else {
                var formats = ['DD-MM-YYYY HH:mm'];
                $rootScope.displayDate = formats[0];
                sessionStorage.setItem('DateFormat', $rootScope.displayDate);
            }
        } else {
            var formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'DD-MM-YYYY HH:mm'];
            $rootScope.format = formats[0];
            $rootScope.displayDate = formats[4];
            sessionStorage.setItem('DateFormat', $rootScope.displayDate);
        }
    });

    vm.clickMe = function() {
        if ($("body").hasClass('exchange-view-activated')) {
            $("body").removeClass("exchange-view-activated");
            sessionStorage.setItem('pre-dashboard-status', 'success');
            $("body").addClass("remove-exchange-list");
        }
    }

    vm.getWallet = {};

    vm.getWalletData = function() {

        // $(".header-balance-dropdown").toggleClass('active');

        var data = {
            "device_ipAddress": sessionStorage.getItem('myIP'),
            "device_os": sessionStorage.getItem('myOS'),
            "device_name": sessionStorage.getItem('myDevice'),
            "device_browser": sessionStorage.getItem('myBrowser')
        }

        var promises = [];

        var promise1 = dashboardService.btcBalance(data).then(function(response) {});
        promises.push(promise1);

        var promise2 = loginService.ltcBalance(data).then(function(response) {});
        promises.push(promise2);

        // var promise3 = loginService.dogeBalance(data).then(function(response) {});
        // promises.push(promise3);

        var promise4= loginService.ethBalance(data).then(function(response) {});
        promises.push(promise4);
        Promise.all(promises).then(function(response) {
            dashboardService.getWallet().then(function(response) {
                // var fulx_obj = {}, fulx_index = 0, fulx_bool = false;
                // console.log("trace header value",response.data)
                vm.getWallet = response.data;
                // response.data.forEach((coin, coin_index)=>{
                //     if(coin.currency_code === "FULX"){
                //         fulx_bool = true;
                //         fulx_obj = coin;
                //         fulx_index = coin_index;
                //     }
                // })
                // if(fulx_bool){
                //     vm.getWallet[fulx_index] = vm.getWallet[1];
                //     vm.getWallet[1] = fulx_obj;
                // }
            });
        }, function(err) {
            console.log("error in balance");
        });

    }

    vm.getWalletData();

    vm.balanceClick = function(event) {
        // if($(".header-balance-dropdown").hasClass('active'))
        //   $(".header-balance-dropdown").toggleClass('active');
        // else {
        //   vm.getWalletData();
        // }

        if (!$(".header-balance-dropdown").hasClass('active')) {
            vm.getWalletData();
        }
    }

    /***
     * Adding balance update for both header H and crypto wallet W ng-repeat
     */
    $rootScope.updateBalanceHW1 = function(event){
        if (!$(".header-balance-dropdown").hasClass('active')) {
            vm.getWalletData();
        }
    }


    /* vm.showcur = 'BTC';         // to be done at buy/sell option - refer line 22 and 42 - home.html
     vm.check = function(data) {
         if (data == 'BTC')
             vm.showcur = 'BTC';
         else if (data == 'ETH')
             vm.showcur = 'ETH';
     }*/

    vm.logout = function() {
        dashboardService.logout().then(function(response) {
            AuthService.clearCredentials();
            socket.close();
            sessionStorage.removeItem('pre-dashboard-status');
            $state.go('app');
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });

        });
    }

    $scope.call_download_inner = function(value){
        console.log("call_download_inner value", value);
        test_call_download_inner.doc.value = value;
        test_call_download_inner.submit();
    }

}]);
