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
app.controller('mainController', function($scope, mainService, socketio) {
    $scope.stock_name = '';
    var chart,
        data_columns = [];

    //Get all stocks from DB
    mainService.list().success(function(all_stocks) {
        create_chart(all_stocks);
        $scope.stocks = all_stocks;
    });

    //Listen for new stocks
    socketio.on('stock', function(stock) {
        data_columns.push(stock.data);
        load_chart(data_columns); //show
        $scope.stocks.push(stock);
    });

    socketio.on('stock_remove', function(name) {
        data_columns = data_columns.filter(function(data){
            return data[0] !== name;
        });
        console.log(data_columns);

        chart.unload({
            ids: [name]
        });
        
        mainService.list().success(function(all_stocks) {
            $scope.stocks = all_stocks;
        });
    });

    //Remove stock
    $scope.remove_stock = function(stock) {
        mainService.delete(stock.stock_name);
    }

    //Add new stock
    $scope.add_stock = function() {
        if ($scope.stock_name === '') return;
        add_new_stock($scope.stock_name);
    }

    function add_new_stock(stock_name) {
        mainService.list_stock_quandl(stock_name).success(function(stock) { //get
            var new_data = [stock_name],
                i = 0;
            while (stock.dataset_data.data.length > i) {
                new_data.push(stock.dataset_data.data[i][1]);
                i++;
            }

            var newStock = {
                stock_name: stock_name,
                data: new_data
            }
            mainService.create(newStock).success(function(result) { //add
                //data_columns.push(result.data);
            });
        });
    }

    function load_chart(data_columns) {
        chart.load({
            columns: data_columns
        });
        $scope.stock_name = '';
    }

    function create_chart(stocks) { //update chart
        var categories_names = [];
        for (var i = 0; i < stocks.length; i++) {
            data_columns.push(stocks[i].data);
        }

        for (var i = 0; i < 6; i++) {
            categories_names.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
        }

        chart = c3.generate({
            data: {
                columns: data_columns
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
            return $http.get('https://www.quandl.com/api/v3/datasets/WIKI/' + stock_name +
                '/data.json?start_date=' + start_date + '?end_date=' + end_date + '?api_key=2X-Xx139y2J_vF49-bzN');
        },
        delete: function(id) {
            $http.delete('stock/' + id);
            //return this.list();
        },
        create: function(stock) {
            return $http.post('stock/', stock);
        },
        list: function() {
            return $http.get('stock/');
        }
    };
});

//
// StockIO SERVICE
//
app.factory('socketio', function($rootScope) {
    var socket = io.connect();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});