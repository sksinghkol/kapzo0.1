import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-store-list',
  imports: [CommonModule],
  templateUrl: './store-list.html',
  styleUrl: './store-list.scss'
})
export class StoreList implements OnInit {
  stores: any[] = [];
  products: any[] = [];

  constructor(private storeService: StoreService) {}

  async ngOnInit() {
    this.stores = await this.storeService.getStores();
  }

  async selectStore(storeId: string) {
    this.products = await this.storeService.getProductsByStore(storeId);
  }
}