import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class EventsService {

	private progressBarSource = new Subject<boolean>();
	progressBarSource$ = this.progressBarSource.asObservable();

	showProgressBar() {
        console.log('EventsService.showProgressBar');
		this.progressBarSource.next(true);
    }

    hideProgressBar() {
        console.log('EventsService.hideProgressBar');
		this.progressBarSource.next(false);
	}
}
