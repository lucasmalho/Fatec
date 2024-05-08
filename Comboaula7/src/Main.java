
import java.util.Scanner;

public class Main {
    public Main() {
    }

    public static void main(String[] args) {
        System.out.println("Selecione seu combo:");
        System.out.println("1. Combo Master");
        System.out.println("2. Super Combo");
        System.out.print("Sua escolha: ");
        Scanner input = new Scanner(System.in);
        int tipo = input.nextInt();
        Combo combo = new Combo();
        if (tipo == 1) {
            combo.criarComboMaster();
        } else {
            if (tipo != 2) {
                System.out.println("Opção inválida.");
                return;
            }

            combo.criarSuperCombo();
        }

        System.out.println("Itens do combo:");
        combo.mostrarItens();
    }
}
