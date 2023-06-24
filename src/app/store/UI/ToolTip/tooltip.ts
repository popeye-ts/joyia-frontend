import { NgModule } from '@angular/core';

import { TooltipDirective } from './../../directives/tooltip.directive';

@NgModule({
    declarations: [
        TooltipDirective
    ],

    exports: [
      TooltipDirective
    ]
})
export class TooltipModule{}
