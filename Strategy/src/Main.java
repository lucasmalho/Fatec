import java.util.Scanner;

// cálculo média
interface CalculoMedia {
    double calcular(double nota1, double nota2);
    boolean aprovado(double media);
}

// média aritmética
class MediaAritmetica implements CalculoMedia {
    @Override
    public double calcular(double nota1, double nota2) {
        return (nota1 + nota2) / 2;
    }

    @Override
    public boolean aprovado(double media) {
        return media > 5.0;
    }
}

// uso da média geométrica
class MediaGeometrica implements CalculoMedia {
    @Override
    public double calcular(double nota1, double nota2) {
        return Math.sqrt(nota1 * nota2);
    }

    @Override
    public boolean aprovado(double media) {
        return media > 7.0;
    }
}

// Classe Disciplina - Strategy
class Disciplina {
    private String nome;
    private double p1;
    private double p2;
    private double media;
    private boolean situacao;
    private CalculoMedia calculoMedia;

    public Disciplina(CalculoMedia calculoMedia) {
        this.calculoMedia = calculoMedia;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setP1(double p1) {
        this.p1 = p1;
    }

    public void setP2(double p2) {
        this.p2 = p2;
    }

    public void CalcularMedia() {
        this.media = calculoMedia.calcular(p1, p2);
        this.situacao = calculoMedia.aprovado(media);
    }

    public String getSituacao() {
        return situacao ? "Aprovado" : "Reprovado";
    }

    public double getP1() {
        return p1;
    }

    public double getP2() {
        return p2;
    }

    public double getMedia() {
        return media;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Digite o nome da disciplina:");
        String nomeDisciplina = scanner.nextLine();

        System.out.println("Digite a nota da P1:");
        double notaP1 = scanner.nextDouble();

        System.out.println("Digite a nota da P2:");
        double notaP2 = scanner.nextDouble();

        // Utilizando média aritmética
        CalculoMedia calculoAritmetico = new MediaAritmetica();
        Disciplina d1 = new Disciplina(calculoAritmetico);
        d1.setNome(nomeDisciplina);
        d1.setP1(notaP1);
        d1.setP2(notaP2);
        d1.CalcularMedia();
        System.out.println(String.format("P1: %.2f P2: %.2f Media: %.2f Situacao: %s", d1.getP1(), d1.getP2(), d1.getMedia(), d1.getSituacao()));

        // Utilizando média geométrica
        CalculoMedia calculoGeometrico = new MediaGeometrica();
        Disciplina d2 = new Disciplina(calculoGeometrico);
        d2.setNome(nomeDisciplina);
        d2.setP1(notaP1);
        d2.setP2(notaP2);
        d2.CalcularMedia();
        System.out.println(String.format("P1: %.2f P2: %.2f Media: %.2f Situacao: %s", d2.getP1(), d2.getP2(), d2.getMedia(), d2.getSituacao()));

        scanner.close();
    }
}
