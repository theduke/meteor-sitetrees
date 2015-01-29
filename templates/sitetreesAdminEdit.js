function SiteTree(data, selector) {
  this.lastId = 0;
  this.nodes = data || [];

  // Initialize jqTree.
  $(selector).tree({
    data: this.getJqTreeData(),
    autoOpen: true,
    dragAndDrop: true,
    onCreateLi: function(node, $li) {
       $li.find('.jqtree-element').append(
          '<button class="btn btn-default btn-sm node-edit" data-id="' + node.id + '"><span class="glyphicon glyphicon-pencil"></span></button>'
          + '<button class="btn btn-default btn-sm node-remove" data-id="' + node.id + '"><span class="glyphicon glyphicon-remove"></span></button>'
          + '<button class="btn btn-default btn-sm node-add-child" data-id="' + node.id + '" title="Add child node"><span class="glyphicon glyphicon-plus"></span></button>'
      );
    }
  });
  this.jqTree = $(selector);
}
SiteTree.prototype.getNode = function(id, tree) {
  if (!tree) {
    tree = this.nodes;
  }

  for (var i = 0; i < tree.length; i++) {
    var node = tree[i];
    if (node.id === id) {
      return node;
    }
    if (node.children.length > 0) {
      var child = this.getNode(id, node.children);
      if (child) {
        return child;
      }
    }
  }

  return null;
};
SiteTree.prototype.appendNode = function(data, parentId) {
  this.lastId += 1;
  data.id = this.lastId;
  data.children = [];

  if (parentId) {
    var parentNode = this.getNode(parentId);
    if (!parentNode) {
      throw new Error("Invalid parentId specified: " + parentId);
    }
    parentNode.children.push(data);
  }
  else {
    this.nodes.push(data);
    console.log(data, this.nodes)
  }

  // Update jqTree.
  var jqParent = this.jqTree.tree('getNodeById', parentId);
  this.jqTree.tree('appendNode',  {
    label: data.title,
    id: data.id
  }, jqParent);
};
SiteTree.prototype.updateNode = function(id, data) {
  var node = this.getNode(id);
  _.extend(node, data);

  this.jqTree.tree('updateNode', this.jqTree.tree('getNodeById', id), data.title);
};
SiteTree.prototype.removeNode = function(id, nodes) {
  if (!nodes) {
    nodes = this.nodes;
  }
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (node.children) {
      this.removeNode(id, node.children);
    }
  }
  this.jqTree.tree('removeNode', this.jqTree.tree('getNodeById', id));
  return false;
};
SiteTree.prototype.getJqTreeData = function(nodes) {
  if (!nodes) {
    nodes = this.nodes;
  }
  var jqTree = [];
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var jqNode = {
      label: node.title,
      id: node.id,
      children: this.getJqTree(node.children)
    };
    jqTree.append(jqNode);
  }

  return jqTree;
};

Template.sitetreesAdminEdit.rendered = function() {
  window.tmpd = this;
  window.siteTree = new SiteTree(doc.nodes, '#sitetree');
}

Template.sitetreesAdminEdit.helpers({
  getNodeModalType: function() {
    return Session.get('sitetreesAdminModalType');
  },
  getNodeModalDoc: function() {
    return Session.get('sitetreesAdminModalDoc');
  }
});

Template.sitetreesAdminEdit.events({
  'click #node-add': function(evt) {
    Session.set('sitetreesAdminModalId', null);
    Session.set('sitetreesAdminModalDoc', null);
    Session.set('sitetreesAdminModalParentId', null);
    $('#node-modal').modal('show');
  },
  'click .node-remove': function(evt) {
    var btn = $(evt.currentTarget);
    var id = btn.attr('data-id');
    siteTree.removeNode(id);
  },
  'click .node-edit': function(evt) {
    var btn = $(evt.currentTarget);
    var id = parseInt(btn.attr('data-id'));
    Session.set('sitetreesAdminModalParentId', null);
    Session.set('sitetreesAdminModalId', id);
    Session.set('sitetreesAdminModalDoc', siteTree.getNode(id));
    $('#node-modal').modal('show');
  },
  'click .node-add-child': function(evt) {
    var btn = $(evt.currentTarget);
    var id = parseInt(btn.attr('data-id'));

    Session.set('sitetreesAdminModalId', null);
    Session.set('sitetreesAdminModalParentId', id);
    Session.set('sitetreesAdminModalDoc', null);
    $('#node-modal').modal('show');
  },
  'click #sitetree-save': function(evt) {
    $('#sitetreeUpdateForm').submit();
  }
});

AutoForm.hooks({
  nodeForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      var id = Session.get('sitetreesAdminModalId');
      if (id === null) {
        var parentId = Session.get('sitetreesAdminModalParentId');
        siteTree.appendNode(insertDoc, parentId);
      }
      else {
        siteTree.updateNode(id, insertDoc);
      }
      
      //this.done(); // submitted successfully, call onSuccess
      //this.done(new Error('foo')); // failed to submit, call onError with the provided error
      //this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
      
      // You must call this.done()!
      $('#node-modal').modal('hide');

      this.done();
      return false;
    },
  },
  sitetreeUpdateForm: {
    before: {
      update: function(docId, modifier, template) {
        modifier['$set'].nodes = siteTree.nodes;
        return modifier;

        //return modifier; (synchronous)
        //return false; (synchronous, cancel)
        //this.result(modifier); (asynchronous)
        //this.result(false); (asynchronous, cancel)
      },
    }
  }
});
