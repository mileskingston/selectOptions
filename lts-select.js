'use strict';

/**
 * @ngdoc directive
 * @name lts2App.directive:form
 * @description
 * # form
 */
angular.module('lts')
  .directive('ltsSelect', ['$rootScope', '$compile', '$timeout', function ($rootScope, $compile, $timeout) {
    return {
      replace: true,
      scope: true,
      restrict: 'AC',
      link: function(scope, elem, attrs) {
        var $elem = angular.element(elem)[0];
        // If a model is passed, bind the model to a select tag
        var modelPath = attrs.ltsSelect;
        var modelInit = attrs.ltsSelectInit;
        var values = [];
        var toggleVisible = false;
        var arrowIcon = attrs.ltsSelectArrow || 'select-primary'; // select icon type

        // Create a value/html map
        var elements = elem.find('[data-lts-select-value]');
        var selectItems = {};
        angular.forEach(elements, function(element) {
          element = angular.element(element);
          selectItems[element.data('lts-select-value')] = element.text();
        });

        // Show the default item
        var selectedLabel = 
          attrs.ltsSelectDefault? selectItems[attrs.ltsSelectDefault] :
          attrs.ltsSelectEmptyLabel? attrs.ltsSelectEmptyLabel : '';
        var visibleElem = angular.element('<div class="list-item selected"><span class="text">'+selectedLabel+'</span><span class="sprite sprite-'+arrowIcon+'"></span></div>');

        // click selected element function
        visibleElem.on('click', function($event) {
          $event.preventDefault();
          $event.stopPropagation();      
          elem.parent().toggleClass('active');
          if(elem.parent().hasClass('active')) {
            angular.element('.product-grid .lts-select-wrapper').removeClass('active');
            elem.parent().toggleClass('active');
          }
        });

        // click outside of element
        angular.element(window.document).on('click', function($event) {
          $event.stopPropagation();  
          var eventOutsideTarget = (elem[0] !== $event.target) && (0 === elem.find($event.target).length);

          if (eventOutsideTarget) {
            elem.parent().removeClass('active');
          } else {
            elem.parent().addClass('active');
          }
        });

        // add wrapper around select dropdown
        elem
          .wrap('<div class="lts-select-wrapper clearfix">')
          .before(visibleElem);

        // hidden input field to store modelPath value
        $compile('<input class="hide" type="text" data-ng-model="' + modelPath + '" ' + (modelInit? 'data-ng-init="' + modelInit + '" ' : '') + (scope.selectValue? 'data-ng-value="' + scope.selectValue + '" ' : '') + '>')(scope, function(input) {
          angular.element($elem).after(input);
          for (var i = 0; i < $elem.children.length; i++) {
            var $option = $elem.children[i];

            // on option click function
            angular.element($option).on('click', function($event) {
              var selectValue = angular.element($event.currentTarget).data('lts-select-value');
              var selectLabel = angular.element($event.currentTarget).attr('data-lts-select-label')? angular.element($event.currentTarget).data('lts-select-label') : angular.element($event.currentTarget).text();

              scope.selectValue = selectValue;

              scope.$apply(function () {
                $timeout(function() {
                  // splitting model path e.g. address.country and creating an array of values, removing the first value
                  var modelPathArr = modelPath.split('.');
                  var createModel = function(pathArr, context) {
                    context = context || {};
                    if (!pathArr.length) {
                      // Finished
                      return context;
                    }
                    var newContext = {};
                    newContext[pathArr.pop()] = context;
                    return createModel(pathArr, newContext);
                  };
                  $rootScope[modelPathArr[0]] = createModel(modelPathArr.slice(1), selectValue);
                  // Execute onchange callback if any
                  if (attrs.ltsSelectChange) {
                    scope.$eval(attrs.ltsSelectChange);
                  }

                  visibleElem.find('span.text').text(selectLabel);
                  visibleElem.click();
                });
              });
            });
          }
        });
      }
    };
  }]);