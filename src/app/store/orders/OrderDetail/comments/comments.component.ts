import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges , EventEmitter , Output} from "@angular/core";
import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl , Validators  } from '@angular/forms';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderDetailService } from '@services/orderDetails.service';
import { CommentsService } from '@services/comments.service';
import { environment } from '@environments/environment';
import { AuthenticationService } from '@services/authentication.service';
import { NotifierService } from "angular-notifier";
@Component({
  selector:"orderComments",
  templateUrl:"./comments.component.html",
  styleUrls:["./comments.component.scss"]
})

export class OrderCommentsComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{
  //Based on order id we are gonna fetch order comments
  @Input() order_id;
  @Output('dataUpdated') newData : EventEmitter<any> = new EventEmitter();
  // re using user upload image method
  fileUploadUrl : string =environment.apiUrl+"users/addImage";
  fileKey: any;

  serverImagesPath : any = environment.cloudinary;
  appInitials : String = "";

  //We are gonna save comments in the form of array
  orderComments:any;

  //Since each comments section is particularly from particular collection/table so keeping record of collection
  static readonly collection : string = 'Order';

  //Preloader
  beingAdded : boolean = false;

  //Comment form
  commentForm  : FormGroup;

  constructor( private _commentsService : CommentsService , private fb:FormBuilder, private _authService: AuthenticationService,
    private http:HttpClient, private _notifier : NotifierService ) {
    //Initializing form
    this.commentForm = this.fb.group({
      comment : ['' , [Validators.required , Validators.minLength(4) ]],
      attachment: []
    });
  }

  ngOnInit():void
  {
    if(this.order_id)
      this.getorderComments();

  }

  ngOnChanges(changes){
    console.log("Changes recieved in order comments details ," , changes)
      if(changes.order_id && changes.order_id.currentValue)
      {
        this.order_id = changes.order_id.currentValue
        this.getorderComments();
      }
  }
  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }

  getorderComments()
  {
    this._commentsService.getAll( OrderCommentsComponent.collection , this.order_id)
      .subscribe(
        response =>
        {
          //All comments for this order
          this.orderComments = response.comments;
          console.log("All comments for this order : : " , response);
        },
        error => {
          console.log(error)
        })
  }

  addComment(){
    console.log("Validity of form " , this.commentForm.valid , this.commentForm.value)
    //In case another request is already in process then dont let it try again
    if(this.beingAdded || this.commentForm.invalid)
      return ;

    this.beingAdded = true;   

    //Making an object to send data to server
    let formData = {...this.commentForm.value, order_id : this.order_id  };
    if(this.fileKey){
      formData.attachment = this.fileKey;
    }
    this._commentsService.create( OrderCommentsComponent.collection , formData)
    .subscribe(
      response =>
      {
        // //Adding comments for this order
        // this.orderComments = response;
        console.log("Order comment being added response : : " , response);

        //Setting the preloaded
        this.beingAdded = false;

        //Fetch order comments again
        this.getorderComments();
      },
      error => {
        console.log(error)
        //Setting the preloader
        this.beingAdded = false;
      })
  }
  createCanvas(name , size=32){
      name  = name || '';
      size  = size || 60;
      let w = window;
      let d= document;

      var colours = [
              "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50",
              "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
          ],

          nameSplit = String(name).toUpperCase().split(' '),
          initials, charIndex, colourIndex, canvas, context, dataURI;


      if (nameSplit.length == 1) {
          initials = nameSplit[0] ? nameSplit[0].charAt(0):'?';
      } else {
          initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
      }

      if (w.devicePixelRatio) {
          size = (size * w.devicePixelRatio);
      }

      charIndex     = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64;
      colourIndex   = charIndex % 20;
      canvas        = d.createElement('canvas');
      canvas.width  = size;
      canvas.height = size;
      context       = canvas.getContext("2d");

      context.fillStyle = colours[colourIndex - 1];
      context.fillRect (0, 0, canvas.width, canvas.height);
      context.font = Math.round(canvas.width/2)+"px Arial";
      context.textAlign = "center";
      context.fillStyle = "#FFF";
      context.fillText(initials, size / 2, size / 1.5);

      dataURI = canvas.toDataURL();
      canvas  = null;

      return dataURI;
  }

  // handleFileSelect(event: any) {
  //   console.log('event ===', event);
  //   this.selectedFile = event.target.files[0];
  //   const selectedFileName = this.selectedFile.name;
  //   document.getElementById("selected-file-name").innerHTML = selectedFileName;
  // }

  loadFile(event : any) {

    let _self = this;
    // var output : any = document.getElementById('profile-image-new');
    // console.log("FYI output file div " , output );
    let file = event.target.files[0];
    // output.src = URL.createObjectURL(file);
    // output.onload = function() {
    //   URL.revokeObjectURL(output.src) // free memory
    // }
    //Upload the file to the server while taking care of updation
    let access_token ;
    //Taking care of authorization
    access_token = this._authService.token;
    let session = sessionStorage.getItem('session') || '';

    let fd = new FormData();
    // fd.append('user_id' , uniqueId );
    fd.append('file' , file );
    this.http.post( _self.fileUploadUrl , fd , {
      headers : { "Authorization" : "Bearer "+access_token , session },
    } ).subscribe( (resp : any)=>{
      console.log("Response while uploading file " , resp )
      _self.fileKey = resp.data.id;
      _self._notifier.notify("success" , "File has been uploaded" )
    } , err=>{
      console.log("An error occured while uploading file" , err );
    });

  };
}
