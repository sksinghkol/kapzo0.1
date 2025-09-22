import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../models/interfaces';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-card.html',
  styleUrls: ['./store-card.scss']
})
export class StoreCard {
  @Input() store!: Store;

  get primaryImage(): string {
    return (this.store.images && this.store.images.length) ? this.store.images[0] : 'assets/default-store.png';
  }

  get subscriptionStatus(): string {
    return this.store.subscription?.status || 'inactive';
  }
}
