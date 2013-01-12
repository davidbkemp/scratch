var tabbed = {};

tabbed.model = {
  name: "ACME Appliances Inc",
  tabs: [
    { id: 13, title: "Head Office", type: "contactUs",
     content: [
       { name: 'Phillis', phone: '9602 3425' },
       { name: 'Graeme',  phone: '9602 2113' },
       { name: 'Gary',    phone: '9602 5637' }
     ]
    },
    { id: 24, title: "Branches", type: "locateUs",
     content: [
       { street: '39 Smith Street',      suburb: 'Fitzroy',  postcode: '3065' },
       { street: '4/125 Hampton Street', suburb: 'Hampton',  postcode: '3188' },
       { street: '17 Footscray Road',    suburb: 'Seddon',   postcode: '3011' },
       { street: '67 Fitzroy Street',    suburb: 'St Kilda', postcode: '3182' },
       { street: '87 Garentol Road',     suburb: 'Werribee', postcode: '3030' }
     ]
    },
    { id: 19, title: "Servicing", type: "locateUs",
     content: [
       { street: '56 Burke Road',    suburb: 'Camberwell', postcode: '3124' },
       { street: '2 The Esplanade',  suburb: 'Mt Martha',  postcode: '3934' },
       { street: '12 Maroon Avenue', suburb: 'Sunshine',   postcode: '3020' }
     ]},
    { id: 53, title: "Retail", type: "contactUs",
     content: [
       { name: 'Harold', phone: '9786 9555' },
       { name: 'Anne',   phone: '9555 6756' },
       { name: 'Oswald', phone: '9565 2322' },
       { name: 'Tran',   phone: '9878 1112' },
       { name: 'Peter',  phone: '9997 4454' }
     ]
    },
    { id: 71, title: "Commercial",    type: "contactUs",
     content: [
       { name: 'Mary',   phone: '9323 5566' },
       { name: 'Andrew', phone: '9445 2122' }
     ]
    }
  ]
};

tabbed.selectedId = tabbed.model.tabs[0].id;

angular.module("tabbedData", []);

tabbed.entityController = function ($scope) {
  $scope.name = function () {
    return tabbed.model.name;
  };
};

tabbed.tabController = function ($scope) {
  $scope.select = function (tabId) {
    tabbed.selectedId = tabId;
  };
  $scope.isSelected = function (tabId) {
    return tabId === tabbed.selectedId ? 'selected' : '';
  };
  $scope.tabs = function() {
    return tabbed.model.tabs;
  };
}

tabbed.contactUsController = function ($scope) {
  $scope.contacts = function () {
    return $scope.tab.content;
  };
};

tabbed.locateUsController = function ($scope) {
  $scope.locations = function (tabIndex) {
    return $scope.tab.content;
  };
};