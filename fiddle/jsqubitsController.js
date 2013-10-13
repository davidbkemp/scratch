function JsqubitsController($scope) {
    $scope.visualQubits = null;
    $scope.numBits = null;
    $scope.bitLabels = [];
    $scope.numBitsSelected = '2';
    $scope.jsqubitsModel = {
        qstate: null,
        config: {
            textHeight: 12,
            textWidth: 12,
            maxRadius: 70
        }
    };
        
    $scope.operators = ['X', 'Y', 'Z', 'hadamard', 'T'];
    
    $scope.request = {
        targetBits: [],
        operationId: $scope.operators[0]
    };
    
    $scope.onOpChange = function () {
        
    };
    
    $scope.selectAllAsTargetBits = function () {
        for(var i = 0; i < $scope.numBits; i++) {
            $scope.request.targetBits[i] = true;
        }
    };
    
    function initializeState() {
        $scope.numBits = parseInt($scope.numBitsSelected, 10);
        $scope.bitLabels.length = 0;
        $scope.request.targetBits.length = 0;
        for(var i = 0; i < $scope.numBits; i++) {
            $scope.bitLabels.push(i);
        }
        $scope.jsqubitsModel.qstate = new jsqubits.QState($scope.numBits);
    }
    
    $scope.onChangeNumBits = function() {
        initializeState();
        $scope.visualQubits.updateQState($scope.jsqubitsModel.qstate);
    };
    
    $scope.performOperation = function () {
        var targetBits = [];
        for (var i = 0; i < $scope.request.targetBits.length; i++) {
            if ($scope.request.targetBits[i]) {
                targetBits.push(i);
            }
        }
        var op = function (s) {
            return s[$scope.request.operationId](targetBits);
        }
        $scope.visualQubits.applyOperator(op, {});
        $scope.jsqubitsModel.qstate = op($scope.jsqubitsModel.qstate);
    }

    initializeState();
    $scope.visualQubits = visQubits($scope.jsqubitsModel.qstate, $scope.jsqubitsModel.config);

}
