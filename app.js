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
  ctrl.loading = false;  // Add this line to track the loading state

  ctrl.getMatchedMenuItems = function () {
    ctrl.searched = true;
    ctrl.loading = true; // Set loading to true when search starts
    if (!ctrl.searchTerm || ctrl.searchTerm.trim() === '') {
      ctrl.found = [];
      ctrl.loading = false;  // Set loading to false when no search term is entered
      return;
    }

    MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
      .then(function (foundItems) {
        ctrl.found = foundItems;
        ctrl.loading = false; // Set loading to false when search is complete
        console.log(ctrl.found); // Log the found items to inspect them
      })
      .catch(function (error) {
        ctrl.loading = false; // Set loading to false in case of error
        console.error('Error searching for menu items:', error);
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
        console.log(response.data); // Log the response to inspect it
        var allItems = response.data; // If the structure is different, adjust accordingly
        var foundItems = [];

        // Ensure we have an array or iterate through the keys if data is an object
        if (Array.isArray(allItems)) {
          for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            if (item.description && item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              foundItems.push(item);
            }
          }
        } else if (allItems) {
          for (var key in allItems) {
            if (allItems[key].description && allItems[key].description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              foundItems.push(allItems[key]);
            }
          }
        }

        return foundItems;
      }).catch(function (error) {
        console.error('Error fetching menu items:', error);
      });
    };
  }

})();
