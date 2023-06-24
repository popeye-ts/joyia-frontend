import { Action } from '@ngrx/store';
import {ADD_PRODUCT,REMOVE_PRODUCT,PRODUCTS_BEING_FETCHED , COMPLETE_ORDER,EMPTY_CART , PRODUCTS_FETCH_SUCCESS , PRODUCTS_FETCH_ERROR , INCREASE_QUANTITY , DECREASE_QUANTITY , CALCULATE_SUMMARY, SUBMIT_ORDER, SUBMIT_ORDER_ERROR, CATEGORY_CHANGED, FILTERS_CHANGED, SEARCH_TEXT, CHANGE_RECIEVED_AMOUNT, CHANGE_ORDER_TYPE, CHANGE_CLIENT, CHANGE_ORDER_MARKUP, CHANGE_ORDER_DISCOUNT, CHANGE_GUARANTOR1, CHANGE_GUARANTOR2, SET_CURRENT_PRODUCT, SELECT_INVENTORY_ITEMS, CHANGE_GUARANTOR, SELECT_ORDER} from '@actionTypes';
import { CashOrderState , cashOrderInitialState } from "@stateInterface";
import {CashOrderActions, ChangeGuarantor} from '@actions/cashOrder.actions';
import {Howl, Howler} from 'howler';

