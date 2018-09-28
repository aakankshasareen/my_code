/*This file is a node.js module.
This is a sample implementation of UDF-compatible datafeed wrapper for Fuleex (historical data)
Some algorithms may be incorrect because it's rather an UDF implementation sample
then a proper datafeed implementation.
*/

/* global require */
/* global console */
/* global exports */
/* global process */

"use strict";

var version = '1.0';

var https = require("https");
var http = require("http");



var cache = {};

var cacheCleanupTime = 3 * 60 * 60 * 1000; // 3 hours
var minimumDate = '2017-06-01';

// this cache is intended to reduce number of requests to server
setInterval(function () {
	Cache = {};
	console.warn(dateForLogs() + 'cache invalidated');
}, cacheCleanupTime);

function dateForLogs() {
	return (new Date()).toISOString() + ': ';
}

var defaultResponseHeader = {
	"Content-Type": "text/plain",
	'Access-Control-Allow-Origin': '*'
};

function sendJsonResponse(response, jsonData) {
	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(jsonData));
	response.end();
}

function dateToYMD(date) {
	var obj = new Date(date);
	var year = obj.getFullYear();
	var month = obj.getMonth() + 1;
	var day = obj.getDate();
	return year + "-" + month + "-" + day;
}

function sendError(error, response) {
	response.writeHead(200, defaultResponseHeader);
	response.write("{\"s\":\"error\",\"errmsg\":\"" + error + "\"}");
	response.end();
}

function httpGet(datafeedHost, path, callback) {
	var options = {
		host: datafeedHost,
		path: path
	};

	function onDataCallback(response) {
		var result = '';
		// // console.log("response", response);
		// // console.log("chunk", chunk);
		response.on('data', function (chunk) {
			result += chunk;
		});

		response.on('end', function () {
			if (response.statusCode !== 200) {
				callback({ status: 'ERR_STATUS_CODE', errmsg: response.statusMessage || '' });
				return;
			}

			callback({ status: 'ok', data: result });
		});
	}

	var req = https.request(options, onDataCallback);

	req.on('socket', function (socket) {
		socket.setTimeout(5000);
		socket.on('timeout', function () {
			// console.log(dateForLogs() + 'timeout');
			req.abort();
		});
	});

	req.on('error', function (e) {
		callback({ status: 'ERR_SOCKET', errmsg: e.message || '' });
	});

	req.end();
}

function convertToUDFFormat(data) {
	// console.log("converting udf" + JSON.stringify(data));
	function parseDate(input) {
		var parts = input.split('-');
		return Date.UTC(parts[0], parts[1] - 1, parts[2]);
	}

	function columnIndices(columns) {
		var indices = {};
		for (var i = 0; i < columns.length; i++) {
			indices[columns[i].name] = i;
		}

		return indices;
	}

	var result = {
		t: [],
		c: [],
		o: [],
		h: [],
		l: [],
		v: [],
		s: "ok"
	};

	try {
		var jData = JSON.parse(data);
		var datatable = jData.data;

		// console.log(datatable);

		datatable.forEach(function (row) {
			result.t.push(parseDate(row['day'])/1000);
			result.o.push(row['first_open']);
			result.h.push(row['high']);
			result.l.push(row['low']);
			result.c.push(row['last_close']);
			result.v.push(row['volume']);
		});
		// console.log(JSON.stringify(result));

	} catch (error) {
		return null;
	}
	return result;
}
//
// function convertYahooQuotesToUDFFormat(tickersMap, data) {
// 	if (!data.query || !data.query.results) {
// 		var errmsg = "ERROR: empty quotes response: " + JSON.stringify(data);
// 		// console.log(dateForLogs() + errmsg);
// 		return {
// 			s: "error",
// 			errmsg: errmsg
// 		};
// 	}
//
// 	var result = {
// 		s: "ok",
// 		d: []
// 	};
//
// 	[].concat(data.query.results.quote).forEach(function (quote) {
// 		var ticker = tickersMap[quote.symbol];
//
// 		// this field is an error token
// 		if (quote["ErrorIndicationreturnedforsymbolchangedinvalid"] || !quote.StockExchange) {
// 			result.d.push({
// 				s: "error",
// 				n: ticker,
// 				v: {}
// 			});
// 			return;
// 		}
//
// 		result.d.push({
// 			s: "ok",
// 			n: ticker,
// 			v: {
// 				ch: +(quote.ChangeRealtime || quote.Change),
// 				chp: +((quote.PercentChange || quote.ChangeinPercent) && (quote.PercentChange || quote.ChangeinPercent).replace(/[+-]?(.*)%/, "$1")),
//
// 				short_name: quote.Symbol,
// 				exchange: quote.StockExchange,
// 				original_name: quote.StockExchange + ":" + quote.Symbol,
// 				description: quote.Name,
//
// 				lp: +quote.LastTradePriceOnly,
// 				ask: +quote.AskRealtime,
// 				bid: +quote.BidRealtime,
//
// 				open_price: +quote.Open,
// 				high_price: +quote.DaysHigh,
// 				low_price: +quote.DaysLow,
// 				prev_close_price: +quote.PreviousClose,
// 				volume: +quote.Volume,
// 			}
// 		});
// 	});
// 	return result;
// }

