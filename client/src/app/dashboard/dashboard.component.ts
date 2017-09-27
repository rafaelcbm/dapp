import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']

})
export class DashboardComponent implements OnInit {

    users: any[];

    candidatos: any[] = [];
    numeroCandidato = '';
    nomeCandidato = '';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {

        this.http.get('/api/users/all').subscribe(
            (resposta: any) => this.users = resposta.data
        );
    }

    addCandidato() {
        const candidato = { nome: this.nomeCandidato, numero: this.numeroCandidato };
        console.log('cadidato - ', candidato)
        this.candidatos.push(candidato);
        console.log('this.candidatos - ', this.candidatos)
    }

    deleteCandidato(candidato) {
        console.log('candidato removido>', candidato);
    }

    concluirVotacao(formValue) {
        console.log('Votação concluida');
    }
}
