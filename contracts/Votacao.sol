pragma solidity ^0.4.15;
// We have to specify what version of compiler this code will compile with

contract Votacao {

    struct  infoCandidato 
    {
      bytes inomeCandidato;
      uint16 inumeroCandidato;
      uint iqtdVotos;
    }
  
  mapping (uint16 => infoCandidato) public votosRecebidos;
  uint qtdVotos;

  function Votacao() {
  }

  function addCandidato(bytes nomeCandidato, uint16 numeroCandidato) returns (bool) {
    //TODO: Fazer validacoes depois
    //if (validCandidate(candidate) == false)  returns (bool);

    var novoCandidato = infoCandidato(nomeCandidato, numeroCandidato, 0);
    votosRecebidos[numeroCandidato] = novoCandidato;
    return true;
  }
  
  function totalVotesFor(uint16 numeroCandidato) returns (uint) {
    //TODO: Fazer validacoes depois
    //if (validCandidate(candidate) == false)  returns (bool);
    return votosRecebidos[numeroCandidato].iqtdVotos;
  }

   function totalVotes() returns (uint) {    
    return qtdVotos;
  }

  function voteForCandidate(uint16 numeroCandidato)  returns (bool) {
    //if (validCandidate(candidate) == false) return false;
    votosRecebidos[numeroCandidato].iqtdVotos += 1;

    return true;
  }
}
