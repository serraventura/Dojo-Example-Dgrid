define([ 
        'dojo/_base/declare',
        '../DAO/BookDAO',
        'dojo/store/Memory',
        'dgrid/OnDemandGrid',
        'dgrid/Keyboard',
        'dgrid/Selection',
        'dgrid/selector',
        'dojo/on',
        'dijit/Dialog',
        'dgrid/tree',
        'dojo/store/Observable',
        'dgrid/extensions/Pagination',
        'dojo/_base/lang',
        'dgrid/util/mouse',
        'dgrid/editor',
        'dijit/form/Button',
        'dojo/date/stamp',
        'dojo/ready',
        'dijit/registry'

],function (
        declare,
        BookDAO,
        Memory,
        OnDemandGrid,
        Keyboard,
        Selection,
        selector,
        on,
        Dialog,
        tree,
        Observable,
        Pagination,
        lang,
        mouseUtil,
        editor,
        Button,
        stamp,
        ready,
        registry
) {

    return declare(null, {

        id: null,
        format: null,
        booksItems: null,
        memoryStore: null,
        filterText: null,
        filterSlider: null,

        constructor: function(){

            this.id = null;

        },


        mapBookItems: function(jsondata){

            this.booksItems = dojo.map(jsondata.books, function(book) {
                return {
                    id : book.id,
                    title : book.title,
                    count : book.count,
                    children: [],
                    type : book.type,
                    format : book.format,
                    idDOC: book.idDOC,
                    latestTimestamp: book.latest.timestamp
                };
            });

        },

        loadMemoryStore: function(items){

            this.memoryStore = Observable(new Memory({
                data: items,
                getChildren: function(parent){

                    return parent.children;
                },

                mayHaveChildren: function(parent){
                    return (parent.children && parent.children.length) || (parent.count != 0 && parent.type != 'DOC');
                }

            }));


        },


        matchChildren: function (id){

            var bookDAO = new BookDAO();
            
            
            
            
            
            // ############################ IF YOU WANT TO USE XHR, UNCOMMENT THE BELLOW CODE ####################################
            
//            var url = 'http://localhost:8080/rest/data/'+id;

//            var returnObj = {

//                data: null,
//                id: null,
//                memoryStore: null,

//                success: function(data){

//                    var node = this.memoryStore.get(this.id);

//                    // I dont know why, when REST has just two or more BOOKS, it generate children...
//                    if(data.book.length >= 2 && data.book.length != undefined){

//                          for(var i=0; i<data.book.length && i<=9; i++){

//                              node.children.push({id:data.book[i].id, title:stamp.fromISOString(data.book[i].created).toGMTString(), format:data.book[i].instances.format, type:'DOC', idDOC:data.book[i].id});

//                          }
//                          
//                    }else{
//                          node.children.push({id:data.book.id, title:stamp.fromISOString(data.book.created).toGMTString(), format:data.book.instances.format, type:'DOC', idDOC:data.book.id});
//                    }

//                    this.memoryStore.put(node);
//                    this.data = data;
//                },
//                error: function(data){
//                    console.log('error: ', data);
//                }

//            };

//            returnObj.id = id;
//            returnObj.memoryStore = this.memoryStore;
//            bookDAO.getChildrenDesign(url).then(lang.hitch(returnObj, 'success')), lang.hitch(returnObj, 'error');
            // ############################ END - XHR  ########################
            
            
            
            
            
            
            
            // ############################ JUST FOR FIX THE DATA (TESTS)  ############
            var url = id;
            
            var data = bookDAO.getChildrenDesign(url);
            
            var node = this.memoryStore.get(id);

            // I dont know why, when REST has just two or more BOOKS, it generate children...
            if(data.book.length >= 2 && data.book.length != undefined){

              for(var i=0; i<data.book.length && i<=9; i++){

                  node.children.push({id:data.book[i].id, title:stamp.fromISOString(data.book[i].created).toGMTString(), format:data.book[i].instances.format, type:'DOC', idDOC:data.book[i].id});

              }
              
            }else{
              node.children.push({id:data.book.id, title:stamp.fromISOString(data.book.created).toGMTString(), format:data.book.instances.format, type:'DOC', idDOC:data.book.id});
            }

            this.memoryStore.put(node);
            this.data = data;
            // ############################ END - TESTS ############################################################
            



        },

        makeHandler: function(grid, type, dir){

            var that = this;

            return function(evt){

                var obj = grid[type](evt);
                var str;

                that.id = obj.row.id;

                if(obj.column){

                    if(obj.column.id == 2){ // tree's click/double click

                        var node = that.memoryStore.get(obj.row.id);

                        if(node.children.length == 0){
                            that.matchChildren(obj.row.id);
                        }

                    }

                    str = obj.row.id + " - " + obj.column.id

                }else{
                    str = obj.id
                }

            };

        },

        loadGrid: function(){

        	var bookDAO = new BookDAO();

            var columns = [

                selector({label: "#", field:'id'}, "radio"),
                
                {label:'Id', field:'id', sortable: true},

                tree({label: "Title", field:"title", sortable: true, indentWidth:10}),

                // Button Column
                editor({label: ' ', field: 'idDOC', sortable: false, canEdit: function(obj){

                    if(obj.type == 'DOC'){

                        if(obj.format == 'html'){
                            this.editorArgs.iconClass = 'dijitEditorIcon dijitEditorIconHtml';
                        }

                        if(obj.format == 'pdf'){
                            this.editorArgs.iconClass = 'dijitEditorIcon dijitEditorIconPdf';
                        }

                        return true;
                    }

                    return false;

                }, editorArgs:{onClick: function(obj){
                
                  alert(this._dgridLastValue);

                }, label:'View', showLabel:false}}, Button),
                // ========  Button Column


                {label:'Count', field:'count', sortable: true}

            ];

            this.mapBookItems(bookDAO.get());
            this.loadMemoryStore(this.booksItems);

            var CustomGrid = declare([OnDemandGrid, Keyboard, Selection, Pagination]);

            window.grid = new CustomGrid({

                columns: columns,
                query: this.filterQuery,
                store: this.memoryStore,
                deselectOnRefresh: false,
                collapseOnRefresh:false,
                pagingLinks: false,
                pagingTextBox: true,
                firstLastArrows: true,
                rowsPerPage: 10,
                pageSizeOptions: [10, 15, 20],
                selectionMode: "single", // for Selection; only select a single row at a time
                cellNavigation: false // for Keyboard; allow only row-level keyboard navigation
            }, "grid");

            grid.on(mouseUtil.clickCell, this.makeHandler(grid, "cell", "click"));
            grid.on(mouseUtil.dblclickCell, this.makeHandler(grid, "cell", "dblclick"));

            ready(function() {

                var timeoutId, timeoutId2;
                this.filterText = registry.byId("filter");
                this.filterSlider = registry.byId("horizontalSlider");

                this.filterText.watch("value", function(name, oldValue, newValue) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    };

                    timeoutId = setTimeout(function() {
                        grid.refresh();
                    }, 300);
                });


                this.filterSlider.watch("value", function(name, oldValue, newValue) {
                    if (timeoutId2) {
                        clearTimeout(timeoutId2);
                        timeoutId = null;
                    };

                    timeoutId2 = setTimeout(function() {
                        grid.refresh();
                    }, 300);
                });


            });



        },

        byId: function(id){
            return document.getElementById(id);
        },

        filterQuery:  function(item, index, items) {

            var filterSlider = this.filterSlider ? this.filterSlider.get("value") + "" : "";
            var filterString = this.filterText ? this.filterText.get("value") + "" : "";

            if (!item.title) return false;
            if (!item.latestTimestamp) return false;

            var name = (item.title + "").toLowerCase();
            var timestamp = stamp.fromISOString(item.latestTimestamp).toGMTString().toLowerCase();

            var m;
            switch (parseInt(filterSlider))
            {
                case 1:
                    m = 'Jan';
                    break;
                case 2:
                    m = 'Feb'
                    break;
                case 3:
                    m = 'Mar'
                    break;
                case 4:
                    m = 'Apr'
                    break;
                case 5:
                    m = 'May'
                    break;
                case 6:
                    m = 'Jun'
                    break;
                case 7:
                    m = 'Jul'
                    break;
                case 8:
                    m = 'Aug'
                    break;
                case 9:
                    m = 'Sep'
                    break;
                case 10:
                    m = 'Oct'
                    break;
                case 11:
                    m = 'Nov'
                    break;
                case 12:
                    m = 'Dec'
                    break;
                default:
                    m = '';
            }

            if(filterString != ''){
                if (~name.indexOf(filterString.toLowerCase())) { return true;}
            }

            if(filterString != '' && m == ''){
                if (~name.indexOf(filterString.toLowerCase())) { return true;}
            }            

            if(filterString == '' && m != ''){
                if (~timestamp.indexOf(m.toLowerCase())) { return true;}
            }

            if(filterString != '' && m != ''){
                if (~timestamp.indexOf(m.toLowerCase()) && ~name.indexOf(filterString.toLowerCase())) { return true;}
            }

            if(filterString == '' && m == ''){
                return true;
            }

            return false;

        }



    });
});
