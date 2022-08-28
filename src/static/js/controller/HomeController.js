/**
 * This controller involves fetching and rendering of search results.  
 * @param $scope
 */ 
var HomeController = function($scope) {

    // List of supported OS and versions
    $scope.supported_oses_list = [];
    $scope.supported_oses_list_keys = [];
    $scope.page_size = 10;
    $scope.number_of_items = 10;
    $scope.page_number = 1;
    $scope.current_page = 1;
    $scope.distro_selected = false;
    $scope.display_column_list = [];
    $scope.prev_url = '';
    $scope.selected_distros = [];
    
    $scope.all = []; 
    $scope.os_list = []; 
    $scope.refine_os_list = [];
    $scope.os_versions_list = []; 
    $scope.current_set = []; 
    $scope.search_bit_flag = 0;
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.gap = 3;  
    $scope.refine_package_name = '';
    $scope.package_name = '';
    $scope.sortingOrder = "S";
    $scope.reverse = false;
    $scope.page_options = [5, 10, 20,30, 40, 50];
    $scope.itemsPerPage = 10;
    $scope.no_results_found = '';
    $scope.loading = false;
    $scope.os_wise_accordion = [];
    $scope.os_wise_accordion_checkboxes = [];
    
    $scope.package_count = 0;
    $scope.response_current_page = 0;
    $scope.response_last_page =  0;
    $scope.response_more_available = false;
    $scope.request_next_page = 0;
    $scope.background_fetch_message = ''
    $scope.forced_stop = false;
    $scope.xhr = null;
    $scope.pctcomplete = 0;

    $scope.showDescription = false;
    
    // Get the package information data from the server and process it for display
    $.ajax({
        url: 'getSupportedDistros',
        success: function(data){
            try{
                $scope.supported_oses_list = data;
                $scope.supported_oses_list_keys = Object.keys($scope.supported_oses_list);
                $scope.all.push({type:"All",value:false}); 
                $scope.os_list = [];
                $scope.os_list.push({type:"All",value:false});
                var osversions = [];
                for (supported_os_name in $scope.supported_oses_list_keys)
                {
                    $scope.os_list.push({type:$scope.supported_oses_list_keys[supported_os_name],value:false});
                    tempName = $scope.supported_oses_list_keys[supported_os_name];
                    $scope.os_wise_accordion[tempName] = true;
                    $scope.os_wise_accordion_checkboxes[tempName] = true;
                }
                for(os_name in $scope.supported_oses_list){
                    osversions = Object.keys($scope.supported_oses_list[os_name]);
                    version_array = []
                    for(i = 0;i < osversions.length;i++ ){
                        version_array.push({type:osversions[i], value:true, count:0, filtercount:0});
                    }
                    $scope.os_versions_list[os_name] = version_array;
                }
            }catch(e){
                console.log(e);
                console.log(data);
                //$scope.supported_oses_list = data;
            }
            $scope.$apply();
        },
        failure: function(data){
            console.log("Not able to fetch Supported Distros information.");                
        }
      });

    if($scope.packages_all === undefined){
        $scope.packages_all = [];
    }
    
    $scope.set_sort_order = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder)
            $scope.reverse = !$scope.reverse;

        $scope.sortingOrder = newSortingOrder;
        $scope.orderBy();
        $scope.currentPage = 0;
        $scope.n = 0;
        $scope.groupToPages();
    };
    
    $scope.orderBy = function() {
       $scope.filteredItems.sort(function(a, b){
            var nameA=a[$scope.sortingOrder], nameB=b[$scope.sortingOrder]
            if(!$scope.reverse){
                if (nameA < nameB) //sort string ascending
                    return -1;
                if (nameA > nameB)
                    return 1;
            }
            else{
                if (nameA < nameB) //sort string ascending
                    return 1;
                if (nameA > nameB)
                    return -1;
            }
            return 0 //default return value (no sorting)
        })
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };
    
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };
    
    $scope.lastPage = function () {
        $scope.currentPage = $scope.pagedItems.length - 1;
    };
    
    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    
    $scope.firstPage = function () {
        $scope.currentPage= 0;
    };
      
     $scope.range = function (size, start, end) {
        var ret = [];

        if (size < end) {
          end = size;
          start = size - $scope.gap;
        }
        for (var i = start; i < end; i++) {
          if(i >= 0){
            ret.push(i);
          }
        }
        return ret;
    };

    $scope.is_distro_selected = function(){
        at_least_one_distro_selected = false;
        for(rec in $scope.os_list){
            if($scope.os_list[rec].value){
                at_least_one_distro_selected = true;
                break;
            }
        }
        if(at_least_one_distro_selected){
            $scope.error_message = '';
        }
        return at_least_one_distro_selected;
    };

    $scope.tickUntick = function(tickevent){
        var tickState = true;
        if(tickevent.target.id === 'chkAll')
        {
            var tickState = $('#chkAll').prop("checked");
            for(rec in $scope.os_list){
                $scope.os_list[rec].value = tickState;
            }
        }
        else
        {
            for(rec in $scope.os_list){
                if($scope.os_list[rec].type !== 'All'){
                    if(!$scope.os_list[rec].value){
                        tickState = false;
                        break;}
                }
            }
            $scope.os_list[0].value = tickState; 
        }
        $scope.is_distro_selected(); //this would clear error message just in case
    };
    
    $scope.searchPackagesFromText = function(pevent) {
        if(pevent !== undefined && pevent !== null){
            var keyCode = pevent.which || pevent.keyCode;
            if (keyCode !== 13) {
               return;
            }
        }
        if($scope.package_name.length >= 3){
            $scope.searchPackages();
        }
        else{
            return;
        }
    };
    $scope.searchPackages = function(pevent, pcalled_from, psearch_exact) {
        if(pevent !== undefined && pevent !== null){
            var keyCode = pevent.which || pevent.keyCode;
            if (keyCode !== 13) {
               return;
            }
        }
        if(!$scope.is_distro_selected()){
            $scope.error_message = 'No Distros selected!';
            return;
        }
        else{
            $scope.error_message = '';
        }
        $scope.loading = true;
        var search_bit_flag = 0;
        for(rec in $scope.os_list){
            if($scope.os_list[rec].type != 'All'){
                $scope.os_wise_accordion_checkboxes[$scope.os_list[rec].type] = $scope.os_list[rec].value;
                for(distro_version_record in $scope.os_versions_list[$scope.os_list[rec].type]){
                    $scope.os_versions_list[$scope.os_list[rec].type][distro_version_record]['value'] = $scope.os_list[rec].value;
                }
                if($scope.os_list[rec].value){
                    for(distro_version_record in $scope.supported_oses_list[$scope.os_list[rec].type]){
                        search_bit_flag += $scope.supported_oses_list[$scope.os_list[rec].type][distro_version_record]
                    }
                }
            }
        }
        $scope.search_bit_flag  = search_bit_flag;
        $scope.error_message = '';
        if(psearch_exact === undefined){
            psearch_exact = false;
        }
        $scope.exact_match = psearch_exact;
        $scope.callSearchAPI();
    };
    
    handleResponseMainSearch = function(status,data){
        try{
            if(status !== 200){
                $scope.loading = false;
                $scope.packages_all = [];
                $scope.$apply();
                return;
            }
            if(status === 404){
                $scope.no_results_found = 'Your search - "'+ decodeURI($scope.package_name) +'" - did not match any package.'
                $scope.packages_all = [];
                $scope.loading = false;
                $scope.$apply();
                return;
            }
            distro_data = JSON.parse(data);
            $scope.package_count = distro_data.total_packages;
            $scope.response_current_page = distro_data.current_page;
            $scope.response_last_page =  distro_data.last_page;
            $scope.response_more_available = distro_data.more_available;
            $scope.request_next_page = 0
            
            if($scope.package_count == 0){
                $scope.no_results_found = 'Your search - "'+ decodeURI($scope.package_name) +'" - did not match any package.'
                $scope.packages_all = [];
            }
            else{
                package_data = distro_data.packages;
                packages_all = [];
                console.log(package_data)
                for(var i = 0; i < package_data.length; i++){
                    package_data[i][0] = decodeURI(package_data[i][0]);
                    packages_all.push(package_data[i]);
                }
                $scope.packages_all = packages_all;
                $scope.no_results_found = '';
            }
            $scope.computePackageCount(false); //Make an initial 'distro version wise' count
            $scope.refine_os_list = [];
            
            for (v_os in $scope.os_list) {
                if ($scope.os_list[v_os].type !== 'All' && $scope.os_list[v_os].value) {
                    $scope.refine_os_list.push({type: $scope.os_list[v_os].type, value: $scope.os_list[v_os].value});
                }
            }
            $scope.filterResults();
            $scope.loading = false;
            $scope.forced_stop = false;
            $scope.$apply();
        }
        catch(e){
            $scope.main_request_progress = '';
            console.log(e);
            console.log('Status Received: ' + status);
            console.log('Data Received: ' + data);
            $scope.no_results_found = 'There was an issue contacting server. Please try again.'
            $scope.loading = false;
            $scope.$apply();
        }
        
        $scope.fetchRemaining();
    }
    
    handleProgressEventMainSearch = function(evt) {
        if(evt.target.status === 0){
            return;
        }
        if(evt.lengthComputable) {
            var pctcomplete = evt.loaded / evt.total;
            pctcomplete = Math.round(pctcomplete * 100);
            $scope.main_request_progress = pctcomplete + '%'
            $scope.$apply();
        }
    }
    
    var handleStateChangeMainSearch = function () {
       switch ($scope.xhr.readyState) {
          case 0 : // UNINITIALIZED
          case 1 : // LOADING
          case 2 : // LOADED
          case 3 : // INTERACTIVE
          break;
          case 4 : // COMPLETED
          handleResponseMainSearch($scope.xhr.status, $scope.xhr.responseText);
          break;
          default: alert("error");
       }
    }
    
    $scope.callSearchAPI = function(){
        if($scope.package_name.length < 1){
            return;
        }
        $scope.package_name_send=encodeURIComponent($scope.package_name);
        api_request_url = 'searchPackages?search_term='+$scope.package_name_send+'&exact_match='+$scope.exact_match+'&search_bit_flag='+ $scope.search_bit_flag;
        
        if ($scope.forced_stop || $scope.prev_url == '' || $scope.prev_url != api_request_url){
            $scope.prev_url = api_request_url;
        }else{
            $scope.loading = false;
            return;
        }
        
        $scope.background_fetch_message = '';
        $scope.pctcomplete = 0;
        $scope.package_count = 0;
        $scope.response_current_page = 0;
        $scope.response_last_page =  0;
        $scope.response_more_available = false;
        $scope.refine_package_name = ""; //2017-08-22 - No need to honor previous refinement
        $scope.loading = true;
        $scope.main_request_progress = '';
        if($scope.xhr !== undefined){
            try{
                $scope.xhr.abort();
            }
            catch(e){}
        }
        $scope.xhr = new XMLHttpRequest();
        $scope.xhr.onreadystatechange=handleStateChangeMainSearch;
        $scope.xhr.addEventListener("progress", handleProgressEventMainSearch);
        $scope.xhr.open("GET",api_request_url,true);
        $scope.main_request_progress = '0%'
        $scope.xhr.send();
    }
    
    handleResponse = function(status,data){
        try{
            if(status !== 200){
                return;
            }
            distro_data = JSON.parse(data);
            $scope.package_count = distro_data.total_packages;
            $scope.response_current_page = distro_data.current_page;
            $scope.response_last_page =  distro_data.last_page;
            $scope.response_more_available = distro_data.more_available;
            
            if($scope.package_count == 0){
                console.log('Fetch remaining - but received empty package_count')
            }
            else{
                package_data = distro_data.packages;
                if(package_data !== undefined){
                    for(var i = 0; i < package_data.length; i++){
                        package_data[i][0] = decodeURI(package_data[i][0]);
                        $scope.packages_all.push(package_data[i]);
                    }
                }
            }
        }
        catch(e){
            console.log(e);
            console.log(data);
        }
        $scope.fetchRemaining();
    }
    
    var handleStateChange = function () {
       switch ($scope.xhr.readyState) {
          case 0 : // UNINITIALIZED
          case 1 : // LOADING
          case 2 : // LOADED
          case 3 : // INTERACTIVE
          break;
          case 4 : // COMPLETED
          handleResponse($scope.xhr.status, $scope.xhr.responseText);
          break;
          default: alert("error");
       }
    }
    
    handleProgressEvent = function(evt) {
        if(evt.target.status === 0){
            return;
        }
        if(evt.lengthComputable) {
            var pctcomplete = evt.loaded / evt.total;
            $scope.pctcomplete = Math.round(pctcomplete * 100);
            $scope.background_fetch_message = 'Downloading remaining ' + $scope.pctcomplete + '% of ' + $scope.package_count + ' packages. Click here to stop.';
            $scope.$apply();
        }
    }
    
    handleAbortEvent = function(evt) {
        $scope.background_fetch_message = '';
    }
    
    $scope.fetchRemaining = function() {
        /*
        $scope.package_count
        $scope.response_current_page
        $scope.response_last_page
        $scope.response_more_available
        */
        if($scope.forced_stop == false && ($scope.response_current_page < $scope.response_last_page) && $scope.response_more_available) {
            $scope.request_next_page += 1
            newURL = api_request_url + '&page_number=' + $scope.request_next_page
            $scope.xhr = new XMLHttpRequest();
            $scope.xhr.onreadystatechange=handleStateChange;
            $scope.xhr.addEventListener("progress", handleProgressEvent);
            $scope.xhr.addEventListener("abort", handleAbortEvent);
            $scope.xhr.open("GET",newURL,true);
            $scope.xhr.send();
        }
        else{           
            $scope.computePackageCount(false); //Make an initial 'distro version wise' count
            $scope.refine_os_list = [];
            
            for (v_os in $scope.os_list) {
                if ($scope.os_list[v_os].type !== 'All' && $scope.os_list[v_os].value) {
                    $scope.refine_os_list.push({type: $scope.os_list[v_os].type, value: $scope.os_list[v_os].value});
                }
            }
            $scope.filterResults();
            $scope.loading = false;
            $scope.background_fetch_message = '';
            $scope.$apply();
        }
    }
    
    $scope.computePackageCount = function(countFiltered){
        for(os_name in $scope.os_versions_list){
            for(os_ver_rec in $scope.os_versions_list[os_name]){
                if(!countFiltered){
                    $scope.os_versions_list[os_name][os_ver_rec].count = 0; 
                }
                $scope.os_versions_list[os_name][os_ver_rec].filtercount = 0; //Always reset filtered count
            }
        }
        
        temp_packages = $scope.packages_all;
        if(countFiltered){
            temp_packages = $scope.filteredItems;
        }
        
        for(i = 0;i < temp_packages.length;i++) {
            pkg = temp_packages[i];
            //console.log(JSON.stringify(pkg));
            for(os_name in $scope.os_versions_list){
                if(pkg[3] === undefined){
                    continue; //current package does not belong to OS being checked so continue
                }
                else{
                    for(os_ver_rec in $scope.os_versions_list[os_name]){
                        //console.log(JSON.stringify($scope.os_versions_list[os_name][os_ver_rec]));
                        if(pkg[3].indexOf($scope.os_versions_list[os_name][os_ver_rec].type) >= 0){
                            if(countFiltered){
                                $scope.os_versions_list[os_name][os_ver_rec].filtercount += 1;
                            }
                            else{
                                $scope.os_versions_list[os_name][os_ver_rec].count += 1;
                            }
                        }
                    }
                }
            }
        }
    }
    
    $scope.filterResults = function(fromMainSearch){
        if(fromMainSearch !== undefined || fromMainSearch ){
            console.log('Filtering from main search');
            $scope.filteredItems = $scope.packages_all;
        }
        else{
            var distro_version_filter = false;
            for(os_name in $scope.os_versions_list){
                for(os_ver_rec in $scope.os_versions_list[os_name]){
                    if($scope.os_versions_list[os_name][os_ver_rec].value){
                        distro_version_filter = true;
                    }
                }
            }
            if(distro_version_filter == false){
                console.log('Refine distros unticked');
                $scope.filteredItems = [];
            }
            else if(distro_version_filter == true){
                $scope.filteredItems = $scope.packages_all.filter(function (pkg) {
                    pfound = pkg[0].indexOf($scope.refine_package_name)>=0 || pkg[2].indexOf($scope.refine_package_name)>=0;
                    if(!pfound){
                        return false;
                    }
                    os_found = false;
                    for(os_name in $scope.os_versions_list){
                        //console.log(os_name); //OS Name
                        if(pkg[3] === undefined){
                            continue; //current package does not belong to OS being checked so continue
                        }
                        else{
                            for(os_ver_rec in $scope.os_versions_list[os_name]){
                                //console.log($scope.os_versions_list[os_name][os_ver_rec].type); //OS Version
                                if($scope.os_versions_list[os_name][os_ver_rec].value){
                                    //OS Ver is ticked
                                    if(pkg[3].indexOf($scope.os_versions_list[os_name][os_ver_rec].type) >= 0){
                                        os_found = true;
                                        return os_found;
                                    }
                                }
                            }
                        }
                    }
                    return os_found;
                });
            }
        }
        
        $scope.computePackageCount(true); //Count the results per distro version after filter is applied
        
        if ($scope.sortingOrder !== '') {
            $scope.orderBy();
        }
        $scope.currentPage = 0;
        $scope.n = 0;
        $scope.groupToPages();
    }
    
     // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];
        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };
    
    $scope.getDisplayDistro = function(package_data){
        var distros = '';
        var tmpPkgDistros = [];
        var package_distro_names = Object.keys(package_data);
        for(rec in $scope.os_list){
            tmpPkgDistros = [];
            searched_distro_name = $scope.os_list[rec].type;
            if(package_distro_names.indexOf(searched_distro_name) >= 0){
                for(v in package_data[searched_distro_name]) {
                    tmpPkgDistros.push(package_data[searched_distro_name][v]);
                }
                $scope.os_versions_list[searched_distro_name].filter(function (rec) { 
                    if(!rec.value){
                        idx = tmpPkgDistros.indexOf(rec.type);
                            if(idx >= 0) {
                                tmpPkgDistros.splice(idx,1);
                            }
                        }
                    return;
                    }
                );
                if(tmpPkgDistros.length > 0) {
                    distros += searched_distro_name + ' (' + tmpPkgDistros + '), ';
                }
            }
        }
        if(distros.length > 0){
            distros = distros.slice(0, -2);
        }
        return distros;
    };
    
    $scope.sortIcon = function(display_field) {
        if(display_field === $scope.sortingOrder){
            if($scope.reverse){
                return "icon-chevron-up";
            }
            else{
                return "icon-chevron-down";
            }
        }
        else
        {
            return "icon-sort";
        }
    };
   
    $scope.toggle_child_filters = function(os_name) {
        $scope.os_wise_accordion[os_name] = !$scope.os_wise_accordion[os_name];
    };
    
    $scope.tickUntickRefineCheckboxes = function(os_name, os_version, os_version_state) {
        if(os_version !== undefined){
            var all_version_state = true;
            for(v in $scope.os_versions_list[os_name]) {
                if(!$scope.os_versions_list[os_name][v]['value']){
                    all_version_state = false;
                }
            }
            $scope.os_wise_accordion_checkboxes[os_name] = all_version_state;
        }
        else{
            for(v in $scope.os_versions_list[os_name]) {
                $scope.os_versions_list[os_name][v]['value'] = $scope.os_wise_accordion_checkboxes[os_name];
            }
        }
        $scope.filterResults();
    }
    
    $scope.display_child_filters = function(os_name) {
        return $scope.os_wise_accordion[os_name];
    };
    
};

myApp.controller('HomeController', HomeController);
