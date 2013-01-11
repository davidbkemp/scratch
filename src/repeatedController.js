

var MainController = function ($scope) {
    $scope.items = [
        {name: "Apple", amount: 3},
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
}

var ItemController = function ($scope) {
    $scope.item = $scope.items[$scope.$index];


    $scope.deleteItem = function () {
        $scope.items.splice($scope.$index, 1);
    };

    $scope.moveUp = function () {
        if ($scope.$index == 0) return;
        $scope.items.splice($scope.$index, 1);
        $scope.items.splice($scope.$index - 1, 0, this.item);
    };

    $scope.moveDown = function () {
        if ($scope.$index == $scope.items.length) return;
        $scope.items.splice($scope.$index, 1);
        $scope.items.splice($scope.$index + 1, 0, this.item);
    };

    $scope.showFoo = function () {
        alert("Foo is: " + ($scope.foo ? "checked" : "not checked") + ". Note foo is kept directly on the controller.  $index is " + $scope.$index);
    }
}
