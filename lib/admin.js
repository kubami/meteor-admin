import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { Roles } from 'meteor/alanning:roles';

Admin = {
  _createRouteCallbacks: [],
  _routeOptions: {},
  config: new ReactiveDict()
};

Admin.config.setDefault('loginLayoutTemplate', undefined);
Admin.config.setDefault('layoutTemplate', 'mfAdminLayout');
Admin.config.setDefault('name', 'Admin');
//
// Admin.isAdmin = function (userId) {
//   return Roles.userIsInRole(userId, ['admin']);
// };

Admin.path = function (path) {
  path = path || '';
  if (path[0] === '/') {
    return '/admin' + path;
  }
  return '/admin/' + path;
};

Admin.go = function (path) {
    return FlowRouter.go(Admin.path(path));
};

Admin.route = function (path, options) {
  path = Admin.path(path);
  _.each(Admin._createRouteCallbacks, function (cb) {
    cb(path, options);
  });
};

Admin._currentRouteOptions = function () {
    return Admin._routeOptions[FlowRouter.current().route.name];
};

Admin._routeParams = function () {
    return FlowRouter.current().params;
};

Admin.onRouteCreate = function (cb) {
  if (typeof cb === 'function') {
    Admin._createRouteCallbacks.push(cb);
  }
};

Admin.onRouteCreate(function (path, options) {
  var data = {
    content: options.template,
    contentHeader: options.contentHeader || 'mfAdminContentHeader',
    _path: path
  };

  Admin._routeOptions[path] = options;

  if (Meteor.isClient) {
    FlowRouter.route(path, {
      name: options.name || path, // TODO: all paths should have proper names
      action: function () {
        BlazeLayout.render(
          data.layoutTemplate || Admin.config.get('layoutTemplate'),
          {
            content: data.content,
            contentHeader: data.contentHeader
          });
      }
    });
  }
});


Admin.route('/login', {
  name: 'mfAdmin.login',
  template: 'mfAdminLogin',
  layoutTemplate: 'mfAdminLoginLayout'
});


Admin.route('/:collectionName', {
  name: 'mfAdmin.collections.view',
  template: 'mfAdminCollectionsView'
});

Admin.route('/:collectionName/new', {
  name: 'mfAdmin.collections.newDocument',
  template: 'mfAdminCollectionsNew'
});


Admin.route('/:collectionName/edit/:documentId', {
  name: 'mfAdmin.collections.editDocument',
  template: 'mfAdminCollectionsEdit'
});


Admin.route('/:collectionName/view/:documentId/', {
  name: 'mfAdmin.collections.viewDocument',
  template: 'mfAdminCollectionsDetailedView',
});