export function cashOrderReducer(state = cashOrderInitialState, action: CashOrderActions): CashOrderState {
  let temporarySelectedProducts;
  switch (action.type) {
    case ADD_PRODUCT : 
     let warning ='assets/mp3/warning.wav';
     let success = 'assets/mp3/clearly-602.mp3'
    
    
      //Make sure thr product stock is available
      if(action.payload.quantity_available < 1)
      {
        var sound = new Howl({
          src: [warning],
          volume: 0.1,
          html5: true
        });
        
        
        sound.play();
        return {...state , beingAdded : "PENDING" };
      }
      var sound = new Howl({
        src: [success],
        html5: true
      });
      
      
      sound.play();
      if(state.orderType == "Installment Order"){
        let price_calculated = action.payload.price * 45 / 100;
        price_calculated = price_calculated + action.payload.price;
        return  {...state , productsSelected: [...state.productsSelected, {...action.payload , price_calculated , markup : 45 } ]};
      }
    return  {...state , productsSelected: [...state.productsSelected, {...action.payload , markup : 45 } ]};
    case REMOVE_PRODUCT : 
      let ok ='assets/mp3/swiftly-610.mp3';
      var sound = new Howl({
        src: [ok],
        html5: true
      });
      
      sound.play();
      return  {...state , productsSelected : state.productsSelected.filter(prod=>prod._id != action.payload)};
    case PRODUCTS_FETCH_SUCCESS : return {...state , products : action.payload , spinner : false } ;
    case INCREASE_QUANTITY : 
      //Make a copy of array of selected products
      temporarySelectedProducts = [...state.productsSelected];
      for(let i = 0  ; i < temporarySelectedProducts.length ; i++){
        if(temporarySelectedProducts[i]._id == action.product_id){
          temporarySelectedProducts[i] = {...temporarySelectedProducts[i]};
          //Make sure the quantity is less then available
          if(temporarySelectedProducts[i].quantity_available >=  ~~temporarySelectedProducts[i].quantity +1){
            temporarySelectedProducts[i].quantity +=1;
          
            //Calculating price
            temporarySelectedProducts[i].price_calculated = ~~temporarySelectedProducts[i].quantity * ~~temporarySelectedProducts[i].price;            
            temporarySelectedProducts[i].recieved = ~~temporarySelectedProducts[i].price_calculated;

            temporarySelectedProducts[i].markup = ~~temporarySelectedProducts[i].markup || 45;
            temporarySelectedProducts[i].discount = ~~temporarySelectedProducts[i].discount || 0;
            //In case its installment orer
            if(state.orderType == "Installment Order"){
              let markup = ~~temporarySelectedProducts[i].price_calculated * ~~temporarySelectedProducts[i].markup / 100;
              temporarySelectedProducts[i].price_calculated += markup;
            }
          }else{
            
          }
        }

      }
      return {...state , productsSelected : temporarySelectedProducts } ;
      
    case DECREASE_QUANTITY :       
      temporarySelectedProducts = [...state.productsSelected];
      for(let i = 0  ; i < temporarySelectedProducts.length ; i++){
        
        if(temporarySelectedProducts[i]._id == action.product_id){
          //Making a deep copy to be able to alter the object
          temporarySelectedProducts[i] = {...temporarySelectedProducts[i]};

          temporarySelectedProducts[i].quantity -=1;

          //Calculating price
          temporarySelectedProducts[i].price_calculated = ~~temporarySelectedProducts[i].quantity * ~~temporarySelectedProducts[i].price;
          temporarySelectedProducts[i].recieved = ~~temporarySelectedProducts[i].price_calculated;

          //In case the quantity is less then 1
          if(temporarySelectedProducts[i].quantity < 1)
          {
            temporarySelectedProducts = [...temporarySelectedProducts];
            temporarySelectedProducts = temporarySelectedProducts.filter(prod => prod._id != action.product_id)
          }  
          //In case its installment orer
          if(state.orderType == "Installment Order"){
            let markup = ~~temporarySelectedProducts[i].price_calculated * ~~temporarySelectedProducts[i].markup / 100;
            temporarySelectedProducts[i].price_calculated += markup;
          }
          break;
        }

      }
      return {...state , productsSelected : temporarySelectedProducts } ;
    case CALCULATE_SUMMARY : 
        let summaryInfo = calculateSummary({...state });
        return {...state , ...summaryInfo };
    case PRODUCTS_FETCH_ERROR : return { ...state , spinner : false} ;
    case PRODUCTS_BEING_FETCHED : return  {...state , spinner : true};

    case SUBMIT_ORDER : return  {...state, beingAdded : "SUBMITTING" };
    case COMPLETE_ORDER : return  {...state, beingAdded : "ORDER_COMPLETE" };
    case SUBMIT_ORDER_ERROR : return { ...state , beingAdded : "SUBMIT_ERROR" };
    case EMPTY_CART : return  {...state , productsSelected : [] , selectedClient : null , selectedGuarantors : [] , orderType : 'Cash Order' };
    case CATEGORY_CHANGED : return  {...state , searchQuery : {...state.searchQuery , category : action.payload }};
    case SEARCH_TEXT : return  {...state , searchQuery : {...state.searchQuery , label : action.payload }};
    case FILTERS_CHANGED : return applyFilters(state );
    case CHANGE_RECIEVED_AMOUNT : return recievedAmountChangeHandler(state , action );
    case CHANGE_ORDER_TYPE : return handleOrderTypeChanged(state , action);
    case CHANGE_CLIENT : return {...state , selectedClient : action.payload};
    case CHANGE_ORDER_MARKUP : return handleMarkupChanged (state , action )
    case CHANGE_ORDER_DISCOUNT : return handleDiscountChanged (state , action )
    case CHANGE_GUARANTOR1 : return { ...state , selectedGuarantors : [action.payload , (state.selectedGuarantors.length > 1 ? state.selectedGuarantors[1] : null )]  }
    case CHANGE_GUARANTOR2 : return { ...state , selectedGuarantors : [(state.selectedGuarantors ? state.selectedGuarantors[0] : null ) , action.payload ]  }
    case CHANGE_GUARANTOR : return handleGuarantorChange(state , action)
    case SET_CURRENT_PRODUCT : return {...state , currentProduct : action.payload };
    case SELECT_INVENTORY_ITEMS : return handleStockItemsAdd(state , action)
    case SELECT_ORDER : return { ...state , selectedOrder : action.payload , orderType : ( (action.payload && action.payload.on_full_payment) ? "Cash Order" : "Installment Order" )}
    // case SPINNER_
    default:
      return state;
  }
  
}
function recievedAmountChangeHandler(state , action){
  let newState = Object.assign( {} , state);
  //Find the product whose recieved amount is to be changed
  let productsSelected = state.productsSelected.map(product=>{
    if(product._id == action.payload.product_id){
      return {...product , recieved : action.payload.amount};
    }
    return product 
  });

  let summaryInfo = calculateSummary({...newState , productsSelected })
  return {...newState , productsSelected  , ...summaryInfo }

}
function applyFilters(state){
  let newState = Object.assign( {} , state);
  //Apply ctagory filter
  let category = state.searchQuery.category || 'all';
  if(category == 'all'){
    newState.products = newState.products.map(p=>{
      return {...p , hidden : false};
    })
  }else{
    newState.products = newState.products.map(p=>{
      let categories = p.categories || [];
      let categoryMatched = categories.some(cat=>cat.name==category);
      return {...p , hidden : !categoryMatched };
    })
  }

  //Apply search text filter
  let searchText = (newState.searchQuery.label || '').trim();
  if(searchText && searchText.length > 0){
    newState.products = newState.products.map(p=>{
      let isNameSame = (p.name || '').trim().toLowerCase().includes(searchText.toLowerCase());
      return {...p , hidden : !isNameSame };
    });
  }

  return newState;
}

