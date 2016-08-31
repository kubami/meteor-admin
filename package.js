Package.describe({
  name: 'kubs:admin',
  version: '0.1.0',
  summary: 'A complete admin dashboard solution',
  git: 'https://github.com/kubami/meteor-admin.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3-rc.1');

  api.use([
    'modules',
    'ecmascript',
    'check',
    'templating',
    'underscore',
    'tracker',
    'reactive-var',
    'reactive-dict',
    'mfactory:admin-lte@0.0.2',
    'aldeed:autoform@5.8.1',
    'aldeed:tabular@1.6.1',
    'tmeasday:publish-counts@0.7.0'
  ]);

  api.use([
    'kadira:flow-router@2.10.0',
    'kadira:blaze-layout@2.3.0',
    'accounts-ui',
    'useraccounts:core@1.11.1',
    'useraccounts:bootstrap@1.11.1'
  ], { weak: true });

  api.addFiles([
    'lib/admin.js',
    'lib/router.js',
    'lib/collections.js'
  ]);

  api.addFiles([
    'client/common/tree.js',
    'client/common/login.html',
    'client/common/login.js',
    'client/header/header.html',
    'client/layout/layout.html',
    'client/layout/layout.js',
    'client/sidebar/sidebar.html',
    'client/sidebar/sidebar.js',
    'client/navbar/navbar.html',
    'client/navbar/navbar.js',
    'client/dashboard/dashboard.html',
    'client/dashboard/dashboard.js',
    'client/collections/collections.html',
    'client/collections/collections.js',
    'client/breadcrumb/breadcrumb.html',
    'client/breadcrumb/breadcrumb.js',
    'client/helpers.js',
    'client/defaults.js',
    'client/style.css'
  ], 'client');

  api.export('Admin');
});
