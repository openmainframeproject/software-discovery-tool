myApp.controller('FAQController', function($scope){
        
    $scope.questions = [];

    $(document).ready(function() {
        $scope.questions = new Array(50);
        for(i = 0;i < $scope.questions.length;i++) {
            $scope.questions[i] = false;
        }
    });
        
    $scope.questionState = function(qid) {
        return $scope.questions[qid];
    }
    
    $scope.clickQuestion = function(qid) {
        var currentState = $scope.questions[qid];
        if(!currentState){
            for(i = 0;i < $scope.questions.length;i++) {
                $scope.questions[i] = false;
            }
        }
        $scope.questions[qid] = !$scope.questions[qid];
    };
});