function handleOrderTypeChanged(state: CashOrderState, action): CashOrderState {
  let newState = Object.assign( {} , state);
  let temporarySelectedProducts = [...state.productsSelected];
      for(let i = 0  ; i < temporarySelectedProducts.length ; i++){        
          //Making a deep copy to be able to alter the object
          temporarySelectedProducts[i] = {...temporarySelectedProducts[i]};

          //Calculating price
          temporarySelectedProducts[i].price_calculated = ~~temporarySelectedProducts[i].quantity * ~~temporarySelectedProducts[i].price;
          temporarySelectedProducts[i].recieved = ~~temporarySelectedProducts[i].price_calculated;

          //In case its installment orer
          if( action.payload == "Installment Order"){
            let markup = ~~temporarySelectedProducts[i].price_calculated * ~~temporarySelectedProducts[i].markup / 100;
            temporarySelectedProducts[i].price_calculated += markup;
          }
      }
  let summaryInfo = calculateSummary({...newState ,productsSelected : temporarySelectedProducts })
  return {...newState ,productsSelected : temporarySelectedProducts , ...summaryInfo , orderType : action.payload }

}
function handleMarkupChanged(state: CashOrderState, action): CashOrderState {
  let newState = Object.assign( {} , state);
  console.log("Markup changed " , action );
  let payload = action.payload;

  let temporarySelectedProducts = [...state.productsSelected];
  for(let i = 0  ; i < temporarySelectedProducts.length ; i++){
    
    if(temporarySelectedProducts[i]._id == payload.product_id){
      //Making a deep copy to be able to alter the object
      temporarySelectedProducts[i] = {...temporarySelectedProducts[i]};

      //Calculating price
      temporarySelectedProducts[i].price_calculated = ~~temporarySelectedProducts[i].quantity * ~~temporarySelectedProducts[i].price;
      temporarySelectedProducts[i].recieved = ~~temporarySelectedProducts[i].price_calculated;

      //In case the quantity is less then 1
      if(temporarySelectedProducts[i].quantity < 1)
      {
        temporarySelectedProducts = [...temporarySelectedProducts];
        temporarySelectedProducts = temporarySelectedProducts.filter(prod => prod._id != payload.product_id)
      }

      temporarySelectedProducts[i].markup = ~~payload.markup;
      //In case its installment orer
      if(state.orderType == "Installment Order"){
        let markup = ~~temporarySelectedProducts[i].price_calculated * ~~payload.markup / 100;
        temporarySelectedProducts[i].price_calculated += ~~markup;
      }
      temporarySelectedProducts[i].price_calculated -= ~~temporarySelectedProducts[i].discount;

      break;
    }
  }
  let summaryInfo = calculateSummary({...newState ,productsSelected : temporarySelectedProducts })
  return {...newState ,productsSelected : temporarySelectedProducts , ...summaryInfo }
}
function handleDiscountChanged(state: CashOrderState, action): CashOrderState {
  let newState = Object.assign( {} , state);
  console.log("Markup changed " , action );
  let payload = action.payload;

  let temporarySelectedProducts = [...state.productsSelected];
  for(let i = 0  ; i < temporarySelectedProducts.length ; i++){
    
    if(temporarySelectedProducts[i]._id == payload.product_id){
      //Making a deep copy to be able to alter the object
      temporarySelectedProducts[i] = {...temporarySelectedProducts[i]};

      //Calculating price
      temporarySelectedProducts[i].price_calculated = ~~temporarySelectedProducts[i].quantity * ~~temporarySelectedProducts[i].price;
      temporarySelectedProducts[i].recieved = ~~temporarySelectedProducts[i].price_calculated;

      //In case the quantity is less then 1
      if(temporarySelectedProducts[i].quantity < 1)
      {
        temporarySelectedProducts = [...temporarySelectedProducts];
        temporarySelectedProducts = temporarySelectedProducts.filter(prod => prod._id != payload.product_id)
      }

      temporarySelectedProducts[i].discount = ~~payload.discount;
      //In case its installment orer
      if(state.orderType == "Installment Order"){
        let markup = temporarySelectedProducts[i].price_calculated *  temporarySelectedProducts[i].markup / 100;
        temporarySelectedProducts[i].price_calculated += ~~markup;
      }
      temporarySelectedProducts[i].price_calculated -= ~~payload.discount;
      break;
    }
  }
  let summaryInfo = calculateSummary({...newState ,productsSelected : temporarySelectedProducts })
  return {...newState ,productsSelected : temporarySelectedProducts , ...summaryInfo }
}

