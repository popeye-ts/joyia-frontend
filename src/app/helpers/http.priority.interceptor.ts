import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/observable/empty'

@Injectable()
export class QueueInterceptor implements HttpInterceptor {
	private pocessed: boolean = false; // to indicate Special header data recieved
	private request = new Subject<any>(); // Subject stream to indicate custom responses
	private requests: HttpRequest<any>[] = []; // to store http requests

	constructor() {}

	requestSetter(response: any) { this.request.next(response) } // set subject stream data
	requestGetter(): Observable<any> { return this.request.asObservable() } // listen to Stream changes and return steeam data

	// remove previous requests from queue/ Array
	removeRequest(req: HttpRequest<any>) {
		const i = this.requests.indexOf(req);
		if (i >= 0) {
				this.requests.splice(i, 1);
		}
	}

	// Default Interceptor FUnctionality
  public intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<any> {
		return Observable.create(observer => {
			if (req.headers.has('access-granting-header')) {
				const subscription = delegate.handle(req).subscribe(event => {
					if (event instanceof HttpResponse) {
						this.pocessed = true;
						this.requestSetter({key: this.pocessed});
						this.removeRequest(req);
						observer.next(event);
					}
				},
				err => {
					alert('error returned');
					this.removeRequest(req);
					observer.error(err);
				},
				() => {
					this.removeRequest(req);
					observer.complete();
				});
				// remove request from queue when cancelled
				return () => {
						this.removeRequest(req);
						subscription.unsubscribe();
				};
			} else {
				this.requests.push(req);

				this.requestGetter().subscribe(res => {
					const i = this.requests.indexOf(req);
					if (i >= 0) {
						this.requests.splice(i, 1);
						req = req.clone({ setHeaders: { 'special-http-header': 'X' } });
						const subscription = delegate.handle(req).subscribe(event => {
							if (event instanceof HttpResponse) {
								this.pocessed = true;
								this.request.next(true);
								this.removeRequest(req);
								observer.next(event);
							}
						},
						err => {
							this.removeRequest(req);
							observer.error(err);
						},
						() => {
							this.removeRequest(req);
							observer.complete();
						});
						// remove request from queue when cancelled
						return () => {
							this.removeRequest(req);
							subscription.unsubscribe();
							this.request.unsubscribe();
						};
					}
				});

				/**
				 * to process calls after the subject stream is unsubscribed
				 */
				if (this.pocessed == true) {
					const i = this.requests.indexOf(req);
					if (i >= 0) {
						this.requests.splice(i, 1);
						req = req.clone({ setHeaders: { 'special-http-header': 'X' } });
						const subscription = delegate.handle(req).subscribe(event => {
							if (event instanceof HttpResponse) {
								this.removeRequest(req);
								observer.next(event);
							}
						},
						err => {
							this.removeRequest(req);
							observer.error(err);
						},
						() => {
							this.removeRequest(req);
							observer.complete();
						});
						// remove request from queue when cancelled
						return () => {
							this.removeRequest(req);
							subscription.unsubscribe();
						};
					}
				}
			}
		});
	}
}
