define([
    'dojo/_base/declare',
    'dojo/request/xhr',
    'dojo/_base/lang',
    'dojo/json',    
    'dojo/text!../Data/items.json',
    'dojo/text!../Data/item4.json',
    'dojo/text!../Data/item6.json',
    'dojo/text!../Data/item5_7.json'

], function (declare, xhr, lang, JSON, items, item4, item6, item5_7) {

    return declare(null, {

        constructor: function(){

        },


        get: function(){

// ############################ IF YOU WANT TO USE XHR, UNCOMMENT THE BELLOW CODE ####################################

//            var promise = {
//                data: null,
//                success: function(data){
//                    this.data = data;
//                },
//                error: function(data){
//                    console.log('error: ', data);
//                }
//            };

//             xhr('/rest/data', {
//                method: 'get',
//                sync: true,
//                handleAs: 'json',
//                headers: {
//                    Accept: 'application/json'
//                }

//            }).then(lang.hitch(promise, 'success'), lang.hitch(promise, 'error'));

//            return promise.data;

// #################################################################################################################


            return JSON.parse( items );


        },


        getChildrenDesign: function(url){

// ############################ IF YOU WANT TO USE XHR, UNCOMMENT THE BELLOW CODE ####################################
//            var promise = xhr(url, {
//                method: 'get',
//                sync: false,
//                handleAs: 'json',
//                headers: {
//                    Accept: 'application/json'
//                }
//            });

//            return promise;
// #################################################################################################################


            // JUST FOR FIX THE DATA FROM JSON FILES

            if(url==4){
                  return JSON.parse( item4 );
            }
            
            if(url==6){
                  return JSON.parse( item6 );
            }
            
            if(url==7 || url==5){
                  return JSON.parse( item5_7 );
            }

            

        }

    });
});
