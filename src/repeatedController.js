

var TabController = function ($scope) {
    $scope.tabs = [
        {title: "Monday", fruit: [{name: 'apple', price: 3}, {name: 'banana', price: 77}]},
        {title: "Tuesday", fruit: [{name: 'pear', price: 5}, {name: 'peach', price: 20}]}
    ];

    $scope.addFruit = function () {
      this.tabs.push({title: "Wednesday", fruit: [{name: 'lemon', price: 22}, {name: 'lime', price: 1}]});
    };

    $scope.deleteTab = function (tabToDelete) {
        $scope.tabs.forEach(function (tab, index) {
            if (tab === tabToDelete) {
                $scope.tabs.splice(index, 1)
            }
        });
    };

    $scope.deleteTuesday = function () {
        $scope.tabs.forEach(function (tab, index) {
            if (tab.title === "Tuesday") {
                $scope.tabs.splice(index, 1)
            }
        });
    };

    $scope.totalPrice = function () {
        var total = 0;
        this.tabs.forEach( function (tab) {
            tab.fruit.forEach(function (fruit){
                total += parseInt(fruit.price, 10);
            });
        });
        return total;
    };
}

var FruitController = function ($scope) {
    $scope.fruit = $scope.tabs[$scope.$index].fruit;

    $scope.deleteFruit = function(fruitToDelete) {
        $scope.fruit.forEach(function (fruit, index) {
            if(fruit === fruitToDelete) {
                $scope.fruit.splice(index, 1);
            }
        });
    };
}
