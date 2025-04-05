(function () {
  'use strict';

  // Declare the Angular module
  angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

  // Directive to Display Found Items
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

  // Controller for NarrowItDownApp
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

  // Service to fetch menu items from Firebase
  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    // Function to get matched menu items from the server
    service.getMatchedMenuItems = function (searchTerm) {
      return $http({
        method: 'GET',
        url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'  // Firebase URL
      }).then(function (response) {
        console.log("Firebase Response Data:", response.data);  // Detailed logging to inspect data

        var allItems = response.data;  // This should be an object of items
        var foundItems = [];

        // Check if the data returned is an object and handle accordingly
        if (typeof allItems === 'object') {
          // Loop through all the items if the data is an object
          for (var key in allItems) {
            if (allItems[key].description && allItems[key].description.toLowerCase().includes(searchTerm.toLowerCase())) {
              foundItems.push(allItems[key]);  // Add item to foundItems
            }
          }
        } else {
          console.error("Data is not an object or array:", allItems); // Log in case the data isn't as expected
        }

        console.log("Found Items: ", foundItems);  // Log the items that were found
        return foundItems;  // Return the list of found items
      }).catch(function (error) {
        console.error('Error fetching menu items:', error);
        return [];  // Return an empty array on error
      });
    };
  }

})();
