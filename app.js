(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItemsDirective);

// ---------- Directive ----------
function FoundItemsDirective() {
  var ddo = {
    restrict: 'E',
    templateUrl: 'foundItems.html',
    scope: {
      found: '<',
      onRemove: '&'
    }
  };
  return ddo;
}

// ---------- Controller ----------
NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  var ctrl = this;

  ctrl.searchTerm = '';
  ctrl.found = [];
  ctrl.searched = false;

  ctrl.getMatchedMenuItems = function () {
    ctrl.searched = true;
    if (!ctrl.searchTerm || ctrl.searchTerm.trim() === '') {
      ctrl.found = [];
      return;
    }

    MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
    .then(function (foundItems) {
      ctrl.found = foundItems;
    });
  };

  ctrl.removeItem = function (itemIndex) {
    ctrl.found.splice(itemIndex, 1);
  };
}

// ---------- Service ----------
MenuSearchService.$inject = ['$http'];
function MenuSearchService($http) {
  var service = this;

  service.getMatchedMenuItems = function (searchTerm) {
    return $http({
      method: 'GET',
      url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'
    }).then(function (response) {
      var allItems = response.data.menu_items;
      var foundItems = [];

      for (var i = 0; i < allItems.length; i++) {
        var item = allItems[i];
        if (item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
          foundItems.push(item);
        }
      }

      return foundItems;
    });
  };
}

})();
