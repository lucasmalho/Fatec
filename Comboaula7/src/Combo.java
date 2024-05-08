
class Combo {
    private Sanduiche sanduiche;
    private Sobremesa sobremesa;
    private Bebida bebida;

    Combo() {
    }

    public void criarComboMaster() {
        this.sanduiche = new Sanduiche("Burger do Papai");
        this.sobremesa = new Sobremesa("Sorvete Gêmeos");
        this.bebida = new Bebida("Refrigerante Família");
    }

    public void criarSuperCombo() {
        this.sanduiche = new Sanduiche("Super Burger Duplo");
        this.sobremesa = new Sobremesa("Torta de Chocolate");
        this.bebida = new Bebida("Suco Natural");
    }

    public void mostrarItens() {
        System.out.println("Sanduíche: " + this.sanduiche.getNome());
        System.out.println("Sobremesa: " + this.sobremesa.getNome());
        System.out.println("Bebida: " + this.bebida.getNome());
    }
}
