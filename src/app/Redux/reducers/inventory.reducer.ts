import { Action } from '@ngrx/store';
import { inititalInventoryFormState, InventoryFormState } from '../state/inventoryForm.state';
import { InventoryActions } from '@actions/inventory.actions';
import { INVENTORY_FORM_ADD_ITEM, INVENTORY_FORM_BARCODE_ADD, INVENTORY_FORM_BARCODE_REMOVE, INVENTORY_FORM_BARCODE_SCANNED, INVENTORY_FORM_CHANGE_BARCODE, INVENTORY_FORM_CHANGE_EAN, INVENTORY_FORM_CHANGE_QUANTITY, INVENTORY_FORM_ITEM_SELECTED, INVENTORY_FORM_KEY_PRESS, INVENTORY_FORM_PRODUCTS_ADD, INVENTORY_FORM_PRODUCT_CHANGE, INVENTORY_FORM_REMOVE_ITEM, INVENTORY_FORM_RESET } from '@actions/stateActions';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40
}
export function inventoryReducer(state = inititalInventoryFormState , action: InventoryActions ): InventoryFormState {
  console.log("I am inventory reducer" , state , action );
  switch (action.type) {
    case INVENTORY_FORM_ADD_ITEM : return handleFormAddItem(state , action );
    case INVENTORY_FORM_BARCODE_SCANNED: return handleBarCodeScanned(state , action );
    case INVENTORY_FORM_CHANGE_QUANTITY : ;break;
    case INVENTORY_FORM_REMOVE_ITEM : return handleFormRemoveItem(state , action );
    case INVENTORY_FORM_PRODUCTS_ADD : return handleMultipleProductsInsert(state  , action);  
    case INVENTORY_FORM_BARCODE_REMOVE : return handleBarcodeRemove(state , action );
    case INVENTORY_FORM_BARCODE_ADD : return handleBarcodeAdd(state , action );
    
    case INVENTORY_FORM_CHANGE_BARCODE : return handleBarcodeChange(state , action);
    case INVENTORY_FORM_CHANGE_EAN : return handleEANChange(state , action );
    case INVENTORY_FORM_KEY_PRESS: return handleKeyboardInputs(state , action );
    case INVENTORY_FORM_RESET: return {...state , ...inititalInventoryFormState };
    case INVENTORY_FORM_ITEM_SELECTED: 
      let { imeiIndex , itemIndex , rowIndex } = action.payload;
      return {...state , selected : [ rowIndex , itemIndex , imeiIndex ] };
    case INVENTORY_FORM_PRODUCT_CHANGE : 
      let idSetArr = state
                      .items
                      .map((item  : any , i : number )=>
                        (i==action.payload.index) ? 
                          ({...item , product_id : action.payload.product_id}) : 
                          item 
                      );
    return {...state , items : idSetArr }
    default:
      return state;
  }
}
function handleFormRemoveItem(state , action ) : any {
  let newState : any = {};
  let { itemIndex , rowIndex } = action.payload;
  Object.assign(newState , state);

  itemIndex = itemIndex || 0 ;
  //First make sure if the item is already in list
  let items = [...newState.items];
  
  let newArr = items.map( (item, index)=> {
    let tempObj = {...item};
    if(index == rowIndex ){
      tempObj.stockItems = tempObj.stockItems.filter((sI , sIndex)=>sIndex != itemIndex)
    }
    if(tempObj.stockItems.length == 0){
      return false;
    }
    return tempObj;
  }).filter(Boolean);
  
  return {...newState  , items : newArr };
}
function handleFormAddItem(state , action ) : any {
  let newState : any = {};
  Object.assign(newState , state);
  console.log("I am handle form add item " , state.items , " PAYLOAD " , action.payload );

  let selectedProduct = action.payload.product;
  let universalcode = selectedProduct.universal_code || '';

  //Creating a template object 
  let objToPush : any = {
    universalCode : universalcode ,
    barcode : [' ']
  }
  //First make sure if the item is already in list
  let items = [...newState.items];
  let isItemFound = false;
  for (let index = 0; index < items.length; index++) {
    const product = items[index];
    if(product.product_id == selectedProduct._id){
      items[index] = {
        ...items[index] ,
        quantity : items[index].quantity+1,
        stockItems : items[index].stockItems.concat(objToPush)
      }; 

      isItemFound = true;
      break;
    }
  }
  //In case item not found
  if(!isItemFound){
    objToPush = {
      product_id : selectedProduct._id ,
      quantity : 1 ,
      ean : universalcode ,
      label : selectedProduct.product_display_name ,
      type : 'Barcoded' ,
      stockItems : [objToPush]
    }
    items.push(objToPush);
  }
  return {...newState , items };
}

