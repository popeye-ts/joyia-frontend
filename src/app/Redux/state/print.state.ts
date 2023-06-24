import * as product from './cashOrderProducts.state';

export interface PrintState {
    products: Array <product.ProductState> ,
    order_id : string ,
    status : string ,
    total : number ,
    tax :  number ,
    discount : number ,
    subTotal : number,
    number : number 
}
  
export const PrintInitialState: PrintState = {
    products : [] ,
    order_id : "" ,
    status : "" ,
    total : 0,
    tax : 0 ,
    discount : 0 ,
    subTotal : 0 ,
    number : 0
}
