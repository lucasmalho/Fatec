package br.fatecrl.mvcdemo.controllers;
import br.fatecrl.mvcdemo.models.Aluno;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/alunos")

public class AlunoController {

    private static final List<Aluno> alunos = new ArrayList<Aluno>();

    public AlunoController() {
        alunos.add(new Aluno("Futebol","Lucas",1,2));
        alunos.add(new Aluno("Basquete","Caio",2,1));
        alunos.add(new Aluno("Beach Tennis","Gustavo",3,3));

    }

    @GetMapping
    public String getAlunos(Model model)
    {
        model.addAttribute("alunos", alunos);
        return "alunos";
    }

}
