'use strict';

angular.module('kalabox.initialize', [])
  .config(function ($routeProvider) {
    $routeProvider.when('/initialize', {
      templateUrl: 'modules/initialize/initialize.html',
      controller: 'InitializeCtrl'
    });
  })
  .controller('InitializeCtrl',
  ['$scope', '$location', '_', 'pconfig', 'VirtualBox', 'Boot2Docker',
    function ($scope, $location, _, pconfig, VirtualBox, Boot2Docker) {

      var remote = require('remote');
      var Menu = remote.require('menu');
      var template = [
        {
          label: 'Kalabox',
          submenu: [
            {
              label: 'About Kalabox',
              selector: 'orderFrontStandardAboutPanel:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              selector: 'terminate:'
            },
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              accelerator: 'Command+R',
              click: function() { remote.getCurrentWindow().reload(); }
            },
            {
              label: 'Toggle DevTools',
              accelerator: 'Alt+Command+I',
              click: function() { remote.getCurrentWindow().toggleDevTools(); }
            },
          ]
        },
        {
          label: 'Window',
          submenu: [
            {
              label: 'Minimize',
              accelerator: 'Command+M',
              selector: 'performMiniaturize:'
            },
            {
              label: 'Close',
              accelerator: 'Command+W',
              selector: 'performClose:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Bring All to Front',
              selector: 'arrangeInFront:'
            }
          ]
        },
        {
          label: 'Help',
          submenu: []
        }
      ];

      if (pconfig.platform === 'darwin') {
        // Different mac settings.
      }

      var menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);

      // Best practices is to manage our data in a scope object
      $scope.ui = {
        messageText: 'Testing dependencies...'
      };

      // Setup the dependency array
      $scope.ui.dependencies = [
        {
          key: 'virtualbox',
          name: 'VirtualBox',
          service: VirtualBox,
          checked: false,
          pass: false,
          status: '',
          version: ''
        },
        {
          key: 'boot2docker',
          name: 'Boot2Docker',
          service: Boot2Docker,
          checked: false,
          pass: false,
          status: '',
          version: ''
        }
      ];

      // reduce callback, returns true if all deps have been checked
      var depChecked = function(result, dependency) {
        return !(!result || !dependency.checked);
      };

      // reduce callback, returns true if all deps passed
      var depPassed = function(result, dependency) {
        return !(!result || !dependency.pass);
      };

      // map callback to test dependency
      var depInstalled = function(dependency) {
        dependency.service.getVersion().then(function(version) {
          dependency.checked = true;
          if (version !== false) {
            dependency.pass = true;
            dependency.status = 'OK';
            dependency.version = version;
          }
          else {
            dependency.status = 'Failed';
            dependency.version = 'N/A';
          }

          // check if all deps have been checked
          if (_.reduce($scope.ui.dependencies, depChecked, true)) {
            // if so, redirect based on if they have all passed or not
            if (_.reduce($scope.ui.dependencies, depPassed, true)) {
              $location.path('/dashboard');
            }
            else {
              $location.path('/installer');
            }
          }
        });
      };

      // run the dependency install checks.
      _.map($scope.ui.dependencies, depInstalled);

    }]);
