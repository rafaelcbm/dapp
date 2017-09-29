import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']

})
export class DashboardComponent implements OnInit {

    cadastroVotacaoConcluida = false;

    users: any[];

    candidatos: any[] = [];
    numeroCandidato = '';
    nomeCandidato = '';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
    }

    addCandidato() {
        const candidato = { nome: this.nomeCandidato, numero: this.numeroCandidato };
        console.log('cadidato - ', candidato)
        this.candidatos.push(candidato);
        console.log('this.candidatos - ', this.candidatos)
    }

    deleteCandidato(candidato) {

        this.candidatos.splice(this.candidatos.findIndex((element, index, array) => element.nome === candidato.nome), 1);
    }

    concluirVotacao() {
        if (!this.cadastroVotacaoConcluida) {

            this.http.get('/api/users/all').subscribe(
                (resposta: any) => {
                    console.log('Contrato recebido:', resposta.data)
                    console.log('Votação Criada');
                    this.cadastroVotacaoConcluida = true;
                }
            );
        }
    }
}
