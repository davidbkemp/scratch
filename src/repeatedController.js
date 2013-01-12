
angular.module('repeatedController', [])
    .directive('myDraggable', function () {
        var indexOfItemBeingDragged;
        return function(scope, element, attrs) {
            element.attr('draggable', 'true');
            element.on('dragstart', function(){
                indexOfItemBeingDragged = scope.$index;
            });
            element.on('dragover', function(e){
                e.preventDefault();
            });
            element.on('drop', function () {
                scope.moveItem(indexOfItemBeingDragged, scope.$index);
            });
        }
    });


var MainController = function ($scope) {
    $scope.items = [
        {name: "Apple", amount: 3},
        {name: "Orange", amount: 32},
        {name: "Lemon", amount: 77},
        {name: "Banana", amount: 7}
    ];

    $scope.total = function () {
        var total = 0;
        this.items.forEach( function (item) {
            total += parseInt(item.amount, 10);
        });
        return total;
    };

    $scope.addItem = function () {
        var name = prompt("Item Name:");
        this.items.push({name: name, amount: 0});
    };

    $scope.moveItem = function (source, dest) {
        var itemToMove = $scope.items[source];
        var offset = source < dest ? 0 : 1;
        $scope.items.splice(source, 1);
        $scope.items.splice(dest + offset, 0, itemToMove);
        $scope.$digest();
    };
}

var ItemController = function ($scope) {

    // NOTE: This controller is assumed to be used within an "item in items()" repeat
    // The ng-repeat will ensure that $scope.item exists.

    $scope.deleteItem = function () {
        $scope.items.splice($scope.$index, 1);
    };

    $scope.moveUp = function () {
        if ($scope.$index == 0) return;
        $scope.items.splice($scope.$index, 1);
        $scope.items.splice($scope.$index - 1, 0, $scope.item);
    };

    $scope.moveDown = function () {
        if ($scope.$index == $scope.items.length) return;
        $scope.items.splice($scope.$index, 1);
        $scope.items.splice($scope.$index + 1, 0, $scope.item);
    };

    $scope.showFoo = function () {
        alert("Foo is: " + ($scope.foo ? "checked" : "not checked") + ". Note foo is kept directly on the controller.  $index is " + $scope.$index);
    }
}
