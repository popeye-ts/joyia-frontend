export interface ProductState {
    _id: string ,
    name :  string ,
    price : number ,
    price_calculated : number ,
    recieved ?: number , 
    quantity : number ,
    quantity_available : number ,
    image : string ,
    markup ?: number ,
    discount ?: number ,
    inventory_type ?: string
}
  
export const productInitialState: ProductState = {
    _id : '-1',
    name : '' ,
    price : 0 ,
    price_calculated : 0 ,
    recieved : 0 ,
    quantity : 0 ,
    quantity_available : 0 ,
    image : '',
    markup : 0 ,
    discount : 0 ,
    inventory_type : 'Non Barcoded'
}