function proxyRequest(controller, options, response) {
	controller.request(options, function (res) {
		var result = '';

		res.on('data', function (chunk) {
			result += chunk;
		});

		res.on('end', function () {
			if (res.statusCode !== 200) {
				response.writeHead(200, defaultResponseHeader);
				response.write(JSON.stringify({
					s: 'error',
					errmsg: 'Failed to get news'
				}));
				response.end();
				return;
			}
			response.writeHead(200, defaultResponseHeader);
			response.write(result);
			response.end();
		});
	}).end();
}

function RequestProcessor(symbolsDatabase) {
	this._symbolsDatabase = symbolsDatabase;
	this._failedYahooTime = {};
}

function filterDataPeriod(data, fromSeconds, toSeconds) {
	if (!data || !data.t) {
		return data;
	}

	if (data.t[data.t.length - 1] < fromSeconds) {
		return {
			s: 'no_data',
			nextTime: data.t[data.t.length - 1]
		};
	}

	var fromIndex = null;
	var toIndex = null;
	var times = data.t;
	for (var i = 0; i < times.length; i++) {
		var time = times[i];
		if (fromIndex === null && time >= fromSeconds) {
			fromIndex = i;
		}
		if (toIndex === null && time >= toSeconds) {
			toIndex = time > toSeconds ? i - 1 : i;
		}
		if (fromIndex !== null && toIndex !== null) {
			break;
		}
	}

	fromIndex = fromIndex || 0;
	toIndex = toIndex ? toIndex + 1 : times.length;

	var s = data.s;

	if (toSeconds < times[0]) {
		s = 'no_data';
	}

	toIndex = Math.min(fromIndex + 1000, toIndex); // do not send more than 1000 bars for server capacity reasons

	return {
		t: data.t.slice(fromIndex, toIndex),
		o: data.o.slice(fromIndex, toIndex),
		h: data.h.slice(fromIndex, toIndex),
		l: data.l.slice(fromIndex, toIndex),
		c: data.c.slice(fromIndex, toIndex),
		v: data.v.slice(fromIndex, toIndex),
		s: s
	};
}

RequestProcessor.prototype._sendConfig = function (response) {

	var config = {
		supports_search: true,
		supports_group_request: false,
		supports_marks: false,
		supports_timescale_marks: false,
		supports_time: true,
		exchanges: [
			{
				value: "Fuleex",
				name: "Fuleex.in",
				desc: "Fuleex Technologies Pvt Ltd"
			}
		],
		symbols_types: [
			{
				name: "Instrument",
				value: "instrument"
			}
		],
		supported_resolutions: ["15M","H","D","W","M"]
	};

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(config));
	response.end();
};

