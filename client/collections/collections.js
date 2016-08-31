import { Template } from 'meteor/templating';
import { AutoForm } from 'meteor/aldeed:autoform';

import { FlowRouter } from 'meteor/kadira:flow-router';

var adminDeleteModalCallback;

Admin.dashboard.set('collectionWidgets', {
  template: 'mfAdminCollectionsWidgets'
});


// ----- Widgets

Template.mfAdminCollectionsWidgets.onCreated(function () {
  var self = this;
  _.each(Admin.collections.get(), function (collection) {
    self.subscribe(Admin.getCollectionCountPubName(collection.name))
  });
});

Template.mfAdminCollectionsWidgets.helpers({
  background: function () {
    return (this.widget && this.widget.color) || 'blue';
  },
  getCountPubName(collectionName) {
    var collectionCountPubName = Admin.getCollectionCountPubName(collectionName);
    return collectionCountPubName;
  }
});

// ----- Collections View

Template.mfAdminCollectionsView.onCreated(function () {
  this.getCollectionName = () => FlowRouter.getParam('collectionName');

  this.subscribe(Admin.getCollectionCountPubName(this.getCollectionName()));
  this.subscribe(Admin.getCollectionPubName(this.getCollectionName()));
});

Template.mfAdminCollectionsView.helpers({
  hasDocuments: function () {
    const instance = Template.instance();
    return Counts.get(Admin.getCollectionCountPubName(instance.getCollectionName())) > 0;
  },
  tabularTable() {
    const instance = Template.instance();
    const adminCollection = Admin.collections.get(instance.getCollectionName());

    return adminCollection.tabularTable;
  }
});

Template.mfAdminCollectionsView.events({
  // This callback should be attached to mfAdminCollectionsDeleteBtn template
  // but for some reason templates rendered with Blaze.renderWithData are not
  // firing event callbacks
  'click .js-delete-doc': function (e, t) {
    const collectionName = t.getCollectionName();
    const documentId = e.currentTarget.dataset.documentid;

    const adminCollection = Admin.collections.get(collectionName);

    adminDeleteModalCallback = function () {
      adminCollection.methods.remove({ collectionName, documentId });
    };

    $('#admin-delete-modal').modal('show');
  }
});


// ----- Collections New Document

Template.mfAdminCollectionsNew.onCreated(function () {
  this.getCollectionName = () => FlowRouter.getParam('collectionName');

  //
  // this.subscribe(
  //   Admin.getCollectionPubName(collectionName));

  this.adminCollection = Admin.collections.get(this.getCollectionName());

});

Template.mfAdminCollectionsNew.helpers({
  collection() {
    const instance = Template.instance();
    return instance.adminCollection.collection;
  }
});

// ----- Collections Edit

Template.mfAdminCollectionsEdit.onCreated(function () {
  let self = this;

  self.getCollectionName = () => FlowRouter.getParam('collectionName');
  self.getDocumentId = () => FlowRouter.getParam('documentId');

  self.subscribe(
    Admin.getCollectionPubName(self.getCollectionName()), self.getDocumentId());

  self.adminCollection = Admin.collections.get(self.getCollectionName());

  AutoForm.hooks({
    'mfAdmin_update': {
      onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();

        if (updateDoc) {
          self.adminCollection.methods.update(
            {
              collectionName: self.getCollectionName(),
              documentId: self.getDocumentId(),
              modifierDoc: updateDoc
            }
          );
        }
        this.done();

        return false;
      },
      onSuccess: function (formType, result) {
        FlowRouter.go('mfAdmin.collections.view', { collectionName: self.getCollectionName() });
      }
    }
  });

});

Template.mfAdminCollectionsEdit.helpers({
  collection() {
    const instance = Template.instance();
    return instance.adminCollection.collection;
  },
  document() {
    const instance = Template.instance();
    return instance.adminCollection.collection.findOne(instance.getDocumentId());
  }
});

// ----- Collections Delete

Template.mfAdminCollectionsDeleteModal.events({
  'click .js-delete': function (e, t) {
    if (typeof adminDeleteModalCallback === 'function') {
      adminDeleteModalCallback();
      t.$('#admin-delete-modal').modal('hide');
    }
  },

  'hidden.bs.modal #admin-delete-modal': function (e, t) {
    adminDeleteModalCallback = null;
  }
});

Template.mfAdminCollectionsDeleteBtn.helpers({
  'click .js-delete-doc'() {
    console.log('delete!');
  }
});

// ----- Collections Detailed View

Template.mfAdminCollectionsDetailedView.onCreated(function () {
  this.getCollectionName = () => FlowRouter.getParam('collectionName');
  this.getDocumentId = () => FlowRouter.getParam('documentId');

  this.subscribe(
    Admin.getCollectionPubName(this.getCollectionName()),
    this.getDocumentId()
  );
});

Template.mfAdminCollectionsDetailedView.helpers({
  stringifiedDocument() {
    const instance = Template.instance();
    const collection = Admin.collections.get(instance.getCollectionName()).collection;
    const document = collection.findOne(instance.getDocumentId());

    return JSON.stringify(document, null, 2);
  }
});