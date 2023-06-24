import * as product from './cashOrderProducts.state';
export interface searchFilters {
    label : string ,
    skip : number ,
    limit : number ,
    category : string,
    sorttype : string , 
    sortdirection : number
}
export const searchFiltersInitialState :searchFilters  = {
    label : '',
    skip : 0 ,
    limit : 10000,
    category : '', 
    sorttype : 'created_at' , 
    sortdirection  : -1
} 

export interface CashOrderState {
    products: Array <product.ProductState> ,
    searchQuery : searchFilters,
    productsSelected : Array <product.ProductState>, 
    spinner:  boolean ,
    beingAdded : string ,
    total : number ,
    tax :  number ,
    discount : number ,
    subTotal : number ,
    orderType : string ,
    selectedClient : any ,
    selectedGuarantors : any [] ,
    currentProduct : any ,
    selectedOrder : any
}
  
export const cashOrderInitialState: CashOrderState = {
    products : [] ,
    searchQuery : searchFiltersInitialState ,
    spinner : true ,
    beingAdded : "PENDING" ,
    productsSelected : [],
    total : 0,
    tax : 0 ,
    discount : 0 ,
    subTotal : 0 ,
    orderType : 'Cash Order',
    selectedClient : null ,
    selectedGuarantors : [] ,
    currentProduct : null ,
    selectedOrder : null
}
