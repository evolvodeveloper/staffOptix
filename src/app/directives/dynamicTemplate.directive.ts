// import { Compiler, Component, ComponentFactoryResolver, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';

// @Directive({
//     selector: '[appDynamicTemplate]'
// })
// export class DynamicTemplateDirective implements OnInit {
//     @Input() template: any; // HTML template string with Angular bindings

//     constructor(
//         private viewContainerRef: ViewContainerRef,
//         private compiler: Compiler,
//         private componentFactoryResolver: ComponentFactoryResolver,
//         private sanitizer: DomSanitizer
//     ) { }

//     ngOnInit(): void {
//         // Compile and render the template
//         this.compileTemplate();
//     }

//     private compileTemplate(): void {
//         // Create a component dynamically
//         @Component({
//             template: this.template
//         })
//         class TemplateComponent { }

//         // Compile the component
//         const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TemplateComponent);
//         const componentRef = this.viewContainerRef.createComponent(componentFactory);

//         // Sanitize the HTML content
//         const sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.template);
//         this.viewContainerRef.element.nativeElement.innerHTML = sanitizedHtml;
//     }
// }
