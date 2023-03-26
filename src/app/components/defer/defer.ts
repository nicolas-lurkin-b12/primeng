import { NgModule, Directive, ElementRef, AfterViewInit, OnDestroy, TemplateRef, EmbeddedViewRef, ViewContainerRef, Renderer2, EventEmitter, Output, ContentChild, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DomHandler } from 'primeng/dom';

@Directive({
    selector: '[pDefer]',
    host: {
        class: 'p-element'
    }
})
export class DeferredLoader implements AfterViewInit, OnDestroy {
    @Output() onLoad: EventEmitter<any> = new EventEmitter();

    @ContentChild(TemplateRef) template: TemplateRef<any>;

    documentScrollListener: Function;

    view: EmbeddedViewRef<any>;

    constructor(@Inject(DOCUMENT) private document: Document, public el: ElementRef, public renderer: Renderer2, public viewContainer: ViewContainerRef, private cd: ChangeDetectorRef) {}

    ngAfterViewInit() {
        if (this.shouldLoad()) {
            this.load();
        }

        if (!this.isLoaded()) {
            const window = this.document.defaultView || 'window';
            this.documentScrollListener = this.renderer.listen(window, 'scroll', () => {
                if (this.shouldLoad()) {
                    this.load();
                    this.documentScrollListener();
                    this.documentScrollListener = null;
                }
            });
        }
    }

    shouldLoad(): boolean {
        if (this.isLoaded()) {
            return false;
        } else {
            let rect = this.el.nativeElement.getBoundingClientRect();
            let docElement = this.document.documentElement;
            let winHeight = docElement.clientHeight;

            return winHeight >= rect.top;
        }
    }

    load(): void {
        this.view = this.viewContainer.createEmbeddedView(this.template);
        this.onLoad.emit();
        this.cd.detectChanges();
    }

    isLoaded() {
        return this.view != null && DomHandler.isClient();
    }

    ngOnDestroy() {
        this.view = null;

        if (this.documentScrollListener) {
            this.documentScrollListener();
        }
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [DeferredLoader],
    declarations: [DeferredLoader]
})
export class DeferModule {}
