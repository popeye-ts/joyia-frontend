export interface stockItem{
    regNo : string ,
    engineNo :  string ,
    chasisNo :  string ,
    keyNo :  string ,
    color :  string ,
    universalCode :  string  ,
    barcode : string [ ] ,
    other : string ,
    expiredAt :  Date ,
    manufacturedAt :  Date ,
}
export interface inventoryItem {
    product_id : string ,
    quantity : number ,
    label : string ,
    type : 'Barcoded' | 'Non Barcoded',
    stockItems : [ stockItem ]
}
export interface InventoryFormState {
    submissionStatus : string ,
    items : inventoryItem[] ,
    selected : [number , number, number ]
}












export const inititalInventoryFormState : InventoryFormState = {
    submissionStatus : 'blank' ,
    items : [],
    selected : [0 , 0 , 0]
}