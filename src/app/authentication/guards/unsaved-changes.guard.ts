import { Injectable } from '@angular/core';


export interface canLeaveComponent {
  canLeave: () => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard  {
  canDeactivate(component: canLeaveComponent) {
    if (component.canLeave) {
      return component.canLeave();

    }
    return true
  }

}
