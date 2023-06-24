import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, Input} from '@angular/core';
import {  StateService, Transition } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { QRSessionService } from '@store/services/QRSessionService.service';
import { environment } from '@environments/environment';

@Component({
  selector : 'sessionDetail',
  templateUrl: './sessionDetail.component.html',
  styleUrls: ['./sessionDetail.component.scss']
})
export class SessionDetailComponent implements AfterViewInit {
  pageData : any;
  @Input() id : string = '' ;
  noImages : boolean = false;
  shownSpinner : Boolean = false;
  beingFormSubmit : Boolean = false;
  beingSubmit : Boolean = false;
  beingFormFetch : Boolean = false;
  active : Number ;
  
  title : string = '';
  interval : any = 0;
  files : any [] = [];
  dropZone : any;
  selectFromLibrary : any;
  form_status : string = 'pending';
  fileUploadUrl : string = environment.apiUrl+"qr-session/addImage";
  serverImagesPath : string = environment.cloudinary.medium;
  session_id: any;
  paginationShortListed : any = [];
  pagination : any = [];
  constructor(private _sessionService : QRSessionService  ,  private $state: StateService ,  private trans:Transition ,
    private notifier : NotifierService , private _authService : AuthenticationService , private store: Store<State>){
    this.pageData = {
      title: 'Inventory',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Sessions Form'
        }
      ]
    };
    this.active = 1;

  }
  ngOnInit(){
    let that = this ;
    this.id = this.trans.params().id;
    if(!this.interval)
      this.monitorModal();
  }
  monitorModal(){
    this.interval = setInterval(()=>{
      console.log("Creating interval" , this.interval )

      let isModalOpen =  $('#Session').is(':visible');
      if(this.id){
        if(isModalOpen){
          (<any>$("#Session") ).modal('hide');
        }
      }else{
        if(!isModalOpen){
            (<any>$("#Session") ).modal('show');
        }
      }
    } , 10000)
  }
  ngAfterViewInit() : void {
    if(this.id ){
      this.pageData.breadcrumbs.push({title : 'Update Session'});
      this.fetchDetails();
    }else{
      this.pageData.breadcrumbs.push({title : 'Add Session'});
      (<any>$("#Session") ).modal('show');
    }
    this.initLib();
  }
  initLib(){
    let that = this;
    let access_token ;
    //Taking care of authorization
      access_token = this._authService.token;
      let session = sessionStorage.getItem('session') || '';

    if ((<any>$()).selectFromLibrary) {
      that.selectFromLibrary = (<any>$(".sfl-multiple")).selectFromLibrary();
      /*
      Getting selected items

      console.log($(".sfl-single").selectFromLibrary().data("selectFromLibrary").getData());
      */
    }
    if ( (<any>$()).dropzone && !$(".dropzone").hasClass("disabled")) {
      
      that.dropZone = (<any>$(".dropzone")).dropzone({
        url: that.fileUploadUrl ,
        autoProcessQueue: false,
        parallelUploads: 1,
        timeout: 180000,
        params: {},
        headers : { "Authorization" : "Bearer "+access_token , session },        
        init: function () {
          this.on("processing", function(file) {
            this.options.params.session_id = that.id;
          });
          this.on("addedfile" , function(file){
            that.shownSpinner = true;
            console.log( "Dropzone :" ,  that.dropZone)
          });
          this.on("success", function (file, responseText) {
            that.notifier.notify("success", "File Uploaded." );
            console.log("File uploaded" , responseText );
            that.uploadNextFile()
            let count = that.dropZone[0].dropzone.files.length;
            for(let i=0; i < count ; i++)
            {
              if(that.dropZone[0].dropzone.files[i].name == file.name){
                that.dropZone[0].dropzone.files[i].uniqueId = responseText.id;
                // that.files.push({name : file.name , id : responseText.id });
                that.fetchDetails();
              }
            }
            that.shownSpinner = false;

          });
          this.on("error", function (file, responseText) {
            console.log("Error occured while uploading " , responseText )
            that.notifier.notify("error", "Failed to upload!" );
            that.shownSpinner = false;

          });
        },
        thumbnailWidth: 160,
        previewTemplate: '<div class="dz-preview dz-file-preview mb-3"><div class="d-flex flex-row "><div class="p-0 w-30 position-relative"><div class="dz-error-mark"><span><i></i></span></div><div class="dz-success-mark"><span><i></i></span></div><div class="preview-container"><img data-dz-thumbnail class="img-thumbnail border-0" /><i class="simple-icon-doc preview-icon" ></i></div></div><div class="pl-3 pt-2 pr-2 pb-1 w-70 dz-details position-relative"><div><span data-dz-name></span></div><div class="text-primary text-extra-small" data-dz-size /><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div><div class="dz-error-message"><span data-dz-errormessage></span></div></div></div><a href="#/" class="remove" data-dz-remove><i class="glyph-icon simple-icon-trash"></i></a></div>'
      });
    }
  }
  uploadNextFile(){
    let remainingFiles = this.dropZone[0].dropzone.getQueuedFiles();
    if(remainingFiles.length){
      this.dropZone[0].dropzone.processFile(remainingFiles[0])
    }
    console.log("Files remaining :" ,  this.dropZone[0].dropzone.getQueuedFiles() );
  }
  async uploadAllFiles(){
    const acceptedFiles = this.dropZone[0].dropzone.getAcceptedFiles()
    if(acceptedFiles.length){
      let processResults =  await this.dropZone[0].dropzone.processFile(acceptedFiles[0])
    }

    // for (let i = 0; i < acceptedFiles.length; i++) {
    //   try{
    //     let processResults =  await this.dropZone[0].dropzone.processFile(acceptedFiles[i])
    //     console.log("File upload result " , processResults );
    //   }catch(error){
    //     console.log("File upload error ", error )
    //   }
    // }
  }
  async submit(){
    try{
      this.beingSubmit = true;      
      let detailsFetched = await this._sessionService.createForm({id : this.id}).toPromise();

      console.log("Create form response "   , detailsFetched);
      this.notifier.notify("success", "Session submitted please wait for sync process" );
      $(".drop-area-container").remove();
    }catch(error ){
      console.log("An error occured " , error );
      if(error && error.error && error.error.error){
        this.notifier.notify("error", error.error.error );
      }else{
        this.notifier.notify("error", error );
      }
    }finally{
      this.beingSubmit = false;
    }

  }
  async fetchDetails() {
    try{
      this.shownSpinner = true;
      let that = this;
      let detailsFetched = await this._sessionService.viewDetail(this.id).toPromise();
      console.log("Details Fetched"  , detailsFetched  );
      this.files = detailsFetched.files;
      this.form_status = detailsFetched.current_status;
      this.session_id = detailsFetched._id;
      
          // subscribe(
          //   response =>
          //     {
          //       console.log("Whats the response of image session detail" , response );
          //       // if(sessions){
          //       //   this.images = sessions;
          //       //   this.noImages = false;
          //       // }else{
          //       //   this.noImages = true;
          //       // }
          //       // console.log("What i have as sessions list " , response )
          //     } ,
          //   error =>
          //     {
          //       console.log("response", error);
          //     }
          //   );
    }catch(error){
      console.log("An error occured in fetching details " , error );
    }finally{
      this.shownSpinner = false;
    }
  }
  ngOnDestroy(): void {
    console.log("Destroying interval" , this.interval )
    if(this.interval)
      clearInterval(this.interval);
  }
  async createSession(){  
    try{
      this.beingFormSubmit =  true;
      console.log("Whats the title " , this.title );
      if(this.title.trim().length < 3){
        throw "Title must be atleast 3 characters long";
      }
      let sessionCreatedResponse = await this._sessionService.create({title : this.title}).toPromise();
      console.log("Session created response " , sessionCreatedResponse );
      if(!sessionCreatedResponse){
        throw "Something went wrong while creating session";
      }
      if(sessionCreatedResponse.error){
        throw sessionCreatedResponse.error;
      }
      this.id = sessionCreatedResponse.session._id;

      this.pageData.breadcrumbs.push({title : `Update '${sessionCreatedResponse.session.name}' `})
      this.notifier.notify("success", "Session created" );
      this.fetchDetails();
    }catch(error){
      let isHttpError = error && error.error && error.error.error;
      if(isHttpError){
        this.notifier.notify("error", error.error.error  );
      }else if ( typeof error == 'string'){
        this.notifier.notify("error", error );
      }else{
        this.notifier.notify("error", "Something went wrong while creating session" );        
      }
      console.log(error , typeof error );
    }finally{
      this.beingFormSubmit =  false;
    }

  }
  showDetails(file){
    console.log("File details " , file )
  }
  async viewForm(){
    try{
      this.beingFormFetch =  true;
      let that = this;
      let detailsFetched = await this._sessionService.getForm(this.id).toPromise();
      console.log("Form Details Fetched"  , detailsFetched  );
      
      if(detailsFetched.data){
        this.$state.go('store.inventoryform' , { id : detailsFetched.data._id })
      }else{
        this.notifier.notify("notify", "Please wait while form is being synced" );        
      }
    }catch(error){
      console.log("Error occured view form " , error );
    }finally{
      this.beingFormFetch =  false;
    }
  }
  change(page : any){
    console.log("Change page clicked" , page )
  }
}
