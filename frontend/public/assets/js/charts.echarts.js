$(function() {
	var colors = {
	  primary   : "#9FA8DA",
	  success   : "#A5D6A7",
	  info      : "#80DEEA",
	  warning   : "#FFE082",
	  danger    : "#EF9A9A",
	  faded     : '#EEEEEE'
	};

	// line 1 - Line Chart
	echarts.init(document.getElementById('echarts-line-1')).setOption({
		tooltip : {
			trigger: 'axis'
		},
		legend: {
			data:['Income','Revenue']
		},
		calculable : true,
		xAxis : [
			{
				type : 'category',
				boundaryGap: false,
				data : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
			}
		],
		yAxis : [
			{
				type : 'value'
			}
		],
		series : [
			{
				name:'Income',
				type:'line',
				data:[15, 17.9, 20, 23.2, 25.6, 76.7, 100.6, 112.2, 32.6, 20.0, 18.4, 15.3],
				markPoint : {
					data : [
						{type : 'max', name: 'Max'},
						{type : 'min', name: 'Min'}
					]
				},
				markLine : {
					data : [
						{type : 'average', name: 'Average'}
					]
				}
			}, {
				name:'Revenue',
				type:'line',
				data:[11.6, 14.9, 18, 26.4, 28.7, 70.7, 97.6, 127.2, 48.7, 18.8, 14, 10.3],
				markPoint : {
					data : [
						{name : 'Max', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
						{name : 'Min', value : 2.3, xAxis: 11, yAxis: 3}
					]
				},
				markLine : {
					data : [
						{type : 'average', name : 'Average'}
					]
				}
			}
		]
	});

	// line 2 - Stacked Line Chart
	echarts.init(document.getElementById('echarts-line-2')).setOption({
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data:['Interview','Marketing','Advertising','Video Ads','Search']
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		toolbox: {
			feature: {
			saveAsImage: {}
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
			name:'Interview',
			type:'line',
			stack: 'Total',
			data:[120, 132, 101, 134, 90, 230, 210]
			}, {
			name:'Marketing',
			type:'line',
			stack: 'Total',
			data:[220, 182, 191, 234, 290, 330, 310]
			}, {
			name:'Advertising',
			type:'line',
			stack: 'Total',
			data:[150, 232, 201, 154, 190, 330, 410]
			}, {
			name:'Video Ads',
			type:'line',
			stack: 'Total',
			data:[320, 332, 301, 334, 390, 330, 320]
			}, {
			name:'Search',
			type:'line',
			stack: 'Total',
			data:[820, 932, 901, 934, 1290, 1330, 1320]
			}
		]
	});

	// line 3 - Basic Area
	echarts.init(document.getElementById('echarts-line-3')).setOption({
		tooltip : {
			trigger: 'axis'
		},
		legend: {
			data:['Income']
		},
		calculable : true,
		xAxis : [
			{
				type : 'category',
				boundaryGap : false,
				data : ['Jan','Feb','Mar','Apr','May','Jun','Jul']
			}
		],
		yAxis : [
			{
				type : 'value'
			}
		],
		series : [
			{
				name:'Income',
				type:'line',
				smooth:true,
				itemStyle: {normal: {areaStyle: {type: 'default'}}},
				data:[520, 720, 601, 420, 230, 200, 210]
			}
		]
	});

	// line 4 - Stacked Area
	echarts.init(document.getElementById('echarts-line-4')).setOption({
		tooltip : {
			trigger: 'axis'
		},
		legend: {
			data:['Preorder','Sale','Deal']
		},
		calculable : true,
		xAxis : [
			{
				type : 'category',
				boundaryGap : false,
				data : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
			}
		],
		yAxis : [
			{
				type : 'value'
			}
		],
		series : [
			{
				name:'Deal',
				type:'line',
				smooth:true,
				itemStyle: {normal: {areaStyle: {type: 'default'}}},
				data:[10, 12, 21, 54, 260, 830, 710]
			}, {
				name:'Sale',
				type:'line',
				smooth:true,
				itemStyle: {normal: {areaStyle: {type: 'default'}}},
				data:[30, 182, 434, 791, 390, 30, 10]
			}, {
				name:'Preorder',
				type:'line',
				smooth:true,
				itemStyle: {normal: {areaStyle: {type: 'default'}}},
				data:[1320, 1132, 601, 234, 120, 90, 20]
			}
		]
	});

	// bar 1 - Vertical Bars
	echarts.init(document.getElementById('echarts-bar-1')).setOption({
	  tooltip : {
		trigger: 'axis'
	  },
	  legend: {
		data:['Sale','Market']
	  },
	  calculable : true,
	  xAxis : [
		{
		  type : 'category',
		  data : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
		}
	  ],
	  yAxis : [
		{
		  type : 'value'
		}
	  ],
	  series : [
		{
		  name:'Sale',
		  type:'bar',
		  data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
		  markPoint : {
			data : [
			  {type : 'max', name: 'Max'},
			  {type : 'min', name: 'Min'}
			]
		  },
		  markLine : {
			data : [
			  {type : 'average', name: 'Average'}
			]
		  }
		},
		{
		  name:'Market',
		  type:'bar',
		  data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
		  markPoint : {
			data : [
			  {name : 'Max', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
			  {name : 'Min', value : 2.3, xAxis: 11, yAxis: 3}
			]
		  },
		  markLine : {
			data : [
			  {type : 'average', name : 'Average'}
			]
		  }
		}
	  ]
	});

	// bar 2 - Horizontal Bars
	echarts.init(document.getElementById('echarts-bar-2')).setOption({
	  tooltip : {
		trigger: 'axis'
	  },
	  legend: {
		data:['2011', '2012']
	  },
	  calculable : true,
	  grid : {
		x: 60
	  },
	  xAxis : [
		{
		  type : 'value',
		  boundaryGap : [0, 0.01]
		}
	  ],
	  yAxis : [
		{
		  type : 'category',
		  data : ['Brasil','Indonesia','USA','India','China','World(M)']
		}
	  ],
	  series : [
		{
		  name:'2011',
		  type:'bar',
		  data:[18203, 23489, 29034, 104970, 131744, 630230]
		},
		{
		  name:'2012',
		  type:'bar',
		  data:[19325, 23438, 31000, 121594, 134141, 681807]
		}
	  ]
	});

	// bar 3 - 2-Direction Bars
	echarts.init(document.getElementById('echarts-bar-3')).setOption({
	  tooltip : {
		trigger: 'axis'
	  },
	  legend: {
		data:['Profit', 'Out', 'In']
	  },
	  calculable : true,
	  xAxis : [
		{
		  type : 'value'
		}
	  ],
	  yAxis : [
		{
		  type : 'category',
		  axisTick : {show: false},
		  data : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
		}
	  ],
	  series : [
		{
		  name:'Profit',
		  type:'bar',
		  itemStyle : { normal: {label : {show: true, position: 'inside'}}},
		  data:[200, 170, 240, 244, 200, 220, 210]
		},
		{
		  name:'In',
		  type:'bar',
		  stack: 'Total',
		  barWidth : 5,
		  itemStyle: {normal: {
			  label : {show: true}
		  }},
		  data:[320, 302, 341, 374, 390, 450, 420]
		},
		{
		  name:'Out',
		  type:'bar',
		  stack: 'Total',
		  itemStyle: {normal: {
			  label : {show: true, position: 'left'}
		  }},
		  data:[-120, -132, -101, -134, -190, -230, -210]
		}
	  ]
	});

	// bar 4 - Horizontal Stacked Bars
	echarts.init(document.getElementById('echarts-bar-4')).setOption({
	  tooltip : {
		trigger: 'axis',
		axisPointer : {
		  type : 'shadow'
		}
	  },
	  legend: {
		data: ['Interview', 'Marketing','Advertising','Video Ads','Search Engine']
	  },
	  grid: {
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
	  },
	  xAxis:{
		type: 'value'
	  },
	  yAxis: {
		type: 'category',
		data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
	  },
	  series: [
		{
		  name: 'Interview',
		  type: 'bar',
		  stack: 'Total',
		  label: {
			normal: {
			  show: true,
			  position: 'insideRight'
			}
		  },
		  data: [320, 302, 301, 334, 390, 330, 320]
		},
		{
		  name: 'Marketing',
		  type: 'bar',
		  stack: 'Total',
		  label: {
			normal: {
			  show: true,
			  position: 'insideRight'
			}
		  },
		  data: [120, 132, 101, 134, 90, 230, 210]
		},
		{
		  name: 'Advertising',
		  type: 'bar',
		  stack: 'Total',
		  label: {
			normal: {
			  show: true,
			  position: 'insideRight'
			}
		  },
		  data: [220, 182, 191, 234, 290, 330, 310]
		},
		{
		  name: 'Video Ads',
		  type: 'bar',
		  stack: 'Total',
		  label: {
			normal: {
			  show: true,
			  position: 'insideRight'
			}
		  },
		  data: [150, 212, 201, 154, 190, 330, 410]
		},
		{
		  name: 'Search Eengine',
		  type: 'bar',
		  stack: 'Total',
		  label: {
			normal: {
			  show: true,
			  position: 'insideRight'
			}
		  },
		  data: [820, 832, 901, 934, 1290, 1330, 1320]
		}
	  ]
	});

	// bar 5 - Stacked Bars
	echarts.init(document.getElementById('echarts-bar-5')).setOption({
	  tooltip : {
		  trigger: 'axis',
		  axisPointer : {
			  type : 'shadow'
		  }
	  },
	  legend: {
		  data:['Interview', 'Marketing','Advertising','Video Ads','search engine','Baidu','Google','Ask','Other']
	  },
	  grid: {
		  left: '3%',
		  right: '4%',
		  bottom: '3%',
		  containLabel: true
	  },
	  xAxis : [
		  {
			  type : 'category',
			  data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
		  }
	  ],
	  yAxis : [
		  {
			  type : 'value'
		  }
	  ],
	  series : [
		  {
			  name:'Interview',
			  type:'bar',
			  data:[320, 332, 301, 334, 390, 330, 320]
		  },
		  {
			  name:'Marketing',
			  type:'bar',
			  stack: 'advertising',
			  data:[120, 132, 101, 134, 90, 230, 210]
		  },
		  {
			  name:'ads',
			  type:'bar',
			  stack: 'advertising',
			  data:[220, 182, 191, 234, 290, 330, 310]
		  },
		  {
			  name:'Video Ads',
			  type:'bar',
			  stack: 'advertising',
			  data:[150, 232, 201, 154, 190, 330, 410]
		  },
		  {
			  name:'search engine',
			  type:'bar',
			  data:[862, 1018, 964, 1026, 1679, 1600, 1570],
			  markLine : {
				  lineStyle: {
				  	color: colors.warning,
					  normal: {
						  type: 'dashed'
					  }
				  },
				  data : [
					  [{type : 'min'}, {type : 'max'}]
				  ]
			  }
		  },
		  {
			  name:'Baidu',
			  type:'bar',
			  barWidth : 5,
			  stack: 'search engine',
			  data:[620, 732, 701, 734, 1090, 1130, 1120]
		  },
		  {
			  name:'Google',
			  type:'bar',
			  stack: 'search engine',
			  data:[120, 132, 101, 134, 290, 230, 220]
		  },
		  {
			  name:'Ask',
			  type:'bar',
			  stack: 'search engine',
			  data:[60, 72, 71, 74, 190, 130, 110]
		  },
		  {
			  name:'Other',
			  type:'bar',
			  stack: 'search engine',
			  data:[62, 82, 91, 84, 109, 110, 120]
		  }
	  ]
	});

	// pie 1 - Basic Pie
	echarts.init(document.getElementById('echarts-pie-1')).setOption({
		tooltip : {
			trigger: 'item',
			formatter: '{a} <br/>{b} : {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			data: ['Interview','Marketing','Advertising','Video Ads','Search']
		},
		series : [
			{
				name: 'Access Sources',
				type: 'pie',
				radius : '55%',
				center: ['50%', '60%'],
				data:[
					{value:335, name:'Interview'},
					{value:310, name:'Marketing'},
					{value:234, name:'Advertising'},
					{value:135, name:'Video Ads'},
					{value:1548, name:'Search'}
				],
				itemStyle: {
					emphasis: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				}
			}
		]
	});

	// pie 2 - Doughnut Chart
	echarts.init(document.getElementById('echarts-pie-2')).setOption({
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			data:['Interview','Marketing','Advertising','Video Ads','Search']
		},
		series: [
			{
				name:'Access Sources',
				type:'pie',
				radius: ['50%', '70%'],
				avoidLabelOverlap: false,
				label: {
					normal: {
						show: false,
						position: 'center'
					},
					emphasis: {
						show: true,
						textStyle: {
							fontSize: '30',
							fontWeight: 'bold'
						}
					}
				},
				labelLine: {
					normal: {
						show: false
					}
				},
				data:[
					{value:335, name:'Interview'},
					{value:310, name:'Marketing'},
					{value:234, name:'Advertising'},
					{value:135, name:'Video Ads'},
					{value:1548, name:'Search'}
				]
			}
		]
	});

	// pie 3 - Nested Pie
	echarts.init(document.getElementById('echarts-pie-3')).setOption({
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			data:['Through','Marketing ','Search','Marketing','Advertising','Video Ads','Baidu','Google','Ask','Other']
		},
		series: [
			{
				name:'Access Sources',
				type:'pie',
				selectedMode: 'single',
				radius: [0, '30%'],

				label: {
					normal: {
						position: 'inner'
					}
				},
				labelLine: {
					normal: {
						show: false
					}
				},
				data:[
					{value:335, name:'Through', selected:true},
					{value:679, name:'Marketing '},
					{value:1548, name:'Search'}
				]
			},
			{
				name:'Access Sources',
				type:'pie',
				radius: ['40%', '55%'],

				data:[
					{value:335, name:'Through'},
					{value:310, name:'Marketing'},
					{value:234, name:'Advertising'},
					{value:135, name:'Video Ads'},
					{value:1048, name:'Baidu'},
					{value:251, name:'Google'},
					{value:147, name:'Ask'},
					{value:102, name:'Other'}
				]
			}
		]
	});

	// pie 4 - Rose Pie
	echarts.init(document.getElementById('echarts-pie-4')).setOption({
		tooltip : {
			trigger: 'item',
			formatter: '{a} <br/>{b} : {c} ({d}%)'
		},
		legend: {
			x : 'center',
			y : 'top',
			data:['rose1','rose2','rose3','rose4','rose5','rose6', 'rose7']
		},
		calculable : true,
		series : [
			{
				name:'Rose',
				type:'pie',
				radius : [20, 110],
				center : ['50%', 200],
				roseType : 'radius',
				label: {
					normal: {
						show: false
					},
					emphasis: {
						show: true
					}
				},
				lableLine: {
					normal: {
						show: false
					},
					emphasis: {
						show: true
					}
				},
				data:[
					{value:10, name:'rose1'},
					{value:5, name:'rose2'},
					{value:15, name:'rose3'},
					{value:25, name:'rose4'},
					{value:20, name:'rose5'},
					{value:35, name:'rose6'},
					{value:30, name:'rose7'},
				]
			}
		]
	});
	
	// scatter 1 - Scatter Example 1
	echarts.init(document.getElementById('echarts-scatter-1')).setOption({
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    tooltip : {
	        trigger: 'axis',
	        showDelay : 0,
	        formatter : function (params) {
	            if (params.value.length > 1) {
	                return params.seriesName + ' :<br/>'
	                   + params.value[0] + 'cm '
	                   + params.value[1] + 'kg ';
	            }
	            else {
	                return params.seriesName + ' :<br/>'
	                   + params.name + ' : '
	                   + params.value + 'kg ';
	            }
	        },
	        axisPointer:{
	            show: true,
	            type : 'cross',
	            lineStyle: {
	                type : 'dashed',
	                width : 1
	            }
	        }
	    },
	    legend: {
	        data: ['Female','Male'],
	        left: 'right'
	    },
	    xAxis : [
	        {
	            type : 'value',
	            scale:true,
	            axisLabel : {
	                formatter: '{value} cm'
	            },
	            splitLine: {
	                lineStyle: {
	                    type: 'dashed'
	                }
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	            scale:true,
	            axisLabel : {
	                formatter: '{value} kg'
	            },
	            splitLine: {
	                lineStyle: {
	                    type: 'dashed'
	                }
	            }
	        }
	    ],
	    series : [
	        {
	            name:'Female',
	            type:'scatter',
	            data: [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
	                [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
	                [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
	                [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
	                [159.5, 50.6], [175.0, 82.5], [166.8, 57.2], [176.5, 87.8], [170.2, 72.8],
	                [174.0, 54.5], [173.0, 59.8], [179.9, 67.3], [170.5, 67.8], [160.0, 47.0],
	                [154.4, 46.2], [162.0, 55.0], [176.5, 83.0], [160.0, 54.4], [152.0, 45.8],
	                [162.1, 53.6], [170.0, 73.2], [160.2, 52.1], [161.3, 67.9], [166.4, 56.6],
	                [168.9, 62.3], [163.8, 58.5], [167.6, 54.5], [160.0, 50.2], [161.3, 60.3],
	                [167.6, 58.3], [165.1, 56.2], [160.0, 50.2], [170.0, 72.9], [157.5, 59.8],
	                [167.6, 61.0], [160.7, 69.1], [163.2, 55.9], [152.4, 46.5], [157.5, 54.3],
	                [168.3, 54.8], [180.3, 60.7], [165.5, 60.0], [165.0, 62.0], [164.5, 60.3],
	                [156.0, 52.7], [160.0, 74.3], [163.0, 62.0], [165.7, 73.1], [161.0, 80.0],
	                [162.0, 54.7], [166.0, 53.2], [174.0, 75.7], [172.7, 61.1], [167.6, 55.7],
	                [151.1, 48.7], [164.5, 52.3], [163.5, 50.0], [152.0, 59.3], [169.0, 62.5],
	                [164.0, 55.7], [161.2, 54.8], [155.0, 45.9], [170.0, 70.6], [176.2, 67.2],
	                [170.0, 69.4], [162.5, 58.2], [170.3, 64.8], [164.1, 71.6], [169.5, 52.8],
	                [163.2, 59.8], [154.5, 49.0], [159.8, 50.0], [173.2, 69.2], [170.0, 55.9],
	                [161.4, 63.4], [169.0, 58.2], [166.2, 58.6], [159.4, 45.7], [162.5, 52.2],
	                [159.0, 48.6], [162.8, 57.8], [159.0, 55.6], [179.8, 66.8], [162.9, 59.4],
	                [161.0, 53.6], [151.1, 73.2], [168.2, 53.4], [168.9, 69.0], [173.2, 58.4],
	                [171.8, 56.2], [178.0, 70.6], [164.3, 59.8], [163.0, 72.0], [168.5, 65.2],
	                [166.8, 56.6], [172.7, 105.2], [163.5, 51.8], [169.4, 63.4], [167.8, 59.0],
	                [159.5, 47.6], [167.6, 63.0], [161.2, 55.2], [160.0, 45.0], [163.2, 54.0],
	                [162.2, 50.2], [161.3, 60.2], [149.5, 44.8], [157.5, 58.8], [163.2, 56.4],
	                [172.7, 62.0], [155.0, 49.2], [156.5, 67.2], [164.0, 53.8], [160.9, 54.4],
	                [162.8, 58.0], [167.0, 59.8], [160.0, 54.8], [160.0, 43.2], [168.9, 60.5],
	                [158.2, 46.4], [156.0, 64.4], [160.0, 48.8], [167.1, 62.2], [158.0, 55.5],
	                [167.6, 57.8], [156.0, 54.6], [162.1, 59.2], [173.4, 52.7], [159.8, 53.2],
	                [170.5, 64.5], [159.2, 51.8], [157.5, 56.0], [161.3, 63.6], [162.6, 63.2],
	                [160.0, 59.5], [168.9, 56.8], [165.1, 64.1], [162.6, 50.0], [165.1, 72.3],
	                [166.4, 55.0], [160.0, 55.9], [152.4, 60.4], [170.2, 69.1], [162.6, 84.5],
	                [170.2, 55.9], [158.8, 55.5], [172.7, 69.5], [167.6, 76.4], [162.6, 61.4],
	                [167.6, 65.9], [156.2, 58.6], [175.2, 66.8], [172.1, 56.6], [162.6, 58.6],
	                [160.0, 55.9], [165.1, 59.1], [182.9, 81.8], [166.4, 70.7], [165.1, 56.8],
	                [177.8, 60.0], [165.1, 58.2], [175.3, 72.7], [154.9, 54.1], [158.8, 49.1],
	                [172.7, 75.9], [168.9, 55.0], [161.3, 57.3], [167.6, 55.0], [165.1, 65.5],
	                [175.3, 65.5], [157.5, 48.6], [163.8, 58.6], [167.6, 63.6], [165.1, 55.2],
	                [165.1, 62.7], [168.9, 56.6], [162.6, 53.9], [164.5, 63.2], [176.5, 73.6],
	                [168.9, 62.0], [175.3, 63.6], [159.4, 53.2], [160.0, 53.4], [170.2, 55.0],
	                [162.6, 70.5], [167.6, 54.5], [162.6, 54.5], [160.7, 55.9], [160.0, 59.0],
	                [157.5, 63.6], [162.6, 54.5], [152.4, 47.3], [170.2, 67.7], [165.1, 80.9],
	                [172.7, 70.5], [165.1, 60.9], [170.2, 63.6], [170.2, 54.5], [170.2, 59.1],
	                [161.3, 70.5], [167.6, 52.7], [167.6, 62.7], [165.1, 86.3], [162.6, 66.4],
	                [152.4, 67.3], [168.9, 63.0], [170.2, 73.6], [175.2, 62.3], [175.2, 57.7],
	                [160.0, 55.4], [165.1, 104.1], [174.0, 55.5], [170.2, 77.3], [160.0, 80.5],
	                [167.6, 64.5], [167.6, 72.3], [167.6, 61.4], [154.9, 58.2], [162.6, 81.8],
	                [175.3, 63.6], [171.4, 53.4], [157.5, 54.5], [165.1, 53.6], [160.0, 60.0],
	                [174.0, 73.6], [162.6, 61.4], [174.0, 55.5], [162.6, 63.6], [161.3, 60.9],
	                [156.2, 60.0], [149.9, 46.8], [169.5, 57.3], [160.0, 64.1], [175.3, 63.6],
	                [169.5, 67.3], [160.0, 75.5], [172.7, 68.2], [162.6, 61.4], [157.5, 76.8],
	                [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]
	            ],
	            markPoint : {
	                data : [
	                    {type : 'max', name: 'Max'},
	                    {type : 'min', name: 'Min'}
	                ]
	            },
	            markLine : {
	                data : [
	                    {type : 'average', name: 'Average'}
	                ]
	            }
	        },
	        {
	            name:'Male',
	            type:'scatter',
	            data: [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8],
	                [181.5, 74.8], [184.0, 86.4], [184.5, 78.4], [175.0, 62.0], [184.0, 81.6],
	                [180.0, 76.6], [177.8, 83.6], [192.0, 90.0], [176.0, 74.6], [174.0, 71.0],
	                [184.0, 79.6], [192.7, 93.8], [171.5, 70.0], [173.0, 72.4], [176.0, 85.9],
	                [176.0, 78.8], [180.5, 77.8], [172.7, 66.2], [176.0, 86.4], [173.5, 81.8],
	                [178.0, 89.6], [180.3, 82.8], [180.3, 76.4], [164.5, 63.2], [173.0, 60.9],
	                [183.5, 74.8], [175.5, 70.0], [188.0, 72.4], [189.2, 84.1], [172.8, 69.1],
	                [170.0, 59.5], [182.0, 67.2], [170.0, 61.3], [177.8, 68.6], [184.2, 80.1],
	                [186.7, 87.8], [171.4, 84.7], [172.7, 73.4], [175.3, 72.1], [180.3, 82.6],
	                [182.9, 88.7], [188.0, 84.1], [177.2, 94.1], [172.1, 74.9], [167.0, 59.1],
	                [169.5, 75.6], [174.0, 86.2], [172.7, 75.3], [182.2, 87.1], [164.1, 55.2],
	                [163.0, 57.0], [171.5, 61.4], [184.2, 76.8], [174.0, 86.8], [174.0, 72.2],
	                [177.0, 71.6], [186.0, 84.8], [167.0, 68.2], [171.8, 66.1], [182.0, 72.0],
	                [167.0, 64.6], [177.8, 74.8], [164.5, 70.0], [192.0, 101.6], [175.5, 63.2],
	                [171.2, 79.1], [181.6, 78.9], [167.4, 67.7], [181.1, 66.0], [177.0, 68.2],
	                [174.5, 63.9], [177.5, 72.0], [170.5, 56.8], [182.4, 74.5], [197.1, 90.9],
	                [180.1, 93.0], [175.5, 80.9], [180.6, 72.7], [184.4, 68.0], [175.5, 70.9],
	                [180.6, 72.5], [177.0, 72.5], [177.1, 83.4], [181.6, 75.5], [176.5, 73.0],
	                [175.0, 70.2], [174.0, 73.4], [165.1, 70.5], [177.0, 68.9], [192.0, 102.3],
	                [176.5, 68.4], [169.4, 65.9], [182.1, 75.7], [179.8, 84.5], [175.3, 87.7],
	                [184.9, 86.4], [177.3, 73.2], [167.4, 53.9], [178.1, 72.0], [168.9, 55.5],
	                [157.2, 58.4], [180.3, 83.2], [170.2, 72.7], [177.8, 64.1], [172.7, 72.3],
	                [165.1, 65.0], [186.7, 86.4], [165.1, 65.0], [174.0, 88.6], [175.3, 84.1],
	                [185.4, 66.8], [177.8, 75.5], [180.3, 93.2], [180.3, 82.7], [177.8, 58.0],
	                [177.8, 79.5], [177.8, 78.6], [177.8, 71.8], [177.8, 116.4], [163.8, 72.2],
	                [188.0, 83.6], [198.1, 85.5], [175.3, 90.9], [166.4, 85.9], [190.5, 89.1],
	                [166.4, 75.0], [177.8, 77.7], [179.7, 86.4], [172.7, 90.9], [190.5, 73.6],
	                [185.4, 76.4], [168.9, 69.1], [167.6, 84.5], [175.3, 64.5], [170.2, 69.1],
	                [190.5, 108.6], [177.8, 86.4], [190.5, 80.9], [177.8, 87.7], [184.2, 94.5],
	                [176.5, 80.2], [177.8, 72.0], [180.3, 71.4], [171.4, 72.7], [172.7, 84.1],
	                [172.7, 76.8], [177.8, 63.6], [177.8, 80.9], [182.9, 80.9], [170.2, 85.5],
	                [167.6, 68.6], [175.3, 67.7], [165.1, 66.4], [185.4, 102.3], [181.6, 70.5],
	                [172.7, 95.9], [190.5, 84.1], [179.1, 87.3], [175.3, 71.8], [170.2, 65.9],
	                [193.0, 95.9], [171.4, 91.4], [177.8, 81.8], [177.8, 96.8], [167.6, 69.1],
	                [167.6, 82.7], [180.3, 75.5], [182.9, 79.5], [176.5, 73.6], [186.7, 91.8],
	                [188.0, 84.1], [188.0, 85.9], [177.8, 81.8], [174.0, 82.5], [177.8, 80.5],
	                [171.4, 70.0], [185.4, 81.8], [185.4, 84.1], [188.0, 90.5], [188.0, 91.4],
	                [182.9, 89.1], [176.5, 85.0], [175.3, 69.1], [175.3, 73.6], [188.0, 80.5],
	                [188.0, 82.7], [175.3, 86.4], [170.5, 67.7], [179.1, 92.7], [177.8, 93.6],
	                [175.3, 70.9], [182.9, 75.0], [170.8, 93.2], [188.0, 93.2], [180.3, 77.7],
	                [177.8, 61.4], [185.4, 94.1], [168.9, 75.0], [185.4, 83.6], [180.3, 85.5],
	                [174.0, 73.9], [167.6, 66.8], [182.9, 87.3], [160.0, 72.3], [180.3, 88.6],
	                [167.6, 75.5], [186.7, 101.4], [175.3, 91.1], [175.3, 67.3], [175.9, 77.7],
	                [175.3, 81.8], [179.1, 75.5], [181.6, 84.5], [177.8, 76.6], [182.9, 85.0],
	                [177.8, 102.5], [184.2, 77.3], [179.1, 71.8], [176.5, 87.9], [188.0, 94.3],
	                [174.0, 70.9], [167.6, 64.5], [170.2, 77.3], [167.6, 72.3], [188.0, 87.3],
	                [174.0, 80.0], [176.5, 82.3], [180.3, 73.6], [167.6, 74.1], [188.0, 85.9],
	                [180.3, 73.2], [167.6, 76.3], [183.0, 65.9], [183.0, 90.9], [179.1, 89.1],
	                [170.2, 62.3], [177.8, 82.7], [179.1, 79.1], [190.5, 98.2], [177.8, 84.1],
	                [180.3, 83.2], [180.3, 83.2]
	            ],
	            markPoint : {
	                data : [
	                    {type : 'max', name: 'Max'},
	                    {type : 'min', name: 'Min'}
	                ]
	            },
	            markLine : {
	                data : [
	                    {type : 'average', name: 'Average'}
	                ]
	            }
	        }
	    ]
	});

	// scatter 2 - Scatter Example 2
	echarts.init(document.getElementById('echarts-scatter-2')).setOption({
	    tooltip : {
	        trigger: 'axis',
	        showDelay : 0,
	        axisPointer:{
	            show: true,
	            type : 'cross',
	            lineStyle: {
	                type : 'dashed',
	                width : 1
	            }
	        },
	        zlevel: 1
	    },
	    legend: {
	        data:['sin','cos']
	    },
	    xAxis : [
	        {
	            type : 'value',
	            scale:true
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	            scale:true
	        }
	    ],
	    series : [
	        {
	            name:'sin',
	            type:'scatter',
	            large: true,
	            symbolSize: 3,
	            data: (function () {
	                var d = [];
	                var len = 10000;
	                var x = 0;
	                while (len--) {
	                    x = (Math.random() * 10).toFixed(3) - 0;
	                    d.push([
	                        x,
	                        (Math.sin(x) - x * (len % 2 ? 0.1 : -0.1) * Math.random()).toFixed(3) - 0
	                    ]);
	                }
	                return d;
	            })()
	        },
	        {
	            name:'cos',
	            type:'scatter',
	            large: true,
	            symbolSize: 2,
	            data: (function () {
	                var d = [];
	                var len = 20000;
	                var x = 0;
	                while (len--) {
	                    x = (Math.random() * 10).toFixed(3) - 0;
	                    d.push([
	                        x,
	                        (Math.cos(x) - x * (len % 2 ? 0.1 : -0.1) * Math.random()).toFixed(3) - 0
	                    ]);
	                }
	                return d;
	            })()
	        }
	    ]
	});

	// other 1 - Gauge
	echarts.init(document.getElementById('echarts-other-1')).setOption({
        tooltip : {
            formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                name: 'Business Index',
                type: 'gauge',
                detail: {formatter:'{value}%'},
                data: [{value: 50, name: 'Completed'}]
            }
        ]
    });

	// other 2 - Multiple Gauge
	echarts.init(document.getElementById('echarts-other-2')).setOption({
	    tooltip : {
	        formatter: '{a} <br/>{c} {b}'
	    },
	    series : [
	        {
	            name:'Speed',
	            type:'gauge',
	            z: 3,
	            min:0,
	            max:220,
	            splitNumber:11,  
	            radius : '60%',
	            axisLine: {            
	                lineStyle: {       
	                    width: 10
	                }
	            },
	            axisTick: {            
	                length :15,       
	                lineStyle: {      
	                    color: 'auto'
	                }
	            },
	            splitLine: {           
	                length :20,        
	                lineStyle: {       
	                    color: 'auto'
	                }
	            },
	            title : {
	                textStyle: {       
	                    fontWeight: 'bolder',
	                    fontSize: 14,
	                    fontStyle: 'italic'
	                }
	            },
	            detail : {
	                textStyle: {       
	                    fontWeight: 'bolder'
	                }
	            },
	            data:[{value: 40, name: 'km/h'}]
	        },
	        {
	            name:'Roll',
	            type:'gauge',
	            center : ['25%', '55%'],    
	            radius : '40%',
	            min:0,
	            max:7,
	            endAngle:45,
	            splitNumber:7,
	            axisLine: {            
	                lineStyle: {       
	                    width: 8
	                }
	            },
	            axisTick: {           
	                length :12,       
	                lineStyle: {      
	                    color: 'auto'
	                }
	            },
	            splitLine: {          
	                length :20,      
	                lineStyle: {   
	                    color: 'auto'
	                }
	            },
	            pointer: {
	                width:5
	            },
	            title : {
	                offsetCenter: [0, '-30%'],
	                textStyle: {
	                    fontSize: 11,
	                }
	            },
	            detail : {
	                textStyle: {      
	                    fontWeight: 'bolder'
	                }
	            },
	            data:[{value: 1.5, name: 'x1000 r/min'}]
	        },
	        {
	            name:'Gas',
	            type:'gauge',
	            center : ['75%', '50%'], 
	            radius : '40%',
	            min:0,
	            max:2,
	            startAngle:135,
	            endAngle:45,
	            splitNumber:2,
	            axisLine: {            
	                lineStyle: {       
	                    color: [[0.2, '#ff4500'],[0.8, '#48b'],[1, '#228b22']], 
	                    width: 8
	                }
	            },
	            axisTick: {           
	                splitNumber:5,
	                length :10,      
	                lineStyle: {     
	                    color: 'auto'
	                }
	            },
	            axisLabel: {
	                formatter:function(v){
	                    switch (v + '') {
	                        case '0' : return 'E';
	                        case '1' : return 'Gas';
	                        case '2' : return 'F';
	                    }
	                }
	            },
	            splitLine: {         
	                length :15,      
	                lineStyle: {      
	                    color: 'auto'
	                }
	            },
	            pointer: {
	                width:2
	            },
	            title : {
	                show: false
	            },
	            detail : {
	                show: false
	            },
	            data:[{value: 0.5, name: 'gas'}]
	        },
	        {
	            name:'Water',
	            type:'gauge',
	            center : ['75%', '50%'],  
	            radius : '40%',
	            min:0,
	            max:2,
	            startAngle:315,
	            endAngle:225,
	            splitNumber:2,
	            axisLine: {           
	                lineStyle: {       
	                    color: [[0.2, '#ff4500'],[0.8, '#48b'],[1, '#228b22']], 
	                    width: 8
	                }
	            },
	            axisTick: {            
	                show: false
	            },
	            axisLabel: {
	                formatter:function(v){
	                    switch (v + '') {
	                        case '0' : return 'H';
	                        case '1' : return 'Water';
	                        case '2' : return 'C';
	                    }
	                }
	            },
	            splitLine: {          
	                length :15,       
	                lineStyle: {     
	                    color: 'auto'
	                }
	            },
	            pointer: {
	                width:2
	            },
	            title : {
	                show: false
	            },
	            detail : {
	                show: false
	            },
	            data:[{value: 0.5, name: 'gas'}]
	        }
	    ]
	});

	// other 3 - Funnel Plot
	echarts.init(document.getElementById('echarts-other-3')).setOption({
	    tooltip: {
	        trigger: 'item',
	        formatter: '{a} <br/>{b} : {c}%'
	    },
	    legend: {
	        data: ['Show','Click','Access','Advisory','Order']
	    },
	    calculable: true,
	    series: [
	        {
	            name:'Funnel plot',
	            type:'funnel',
	            left: '10%',
	            top: 60,
	            //x2: 80,
	            bottom: 60,
	            width: '80%',
	            // height: {totalHeight} - y - y2,
	            min: 0,
	            max: 100,
	            minSize: '0%',
	            maxSize: '100%',
	            sort: 'descending',
	            gap: 2,
	            label: {
	                normal: {
	                    show: true,
	                    position: 'inside'
	                },
	                emphasis: {
	                    textStyle: {
	                        fontSize: 16
	                    }
	                }
	            },
	            labelLine: {
	                normal: {
	                    length: 10,
	                    lineStyle: {
	                        width: 1,
	                        type: 'solid'
	                    }
	                }
	            },
	            itemStyle: {
	                normal: {
	                    borderColor: '#fff',
	                    borderWidth: 1
	                }
	            },
	            data: [
	                {value: 60, name: 'Access'},
	                {value: 40, name: 'Advisory'},
	                {value: 20, name: 'Order'},
	                {value: 80, name: 'Click'},
	                {value: 100, name: 'Show'}
	            ]
	        }
	    ]
	});

	// other 4 - Radar Chart
	echarts.init(document.getElementById('echarts-other-4')).setOption({
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            y : 0,
            data:['Chrome','Firefox']
        },
        calculable : true,
        polar : [
            {
                indicator : [
                    {text : 'Speed', max  : 100},
                    {text : 'Memory', max  : 100},
                    {text : 'Design', max  : 100},
                    {text : 'Respond', max  : 100},
                    {text : 'Security', max  : 100},
                    {text : 'Support', max  : 100}
                ],
                radius : 130
            }
        ],
        series : [
            {
                name: 'Players entirely live data',
                type: 'radar',
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                },
                data : [
                    {
                        value : [97, 42, 88, 94, 90, 86],
                        name : 'Firefox'
                    },
                    {
                        value : [97, 32, 74, 95, 88, 92],
                        name : 'Chrome'
                    }
                ]
            }
        ]
    });
});