function handleMultipleProductsInsert(state: InventoryFormState, action: any ): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);
  console.log("I am handle form multiple add items " , state.items , " PAYLOAD " , action.payload );
  let selectedProducts = action.payload || [];
  //First make sure if the item is already in list
  let items = [...newState.items];
    
  //For each of the product
  for (let index = 0; index < selectedProducts.length; index++) {
    const thisProductFromDB = selectedProducts[index];

    let universalCode = thisProductFromDB.ean || thisProductFromDB.universal_code;

    //Creating a template object 
    let objToPush : any = {
      universalCode : universalCode ,
      barcode : thisProductFromDB.barcode || []
    }
    let isItemFound = false;
    for (let index = 0; index < items.length; index++) {
      const product = items[index];
      if(thisProductFromDB.product_id && product.product_id == thisProductFromDB.product_id){
        items[index] = {
          ...items[index] ,
          quantity : items[index].quantity+1,
          stockItems : items[index].stockItems.concat(objToPush)
        }; 
        isItemFound = true;
        break;
      }
    }
    //In case item not found
    if(!isItemFound){
      objToPush = {
        product_id : thisProductFromDB.product_id ,
        quantity : 1 ,
        ean : universalCode , 
        label : thisProductFromDB.product_display_name ,
        type : 'Barcoded' ,
        stockItems : [objToPush]
      }
      items.push(objToPush);
    }  
  }

  let selectedProduct = action.payload.product;
  return {...newState , items };
}

function handleBarcodeRemove(state: InventoryFormState, action: any): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);

  let { imeiIndex , itemIndex , rowIndex } = action.payload;
  let items = [...newState.items];

  let newArr = items.map( (item, index)=> {
    let tempObj = {...item};
    if(index == rowIndex ){
      tempObj.stockItems = tempObj.stockItems.map((sI , sIndex)=>{
        let tempStockItem = {...sI};
        if(sIndex == itemIndex){
          tempStockItem.barcode = tempStockItem.barcode.filter((elem : any , i : number )=> imeiIndex != i)
        }
        return tempStockItem
      })
    }
    return tempObj;
  })
  
  return {...newState  , items : newArr };
}

function handleBarcodeChange(state: InventoryFormState, action: any): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);

  let { imeiIndex , itemIndex , rowIndex , code } = action.payload;
  let items = [...newState.items];

  let newArr = items.map( (item, index)=> {
    let tempObj = {...item};
    if(index == rowIndex ){
      tempObj.stockItems = tempObj.stockItems.map((sI , sIndex)=>{
        let tempStockItem = {...sI};
        if(sIndex == itemIndex){
          tempStockItem.barcode = tempStockItem.barcode.map((elem : any , i : number )=>{ 
            if(imeiIndex == i)
            {
              return code; 
            }else{
              return elem;
            }
          })
        }
        return tempStockItem
      })
    }
    return tempObj;
  })
  
  return {...newState  , items : newArr };
}

function handleEANChange(state: InventoryFormState, action: any): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);

  let { index , ean } = action.payload;
  let items = [...newState.items];

  let newArr = items.map( (item, i)=> {
    let tempObj = {...item};
    if(i == index ){
      tempObj.ean = ean 
    }
    return tempObj;
  })
  
  return {...newState  , items : newArr };
}

function handleBarcodeAdd(state: InventoryFormState, action: any): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);

  let { imeiIndex , itemIndex , rowIndex } = action.payload;
  let items = [...newState.items];

  let newArr = items.map( (item, index)=> {
    let tempObj = {...item};
    if(index == rowIndex ){
      tempObj.stockItems = tempObj.stockItems.map((sI , sIndex)=>{
        let tempStockItem = {...sI};
        if(sIndex == itemIndex){
          tempStockItem.barcode = tempStockItem.barcode.concat(' ');
        }
        return tempStockItem
      })
    }
    return tempObj;
  })
  
  return {...newState  , items : newArr };
}

function handleKeyboardInputs(state: InventoryFormState, action: any): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);
  let eventCode = action.payload.code;
  let itemsCount = newState.items.length;
  let x = newState.selected[0];
  let y = newState.selected[1];
  let z = newState.selected[2];
  
  let thisProductBarcodeCount = 0;
  newState.items.forEach(( item,index) =>{
    if(index == x){
      console.log(item.stockItems , " <<< ");
      thisProductBarcodeCount = item.stockItems.map(t=>t.barcode).flat().length;
    }
  })
  console.log("This product barcode count " , thisProductBarcodeCount);

  switch(eventCode){
    case KEY_CODE.RIGHT_ARROW : 
      z++;
      z = z > 2 ? 2 : z;
      return {...newState , selected : [x, y , z]}    
    break;
    case KEY_CODE.LEFT_ARROW : 
      z--;
      z = z < 0 ? 0 : z;
      return {...newState , selected : [x, y , z]}    
  
    break;
    case KEY_CODE.DOWN_ARROW : 

      y++;
      if(y > (thisProductBarcodeCount-1 ) ){
        x++
        x = x > itemsCount-1 ? itemsCount-1 : x;
        y = 0;
      }
      return {...newState , selected : [x, y ,z]}    

    break;
    
    case KEY_CODE.UP_ARROW : 
      y--;
      if(y<0){
        x--;
        x = x < 0 ? 0 : x;
        y = 0;
      }
      return {...newState , selected : [x, y , z]}    
  
    break;
  }
  return {...newState };
}

function handleBarCodeScanned(state: InventoryFormState, action: InventoryActions): InventoryFormState {
  let newState : any = {};
  Object.assign(newState , state);
  console.log("Handle Barcode Scanned ", action );
  return {...newState };
}

// function handleKeyboardInputs(state: InventoryFormState, action: InventoryActions): InventoryFormState {
//   let newState : any = {};
//   Object.assign(newState , state);
//   console.log("Handle Select item ", action );
//   return {...newState };
// }
