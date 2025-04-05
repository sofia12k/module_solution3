(function () {
  'use strict';

  // Declare the Angular module
  angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

  // --------- Directive to Display Found Items ---------
  function FoundItemsDirective() {
    var ddo = {
      restrict: 'E',
      templateUrl: 'foundItems.html', // The template for displaying items
      scope: {
        found: '<',    // Bind the found items
        onRemove: '&'  // Function to remove item from the list
      }
    };
    return ddo;
  }

  // --------- Controller ---------
  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    
    ctrl.searchTerm = '';    // Search term entered by the user
    ctrl.found = [];         // List of found items
    ctrl.searched = false;   // Flag to check if search has been made

    // Function to get matched menu items
    ctrl.getMatchedMenuItems = function () {
      ctrl.searched = true;  // Mark as searched
      if (!ctrl.searchTerm || ctrl.searchTerm.trim() === '') {
        ctrl.found = [];  // Clear the found list if the search term is empty
        return;
      }

      // Call the service to get the matched menu items
      MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
        .then(function (foundItems) {
          ctrl.found = foundItems;  // Update the found list with results
        })
        .catch(function (error) {
          console.error('Error fetching menu items:', error);
        });
    };

    // Function to remove an item from the found list
    ctrl.removeItem = function (itemIndex) {
      ctrl.found.splice(itemIndex, 1);  // Remove the item from the list by index
    };
  }

  // --------- Service to Fetch Menu Items ---------
  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    // Function to get matched menu items from the server
    service.getMatchedMenuItems = function (searchTerm) {
      return $http({
        method: 'GET',
        url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'  // API URL to fetch menu items
      }).then(function (response) {
        var allItems = response.data;  // The list of all menu items
        var foundItems = [];

        // Loop through all the items to check if the description matches the search term
        if (Array.isArray(allItems)) {
          for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            if (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
              foundItems.push(item);  // Add item to foundItems if description matches
            }
          }
        } else {
          // Handle the case when Firebase returns data in object form instead of an array
          for (var key in allItems) {
            if (allItems[key].description && allItems[key].description.toLowerCase().includes(searchTerm.toLowerCase())) {
              foundItems.push(allItems[key]);
            }
          }
        }

        return foundItems;  // Return the list of found items
      }).catch(function (error) {
        console.error('Error fetching menu items:', error);
        return [];  // Return an empty array on error
      });
    };
  }
})();
