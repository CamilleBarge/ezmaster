
'use strict';

/*
  Example with curl to test the reverse proxy:
  export EZMASTER_PUBLIC_DOMAIN="data.istex.fr"
  make run-debug
  curl -v --proxy "" -H "X-Forwarded-Host: aa-bb-1.data.istex.fr"
  ++ -H "X-Forwarded-Server: data.istex.fr" http://127.0.0.1:35267/
  curl -v --proxy "" -H "Host: aa-bb-1.data.istex.fr" http://127.0.0.1:35267/
 */

var path      = require('path');
var basename  = path.basename(__filename, '.js');
var debug     = require('debug')('ezmaster:' + basename);
var httpProxy = require('http-proxy');
var instances = require('../helpers/instances');


module.exports = function(options, core) {

  var proxy = httpProxy.createProxyServer({});
  var publicDomain = core.config.get('publicDomain');

  debug('Loading reverseproxy middleware: ' + (publicDomain ? 'enabled [' + publicDomain + ']' : 'disabled'));

  return function(req, res, next) {

    // false for instancesChangesBool because when this code is executed
    // the cache is already present in getInstances().
    instances.getInstances(false, function (err, instances) {

      if (err) { return new Error(err); }

      var host         = req.headers['host'];
      var reqServer    = req.headers['x-forwarded-server'];
      var reqHost      = req.headers['x-forwarded-host'];
      var reqSubdomain = reqHost ? reqHost.split('.') : false;

      debug('reverseproxy#1', host, ' ', reqSubdomain, ' && (', reqServer, ' === ', publicDomain, ')');

      // Two way to activate the RP:
      // with an explicit "Host" header
      // with the special X-Forwarded-* headers
      var isRpEnabled = {};
      isRpEnabled.byHost = publicDomain ? (host.slice(-publicDomain.length) === publicDomain) : false;
      isRpEnabled.byXForwarded = reqSubdomain && (reqServer === publicDomain);

      // TODO : rendra capable le RP de gérer le header "Host"
      console.log("########## isRpEnabled : " + isRpEnabled + " ##########");

      if (isRpEnabled.byXForwarded && instances !== undefined) {

        debug('reverseproxy#1.1');
        console.log("########## BY X FORWARDED ##########");
        console.log("########## HOST : " + host + " ##########");

        var search = reqSubdomain[0].split('-');
        console.log("########## SEARCH : " + search + " ##########");

        var found = Object.keys(instances)
          .map(function(z) {
            instances[z].current = instances[z].technicalName.split('-');
            instances[z].current[2] = instances[z].current[2] === undefined
              ? 0 : Number(instances[z].current[2]);
            if (Number.isNaN(instances[z].current[2])) {
              instances[z].current[2] = 0;
            }
            return z;
          })
          .sort(function (a, b) {
            return instances[a].current[2] < instances[b].current[2];
          })
          .filter(function (x) {
            return instances[x].current[0] === search[0] && instances[x].current[1] === search[1];
          })
          .reduce(function (prev, w) {
            if (prev !== undefined) {
              return prev;
            }
            if (search[2] === undefined) {
              return w;
            }
            if (instances[w].current[0] === search[0] && instances[w].current[1] === search[1]
              && instances[w].current[2] === Number(search[2])) {
              return w;
            }
            return;
          }, undefined);

        console.log("########## FOUND : " + found + " ##########");

        if (found !== undefined) {
          var url = 'http://'+found+':'+ '3000';
          debug('reverseproxy#1.1.1', url);
          console.log("########## URL : " + url + " ##########");
          proxy.web(req, res, { target: url });
          proxy.on('error', function(e) {
            console.error('reverseproxy#1.1.2', e);
            next(new Error('Bad gateway'));
          });
          return;
        }
        else {
          debug('reverseproxy#1.2');
          res.render('404', { title: 'No any app found :( !', path: '/', userName: req.user });
        }
      }
      else if (isRpEnabled.byHost && instances !== undefined) {

        console.log("########## BY HOST ##########");
        console.log("########## HOST : " + host + " ##########");





        var search = reqSubdomain[0].split('-');
        console.log("########## SEARCH : " + search + " ##########");

        var found = Object.keys(instances)
          .map(function(z) {
            instances[z].current = instances[z].technicalName.split('-');
            instances[z].current[2] = instances[z].current[2] === undefined
              ? 0 : Number(instances[z].current[2]);
            if (Number.isNaN(instances[z].current[2])) {
              instances[z].current[2] = 0;
            }
            return z;
          })
          .sort(function (a, b) {
            return instances[a].current[2] < instances[b].current[2];
          })
          .filter(function (x) {
            return instances[x].current[0] === search[0] && instances[x].current[1] === search[1];
          })
          .reduce(function (prev, w) {
            if (prev !== undefined) {
              return prev;
            }
            if (search[2] === undefined) {
              return w;
            }
            if (instances[w].current[0] === search[0] && instances[w].current[1] === search[1]
              && instances[w].current[2] === Number(search[2])) {
              return w;
            }
            return;
          }, undefined);

        console.log("########## FOUND : " + found + " ##########");

        if (found !== undefined) {
          var url = 'http://'+host.split('.')[0]+':'+ '3000';
          console.log("########## URL : " + url + " ##########");
          proxy.web(req, res, { target: url });
          proxy.on('error', function(e) {
            console.error('reverseproxy#1.1.2', e);
            next(new Error('Bad gateway'));
          });
          return;
        }
        else {
          debug('reverseproxy#1.2');
          res.render('404', { title: 'No any app found :( !', path: '/', userName: req.user });
        }





/*

          var url = 'http://'+host.split('.')[0]+':'+ '3000';
          console.log("########## URL : " + url + " ##########");
          proxy.web(req, res, { target: url });
*/

      }
      else {
        console.log("########## BY ELSE ##########");
        debug('reverseproxy#1.0');
        return next();
      }
    });
  };
};