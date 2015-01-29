SiteTrees = new Mongo.Collection('sitetrees');
var SiteTreeSchema = new SimpleSchema({
  name: {
    type: String,
    max: 50
  },
  identifier: {
    type: String,
    max: 20,
    unique: true
  },
  description: {
    type: String,
    max: 500,
    optional: true
  },
  nodes: {
    type: [Object],
    defaultValue: []
  }
});
SiteTrees.attachSchema(SiteTreeSchema);

SiteTreeNodeSchema = new SimpleSchema({
  /*
  identifier: {
    type: String,
    max: 100,
    autoValue: function() {
      return this.field('path');
    }
  },
  */
  title: {
    type: String,
    max: 100
  },
  path: {
    type: String,
    max: 200
  },
  isIronRoute: {
    type: Boolean,
    label: 'Iron Route'
  },
  showInMenu: {
    type: Boolean,
    label: 'In menu',
    defaultValue: true
  },
  showInBreadcrumbs: {
    type: Boolean,
    label: 'In breadcrumbs',
    defaultValue: true
  },
});