RequestProcessor.prototype._sendSymbolSearchResults = function (query, type, exchange, maxRecords, response) {
	if (!maxRecords) {
		throw "wrong_query";
	}

	var result = this._symbolsDatabase.search(query, type, exchange, maxRecords);

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(result));
	response.end();
};

RequestProcessor.prototype._prepareSymbolInfo = function (symbolName) {
	var symbolInfo = this._symbolsDatabase.symbolInfo(symbolName);

	if (!symbolInfo) {
		throw "unknown_symbol " + symbolName;
	}

	return {
		"name": symbolInfo.name,
		"exchange-traded": symbolInfo.exchange,
		"exchange-listed": symbolInfo.exchange,
		"timezone": "India/Kolkata",
		"minmov": 1,
		"minmov2": 0,
		"pointvalue": 1,
		"session": "0000-2359",
		"has_intraday": true,
		"has_no_volume": symbolInfo.type !== "stock",
		"description": symbolInfo.description.length > 0 ? symbolInfo.description : symbolInfo.name,
		"type": symbolInfo.type,
		"supported_resolutions": ["15M","H","D","W","M"],
		"pricescale": 100,
		"ticker": symbolInfo.name.toUpperCase()
	};
};

RequestProcessor.prototype._sendSymbolInfo = function (symbolName, response) {
	var info = this._prepareSymbolInfo(symbolName);

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(info));
	response.end();
};

RequestProcessor.prototype._sendSymbolHistory = function (symbol, startDateTimestamp, endDateTimestamp, resolution, response) {
	function sendResult(content) {
		var header = Object.assign({}, defaultResponseHeader);
		header["Content-Length"] = content.length;
		response.writeHead(200, header);
		response.write(content, null, function () {
			response.end();
		});
	}

	function secondsToISO(sec) {
		if (sec === null || sec === undefined) {
			return 'n/a';
		}
		return (new Date(sec * 1000).toISOString());
	}

	function logForData(data, key, isCached) {
		var fromCacheTime = data && data.t ? data.t[0] : null;
		var toCacheTime = data && data.t ? data.t[data.t.length - 1] : null;
		// console.log(dateForLogs() + "Return result" + (isCached ? " from cache" : "") + ": " + key + ", from " + secondsToISO(fromCacheTime) + " to " + secondsToISO(toCacheTime));
	}

	// console.log(dateForLogs() + "Got history request for " + symbol + ", " + resolution + " from " + secondsToISO(startDateTimestamp)+ " to " + secondsToISO(endDateTimestamp));

	var from = minimumDate;
	var to = dateToYMD(Date.now());
	var key = symbol + "|" + from + "|" + to;

	//serve from cache
	if (cache[key]) {
		var dataFromCache = filterDataPeriod(cache[key], startDateTimestamp, endDateTimestamp);
		logForData(dataFromCache, key, true);
		sendResult(JSON.stringify(dataFromCache));
		return;
	}

	var address = "/api/getChartData/" +
		symbol + "/" +
		"D" + "/" +
		from + "/" +
		to + "/";


	httpGet("fuleex.exchange", address, function (result) {
		if (response.finished) {
			// we can be here if error happened on socket disconnect
			return;
		}

		//remove once server is up again
		if (result.status !== 'ok') {
			console.error(dateForLogs() + "Error response from Fuleex for key " + key + ". Message: " + result.errmsg);
			sendError("Error Fuleex response: " + result.errmsg, response);
			return;
		}

		var data = convertToUDFFormat(result.data);

		if (data === null) {
			var dataStr = typeof result === "string" ? result.slice(0, 100) : result;
			console.error(dateForLogs() + " failed to parse: " + dataStr);
			sendError("Invalid fuleex response", response);
			return;
		}

		if (data.t.length !== 0) {
			// console.log(dateForLogs() + "Successfully parsed and put to cache " + data.t.length + " bars.");
			cache[key] = data;
		} else {
			// console.log(dateForLogs() + "Parsing returned empty result.");
		}

		var filteredData = filterDataPeriod(data, startDateTimestamp, endDateTimestamp);
		logForData(filteredData, key, false);
		sendResult(JSON.stringify(data));
	});
};

