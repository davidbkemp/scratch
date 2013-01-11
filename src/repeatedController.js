

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

    // NOTE: Cannot rely on $index as items can be deleted and inserted into the middle of the array.

    var itemIndex = function () {
        var index;
        for (index = 0; index < $scope.items.length; index++) {
            if ($scope.items[index] === $scope.item) {
                return index;
            }
        };
        throw "Can't find the item??";
    };

    $scope.deleteItem = function () {
        $scope.items.splice(itemIndex(), 1);
    };

    $scope.moveUp = function () {
        var currentIndex = itemIndex();
        if (currentIndex == 0) return;
        $scope.items.splice(currentIndex, 1);
        $scope.items.splice(currentIndex - 1, 0, this.item);
    };

    $scope.moveDown = function () {
        var currentIndex = itemIndex();
        if (currentIndex == $scope.items.length) return;
        console.log('moving down')
        $scope.items.splice(currentIndex, 1);
        $scope.items.splice(currentIndex + 1, 0, this.item);
    };

    $scope.showFoo = function () {
        alert("Foo is: " + ($scope.foo ? "checked" : "not checked") + ". Note foo is kept directly on the controller.");
    }
}
