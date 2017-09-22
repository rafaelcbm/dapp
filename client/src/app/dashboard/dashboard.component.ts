import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  users: any[];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.http.get('/api/users/all').subscribe(
      (resposta: any) => this.users = resposta.data
    );

  }

}