function handleStockItemsAdd(state: CashOrderState, action): CashOrderState {
  let newState = Object.assign( {} , state);
  console.log("Add Inventory Items " , action );
  let payload = action.payload;
  let quantity = payload.items.length || 1;
  let price_calculated = ~~quantity * ~~payload.price;
  //Extract product info from
  let itemAlreadyExists = newState.productsSelected.some( (item: any)=>item.inventory_id == payload.inventory_id);
  let newProducts = [];
  if(itemAlreadyExists){
    newProducts = newState.productsSelected.map( (item : any)=>{
      if(item.inventory_id == payload.inventory_id){
        return {...payload , quantity , price_calculated }
      }
      return item;
    });
  }else{
    newProducts = newState.productsSelected.concat({...payload , quantity , price_calculated });
  }
  let success = 'assets/mp3/clearly-602.mp3'

  var sound = new Howl({
    src: [success],
    html5: true
  });
  
  
  sound.play();

  let summaryInfo = calculateSummary({...newState ,productsSelected : newProducts })
  return {...newState ,productsSelected : newProducts , ...summaryInfo}
}
function calculateSummary(state){
  //We have to calculate Summary of order based on state's current data
      //Calculate tax
      let tax = 0;

      //Calculate discount
      let discount = state.productsSelected.reduce( (total , product)=>{        
        //since price_calculated can be manipulated by user so
        return (total + ~~product.discount);
      }, 0);
      //Calculate sub total
      let subTotal =  state.productsSelected.reduce( (total , elem)=>{
        return (~~elem.price_calculated)+total;
      }, 0);
      //Calculate total amount
      let total = ~~subTotal - ~~tax;
           
    return { total : total, tax : tax , subTotal : subTotal , discount : discount } ;
}
function handleGuarantorChange(state: CashOrderState, action: ChangeGuarantor): CashOrderState {
  let newState = Object.assign( {} , state);
  let payload = action.payload;
  let identifier = action.id; 
  let selectedGuarantors = []
  //Handling guarantor 1
  if(identifier == 1){
    selectedGuarantors = [action.payload , (state.selectedGuarantors.length > 1 ? state.selectedGuarantors[1] : null )]
  }
  //Handling guarantor 2
  if(identifier == 2){
    selectedGuarantors =  [(state.selectedGuarantors ? state.selectedGuarantors[0] : null ) , action.payload ]
  }
  return {...newState , selectedGuarantors };
}

