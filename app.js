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
          console.log('Found items:', foundItems);  // Log the found items
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

  // --------- Service ---------
  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    // Function to get matched menu items from the server
    service.getMatchedMenuItems = function (searchTerm) {
      return $http({
        method: 'GET',
        url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'  // Firebase URL
      }).then(function (response) {
        // Log the entire response to inspect the structure of the returned data
        console.log('Firebase response:', response.data);

        var allItems = response.data;  // Firebase data (could be an object or array)
        var foundItems = [];

        // Check if the data returned is an object (common in Firebase)
        if (typeof allItems === 'object') {
          // Loop through all the items if the data is an object (Firebase's default response)
          for (var key in allItems) {
            if (allItems.hasOwnProperty(key)) {
              var item = allItems[key];
              if (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                foundItems.push(item);  // Add item to foundItems
              }
            }
          }
        } else if (Array.isArray(allItems)) {
          // If it's an array, use the previous logic
          for (var i = 0; i < allItems.length; i++) {
            if (allItems[i].description && allItems[i].description.toLowerCase().includes(searchTerm.toLowerCase())) {
              foundItems.push(allItems[i]);  // Add item to foundItems
            }
          }
        }

        // Return the list of found items
        return foundItems;  
      }).catch(function (error) {
        console.error('Error fetching menu items:', error);
        return [];  // Return an empty array on error
      });
    };
  }
})();
