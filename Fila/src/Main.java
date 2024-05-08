public class Fila {
    private static Fila instance;
    private Fila() {}
    public static synchronized Fila getInstance() {
        if (instance == null) {
            instance = new Fila();
        }
        return instance;
    }
    public void ImprimeDocumento() {
        System.out.println("Documento impresso");
    }
    public void RemoveDocumento() {
        System.out.println("Documento removido");
    }
    public void RemoveTodosDocumentos() {
        System.out.println("Todos os documentos removidos");
    }
}
