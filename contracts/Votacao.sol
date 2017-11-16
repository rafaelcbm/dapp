pragma solidity ^0.4.15;

contract Votacao {

    struct infoCandidato
    {
        string inomeCandidato;
        uint16 inumeroCandidato;
        uint iqtdVotos;
    }

    mapping (uint16 => infoCandidato) votosRecebidos;
    uint qtdVotos;

    function Votacao() public {
        qtdVotos = 0;
    }

    function adicionarCandidato(string nomeCandidato, uint16 numeroCandidato) public {
        var novoCandidato = infoCandidato(nomeCandidato, numeroCandidato, 0);
        votosRecebidos[numeroCandidato] = novoCandidato;
    }

    function totalVotosCandidato(uint16 numeroCandidato) public constant returns (uint) {
        return votosRecebidos[numeroCandidato].iqtdVotos;
    }

    function totalVotos() public constant returns (uint) {
        return qtdVotos;
    }

    function votarParaCandidato(uint16 numeroCandidato) public {
        votosRecebidos[numeroCandidato].iqtdVotos += 1;
        qtdVotos++;
    }
}
