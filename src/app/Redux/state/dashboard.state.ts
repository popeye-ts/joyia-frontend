

export interface searchFilters {
    skip : number ,
    limit : number ,
    sorttype : string , 
    sortdirection : number
}
export const searchFiltersInitialState :searchFilters  = {
    skip : 0 ,
    limit : 50,
    sorttype : 'created_at' , 
    sortdirection  : -1
}
export interface card{ 
    label : string , 
    icon : string , 
    value : string 
}
interface cardStats {
    beingLoaded : Boolean ,
    data : Array<card>
}
// interface sales {
//     beingLoaded : Boolean ,
//     currentlySelected : 'weekly' | 'monthly' , 
//     weekly : { labels : Array<string> , values : Array<string> } , 
//     monthly : { labels : Array<string> , values : Array<string> }
// }
export interface recent{
    image : string , 
    order_id : string , 
    client_id : string , 
    client_name : string , 
    order_created_at : Date 
}
interface recentOrders {
    beingLoaded : Boolean , 
    data : Array<recent>,
    filters : searchFilters
}
export interface category{ 
    category_id : string , 
    count : number 
}
interface categories {
    beingLoaded : Boolean , 
    data : Array<category>
}
export interface log {
    _id : string , 
    severity : string , 
    comment : string , 
    created_at : Date , 
    created_by : string 
    user_id: string ,
    user_name: string
}
interface logs {
    beingLoaded : Boolean ,
    data : Array <log> ,
    filters : searchFilters
}
export interface pendingPayment {
    order_id : string , 
    client_id : string , 
    client_name : string , 
    amountRemaining: number , 
    expectedPaymentDate : Date , 
    image : string 
}
interface pendingPayments {
    beingLoaded : Boolean , 
    data : Array<pendingPayment>,
    filters : searchFilters
}
export interface bestSeller{ 
    product_id : string , 
    product_name : string , 
    product_total_sales_amount : number , 
    product_total_sales_quantity : number , 
    product_categories : Array<{_id : string , title : string}>
}
interface bestSellers {
    beingLoaded : Boolean , 
    data : Array<bestSeller>,
    filters : searchFilters
}
export interface summary{ 
    label : string , 
    obtained : number , 
    total : number 
}
interface summaryStats {
    beingLoaded : Boolean , 
    data : Array<summary>
}
export interface product{
    product_id : string , 
    name : string 
}
interface products {
    beingLoaded : Boolean ,
    data : Array<product>
}
export interface statSortable{
    label : string , 
    percent : number 
}
interface cardStatsSortable {
    beingLoaded : Boolean ,
    data : Array<statSortable>
}
interface OrdersChart{
    beingLoaded : Boolean ,
    currentlySelected : 'weekly' | 'monthly' , 
    weekly : { labels : Array<string> , values : Array<string> } , 
    monthly : { labels : Array<string> , values : Array<string> }
}
export interface otherStat{
    title : string , 
    description : string , 
    obtained : number , 
    total : number 
}
interface otherStatsLeft{
    beingLoaded : Boolean ,
    data : Array<otherStat>
}
export interface DashboardState {
    cardStats ,
    sales : OrdersChart  ,
    recentOrders  , 
    categories  ,
    logs ,
    pendingPayments ,
    calendar : any ,
    bestSellers ,
    summaryStats , 
    products ,
    cardStatsSortable ,
    cashOrdersChart : OrdersChart ,
    installmentOrdersChart : OrdersChart ,
    otherStatsLeft : any ,
    orderForm : any , 
    otherStatsRight : any 
}
export const inititalDashboardState : DashboardState= {
    cardStats : { beingLoaded : true , data : null } ,
    sales : { beingLoaded : true  , currentlySelected : 'weekly' , weekly : null , monthly : null }  ,
    recentOrders :{ beingLoaded : true,  data : null , filters : searchFiltersInitialState }  , 
    categories : { beingLoaded : true, data : null } ,
    logs : { beingLoaded : true, data : null , filters : searchFiltersInitialState },
    pendingPayments: { beingLoaded : true, data : null , filters : searchFiltersInitialState }  ,
    calendar : {} ,
    bestSellers : { beingLoaded : true, data : null , filters : searchFiltersInitialState },
    summaryStats : { beingLoaded : true, data : null } , 
    products : { beingLoaded : true, data : null } ,
    cardStatsSortable : { beingLoaded : true, data : null },
    cashOrdersChart : { beingLoaded : true  , currentlySelected : 'weekly' , weekly : null , monthly : null } ,
    installmentOrdersChart : { beingLoaded : true  , currentlySelected : 'weekly' , weekly : null , monthly : null } ,
    otherStatsLeft : { beingLoaded : true  , currentlySelected : 'weekly' , weekly : null , monthly : null } ,
    orderForm : {} , 
    otherStatsRight : {} 
}