//this function we'll come back to later
RequestProcessor.prototype._sendQuotes = function (tickersString, response) {
	var tickersMap = {}; // maps YQL symbol to ticker

	var tickers = tickersString.split(",");
	[].concat(tickers).forEach(function (ticker) {
		var yqlSymbol = ticker.replace(/.*:(.*)/, "$1");
		tickersMap[yqlSymbol] = ticker;
	});

	if (this._failedYahooTime[tickersString] && Date.now() - this._failedYahooTime[tickersString] < yahooFailedStateCacheTime) {
		sendJsonResponse(response, this._quotesQuandlWorkaround(tickersMap));
		// console.log("Quotes request : " + tickersString + ' processed from quandl cache');
		return;
	}

	var that = this;

	var yql = "env 'store://datatables.org/alltableswithkeys'; select * from yahoo.finance.quotes where symbol in ('" + Object.keys(tickersMap).join("','") + "')";
	// console.log("Quotes query: " + yql);

	var options = {
		host: "query.yahooapis.com",
		path: "/v1/public/yql?q=" + encodeURIComponent(yql) +
		"&format=json" +
		"&env=store://datatables.org/alltableswithkeys"
	};
	// for debug purposes
	// // console.log(options.host + options.path);

	http.request(options, function (res) {
		var result = '';

		res.on('data', function (chunk) {
			result += chunk;
		});

		res.on('end', function () {
			var jsonResponse = { s: 'error' };

			if (res.statusCode === 200) {
				jsonResponse = convertYahooQuotesToUDFFormat(tickersMap, JSON.parse(result));
			} else {
				console.error('Yahoo Fails with code ' + res.statusCode);
			}

			if (jsonResponse.s === 'error') {
				that._failedYahooTime[tickersString] = Date.now();
				jsonResponse = that._quotesQuandlWorkaround(tickersMap);
				// console.log("Quotes request : " + tickersString + ' processed from quandl');
			}

			sendJsonResponse(response, jsonResponse);
		});
	}).end();
};

RequestProcessor.prototype._sendNews = function (symbol, response) {
	var options = {
		host: "feeds.finance.yahoo.com",
		path: "/rss/2.0/headline?s=" + symbol + "&region=US&lang=en-US"
	};

	proxyRequest(https, options, response);
};

RequestProcessor.prototype._sendFuturesmag = function (response) {
	var options = {
		host: "www.futuresmag.com",
		path: "/rss/all"
	};

	proxyRequest(http, options, response);
};

RequestProcessor.prototype.processRequest = function (action, query, response) {

	try {
		if (action === "//config") {
			this._sendConfig(response);
		}
		else if (action === "//symbols" && !!query["symbol"]) {
			this._sendSymbolInfo(query["symbol"], response);
		}
		else if (action === "//search") {
			this._sendSymbolSearchResults(query["query"], query["type"], query["exchange"], query["limit"], response);
		}
		else if (action === "//history") {
			// console.log('historyd',query);
			this._sendSymbolHistory(query["symbol"], query["from"], query["to"], query["resolution"].toLowerCase(), response);
		}
		else if (action === "//quotes") {
			this._sendQuotes(query["symbols"], response);
		}
		else if (action === "//time") {
			this._sendTime(response);
		}
		else if (action === "//news") {
			this._sendNews(query["symbol"], response);
		}
		else if (action === "//futuresmag") {
			this._sendFuturesmag(response);
		} else {
			response.writeHead(200, defaultResponseHeader);
			response.write('Datafeed version is ' + version);
			response.end();
		}
	}
	catch (error) {
		sendError(error, response);
		console.error('Exception: ' + error);
	}
};

exports.RequestProcessor = RequestProcessor;
