var myApp = angular.module("sdt", ['ngRoute']); 

myApp.config(
	[ '$routeProvider', '$locationProvider', function($routeProvider,$locationProvider) {
        $locationProvider.hashPrefix('/sdt/');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: true
        });
		$routeProvider.when('/', {
			templateUrl : '/static/js/views/home.html',
			controller : 'HomeController'		 
		}).when('/faq', {
            templateUrl : '/static/js/views/faq.html',
            controller : 'FAQController'
        }).otherwise({
			redirectTo : '/'
		});
	} ]
);