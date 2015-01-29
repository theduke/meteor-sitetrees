Package.describe({
  name: "sitetrees",
  summary: "Menus, breadcrumbs and sitemaps for your multi-page meteor site.",
  version: "0.0.1"
});

Package.onUse(function (api) {
  var both = ['client', 'server'];
  //api.imply('accounts-base', ['client', 'server']);
  api.use("aldeed:collection2", both);
  api.use('aldeed:autoform');
  api.use('peerlibrary:urlify2');
  api.use("iron:router", both);
  api.use('templating');

  api.export('SiteTrees', both);
  api.export('SiteTreeNodeSchema');

  api.addFiles(["collections.js"], both);

  // templates
  api.addFiles([
    'templates/sitetreesAdminEdit.html',
    'templates/sitetreesAdminEdit.js'

  ], 'client');
});
