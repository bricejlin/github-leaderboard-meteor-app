if (Meteor.isClient) {
  Template.body.helpers({
    users: [
      {
        name: 'Brice Lin',
        deletions: 0
      },
      {
        name: 'Joe Smith',
        deletions: 4
      },
      {
        name: 'Sam Lin',
        deletions: 10
      },
      {
        name: 'Jennifer Smith',
        deletions: -4
      }
    ]
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
