var exec = require('child_process').exec,
	named = require('node-named'),
	express = require('express'),
	request = require('request'),
	dns = require('native-dns'),
	gui = require('nw.gui'),
	path = require('path'),
	net = require('net'),
	fs = require('fs'),
	app = express(),
	customTunables = require('./custom-tunables'),
	appPackage = require('./package'),
	/* Predefine variables */
	dnsServer = named.createServer(),
	gameConsole,
	tunables,
	ip;

// gui.Window.get().showDevTools();

tunables = fs.readFileSync('tunables.json', 'utf8');

app.get('/', function (req, res) {
	res.send('GTM is working.');
});

app.get('/titles/gta5/:console/tunables.json', function (req, res) {
	var data = tunables,
		health = parseFloat(customTunables.health),
		bounty = parseFloat(customTunables.bounty),
		rp = parseFloat(customTunables.rp),
		cash = parseFloat(customTunables.cash),
		passive = parseFloat(customTunables.passive),
		weapons = parseFloat(customTunables.weapons),
		carmods = parseFloat(customTunables.carmods),
		haircuts = parseFloat(customTunables.haircuts);

	gameConsole = req.params.console;

	if (customTunables.god_mode) {
		health = 999;
	} else {
		health = 1;
	}

	if (customTunables.snow) {
		data = data.replace('"TURN_SNOW_ON_OFF":[{"value":true,"start":1287929600,"end":1388034000}]', '"TURN_SNOW_ON_OFF":[{"value":true,"start":287929600,"end":2388034000}]')	
	} else {
		data = data.replace('"TURN_SNOW_ON_OFF":[{"value":true,"start":1287929600,"end":1388034000}]', '"TURN_SNOW_ON_OFF":[{"value":false,"start":287929600,"end":2388034000}]')	
	}

	if (customTunables.xmas) {
		data = data.replace('"TOGGLE_XMAS_CONTENT":[{"value":true,"start":1387882800,"end":1388966340}]', '"TOGGLE_XMAS_CONTENT":[{"value":true,"start":287929600,"end":2388034000}]')	
	} else {
		data = data.replace('"TOGGLE_XMAS_CONTENT":[{"value":true,"start":1387882800,"end":1388966340}]', '"TOGGLE_XMAS_CONTENT":[{"value":false,"start":287929600,"end":2388034000}]')	
	}

	if (customTunables.cheater) {
		data = data.replace('"SESSION_TIME_MATCHMAKING":[{"value":45000}]', '"MATCHMAKING_CONSIDER_CHEATERS": [{"value": false}],"SESSION_TIME_MATCHMAKING":[{"value":45000}]');
		
	}
	if (customTunables.bad_sport) {
		data = data.replace('"SESSION_TIME_MATCHMAKING":[{"value":45000}]', '"MATCHMAKING_CONSIDER_BADSPORTS": [{"value": false}],"SESSION_TIME_MATCHMAKING":[{"value":45000}]');
	}

	if (customTunables.idlekick) {
		data = data.replace('"IDLEKICK_WARNING1":[{"value":120000}],"IDLEKICK_WARNING2":[{"value":300000}],"IDLEKICK_WARNING3":[{"value":600000}],"IDLEKICK_KICK":[{"value":900000}]', '"IDLEKICK_WARNING1":[{"value":9000000000}],"IDLEKICK_WARNING2":[{"value":9000000000}],"IDLEKICK_WARNING3":[{"value":9000000000}],"IDLEKICK_KICK":[{"value":9000000000}]')
	}

	data = data.replace('"MAX_HEALTH_MULTIPLIER":[{"value":1.0}]', '"MAX_HEALTH_MULTIPLIER":[{"value":' + health.toFixed(1) + '}]');
	data = data.replace('"MIN_HEALTH_MULTIPLIER":[{"value":1.0}]', '"MIN_HEALTH_MULTIPLIER":[{"value":' + health.toFixed(1) + '}]');
	data = data.replace('"HEALTH_REGEN_RATE_MULTIPLIER":[{"value":1.0}]', '"HEALTH_REGEN_RATE_MULTIPLIER":[{"value":' + health.toFixed(1) + '}]');
	data = data.replace('"HEALTH_REGEN_MAX_MULTIPLIER":[{"value":1.0}]', '"HEALTH_REGEN_MAX_MULTIPLIER":[{"value":' + health.toFixed(1) + '}]');
	data = data.replace('"BOUNTY_THRESHOLD_MULTIPLIER":[{"value":1.0}]', '"BOUNTY_THRESHOLD_MULTIPLIER":[{"value":' + bounty.toFixed(1) + '}]');
	data = data.replace('"XP_MULTIPLIER":[{"value":1.0}]', '"XP_MULTIPLIER":[{"value":' + rp.toFixed(1) + '}]');
	data = data.replace('"CASH_MULTIPLIER":[{"value":1.0}]', '"CASH_MULTIPLIER":[{"value":' + cash.toFixed(1) + '}]');
	data = data.replace('"PASSIVE_DONATE":[{"value":0}]', '"PASSIVE_DONATE":[{"value":' + passive + '}]');
	data = data.replace('"WEAPONS_SHOP_MULTIPLIER":[{"value":1.0}]', '"WEAPONS_SHOP_MULTIPLIER":[{"value":' + weapons.toFixed(1) + '}]');
	data = data.replace('"CARMOD_SHOP_MULTIPLIER":[{"value":1.0}]', '"CARMOD_SHOP_MULTIPLIER":[{"value":' + carmods.toFixed(1) + '}]');
	data = data.replace('"HAIRDO_SHOP_MULTIPLIER":[{"value":1.0}]', '"HAIRDO_SHOP_MULTIPLIER":[{"value":' + haircuts.toFixed(1) + '}]');

	$('.load-online').removeClass('waiting').addClass('success');
	$('.load-online i').removeClass('glyphicon-record').addClass('glyphicon-ok-circle');

	res.set('Content-Type', 'application/json').send(data);
});

