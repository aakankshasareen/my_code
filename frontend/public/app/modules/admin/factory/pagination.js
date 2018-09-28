var app = angular.module('admin');
app.factory('paginationFactory',function($http){
    var factory = {};
  
    
   factory.showPagination = function($scope){
   
     $scope.loadingText = 'Loading...'; 
    
    $scope.pagination = {
        paginationPageSizes: [10, 25, 50, 100],
        ddlpageSize: 25,
        pageNumber: 1,
        pageSize: 25,
        totalItems: 0,
        filter_value: '',

        getTotalPages: function () {
            return Math.ceil(this.totalItems / this.pageSize);
        },
        pageSizeChange: function () {
            if (this.ddlpageSize == "All")
                this.pageSize = $scope.pagination.totalItems;
            else
                this.pageSize = this.ddlpageSize

            this.pageNumber = 1
            $scope.drawGrid();
        },
        firstPage: function () {
            if (this.pageNumber > 1) {
                this.pageNumber = 1
                $scope.drawGrid();
            } else {
                this.pageNumber = 1
                $scope.drawGrid();
            }
        },
        nextPage: function () {
            if (this.pageNumber < this.getTotalPages()) {
                this.pageNumber++;
                $scope.drawGrid();
            } else {
                this.pageNumber = 1
                $scope.drawGrid();
            }
        },
        previousPage: function () {
            if (this.pageNumber > 1) {
                this.pageNumber--;
                $scope.drawGrid();
            } else {
                this.pageNumber = 1
                $scope.drawGrid();
            }
        },
        currentPage: function () {
            if (this.pageNumber > 1) {
                $scope.drawGrid();
            } else {
                $scope.drawGrid();
            }
        },
        lastPage: function () {
            if (this.pageNumber >= 1) {
                this.pageNumber = this.getTotalPages();
                $scope.drawGrid();
            } else {
                this.pageNumber = 1
                $scope.drawGrid();
            }
        }
    };
    
    return $scope.pagination;
}

factory.getTableHeight = function($scope) {

    console.log("$scope$scope",$scope.gridOptions.data.length);
    // console.log("$depositeOptions$scope",$scope.depositeOptions.data.length);
console.log($scope.gridOptions.data);

    var totalPage = $scope.pagination.totalItems;
    var currentPage = $scope.pagination.currentPage;
    var pageSize = $scope.pagination.pageSize;
    var dataLen = $scope.gridOptions.data.length;

    var rowHeight = 30; // row height  
    var headerHeight = 50; // header height  
    var footerHeight = 30; // bottom scroll bar height  
    var totalH = 0;
    if (totalPage >=1) {
        if (currentPage < totalPage) {
            totalH = pageSize * rowHeight + headerHeight + footerHeight;
        } else {
            var lastPageSize = dataLen % pageSize;
            if (lastPageSize === 0) {
                totalH = pageSize * rowHeight + headerHeight + footerHeight;
            } else {
                totalH = lastPageSize * rowHeight + headerHeight + footerHeight;
            }
        }
        $scope.loadingText = "";
        console.log(totalH);
    } else
    {
        $scope.loadingText = 'No data available'; 
        totalH = dataLen * rowHeight + headerHeight + footerHeight;
    }

    if($scope.gridOptions.data.length == 0){
        totalH = 200; 
        $scope.loading= true;
    }
    $scope.tableHeight =  'height: ' + (totalH) + 'px';
}

return factory;

});