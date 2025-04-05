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

    // Function to get matched menu items from the server or use mock data
    service.getMatchedMenuItems = function (searchTerm) {
      // Mock data for testing
      var mockData = [
        {
          name: 'Beef Burger',
          short_name: 'BB',
          description: 'A delicious beef burger with cheese and lettuce.'
        },
        {
          name: 'Chicken Salad',
          short_name: 'CS',
          description: 'A healthy chicken salad with mixed vegetables.'
        },
        {
          name: 'Veggie Wrap',
          short_name: 'VW',
          description: 'A wrap with fresh veggies and a tangy dressing.'
        },
        {
          name: 'Fish Tacos',
          short_name: 'FT',
          description: 'Spicy fish tacos with fresh salsa and cilantro.'
        }
      ];

      return new Promise(function (resolve, reject) {
        // Simulate async behavior like $http request
        setTimeout(function () {
          // Filter mock data by search term
          var foundItems = mockData.filter(function (item) {
            return item.description.toLowerCase().includes(searchTerm.toLowerCase());
          });
          
          // Resolve the found items
          resolve(foundItems);
        }, 1000); // Simulate network delay
      });
    };
  }
})();
