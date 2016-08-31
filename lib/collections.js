import { Blaze } from 'meteor/blaze';
import { check } from 'meteor/check';

Admin.collections = {
  _collections: {},
  _dep: new Tracker.Dependency()
};


const getCollectionColumns = function (collection) {
  if (collection && collection._c2 && collection._c2._simpleSchema) {
    return _.map(collection._c2._simpleSchema._schemaKeys, function (key) {
      return { data: key, title: key };
    });
  }

  return [{ data: '_id', title: 'ID' }];
}

Admin.getCollectionPubName = function (collectionName) {
  check(collectionName, String)
  return `mfAdmin.${collectionName}`;
};

Admin.getCollectionCountPubName = function (collectionName) {
  check(collectionName, String)
  return `mfAdmin.count.${collectionName}`;
};

Admin.collections.add = function (name, options) {
  check(name, String);
  check(options, Object);

  const pubName = Admin.getCollectionPubName(name);
  const countPubName = Admin.getCollectionCountPubName(name);

  const collection = options.collection

  const viewPath = `/${name}`;
  const newPath = `/${name}/new`;
  const editPath = `/${name}/edit`;

  const icon = options.icon || 'plus';
  const columns = options.columns || getCollectionColumns(collection);

  columns.unshift({
    data: '_id',
    title: 'Id',
    createdCell: function (node, cellData, rowData) {
      const _id = cellData;
      $(node).html(
        Blaze.toHTMLWithData(
          Template.mfAdminCollectionsViewDetailsBtn,
          {
            documentId: cellData,
            collectionName: name
          }
        )
      );
    },
    orderable: false
  });


  columns.push({
    data: '_id',
    title: 'Edit',
    createdCell: function (node, cellData, rowData) {
      const _id = cellData;
      $(node).html(
        Blaze.toHTMLWithData(
          Template.mfAdminCollectionsEditBtn,
          { path: Admin.path(editPath + '/' + _id) }));
    },
    width: '40px',
    orderable: false
  });

  columns.push({
    data: '_id',
    title: 'Delete',
    createdCell: function (node, cellData, rowData) {
      const _id = cellData;
      $(node).html(
        Blaze.toHTMLWithData(
          Template.mfAdminCollectionsDeleteBtn,
          { _id: _id }));
    },
    width: '40px',
    orderable: false
  });

  const table = new Tabular.Table({
    name: 'mfAdminTables.' + name,
    collection: collection,
    columns: columns,
    extraFields: options.extraFields,
    changeSelector: options.changeSelector,
    allow: function (userId) {
      return Admin.isAdmin(userId);
    }
  });

  if (Meteor.isClient) {
    const id = 'collection-' + name;

    Admin.sidebar.set(id, {
      label: name,
      icon: icon
    });

    Admin.sidebar.set(id + '.view', {
      label: 'View all',
      path: viewPath,
      order: 10
    });

    Admin.sidebar.set(id + '.create', {
      label: 'New',
      path: newPath,
      order: 20
    });
  }

  if (Meteor.isServer) {
    Meteor.publish(countPubName, function () {
      Counts.publish(this, countPubName, collection.find());
    });

    Meteor.publish(pubName, function (documentId) {
      check(documentId, Match.Maybe(String));

      if (!Admin.isAdmin(this.userId)) {
        this.stop();
        return;
      }

      return collection.find({ _id: documentId });
    });
  }

  Admin.collections._collections[name] = {
    name,
    collection,
    tabularTable: table,
    widget: options.widget || {},
    methods: options.methods || {
      remove() {
        console.log('You need to provide a "remove" method.');
      },
      update() {
        console.log('You need to provide an "update" method.');
      }
    }
  };

  Admin.collections._dep.changed();
};

Admin.collections.get = function (name) {
  Admin.collections._dep.depend();

  if (name) {
    return Admin.collections._collections[name];
  }

  return _.values(Admin.collections._collections);
};
