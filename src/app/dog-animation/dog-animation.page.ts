import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dog-animation',
  templateUrl: './dog-animation.page.html',
  styleUrls: ['./dog-animation.page.scss'],
})
export class DogAnimationPage implements OnInit {

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      const contentElement = this.el.nativeElement.querySelector('ion-content');
      this.renderer.addClass(contentElement, 'fade-out-hidden');
      
      setTimeout(() => {
        this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      }, 300);
    }, 1000); 
  }
}
