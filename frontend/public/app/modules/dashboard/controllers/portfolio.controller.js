     dashboard.controller("portfolioController", ['$rootScope', '$scope', 'dashboardService', 'tradeService', 'uiGridConstants', 'uiGridExporterService', 'uiGridExporterConstants', '$timeout', '$filter', 'TRANSACTION_TYPE', 'TRADE_TYPE', 'STATUS_TYPE', 'ORDER_STATUS', 'WITHDRAW_DEPOSIT_STATUS', 'WITHDRAW_DEPOSIT',
         function($rootScope, $scope, dashboardService, tradeService, uiGridConstants, uiGridExporterService, uiGridExporterConstants, $timeout, $filter, TRANSACTION_TYPE, TRADE_TYPE, STATUS_TYPE, ORDER_STATUS, WITHDRAW_DEPOSIT_STATUS, WITHDRAW_DEPOSIT) {

             var vm = this;

             var pieChartData = [];
             dashboardService.getWalletCrypto().then(function(response) {
                 vm.getWalletCrypto = response.data;

                 vm.is_balance_zero = 0;

                 for (var i = 0; i < vm.getWalletCrypto.length; i++) {
                     if (vm.getWalletCrypto[i].balance != 0) {
                         vm.is_balance_zero = 0;
                         break;
                     } else {
                         vm.is_balance_zero = 1;
                     }
                 }

                 vm.totalFiatInvested = 0;

                 let btcLastTradedPrice;
                 for (var i = 0; i < vm.getWalletCrypto.length; i++) {
                     var tmp = [];
                     vm.totalFiatInvested = (vm.totalFiatInvested * 1) + (vm.getWalletCrypto[i].wallet_value * 1);
                     tmp.push(vm.getWalletCrypto[i].currency_code)
                     tmp.push(vm.getWalletCrypto[i].wallet_value)
                     if (vm.getWalletCrypto[i].currency_code === 'BTC') {
                         btcLastTradedPrice = Number(vm.getWalletCrypto[i].last_trade_price);
                     }
                     vm.investmentValue = btcLastTradedPrice ? vm.totalFiatInvested / btcLastTradedPrice : vm.totalFiatInvested;
                     pieChartData.push(tmp);
                 }
                 
                 var data = anychart.data.set(pieChartData);
                 var chart = anychart.pie(data);
                 // set chart radius
                 chart.innerRadius('55%')
                     // set value for the exploded slices
                     .explode(35);

                 // set label to center content of chart
                 chart.labels().position('inside');
                 // create range color palette with color ranged
                 var palette = anychart.palettes.rangeColors();
                 palette.items([{
                         color: '#5e36b8'
                     },
                     {
                         color: '#1489fd'
                     },
                     {
                         color: '#82d13b'
                     }
                 ]);
                 // set chart palette
                 chart.palette(palette);

                 // set hovered settings
                 // chart.hovered()
                 //     .fill('#6f3448');

                 // set selected settings
                 chart.selected()
                     .fill('#ff6e40');

                 // // set hovered outline settings
                 chart.hovered().outline()
                     .fill(function() {
                         return anychart.color.lighten('pink', 0.50);
                     });

                 chart.tooltip().format('Percent Value: {%PercentValue}%');

                 // set container id for the chart
                 chart.container('currentHoldingGraph');
                 // initiate chart drawing
                 chart.draw();

             });


             var timeSpan = '1M';
             vm.timeSpan = function(t) {
                 timeSpan = t;
                 vm.getGraph();
             }

             vm.getGraph = function() {
                 var value, tmp;
                 var days;
                 // var service = dashboardService.getWalletHistory

                 switch (timeSpan) {
                     case '1Y':
                         days = 365;
                         break;
                     case '6M':
                         days = 182;
                         break;
                     case '3M':
                         days = 90;
                         break;
                     case '1M':
                         days = 31;
                         break;
                         // case 'AllTime' :time = moment().startOf('year').valueOf();break;
                     case 'Alltime':
                         days = 10000000;
                         break;
                     case 'Today':
                         days = 1;
                         break;

                 }



                 // vm.getGraph('BTC');

                 dashboardService.getWalletHistory(days).then(function(response) {
                     console.log(response.result)

                     $('#PastPerformanceGraph').html('');
                     var graphData = response.result;
                     vm.data = response.result;
                     var graphNewData = [];
                     graphData.forEach(function(i, j) {
                         var date = moment(i.created_at).format("YYYY-MM-DD");
                         tmp = [];
                         tmp.push(date);
                         tmp.push(i.btc_value);
                         tmp.push(i.inr_value);
                         graphNewData.push(tmp);
                     });
                     // console.log(graphNewData);
                     var table = anychart.data.table('x');
                     table.addData(graphNewData);
                     var dataSet = anychart.data.set(graphNewData);
                     var seriesData_1 = dataSet.mapAs({
                         'x': 0,
                         'value': 1
                     });
                     var seriesData_2 = dataSet.mapAs({
                         'x': 0,
                         'value': 2
                     });
                     var chart = anychart.line();

                     chart.animation(true);


                     //adding extra yaxis
                     var btcYScale = anychart.scales.linear();
                     var btcYAxis = chart.yAxis(1);
                     btcYAxis.title('BTC Value');

                     btcYAxis.orientation("right");
                     btcYAxis.scale(btcYScale);

                     // setup first series
                     var series1 = chart.line(seriesData_1);
                     series1.name('BTC');
                     // turn the legend on
                     var series2 = chart.line(seriesData_2);
                     series2.name('USD');

                     series1.yScale(btcYScale)

                     chart.yAxis().title('USD Value')

                     series1.stroke('3 #1489fd');
                     series2.stroke('3 #ff8207');
                     chart.legend()
                         .enabled(true)
                         .fontSize(13)
                         .padding([0, 0, 10, 0]);

                     // set container id for the chart
                     chart.container('PastPerformanceGraph');
                     // initiate chart drawing
                     chart.draw();


                 })
             }
             vm.getGraph();
         }
     ]);