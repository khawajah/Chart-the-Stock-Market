var app = angular.module('stockmarket', ['ngRoute']);

//
//  ROUTER
//
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main.html',
            controller: 'mainController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

//
// MAIN CONTROLLER
//
app.controller('mainController', function($scope, mainService) {
    $scope.stock_name = '';
    $scope.add_stock = function() {
        if ($scope.stock_name === '') return;
        //First search if stock is already in DB then add the stock
        mainService.list($scope.stock_name).success(function(stock) {
            if (stock) {
                var today = new Date(),
                    stock_date = new Date(stock.created_at);
                //check date
                if ((stock_date.getDate() + stock_date.getMonth() + stock_date.getFullYear()) === (today.getDate() + today.getMonth() + today.getFullYear())) {
                    update_chart(stock);
                } else { //add
                    addNewStock($scope.stock_name);
                }
            } else { //is not in DB so add
                console.log("else");
                addNewStock($scope.stock_name);
            }
        });
    }


    function addNewStock(stock_name) {
        mainService.list_stock_quandl(stock_name).success(function(stock) { //get
            var newData = [stock_name],
                i = 0;
            while (stock.dataset_data.data.length > i) {
                newData.push(stock.dataset_data.data[i][1]);
                i++;
            }

            var newStock = {
                stock_name: stock_name,
                data: newData
            }
            mainService.create(newStock).success(function(result) { //add
                update_chart(result); //show
            });
        });
    }

    function update_chart(stock) { //update chart
        var categories_names = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8', 'cat9'],
            data_stock.push(stock);

        if (stock) {

        }

        var chart = c3.generate({
            data: {
                columns: [stock]
            },
            axis: {
                x: {
                    type: 'category',
                    categories: categories_names
                }
            }
        });

    }
});

//
// MAIN SERVICE
//
app.factory('mainService', function($http) {
    return {
        list_stock_quandl: function(stock_name) {
            var end_date = moment().format('YYYY-MM-DD'),
                start_date = moment().subtract(7, 'days').format('YYYY-MM-DD');
            return $http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+ stock_name +
                            '/data.json?start_date='+ start_date +'?end_date='+end_date+'?api_key=2X-Xx139y2J_vF49-bzN');
        },
        update: function() {

        },
        create: function(stock) {
            return $http.post('api/stock/', stock);
        },
        list: function(name) {
            return $http.get('api/stock/' + name);
        }
    };
});