app.all('/*', function (req, res) {
	if (/commerce/.test(req.url)) {
		console.log('Loading game..');	
		$('.load-game').removeClass('waiting').addClass('success');
		$('.load-game i').removeClass('glyphicon-record').addClass('glyphicon-ok-circle');
	}
  req.pipe( request.get('http://prod.cloud.rockstargames.com' + req.url) ).pipe(res);
});

if (process.env.USER === 'root' || process.platform == 'win32') {
	app.listen(80, function () {
		gui.Window.get().show();
	});
}
else {
	if (process.platform == 'darwin') {
		var assist = confirm('To start the web server and DNS, this program must be ran as an administrator.\n\nClick OK to automate this process.\n\nAfter GTM has started you may close the Terminal window.');
		var appPath = path.resolve(process.cwd(), '../../MacOS/node-webkit').replace(/\ /g, '\\ '); 
		if (assist) {
			exec('osascript -e \'tell application "Terminal" to do script "/bin/sh ' + process.cwd().replace(/\ /g, '\\\\ ') + '/help.sh ' + appPath.replace(/\ /g, '\\ ') + '"\'');
		} else {
			alert('To run this as an administrator, open Terminal (Applications > Utilities) and type:\n\nnohup sudo ' + appPath + ' >/dev/null 2>&1 & exit\n\nOnce GTM has started, you may close the Terminal window.');
		}
		gui.App.quit();
	}
}

function getNetworkIP(callback) {
  var socket = net.createConnection(80, '173.194.46.6');
  socket.on('connect', function() {
    callback(undefined, socket.address().address);
    socket.end();
  });
  socket.on('error', function(e) {
    callback(e, 'error');
  });
};

getNetworkIP(function (err, add) {
	ip = add;
  $('.ip .value').text(ip);
});

dnsServer.listen(53, '0.0.0.0', function (err) {
	console.log('DNS server listening on port 53.');
});

dnsServer.on('query', function (query) {
	var domain = query.name(),
		type= query.type(),
		question,
		record,
		req;

	console.log('Received query for: %s %s', type, domain);

	if (domain == 'prod.cloud.rockstargames.com') {
		var record = createRecord('A', ip);
		query.addAnswer(domain, record, 14400);
		dnsServer.send(query);
	} else {
		// Pose DNS question
		question = dns.Question({
			name: domain,
			type: type
		});

		// Request answer
		req = dns.Request({
			question: question,
			server: {
				address: '8.8.8.8',
				port: 53,
				type: 'udp'
			},
			timeout: 1000
		});

		req.on('message', function (err, answer) {
			if (err) { console.error(err); } 
			else {
				answer.answer.forEach(function (ans) {
					if (ans.address) {
						console.log('Adding answer for %s: %s', domain, ans.address);
						var record = createRecord(type, ans.address);
						query.addAnswer(domain, record, 14400);
					}
				});
			}
		});

		req.on('end', function () {
			dnsServer.send(query);
		});

		req.send();
	}
});

createRecord = function (type, address) {
	var record;
	switch (type) {
		case 'A': 
			record = new named.ARecord(address);
			break;
		case 'CNAME':
			record = new named.CNAMERecord(address);
			break;
	}
	return record;
};

/* Page JavaScript */

$(function () {
	$('input[data-toggle="popover"]').popover({placement: 'right', container: 'body', trigger: 'focus'});
	$('.version').text(appPackage.version);
	request({url: 'http://gtadns.com/version.json', json:true}, function (err, resp, body) {
		if (body.version !== appPackage.version) {
			$('.new-version').text(body.version);
			$('.update-gtm').modal();
			$('.open-gtadns').click(function() {
				gui.Shell.openExternal('http://gtadns.com');
			});
		}
	});
});


var MainCtrl = function ($scope) {
	$scope.tunables = customTunables;
	setTimeout(function() {
		$scope.saveValues();
	}, 10);
	$scope.saveValues = function () {
		$scope.tunables.passive = Math.round(Math.random() * 100);
		customTunables = $scope.tunables;
		fs.writeFile('custom-tunables.json', JSON.stringify(customTunables), function (err) {
			if (err) {
				$('.save').removeClass('waiting').addClass('error');
				$('.save i').removeClass('glyphicon-record').addClass('glyphicon-remove-circle');

			} else {
				$('.save').removeClass('waiting').addClass('success');
				$('.save i').removeClass('glyphicon-record').addClass('glyphicon-ok-circle');
				$('.load-game, .load-online').removeClass('success').addClass('waiting');				
				$('.load-game i, .load-online i').removeClass('glyphicon-ok-circle').addClass('glyphicon-record');
			}
		});
	};

	$scope.defaultValues = function () {
		$scope.tunables = {
			passive: 0,
			bounty: 1,
			rp: 1,
			health: 1,
			cash: 1,
			haircuts: 1,
			weapons: 1,
			carmods: 1,
			snow: false,
			xmas: false,
			god_mode: false,
			idlekick: false,
			cheater: false,
			bad_sport: false
		};
	};

	$scope.$watch(function () {
		$('.success i').removeClass('glyphicon-ok-circle').addClass('glyphicon-record');
		$('.success').removeClass('success').addClass('waiting');
	});
};