 // Directive to input only numbers. 
 app.directive('numbersOnly', function() {
     return {
         require: '?ngModel',
         link: function(scope, element, attrs, ngModelCtrl) {
             if (!ngModelCtrl) {
                 return;
             }

             ngModelCtrl.$parsers.push(function(val) {
                 if (angular.isUndefined(val)) {
                     var val = '';
                 }

                 var clean = val.replace(/[^0-9\.]/g, '');
                 // var negativeCheck = clean.split('-');
                 var decimalCheck = clean.split('.');
                 /*  if(!angular.isUndefined(negativeCheck[1])) {
                       negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                       clean =negativeCheck[0] + '-' + negativeCheck[1];
                       if(negativeCheck[0].length > 0) {
                        clean =negativeCheck[0];
                       }
                       
                   }*/

                 if (!angular.isUndefined(decimalCheck[1])) {
                     decimalCheck[1] = decimalCheck[1].slice(0, 8);
                     clean = decimalCheck[0] + '.' + decimalCheck[1];
                 }

                 if (val !== clean) {
                     ngModelCtrl.$setViewValue(clean);
                     ngModelCtrl.$render();
                 }
                 return clean;
             });

             element.bind('keypress', function(event) {
                 if (event.keyCode === 32) {
                     event.preventDefault();
                 }
             });
         }
     };
 })
.directive('passwordValidation', function () {
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctl) {
      scope.$watch(attrs['passwordValidation'], function (errorMsg) {
        elm[0].setCustomValidity(errorMsg);
        ctl.$setValidity('passwordValidation', errorMsg ? false : true);
      });
    }
  };
}).directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });
                        
                        event.preventDefault();
                }
            });
        };
})
.directive('numbrOnly', function() {  // for mobile numbers only
     return {
         require: '?ngModel',
         link: function(scope, element, attrs, ngModelCtrl) {
             if (!ngModelCtrl) {
                 return;
             }

             ngModelCtrl.$parsers.push(function(val) {
                 if (angular.isUndefined(val)) {
                     var val = '';
                 }

                 var clean = val.replace(/[^0-9]/g, '');
                 
                 var decimalCheck = clean.split('.');

                 if (!angular.isUndefined(decimalCheck[1])) {
                     decimalCheck[1] = decimalCheck[1].slice(0, 8);
                     clean = decimalCheck[0] + '.' + decimalCheck[1];
                 }

                 if (val !== clean) {
                     ngModelCtrl.$setViewValue(clean);
                     ngModelCtrl.$render();
                 }
                 return clean;
             });

             element.bind('keypress', function(event) {
                 if (event.keyCode === 32) {
                     event.preventDefault();
                 }
             });
         }
     };
 })



.directive(
    'dnEmailCustomValidation',
    function() {
      return {
        require: [ '^form', 'ngModel' ],
        link: function( $scope, $element, attrs, ctls ) {
          var $form = ctls.shift( ),
          $model = ctls.shift( ),
          validateMatch = function( ) {
            var errorFlag = true;
 
            // Email Validations
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailIds = $model.$viewValue;
            if (emailIds != "") {

              var emailIdsArr = emailIds.split(/[, ]+/);
              angular.forEach( emailIdsArr, function( value, key ) {
                if (!re.test(value)) {
                  errorFlag = false;
                  return false;
                }
              } );
            }
 
            $model.$setValidity( 'invalid', errorFlag);
          };
 
          // Trigger a validation check
          $model.$viewChangeListeners.push( validateMatch );
        }
      };
    }
  )

.directive("whenScrolled", function(){
  return{
    
    restrict: 'A',
    link: function(scope, elem, attrs){
    
      // we get a list of elements of size 1 and need the first element
      raw = elem[0];
    
      // we load more elements when scrolled past a limit
      elem.bind("scroll", function(){
        if(raw.scrollTop+raw.offsetHeight+5 >= raw.scrollHeight){
          scope.loading = true;
          
        // we can give any function which loads more elements into the list
          scope.$apply(attrs.whenScrolled);
        }

         
      });

    }
  }
})

.directive('datePicker', function(){
    return {
        restrict : "A",
        require: 'ngModel',
        link : function(scope, element, attrs, ngModel){
            $(function(){
                $(element).datepicker({
                     changeMonth: true,
                     changeYear: true,
                     closeText: 'Clear',
                     showButtonPanel: true,
                     onClose: function () {
                        var event = arguments.callee.caller.caller.arguments[0];
                        // If "Clear" gets clicked, then really clear it
                        if ($(event.delegateTarget).hasClass('ui-datepicker-close')) {
                            $(this).val('');
                            scope.$apply(function() {
                               ngModel.$setViewValue(null);
                            });
                        }
                    },
                    onSelect: function(date){
                        scope.$apply(function() {
                           ngModel.$setViewValue(date);
                        });
                    }
               });
            })
        }
    }
})

/*.directive('emptyToNull', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.push(function(viewValue) {
                if(typeof viewValue === 'undefined') {
                    alert("hey");
                    return undefined;
                }
                return viewValue;
            });
        }
    };
});
*/