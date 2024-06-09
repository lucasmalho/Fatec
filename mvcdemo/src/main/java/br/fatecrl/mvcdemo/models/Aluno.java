package br.fatecrl.mvcdemo.models;

public class Aluno {
    private String esporte;
    private String nome;
    private float podio1;
    private float podio2;

    public Aluno(String esporte, String nome, float podio1, float podio2) {
        this.esporte = esporte;
        this.nome = nome;
        this.podio1 = podio1;
        this.podio2 = podio2;
    }

    public String getEsporte() {
        return esporte;
    }

    public void setEsporte(String esporte) {
        this.esporte = esporte;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public float getPodio1() {
        return podio1;
    }

    public void setPodio1(float podio1) {
        this.podio1 = podio1;
    }

    public float getPodio2() {
        return podio2;
    }

    public void setPodio2(float podio2) {
        this.podio2 = podio2;
    }
}
